import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Linking, Alert } from 'react-native';
import { getDoc, doc, getDocs, collection } from 'firebase/firestore';
import { auth, db } from '../FirebaseConfig';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import Modal from 'react-native-modal';
import NavBar from '../components/navbar';
import MapPreview from '../components/mapPreview';
import { SafeAreaView } from 'react-native-safe-area-context';


// HomeScreen displays user profile, map, and location sharing options
export default function HomeScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [liveModalVisible, setLiveModalVisible] = useState(false);
  const [mapKey, setMapKey] = useState(0); 
  const mapRef = useRef(null);

  // Fetch user profile info from Firestore
  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
      }
    }
  };

  // Refresh profile info when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out, waiting for navigator to redirect...');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Callback when MapPreview has loaded location
  const onLocationReady = (location) => {
    setCurrentLocation(location);
  };

  // Handle one-time location share
  const handleCurrentLocationShare = () => {
    if (!currentLocation) {
      alert('Please wait for location to load');
      return;
    }
    navigation.navigate('ShareTo', {
      isLive: false,
      location: currentLocation,
    });
  };

  // Handle live location share
  const handleLiveLocationShare = () => {
    if (!currentLocation) {
      alert('Please wait for location to load');
      return;
    }
    setLiveModalVisible(true);
  };

  // User selects duration for live share
  const handleSelectDuration = (durationHours) => {
    setLiveModalVisible(false);
    navigation.navigate('ShareTo', {
      isLive: true,
      duration: durationHours,
      location: currentLocation,
    });
  };

  // Handle emergency call
  const handleEmergencyCall = () => {
    Linking.openURL('tel:999').catch(err =>
      console.error('Failed to open dialer:', err)
    );
  };

  // Refresh map by changing key 
  const handleRefreshLocation = () => {
    // Force MapPreview to completely re-render by changing its key
    // This will cause it to re-fetch all location data from Firebase
    setMapKey(prev => prev + 1);
    Alert.alert('Map refreshed!');
  };

  // Render the home screen
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileText}>{name || 'No name added'}</Text>
            <Text style={styles.profileText}>{phone || 'No phone number added'}</Text>
            <Text style={styles.profileText}>{address || 'No address added'}</Text>

            <View style={styles.profileButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={styles.editButtonText}>Profile Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Map Section */}
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Map</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                style={styles.spfButton}
                onPress={() => navigation.navigate('SpfScreen')}
              >
                <Text style={styles.spfText}>Police Stations</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefreshLocation}
              >
                <Text style={styles.spfText}>🔄</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* ADD key prop to force re-render */}
          <MapPreview 
            key={mapKey} 
            ref={mapRef} 
            onLocationReady={onLocationReady} 
          />
        </View>

        {/* Location Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.locationButton} onPress={handleCurrentLocationShare}>
            <Text style={styles.buttonText}>Share One-Time Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationButton} onPress={handleLiveLocationShare}>
            <Text style={styles.buttonText}>Share Live Location</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Button */}
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
          <Text style={styles.emergencyText}>Call Local Emergency</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Sheet Modal */}
      <Modal
        isVisible={liveModalVisible}
        onBackdropPress={() => setLiveModalVisible(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View style={{
          backgroundColor: 'white',
          padding: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center'
          }}>
            Share live location for:
          </Text>
          {[1, 3, 8].map(duration => (
            <TouchableOpacity
              key={duration}
              onPress={() => handleSelectDuration(duration)}
              style={{
                backgroundColor: '#1D3557',
                paddingVertical: 12,
                borderRadius: 15,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
                {duration} Hour{duration > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </Modal>
      <NavBar />
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
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.12,
  },
  profileSection: {
    backgroundColor: '#1A2B44',
    borderRadius: 15,
    padding: width * 0.05,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
  },
  profileText: {
    color: '#faf8f6',
    fontSize: 14,
    paddingRight: width * 0.02,
  },
  profileInfo: {
    flex: 1,
    paddingRight: width * 0.02,
  },
  profileButtons: {
    flexDirection: 'row',
    marginTop: height * 0.01,
    gap: width * 0.025,
  },
  logoutButton: {
    marginTop: height * 0.01,
    backgroundColor: '#F08080',
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.04,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  logoutButtonText: {
    color: '#faf8f6',
    fontSize: 14,
    fontWeight: '500',
  },
  editButton: {
    marginTop: height * 0.01,
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.04,
    backgroundColor: '#A8DADC',
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#1C2A49',
    fontSize: 14,
    fontWeight: '500',
  },
  mapContainer: {
    backgroundColor: '#DFF6E4',
    borderRadius: 15,
    padding: width * 0.04,
    marginBottom: height * 0.02,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  mapTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#1D3557',
  },
  spfButton: {
    backgroundColor: '#A8DADC',
    paddingVertical: height * 0.006,
    paddingHorizontal: width * 0.04,
    borderRadius: 15,
  },
  refreshButton: {
    backgroundColor: '#A8DADC',
    paddingVertical: height * 0.006,
    paddingHorizontal: width * 0.03,
    borderRadius: 15,
  },
  spfText: {
    fontSize: 14,
    color: '#1C2A49',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
  },
  locationButton: {
    backgroundColor: '#1D3557',
    paddingVertical: height * 0.02,
    borderRadius: 15,
    flex: 1,
    marginHorizontal: width * 0.01,
  },
  buttonText: {
    color: '#faf8f6',
    textAlign: 'center',
    fontSize: width * 0.032,
  },
  emergencyButton: {
    backgroundColor: '#880808',
    paddingVertical: height * 0.02,
    borderRadius: 15,
  },
  emergencyText: {
    color: '#faf8f6',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
