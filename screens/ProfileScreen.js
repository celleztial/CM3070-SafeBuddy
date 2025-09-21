import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, Alert, Dimensions, Switch, TouchableOpacity } from 'react-native';
import { auth, db } from '../FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { scheduleDailyReminder, cancelDailyReminder, requestNotificationPermissions } from '../components/notifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics'; 

// ProfileScreen allows users to view and update their profile information and settings
export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dailyRemindersEnabled, setDailyRemindersEnabled] = useState(false);
  const navigation = useNavigation();

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setDailyRemindersEnabled(data.dailyRemindersEnabled || false);
        }
      }
    };
    fetchProfile();
  }, []);

  // Handle toggling daily reminders
  const handleDailyReminderToggle = async (value) => {
    try {
      // Check permissions first
      const hasPermission = await requestNotificationPermissions();
      
      if (value && !hasPermission) {
        Alert.alert(
          'Notification Permission Required',
          'Please enable notifications in your device settings to receive daily reminders.'
        );
        return;
      }

      // Schedule or cancel reminders based on toggle
      if (value) {
        const success = await scheduleDailyReminder();
        if (success) {
          setDailyRemindersEnabled(true);
          Alert.alert('Success', 'Daily reminders enabled! You\'ll receive a notification at 9 AM each day.');
        } else {
          Alert.alert('Error', 'Failed to enable daily reminders.');
        }
      } else {
        const success = await cancelDailyReminder();
        if (success) {
          setDailyRemindersEnabled(false);
          Alert.alert('Success', 'Daily reminders disabled.');
        } else {
          Alert.alert('Error', 'Failed to disable daily reminders.');
        }
      }
    } catch (error) {
      console.error('Error toggling daily reminders:', error);
      Alert.alert('Error', 'Failed to update reminder settings.');
    }
  };

  // Handle profile update
  const handleUpdate = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          name,
          phone,
          address,
          dailyRemindersEnabled,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Profile updated!');
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  // UI rendering
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Update Profile</Text>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Address</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        style={styles.input}
        multiline
      />

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Daily Reminders</Text>
            <Text style={styles.settingDescription}>
              Get a daily notification at 9 AM to check in to SafeBuddy
            </Text>
          </View>
          <Switch
            value={dailyRemindersEnabled}
            onValueChange={handleDailyReminderToggle}
            trackColor={{ false: '#767577', true: '#1A2B44' }}
            thumbColor={dailyRemindersEnabled ? '#EEFFF3' : '#f4f3f4'}
            accessibilityLabel="Daily Reminders"
          />
        </View>
      </View>

      <Pressable style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </Pressable>
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
    justifyContent: 'center',
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
  input: {
    borderWidth: 1,
    borderColor: '#1A2B44',
    borderRadius: 10,
    paddingHorizontal: width * 0.035,
    paddingVertical: height * 0.012,
    marginBottom: height * 0.025,
    backgroundColor: '#faf8f6',
  },
  settingsSection: {
    marginBottom: height * 0.03,
    paddingTop: height * 0.02,
    borderTopWidth: 1,
    borderTopColor: '#1A2B44',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A2B44',
    marginBottom: height * 0.02,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.015,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: width * 0.04,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A2B44',
    marginBottom: height * 0.005,
  },
  settingDescription: {
    fontSize: 14,
    color: '#1A2B44',
    opacity: 0.7,
  },
  button: {
    backgroundColor: '#1A2B44',
    paddingVertical: height * 0.018,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  buttonText: {
    color: '#EEFFF3',
    fontWeight: '600',
    fontSize: 16,
  },
});