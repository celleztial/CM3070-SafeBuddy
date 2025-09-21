import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { quizContent } from '../components/static/quizContent';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics'; 
import ConfettiCannon from 'react-native-confetti-cannon';

// language options
const LANGUAGES = ['en', 'cn', 'my', 'tm'];

// QuizScreen presents a multiple-choice quiz with language options and feedback
export default function QuizScreen() {
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Handle answer selection
  const handleSelect = (qId, optionIdx) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  // Calculate score based on correct answers
  const calculateScore = () => {
    let score = 0;
    quizContent.questions.forEach((q) => {
      const selectedIdx = selectedAnswers[q.id];
      if (
        selectedIdx !== undefined &&
        q.options[selectedLanguage] &&
        q.options[selectedLanguage][selectedIdx]?.correct
      ) {
        score++;
      }
    });
    return score;
  };

  // Total questions for result display
  const totalQuestions = quizContent.questions.length;
  const score = calculateScore();

  // UI rendering 
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>
          {quizContent.title[selectedLanguage] ?? 'Quiz'}
        </Text>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('GamesLanding')}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        {/* Language Toggle */}
        <View style={styles.languageToggle}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.langButton,
                selectedLanguage === lang && styles.langButtonActive,
              ]}
              onPress={() => setSelectedLanguage(lang)}
            >
              <Text
                style={[
                  styles.langText,
                  selectedLanguage === lang && styles.langTextActive,
                ]}
              >
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
            
          ))}
        </View>

        {/* Questions */}
        {quizContent.questions.map((q, qIndex) => (
          <View key={q.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {qIndex + 1}. {q.text[selectedLanguage]}
            </Text>
            {(q.options[selectedLanguage] ?? []).map((opt, optIdx) => {
              const isSelected = selectedAnswers[q.id] === optIdx;
              const isCorrect = opt.correct;
              const isWrong = isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={optIdx}
                  onPress={() => handleSelect(q.id, optIdx)}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionSelected,
                    showResults && isCorrect && styles.optionCorrect,
                    showResults && isWrong && styles.optionWrong,
                  ]}
                >
                  <Text style={styles.optionText}>{opt.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {!showResults && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={async () => {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setShowResults(true);
              setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000); 
            }}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        )}

        {showResults && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>
              {selectedLanguage === 'en' && `You scored ${score} out of ${totalQuestions}`}
              {selectedLanguage === 'cn' && `你得了 ${score} 分（满分 ${totalQuestions}`}
              {selectedLanguage === 'my' && `Skor anda: ${score} daripada ${totalQuestions}`}
              {selectedLanguage === 'tm' && `நீங்கள் ${totalQuestions} இல் ${score} மதிப்பெண்கள் பெற்றீர்கள்`}
            </Text>
          </View>
        )}

        {showConfetti && (
        <ConfettiCannon
          count={100}
          origin={{ x: width / 2, y: height / 2 }}
          fadeOut
          autoStart
        />
      )}

      </ScrollView>
    </SafeAreaView>
  );
}

// Get device width/height for responsive map sizing
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#EEFFF3' 
  },
  scroll: { 
    paddingHorizontal: width * 0.05, 
    paddingTop: height * 0.03, 
    paddingBottom: height * 0.12 
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
  languageToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: width * 0.02,
    marginBottom: height * 0.025,
  },
  langButton: {
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.03,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#888',
    marginHorizontal: width * 0.015,
  },
  langButtonActive: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  langText: {
    fontSize: width * 0.035,
    color: '#444',
  },
  langTextActive: {
    color: '#faf8f6',
  },
  questionContainer: {
    marginBottom: height * 0.03,
  },
  questionText: {
    fontSize: width * 0.04,
    fontWeight: '600',
    marginBottom: height * 0.01,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.03,
    borderRadius: 15,
    marginBottom: height * 0.01,
  },
  optionText: {
    fontSize: width * 0.035,
    color: '#333',
  },
  optionSelected: {
    borderColor: '#1e40af',
    backgroundColor: '#dbeafe',
  },
  optionCorrect: {
    borderColor: 'green',
    backgroundColor: '#dcfce7',
  },
  optionWrong: {
    borderColor: 'red',
    backgroundColor: '#fee2e2',
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: height * 0.02,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: height * 0.015,
  },
  submitText: {
    color: '#faf8f6',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  resultBox: {
    marginTop: height * 0.03,
    padding: width * 0.05,
    backgroundColor: '#faf8f6',
    borderRadius: 15,
  },
  resultText: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});