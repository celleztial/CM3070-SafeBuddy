import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Alert, Image, Animated } from 'react-native';
import { readingMaterials, badges, defaultUserProgress, calculateTotalPoints } from '../components/static/readingMaterials';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

// ReadingChoicesScreen allows users to select and read educational materials, track progress, and earn badges
export default function ReadingChoicesScreen({ navigation }) {
  const [userProgress, setUserProgress] = useState(defaultUserProgress);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [language, setLanguage] = useState('en');
  const filteredMaterials = readingMaterials[language] || [];
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Load user progress on mount
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      // If this ever happens, the route shouldn't be reachable.
      Alert.alert('Not signed in', 'Please sign in again.');
      navigation.goBack();
      return;
    }
    loadUserProgress(user.uid);

    // Shake animation loop
    Animated.loop(
      Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Load user progress from Firestore
  const loadUserProgress = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        const safeData = {
          ...defaultUserProgress,
          ...data,
          completedMaterials: data.completedMaterials || [],
          badges: data.badges || [],
          totalScore: data.totalScore || 0,
        };
        setUserProgress(safeData);
      } else {
        await setDoc(userRef, defaultUserProgress);
        setUserProgress(defaultUserProgress);
      }
    } catch (e) {
      console.log('Error loading progress:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Save user progress to Firestore
  const saveUserProgress = async (newProgress) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return; 
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, newProgress);
      setUserProgress(newProgress);
    } catch (e) {
      console.log('Error saving progress:', e);
    }
  };

  // Start reading a material
  const startReading = (material) => {
    setSelectedMaterial(material);
    setIsReading(true);
    setReadingProgress(0);
  };

  // Handle completing a reading
  const handleReadingComplete = async () => {
    if (!selectedMaterial) return;

    const alreadyCompleted = userProgress.completedMaterials.includes(selectedMaterial.id);
    if (alreadyCompleted) {
      Alert.alert('Already Completed', 'You have already completed this reading!', [{ text: 'OK' }]);
      setIsReading(false);
      setSelectedMaterial(null);
      setReadingProgress(0);
      return;
    }

    // Update progress
    const newCompletedMaterials = [...userProgress.completedMaterials, selectedMaterial.id];
    const newTotalScore = calculateTotalPoints(newCompletedMaterials);
    const newBadges = [...userProgress.badges];

    // Add reading-specific badge if not already earned
    if (!newBadges.includes(selectedMaterial.badgeTitle)) {
      newBadges.push(selectedMaterial.badgeTitle);
    }

    // Completed badge (for finishing all readings in the selected language)
    const totalReadingsInLanguage = filteredMaterials.length;
    const completedInLanguage = newCompletedMaterials.filter((id) =>
      filteredMaterials.some((m) => m.id === id)
    ).length;

    let mostRecentBadge = selectedMaterial.badgeTitle;
    if (completedInLanguage === totalReadingsInLanguage && !newBadges.includes('Completed')) {
      newBadges.push('Completed');
      mostRecentBadge = 'Completed';
    }

    const newProgress = {
      ...userProgress,
      completedMaterials: newCompletedMaterials,
      totalScore: newTotalScore,
      mostRecentBadge,
      badges: newBadges,
      lastReadingDate: new Date().toISOString(),
    };

    await saveUserProgress(newProgress);

    // Badge alerts
    const badge = badges[selectedMaterial.badgeTitle]; // Changed from selectedMaterial.id
    const completedBadge = badges['Completed'];

    if (completedInLanguage === totalReadingsInLanguage && mostRecentBadge === 'Completed') {
      const badgeMessage = completedBadge
        ? `You've completed all readings in ${language.toUpperCase()}! ${completedBadge.description}`
        : `You've completed all readings in ${language.toUpperCase()}!`;

      Alert.alert('🏆 All Readings Completed!', badgeMessage, [{ text: 'Amazing!' }]);
    } else {
      if (badge && badge.icon && badge.description) {
        Alert.alert(
          `${badge.icon || '🏅'} Badge Earned!`,
          `You are now a ${selectedMaterial.badgeTitle}!\n${badge.description[language] || badge.description.en}`,
          [{ text: 'Great!' }]
        );
      } else {
        Alert.alert('🏅 Reading Complete!', `You completed "${selectedMaterial.title}"!`, [
          { text: 'Nice!' },
        ]);
      }
    }

    // Reset reading state
    setIsReading(false);
    setSelectedMaterial(null);
    setReadingProgress(0);
  };

  // Track reading scroll progress
  const onScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const progress = (contentOffset.y + layoutMeasurement.height) / contentSize.height;
    setReadingProgress(Math.min(progress, 1));
  };

  // Animated shake style for images
  const animatedShakeStyle = {
  transform: [
      {
        rotate: shakeAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-1deg', '1deg'],
        }),
      },
    ],
  };

  // Format content with basic markdown-like syntax
  const formatContent = (content) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <Text key={index} style={styles.boldText}>
            {line.replace(/\*\*/g, '')}
          </Text>
        );
      } else if (line.startsWith('•')) {
        return (
          <Text key={index} style={styles.bulletPoint}>
            {line}
          </Text>
        );
      } else if (line.trim() === '') {
        return <View key={index} style={styles.lineBreak} />;
      } else {
        return (
          <Text key={index} style={styles.regularText}>
            {line}
          </Text>
        );
      }
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.title}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Reading View Ui
  if (isReading && selectedMaterial) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.readingHeader}>
          <TouchableOpacity onPress={() => setIsReading(false)}>
            <Text style={styles.readingBackText}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${readingProgress * 100}%` }]} />
          </View>
          <Text style={styles.progressPctText}>{Math.round(readingProgress * 100)}%</Text>
        </View>

        <ScrollView style={styles.readingContent} onScroll={onScroll} scrollEventThrottle={16}>
          <Text style={styles.readingTitle}>{selectedMaterial.title}</Text>
          <View style={styles.readingMeta}>
            <Text style={styles.metaText}>📖 {selectedMaterial.readingTime}</Text>
            <Text style={styles.metaText}>⭐ {selectedMaterial.points} points</Text>
            <Text style={styles.metaText}>Level {selectedMaterial.difficulty}</Text>
          </View>
          <View style={styles.contentContainer}>{formatContent(selectedMaterial.content)}</View>

          {readingProgress > 0.8 && (
            <TouchableOpacity style={styles.completeButton} onPress={handleReadingComplete}>
              <Text style={styles.completeButtonText}>
                {userProgress.completedMaterials.includes(selectedMaterial.id) ? '✓ Completed' : 'Mark as Complete'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main Screen UI
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.title}>Read About</Text>
          <TouchableOpacity onPress={() => setLanguageMenuVisible(!languageMenuVisible)}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1A2B44' }}>🌐 {language.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {languageMenuVisible && (
          <View style={{ marginBottom: 16 }}>
            {['en', 'cn', 'my', 'tm'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={{ paddingVertical: 6 }}
                onPress={() => {
                  setLanguage(lang);
                  setLanguageMenuVisible(false);
                }}
              >
                <Text style={{ fontSize: 16, color: language === lang ? '#10b981' : '#1A2B44' }}>
                  {lang === 'en' ? 'English' : lang === 'cn' ? '简体中文' : lang === 'my' ? 'Bahasa Melayu' : 'தமிழ்'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Back to games */}
        <TouchableOpacity style={styles.backButtonContainer} onPress={() => navigation.navigate('GamesLanding')}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Progress indicator */}
        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>
            Progress:{' '}
            {
              userProgress.completedMaterials.filter((id) => filteredMaterials.some((m) => m.id === id))
                .length
            }
            /{filteredMaterials.length} completed
          </Text>

          {userProgress.badges.includes('Completed') && (
            <View style={styles.completedBadgeContainer}>
              <Image
                source={require('../assets/badges/completed-badge.png')}
                style={styles.completedBadgeImage}
                resizeMode="contain"
              />
              <Text style={styles.completedText}>You have completed all readings!</Text>
            </View>
          )}
        </View>

        <View style={styles.gridContainer}>
          {filteredMaterials.map((material) => {
            const isCompleted = (userProgress?.completedMaterials || []).includes(material.id);
            const hasBadge = (userProgress?.badges || []).includes(material.badgeTitle);
            const badge = badges[material.badgeTitle];

            return (
              <TouchableOpacity
                key={material.id}
                style={[styles.card, isCompleted && styles.completedCard]}
                onPress={() => startReading(material)}
              >
                <Animated.Image
                source={material.thumbnail}
                style={[styles.image, animatedShakeStyle]}
                resizeMode="contain"
                />
                <Text style={styles.cardLabel}>{material.title}</Text>
                {isCompleted && (
                  <View style={styles.badgeIndicator}>
                    <Text style={styles.badgeEmoji}>{badge?.icon || '🏅'}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.04,
    paddingBottom: height * 0.15,
  },
  backButtonContainer: {
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
  progressIndicator: {
    backgroundColor: '#faf8f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6, 
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B44',
    textAlign: 'center',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    textAlign: 'center',
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - width * 0.12 - width * 0.03 * 3) / 2,
    height: (width - width * 0.12 - width * 0.03 * 3) / 2,
    backgroundColor: '#faf8f6',
    borderColor: '#1A2B44',
    borderWidth: 1,
    borderRadius: width * 0.04,
    marginBottom: width * 0.03,
    alignItems: 'center',
    justifyContent: 'center',
    padding: width * 0.02,
    position: 'relative',
  },
  completedCard: {
    borderColor: '#10b981',
    backgroundColor: '#faf8f6',
  },
  image: {
    width: '70%',
    height: '60%',
    marginBottom: height * 0.01,
  },
  cardLabel: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#1A2B44',
    textAlign: 'center',
  },
  badgeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#faf8f6',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  badgeEmoji: {
    fontSize: 16,
  },
  readingHeader: {
    backgroundColor: '#1D3557',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readingBackText: {
    color: '#EEFFF3',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#EEFFF3',
    marginHorizontal: 15,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#A8DADC',
    borderRadius: 3,
  },
  progressPctText: {
    color: '#EEFFF3',
    fontSize: 16,
    fontWeight: '600',
  },
  readingContent: {
    flex: 1,
    backgroundColor: '#EEFFF3',
  },
  readingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D3557',
    padding: 20,
  },
  readingMeta: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#1D3557',
    fontWeight: '500',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  boldText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D3557',
    marginVertical: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#1D3557',
    lineHeight: 24,
    marginVertical: 4,
    paddingLeft: 10,
  },
  regularText: {
    fontSize: 16,
    color: '#1D3557',
    lineHeight: 24,
    marginVertical: 6,
  },
  lineBreak: {
    height: 12,
  },
  completeButton: {
    backgroundColor: '#10B981',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#1D3557',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedBadgeContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  completedBadgeImage: {
    width: 140,
    height: 140,
  },
});