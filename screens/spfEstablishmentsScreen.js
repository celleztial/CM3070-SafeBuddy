import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert, RefreshControl, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { getSpfStations } from '../apis/spf';

// Utility to extract fields from embedded HTML string in Description
function extractFieldsFromHtml(htmlString) {
  const matches = [...htmlString.matchAll(/<th[^>]*>(.*?)<\/th>\s*<td[^>]*>(.*?)<\/td>/g)];
  const data = {};
  for (const match of matches) {
    const key = match[1].trim();
    const value = match[2].trim();
    data[key] = value;
  }
  return data;
}

// Haversine formula to calculate distance in kilometers
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * (Math.PI / 180);
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// SpfEstablishmentsScreen shows nearby police stations with search and map links
export default function SpfEstablishmentsScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [stations, setStations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load stations and user location
  const loadStations = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to sort by distance.');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const coords = location.coords;
      setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });

      // Fetch station data
      const data = await getSpfStations();
      if (data.length === 0) {
        setError('No station data received.');
      } else {
        const enriched = data.map(station => {
          const [lon, lat] = station.geometry?.coordinates || [];
          const distance = getDistanceFromLatLonInKm(
            coords.latitude,
            coords.longitude,
            lat,
            lon
          );
          return {
            ...station,
            _distance: distance || Infinity,
          };
        });

        // Sort by distance
        const sorted = enriched.sort((a, b) => a._distance - b._distance);
        setStations(sorted);
      }
    } catch (err) {
      console.error('Error loading SPF stations:', err);
      setError('Failed to load station data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadStations();
  }, []);

  // Filter stations based on search query
  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return stations;
    const query = searchQuery.toLowerCase();
    return stations.filter((station) => {
      const props = station.properties || {};
      const html = props.Description || props.description || '';
      const extracted = extractFieldsFromHtml(html);
      const combined = Object.values(extracted).join(' ').toLowerCase();
      return combined.includes(query);
    });
  }, [stations, searchQuery]);

  // Open location in Google Maps
  const openInGoogleMaps = (lat, lon = 'Police Station') => {
    const url  = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    Linking.openURL(url);
  };

  // Render a single station card
  const renderStationCard = (station, index) => {
    const props = station.properties || {};
    const html = props.Description || props.description || '';
    const fields = extractFieldsFromHtml(html);
    const coords = station.geometry?.coordinates;
    const lat = coords?.[1];
    const lon = coords?.[0];

    // Card UI
    return (
      <TouchableOpacity
        key={`station-${index}`}
        style={styles.card}
        onPress={() => lat && lon && openInGoogleMaps(lat, lon, fields.STREET_NAME)}
      >
        {fields.STREET_NAME && <Text style={styles.stationName}>{fields.STREET_NAME}</Text>}
        {fields.TELEPHONE && <Text style={styles.meta}>📞 {fields.TELEPHONE}</Text>}
        {fields.POSTAL_CODE && <Text style={styles.meta}>🏷️ Postal Code: {fields.POSTAL_CODE}</Text>}
        {fields.OPERATING_HOURS && <Text style={styles.meta}>🕐 {fields.OPERATING_HOURS}</Text>}
        {station._distance && <Text style={styles.meta}>📍 {station._distance.toFixed(2)} km away</Text>}
      </TouchableOpacity>
    );
  };

  // Show loading indicator
  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1A2B44" />
          <Text style={styles.loadingText}>Loading nearest police stations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render main UI
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadStations(true)}
            colors={['#1A2B44']}
          />
        }
      >
        <Text style={styles.title}>Police Stations</Text>
        {/* Back Button */}
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.backButtonText}>← </Text>
              </TouchableOpacity>
        <Text style={styles.subtitle}>
          {stations.length > 0 ? `${stations.length} stations found` : 'No stations available'}
        </Text>

        {stations.length > 0 && (
          <TextInput
            placeholder="Search by keyword..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
          />
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : filteredStations.length === 0 && stations.length > 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.noResults}>
              No stations match "{searchQuery}"
            </Text>
          </View>
        ) : (
          <>
            {searchQuery !== '' && (
              <Text style={styles.resultsCount}>
                {filteredStations.length} result{filteredStations.length !== 1 ? 's' : ''} found
              </Text>
            )}
            {filteredStations.map(renderStationCard)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Get device width/height for responsive map sizing
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEFFF3',
  },
  scrollContent: {
    flexGrow: 1,
    padding: width * 0.05,             
    paddingBottom: height * 0.12,      
  },
  backButton: {
    marginBottom: height * 0.015,
  },
  backButtonText: {
    color: '#1A2B44',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginBottom: height * 0.015,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2B44',
    marginBottom: height * 0.02,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: height * 0.025,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderColor: '#1A2B44',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: width * 0.042,
    paddingVertical: height * 0.015,
    fontSize: width * 0.043,
    marginBottom: height * 0.02,
    color: '#1A2B44',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultsCount: {
    fontSize: width * 0.037,
    color: '#666',
    marginBottom: height * 0.015,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: width * 0.032,
    padding: width * 0.042,
    marginBottom: height * 0.015,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stationName: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#1A2B44',
    marginBottom: height * 0.008,
  },
  address: {
    fontSize: 14,
    color: '#333',
    lineHeight: height * 0.025,
    marginBottom: height * 0.005,
  },
  meta: {
    fontSize: width * 0.037,
    color: '#444',
    marginBottom: height * 0.005,
  },
  centerContent: {
    alignItems: 'center',
    marginTop: height * 0.06,
  },
  loadingText: {
    marginTop: height * 0.015,
    fontSize: width * 0.043,
    color: '#1A2B44',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: width * 0.042,
    borderRadius: width * 0.032,
    marginBottom: height * 0.02,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  errorText: {
    fontSize: width * 0.043,
    color: '#d32f2f',
    fontWeight: '600',
  },
  noResults: {
    textAlign: 'center',
    fontSize: width * 0.043,
    color: '#666',
  },
});
