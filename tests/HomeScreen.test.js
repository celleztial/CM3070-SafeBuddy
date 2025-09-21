import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';

// Mock Firebase
const mockSignOut = jest.fn();
const mockGetDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  getDoc: mockGetDoc,
  doc: jest.fn(() => 'mock-doc-ref'),
  getDocs: jest.fn(),
  collection: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  signOut: () => mockSignOut(), // make signOut a call wrapper
}));

jest.mock('../FirebaseConfig', () => ({
  auth: { currentUser: { uid: 'user123' } },
  db: 'mock-db',
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({ params: {} }),
}));

// Mock custom components
jest.mock('../components/navbar', () => 'NavBar');
jest.mock('../components/mapPreview', () => 'MapPreview');
jest.mock('react-native-modal', () => 'Modal');

// Spy on React Native APIs
import { Alert, Linking } from 'react-native';
jest.spyOn(Alert, 'alert').mockImplementation(() => {});
jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());

// Test suite
describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'John Doe', phone: '123-456-7890' }),
    });

    Linking.openURL.mockResolvedValue(true);
  });

  // Render test
  it('renders main UI elements', () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText('Map')).toBeTruthy();
    expect(getByText('Police Stations')).toBeTruthy();
    expect(getByText('Share One-Time Location')).toBeTruthy();
    expect(getByText('Share Live Location')).toBeTruthy();
    expect(getByText('Call Local Emergency')).toBeTruthy();
    expect(getByText('Profile Settings')).toBeTruthy();
    expect(getByText('Logout')).toBeTruthy();
  });

  // Navigation tests
  it('navigates to Profile screen when Profile Settings is pressed', () => {
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Profile Settings'));
    expect(mockNavigate).toHaveBeenCalledWith('Profile');
  });

  it('navigates to Police Stations screen when Police Stations is pressed', () => {
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Police Stations'));
    expect(mockNavigate).toHaveBeenCalledWith('SpfScreen');
  });

  // Button functionality tests
  it('calls signOut when logout button is pressed', () => {
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Logout'));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('opens emergency dialer when emergency button is pressed', () => {
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Call Local Emergency'));
    expect(Linking.openURL).toHaveBeenCalledWith('tel:999');
  });

  it('shows alert when map refresh button is pressed', () => {
    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('🔄'));
    expect(Alert.alert).toHaveBeenCalledWith('Map refreshed!');
  });
});
