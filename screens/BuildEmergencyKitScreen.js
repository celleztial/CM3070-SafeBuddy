import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, } from 'react-native';
import { emergencyKitItems } from '../components/static/emergencyKitMaterials';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics'; 
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';

// BuildEmergencyKitScreen is an interactive quiz where users select essential items for an emergency kit
export default function BuildEmergencyKitScreen() {
  const [language, setLanguage] = useState('en');
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigation = useNavigation();
  const items = emergencyKitItems[language] || [];

  // Toggle item selection
  const toggleSelectItem = (id) => {
    if (submitted) return;
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Validate selected items against correct answers
  const validateSelection = () => {
    const correctIds = items.filter((item) => item.isEssential).map((item) => item.id);
    const isCorrect =
      correctIds.length === selectedItems.length &&
      correctIds.every((id) => selectedItems.includes(id));
      setSubmitted(true);

    // If correct, show confetti and success alert; else show try again alert
    if (isCorrect) {
      setShowConfetti(true); 
      Alert.alert('Well done!', 'You selected all the essential items correctly.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Try Again', 'Some items are incorrect. Review the checklist and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Title Row */}
      <Text style={styles.title}>Build an Emergency Kit</Text>

      {/* Back + Language Row */}
      <View style={styles.rowBelowTitle}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('GamesLanding')}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLanguageMenuVisible(!languageMenuVisible)}>
          <Text style={styles.languageToggle}>🌐 {language.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

    {/* Language Menu */}
    {languageMenuVisible && (
      <View style={styles.languageMenu}>
        {['en', 'cn', 'my', 'tm'].map((lang) => (
          <TouchableOpacity
            key={lang}
            style={styles.languageOption}
            onPress={() => {
              setLanguage(lang);
              setSelectedItems([]);
              setSubmitted(false);
              setLanguageMenuVisible(false);
            }}
          >
            <Text style={[styles.languageText, language === lang && styles.selectedLanguage]}>
              {lang === 'en' ? 'English' : lang === 'cn' ? '简体中文' : lang === 'my' ? 'Bahasa Melayu' : 'தமிழ்'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    {/* Emergency Kit Grid */}
    <View style={styles.gridContainer}>
      {items.map((item) => {
        const isSelected = selectedItems.includes(item.id);
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, isSelected && styles.selectedCard]}
            onPress={() => toggleSelectItem(item.id)}
          >
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </TouchableOpacity>
        );
      })}
    </View>

    {/* Submit Button */}
    <TouchableOpacity style={styles.submitButton} onPress={validateSelection}>
      <Text style={styles.submitText}>Submit Answers</Text>
    </TouchableOpacity>
    </ScrollView>
      {showConfetti && (
      <ConfettiCannon
        count={120}
        origin={{ x: width / 2, y: 0 }}
        fallSpeed={2500}
        explosionSpeed={350}
        fadeOut={true}
        autoStart={true}
        onAnimationEnd={() => setShowConfetti(false)}
      />
      )}
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
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.04,
    paddingBottom: height * 0.15,
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
  rowBelowTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  languageToggle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B44',
  },
  languageMenu: {
    marginBottom: 20,
    padding: 8,
    backgroundColor: '#faf8f6',
    borderRadius: 8,
    borderColor: '#1A2B44',
    borderWidth: 1,
  },
  languageOption: {
    paddingVertical: 6,
  },
  languageText: {
    fontSize: 16,
    color: '#1A2B44',
  },
  selectedLanguage: {
    color: '#10B981',
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - width * 0.12 - width * 0.03 * 3) / 2,
    backgroundColor: '#faf8f6',
    marginBottom: width * 0.04,
    padding: width * 0.04,
    alignItems: 'center',
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#1A2B44',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6, 
  },
  selectedCard: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  image: {
    width: '80%',
    height: 80,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B44',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 12,
    textAlign: 'center',
    color: '#4B5563',
  },
  submitButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    fontSize: 16,
    color: '#EEFFF3',
    fontWeight: '700',
  },
});
