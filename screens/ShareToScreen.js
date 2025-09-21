import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getContacts } from '../firebase/contactService';
import { sendOneTimeLocation, startLiveLocationShare, startLiveLocationUpdates } from '../firebase/locationShare';
import { getAuth } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics'; 

// ShareToScreen allows users to share their location with contacts
export default function ShareToScreen() {
  const [contacts, setContacts] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { isLive, duration, location } = route.params;
  const currentUser = getAuth().currentUser;

  // Fetch contacts on mount
  useEffect(() => {
    const fetchContacts = async () => {
      const data = await getContacts(currentUser.uid);
      setContacts(data);
    };
    fetchContacts();
  }, []);

  // Confirm before sharing location
  const showConfirmationAlert = (contact) => {
    const shareType = isLive ? `live location for ${duration} hour(s)` : 'one-time location';
    
    Alert.alert(
      'Share Location',
      `Share your ${shareType} with ${contact.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send',
          onPress: () => handleShare(contact.id),
        },
      ]
    );
  };

  // Sharing logic
  const handleShare = async (contactId) => {
    try {
      let currentLocation = location;
      
      // Get fresh location if not provided
      if (!currentLocation) {
        const loc = await Location.getCurrentPositionAsync({});
        currentLocation = loc.coords;
      }

      if (isLive) {
        // Convert hours to milliseconds
        const durationMs = duration * 60 * 60 * 1000; 
        await startLiveLocationShare(currentUser.uid, contactId, currentLocation, durationMs);
        await startLiveLocationUpdates(currentUser.uid, contactId, Date.now() + durationMs);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', `Live location shared for ${duration} hour(s).`);
      } else {
        await sendOneTimeLocation(currentUser.uid, contactId, currentLocation);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'One-time location shared.');
      }
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to share location.');
    }
  };

  // UI rendering
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Select Contact to Share</Text>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {contacts.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={styles.card}
            onPress={() => showConfirmationAlert(contact)}
          >
            <Text style={styles.cardText}>{contact.name}</Text>
          </TouchableOpacity>
        ))}
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
    padding: width * 0.06,
    paddingTop: height * 0.06,
  },
  backButton: {
    marginBottom: height * 0.015,
  },
  backButtonText: {
    color: '#1A2B44',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2B44',
    marginBottom: height * 0.02,
  },
  scrollContent: {
    paddingBottom: height * 0.2,
  },
  card: {
    backgroundColor: '#faf8f6',
    borderColor: '#1A2B44',
    borderWidth: 1,
    borderRadius: 20,
    padding: width * 0.04,
    marginBottom: height * 0.025,
  },
  cardText: {
    fontSize: 16,
    color: '#1A2B44',
  },
});