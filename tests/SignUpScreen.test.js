import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpScreen from '../screens/SignUpScreen';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { Alert } from 'react-native';

// Firebase mocks
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  setDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('expo-checkbox', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ value, onValueChange, ...props }) => (
    <View
      accessibilityRole="checkbox"
      testID="mockCheckbox"
      onTouchStart={() => onValueChange(!value)}
      {...props}
    />
  );
});

jest.mock('../FirebaseConfig', () => ({
  auth: {},
  db: {}, // if your SignUpScreen uses Firestore too
}));


// Navigation mock
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Alert mock using spyOn pattern
const mockAlert = jest.fn();
jest.spyOn(Alert, 'alert').mockImplementation(mockAlert);

// Test suite
describe('SignUpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Render test
  it('renders all input fields, checkbox, and button', () => {
    const { getByText } = render(<SignUpScreen />);

    expect(getByText('Register')).toBeTruthy();
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Password')).toBeTruthy();
    expect(getByText('Register account')).toBeTruthy();
    expect(getByText(/I agree that my email will be used/i)).toBeTruthy();
  });

  it('shows alert if checkbox is not ticked', () => {
    const { getByText } = render(<SignUpScreen />);
    fireEvent.press(getByText('Register account'));

    expect(mockAlert).toHaveBeenCalledWith(
      'Agreement Required',
      'You must agree to the use of your email to proceed.'
    );
  });

  // Successful sign-up test
  it('submits successfully when form is valid and checkbox is ticked', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'abc123' },
    });

    const { getByText, getByTestId, getByLabelText } = render(<SignUpScreen />);

    fireEvent.changeText(getByLabelText(/name/i), 'Jane Doe');
    fireEvent.changeText(getByLabelText(/email/i), 'jane@example.com');
    fireEvent.changeText(getByLabelText(/password/i), 'password123');
    fireEvent(getByTestId('mockCheckbox'), 'valueChange', true);
    fireEvent.press(getByText('Register account'));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'jane@example.com',
        'password123'
      );
    });

    expect(setDoc).toHaveBeenCalled();
    expect(mockAlert).toHaveBeenCalledWith('Success', 'Account created!');
    expect(mockNavigate).toHaveBeenCalledWith('Home', { uid: 'abc123' });
  });

  // Error handling test
  it('shows error alert when sign up fails', async () => {
    createUserWithEmailAndPassword.mockRejectedValue(new Error('Email already in use'));

    const { getByText, getByTestId, getByLabelText } = render(<SignUpScreen />);

    fireEvent.changeText(getByLabelText('Name'), 'Jane Doe');
    fireEvent.changeText(getByLabelText('Email'), 'jane@example.com');
    fireEvent.changeText(getByLabelText('Password'), 'password123');
    fireEvent(getByTestId('mockCheckbox'), 'valueChange', true);
    fireEvent.press(getByText('Register account'));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Sign Up Error', 'Email already in use');
    });
  });

  it('navigates to login screen when "Log in" is pressed', () => {
    const { getByText } = render(<SignUpScreen />);
    fireEvent.press(getByText('Log in'));
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
});
