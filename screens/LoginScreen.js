import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, Pressable, Dimensions } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// LoginScreen allows existing users to log in with email and password
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  // Handle user login
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'You are now signed in');
    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };

  // UI rendering
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </Pressable>

      <Text style={styles.loginText}>
        Don't have an account?{' '}
        <Text style={styles.signupLink} onPress={() => navigation.navigate('SignUp')}>
          Sign up
        </Text>
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
    color: '#333',
  },
  signupLink: {
    color: '#780606',
    fontWeight: 'bold',
  },
});