import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer, } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth } from './FirebaseConfig'; 
import { registerForPushNotifications } from './components/notifications';

// Screens
import HomeScreen from './screens/HomeScreen';
import ContactsScreen from './screens/ContactsScreen';
import AddContactScreen from './screens/AddContactScreen';
import ContactDetailsScreen from './screens/ContactDetailsScreen';
import ShareToScreen from './screens/ShareToScreen';
import GamesLandingScreen from './screens/GamesLandingScreen';
import SpfEstablishments from './screens/spfEstablishmentsScreen';
import ReadingChoicesScreen from './screens/ReadingChoicesScreen';
import BuildEmergencyKitScreen from './screens/BuildEmergencyKitScreen';
import QuizScreen from './screens/QuizScreen';
import ProfileScreen from './screens/ProfileScreen';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen'; 

const AppStack = createStackNavigator();
const AuthStack = createStackNavigator();

function AppNavigator() {
  return (
    <AppStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
        cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
      }}
    >
      <AppStack.Screen name="Home" component={HomeScreen} />
      <AppStack.Screen name="Contacts" component={ContactsScreen} />
      <AppStack.Screen name="ContactDetails" component={ContactDetailsScreen} />
      <AppStack.Screen name="AddContact" component={AddContactScreen} />
      <AppStack.Screen name="ShareTo" component={ShareToScreen} />
      <AppStack.Screen name="GamesLanding" component={GamesLandingScreen} />
      <AppStack.Screen name="SpfScreen" component={SpfEstablishments} />
      <AppStack.Screen name="ReadingChoices" component={ReadingChoicesScreen} />
      <AppStack.Screen name="EmergencyKit" component={BuildEmergencyKitScreen} />
      <AppStack.Screen name="Quiz" component={QuizScreen} />
      <AppStack.Screen name="Profile" component={ProfileScreen} />
    </AppStack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
        cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
      }}
    >
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setCheckingAuth(false);
      
      // Register for push notifications when user signs in
      if (user) {
        await registerForPushNotifications(user.uid);
      }
    });
    return unsubscribe;
  }, []);

  // Handle notifications when app is running
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  if (checkingAuth) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color="#1A2B44" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {user ? <AppNavigator /> : <AuthNavigator />}
        </View>
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0FFF0',
  },
  container: {
    flex: 1,
    backgroundColor: '#F0FFF0',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});