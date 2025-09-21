import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getContacts, updateContact, deleteContact } from '../firebase/contactService';
import { getAuth } from 'firebase/auth';
import * as Haptics from 'expo-haptics'; 
import { SafeAreaView } from 'react-native-safe-area-context';

// ContactDetailsScreen allows viewing and editing details of a specific contact
export default function ContactDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { contactId } = route.params;
  const [contact, setContact] = useState(null);
  const [label, setLabel] = useState('');
  const currentUser = getAuth().currentUser;

  // Fetch contact details on mount
  useEffect(() => {
    const fetchDetails = async () => {
      const allContacts = await getContacts(currentUser.uid);
      const found = allContacts.find(c => c.id === contactId);
      if (found) {
        setContact(found);
        setLabel(found.label || '');
      }
    };
    fetchDetails();
  }, []);

  // Save updated contact details
  const handleSave = async () => {
    try {
      await updateContact(currentUser.uid, contactId, { label });  
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Contact details updated.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Could not update contact.');
    }
  };

  // Render loading state if contact not yet fetched
  if (!contact) return null;
  // Render the contact details form
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Contact Details</Text>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{contact.name}</Text>

      <Text style={styles.label}>Label</Text>
      <TextInput
        style={styles.input}
        value={label}
        onChangeText={setLabel}
        placeholder="e.g. Friend, Sibling"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert(
            'Delete Contact',
            `Are you sure you want to delete ${contact.name}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await deleteContact(currentUser.uid, contactId);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert('Deleted', 'Contact has been removed.');
                    navigation.goBack();
                  } catch (err) {
                    Alert.alert('Error', 'Failed to delete contact.');
                  }
                },
              },
            ]
          )
        }
      >
        <Text style={styles.deleteButtonText}>Delete Contact</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Get device width/height for responsive map sizing
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
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
  backButton: {
    marginBottom: height * 0.015,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2B44',
    marginBottom: height * 0.02,
  },
  label: {
    fontSize: 14,
    color: '#1A2B44',
    marginBottom: height * 0.005,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: height * 0.02,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1A2B44',
    borderRadius: 15,
    paddingHorizontal: width * 0.035,
    paddingVertical: height * 0.012,
    marginBottom: height * 0.025,
    backgroundColor: '#faf8f6',
  },
  button: {
    backgroundColor: '#1A2B44',
    paddingVertical: height * 0.02,
    borderRadius: 30,
    alignItems: 'center',
  },
  deleteButton: {
    marginTop: height * 0.015,
    backgroundColor: '#C62828',
    paddingVertical: height * 0.02,
    borderRadius: 30,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#EEFFF3',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: '#EEFFF3',
    fontSize: 16,
    fontWeight: '600',
  },
});
