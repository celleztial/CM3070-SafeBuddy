import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, Pressable, Dimensions } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Checkbox from 'expo-checkbox';

// SignUpScreen allows new users to create an account with email and password
export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const navigation = useNavigation();

  // Handle user sign-up
  const handleSignUp = async () => {
    if (!agreed) {
      Alert.alert('Agreement Required', 'You must agree to the use of your email to proceed.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // Save additional info to Firestore
      await setDoc(doc(db, 'users', uid), {
        name,
        email,
      });

      Alert.alert('Success', 'Account created!');
      navigation.navigate('Home', { uid }); 
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
    }
  };

  // Render UI
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} accessibilityLabel="Name"/>

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} accessibilityLabel="Email" />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} accessibilityLabel="Password"/>

      <View style={styles.checkboxContainer}>
        <Checkbox value={agreed} onValueChange={setAgreed} color={agreed ? '#1A2B44' : undefined} />
        <Text style={styles.checkboxLabel}>I agree that my email will be used to create an account and access features.</Text>
      </View>

      <Pressable style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Register account</Text>
      </Pressable>

      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>Log in</Text>
      </Text>
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
  title: {
    fontSize: 25,
    fontWeight: '700',
    marginBottom: height * 0.035,
    color: '#1A2B44',
  },
  label: {
    fontSize: 14,
    color: '#1A2B44',
    marginBottom: height * 0.005,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: height * 0.025,
  },
  checkboxLabel: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
    color: '#333',
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
  loginText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#1A2B44',
  },
  loginLink: {
    color: '#780606',
    fontWeight: 'bold',
  },
});
