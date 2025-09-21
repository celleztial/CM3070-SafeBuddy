import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import QuizScreen from '../screens/QuizScreen';
import * as Haptics from 'expo-haptics';

// Mock quizContent
jest.mock('../components/static/quizContent', () => ({
  quizContent: {
    title: {
      en: 'Sample Quiz',
      cn: '示例测验',
      my: 'Kuiz Contoh',
      tm: 'மாதிரி வினாடி வினா',
    },
    questions: [
      {
        id: 'q1',
        text: {
          en: 'What is 2 + 2?',
          cn: '2 + 2 等于几？',
          my: 'Berapakah 2 + 2?',
          tm: '2 + 2 என்ன?',
        },
        options: {
          en: [
            { text: '3', correct: false },
            { text: '4', correct: true },
          ],
          cn: [
            { text: '三', correct: false },
            { text: '四', correct: true },
          ],
          my: [
            { text: 'Tiga', correct: false },
            { text: 'Empat', correct: true },
          ],
          tm: [
            { text: 'மூன்று', correct: false },
            { text: 'நான்கு', correct: true },
          ],
        },
      },
    ],
  },
}));

// Mock dependencies
jest.mock('react-native-confetti-cannon', () => () => null);

// Mock Haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'Success',
  },
}));

const renderWithNavigation = (ui) => {
  return render(<NavigationContainer>{ui}</NavigationContainer>);
};

// Test suite
describe('QuizScreen', () => {
  // Render test
  it('renders quiz title and language buttons', () => {
    const { getByText } = renderWithNavigation(<QuizScreen />);
    expect(getByText('Sample Quiz')).toBeTruthy();
    expect(getByText('EN')).toBeTruthy();
    expect(getByText('CN')).toBeTruthy();
    expect(getByText('MY')).toBeTruthy();
    expect(getByText('TM')).toBeTruthy();
  });

  // Answer selection and submission test
  it('submits the quiz and shows result', async () => {
    const { getByText, findByText } = renderWithNavigation(<QuizScreen />);
    fireEvent.press(getByText('4')); 
    fireEvent.press(getByText('Submit'));
    await findByText('You scored 1 out of 1');
    expect(Haptics.notificationAsync).toHaveBeenCalled();
  });

  // Language change test
  it('changes language and shows translated question and options', () => {
    const { getByText } = renderWithNavigation(<QuizScreen />);
    fireEvent.press(getByText('CN'));
    expect(getByText(/2 \+ 2 等于几？/)).toBeTruthy();
    expect(getByText('三')).toBeTruthy();
    expect(getByText('四')).toBeTruthy();
  });
});


