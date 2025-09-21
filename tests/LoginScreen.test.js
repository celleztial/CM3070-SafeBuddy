import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

// Mock FirebaseConfig
jest.mock('../FirebaseConfig', () => ({
  auth: {},
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock Alert
const mockAlert = jest.fn();
jest.spyOn(require('react-native'), 'Alert', 'get').mockReturnValue({
  alert: mockAlert,
});

// Test suite
describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Render test
  it('renders all input fields and login button', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Password')).toBeTruthy();
    expect(getByText('Log In')).toBeTruthy();
    expect(getByText(/Don't have an account/i)).toBeTruthy();
  });

  // Navigation test
  it('navigates to SignUp screen when Sign up text is pressed', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Sign up'));
    expect(mockNavigate).toHaveBeenCalledWith('SignUp');
  });

  // Shows alrert tests
  it('shows success alert on successful login', async () => {
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: '123' } });

    const { getByText, getByPlaceholderText  } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Log In'));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), 
        'test@example.com',
        'password123'
      );
      expect(mockAlert).toHaveBeenCalledWith('Success', 'You are now signed in');
    });
  });

  it('shows error alert on failed login', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'wrong@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrongpass');
    fireEvent.press(getByText('Log In'));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalledWith('Login Error', 'Invalid credentials');
    });
  });
});
