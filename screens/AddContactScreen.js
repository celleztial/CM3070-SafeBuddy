import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { checkUserByEmail, addContact } from '../firebase/contactService';
import { getAuth } from 'firebase/auth';
import * as Haptics from 'expo-haptics'; 
import { SafeAreaView } from 'react-native-safe-area-context';


// AddContactScreen allows users to add a new contact by email
export default function AddContactScreen() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();
  const currentUser = getAuth().currentUser;

  // Handle adding a new contact
  const handleAddContact = async () => {
    if (!email.trim()) return Alert.alert('Error', 'Please enter an email');

    // Check if the user exists
    const matchedUser = await checkUserByEmail(email.trim());
    if (!matchedUser) return Alert.alert('Error', 'User not found or not registered with SafeBuddy');

    // Prevent adding oneself
    try {
      await addContact(currentUser.uid, matchedUser.uid);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); 
      Alert.alert('Success', 'Contact added!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add contact.');
    }
  };

  // UI rendering
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Contact</Text>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Contacts')}>
        <Text style={styles.backButtonText}>← </Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Enter contact's registered email"
        placeholderTextColor="#888"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleAddContact}>
        <Text style={styles.buttonText}>Add Contact</Text>
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
    fontSize: 20,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2B44',
    marginBottom: height * 0.02,
  },
  input: {
    backgroundColor: '#faf8f6',
    borderColor: '#1A2B44',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: height * 0.014,
    paddingHorizontal: width * 0.04,
    fontSize: 14,
    marginBottom: height * 0.025,
    color: '#1A2B44',
  },
  button: {
    backgroundColor: '#1A2B44',
    paddingVertical: height * 0.02,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#EEFFF3',
    fontSize: 16,
    fontWeight: '600',
  },
});
