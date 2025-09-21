import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ActivityIndicator, Dimensions, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getAuth } from 'firebase/auth';
import { collection, onSnapshot, getDoc, doc as firestoreDoc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

// Map component to preview user's location and shared locations
export default function MapPreview({ onLocationReady }) {

  // State for user's location, loading status, error messages, and shared locations
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [sharedLocations, setSharedLocations] = useState([]);
  const currentUser = getAuth().currentUser;

  // Fetch user's location on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      if (onLocationReady) onLocationReady(loc.coords);
      setLoading(false);
    })();

  }, []);

  // Listen for shared locations in Firestore
  useFocusEffect(
    useCallback(() => {
      if (!currentUser) return;

      const unsubscribe = onSnapshot(
        collection(db, 'users', currentUser.uid, 'sharedLocations'),
        async (snapshot) => {
          const locations = [];

          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const now = Date.now();

            // Skip expired current or live shares
            if ((data.type === 'current' || data.type === 'live') && data.expiresAt && now > data.expiresAt) {
              continue;
            }

            let senderName = 'Unknown';
            try {
              const senderRef = firestoreDoc(db, 'users', docSnap.id);
              const senderDoc = await getDoc(senderRef);
              if (senderDoc.exists()) {
                senderName = senderDoc.data().name || 'Unnamed';
              }
            } catch (err) {
              console.warn('Error fetching sender name:', err);
            }

            locations.push({
              id: docSnap.id,
              ...data,
              senderName,
            });
          }

          setSharedLocations(locations);
        },
        (error) => {
          console.error('Error listening to shared locations:', error);
        }
      );

      return () => unsubscribe();
    }, [currentUser])
  );

  // Render loading, error, or map view
  if (loading) {
    return (
      <View style={[styles.mapBox, styles.center]}>
        <ActivityIndicator size="large" color="#1A2B44" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.mapBox, styles.center]}>
        <Text style={{ color: '#1A2B44' }}>{errorMsg}</Text>
      </View>
    );
  }

  return (
 
    <MapView
      style={styles.mapBox}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {/* User's own location marker */}
      <Marker
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        title="You are here"
        pinColor="#000080"
      />

      {/* Shared location markers */}
      {sharedLocations.map((loc) => {
      const now = Date.now();
      const timeLeftMs = loc.expiresAt ? loc.expiresAt - now : 0;
      const minutesLeft = Math.floor(timeLeftMs / (1000 * 60));

      let description = '';
      if (loc.type === 'live') {
        description = timeLeftMs > 0
          ? `Live - ${minutesLeft} min${minutesLeft !== 1 ? 's' : ''} left`
          : 'Live - expired';
      } else if (loc.type === 'current') {
        description = timeLeftMs > 0
          ? `One-time - ${minutesLeft} min${minutesLeft !== 1 ? 's' : ''} left`
          : 'One-time - expired';
      }

      return (
        <Marker
          key={loc.id}
          coordinate={{
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          }}
          title={`Shared by ${loc.senderName}`}
          description={description}
          pinColor={loc.type === 'live' ? "#FF6B6B" : "#4ECDC4"}
        />
      );
    })}
    </MapView>
  );
}

// Get device width/height for responsive map sizing
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  mapBox: {
    height: height * 0.38,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FFF0',
  },
});
