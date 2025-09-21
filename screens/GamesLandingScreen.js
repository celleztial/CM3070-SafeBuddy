import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Animated, } from 'react-native';
import { defaultUserProgress } from '../components/static/readingMaterials';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavBar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';

// GamesLandingScreen shows the main games options with animations
export default function GamesLandingScreen({ navigation }) {
  const [userProgress, setUserProgress] = useState(defaultUserProgress);

  // Animated values
  const translateY1 = useRef(new Animated.Value(30)).current;
  const translateY2 = useRef(new Animated.Value(30)).current;
  const translateY3 = useRef(new Animated.Value(30)).current;
  const opacity1 = useRef(new Animated.Value(0)).current;
  const opacity2 = useRef(new Animated.Value(0)).current;
  const opacity3 = useRef(new Animated.Value(0)).current;

  // Load user progress and animate cards on mount
  useEffect(() => {
    loadUserProgress();

    // Animate cards upward and fade in
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(translateY1, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity1, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(translateY2, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity2, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(translateY3, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity3, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Load user progress from AsyncStorage
  const loadUserProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('userProgress');
      if (saved) {
        const data = JSON.parse(saved);
        const safeData = {
          ...defaultUserProgress,
          ...data,
          completedMaterials: data.completedMaterials || [],
          badges: data.badges || [],
        };
        setUserProgress(safeData);
      }
    } catch (err) {
      console.error('Failed to load user progress:', err);
    }
  };

  // Render the games landing screen
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: NAVBAR_HEIGHT }]}>
        <Text style={styles.title}>Edu Games</Text>

        <Animated.View style={[styles.card, { transform: [{ translateY: translateY1 }], opacity: opacity1 }]}>
          <TouchableOpacity style={{ width: '100%', alignItems: 'center' }} onPress={() => navigation.navigate('ReadingChoices')}>
            <Image source={require('../assets/thumbnails/reading.png')} style={styles.image} resizeMode="contain" />
            <Text style={styles.cardText}>Reading</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.card, { transform: [{ translateY: translateY2 }], opacity: opacity2 }]}>
          <TouchableOpacity style={{ width: '100%', alignItems: 'center' }} onPress={() => navigation.navigate('Quiz')}>
            <Image source={require('../assets/thumbnails/quiz.png')} style={styles.image} resizeMode="contain" />
            <Text style={styles.cardText}>Quiz</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.card, { transform: [{ translateY: translateY3 }], opacity: opacity3 }]}>
          <TouchableOpacity style={{ width: '100%', alignItems: 'center' }} onPress={() => navigation.navigate('EmergencyKit')}>
            <Image source={require('../assets/thumbnails/emergency-kit.png')} style={styles.image} resizeMode="contain" />
            <Text style={styles.cardText}>Build an{"\n"}emergency kit</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <NavBar />
    </SafeAreaView>
  );
}

// Get device width/height for responsive map sizing
const { width, height } = Dimensions.get('window');
const NAVBAR_HEIGHT = width * 0.18;
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEFFF3',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    marginBottom: height * 0.02,
    color: '#1A2B44',
    alignSelf: 'flex-start',
  },
  card: {
    width: '100%',
    borderRadius: 15,
    padding: width * 0.05,
    marginBottom: height * 0.025,
    backgroundColor: '#faf8f6',
    alignItems: 'center',
    shadowColor: '#1A2B44',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  image: {
    width: width * 0.22,
    height: width * 0.22,
    marginBottom: height * 0.015,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A2B44',
    textAlign: 'center',
  },
});
