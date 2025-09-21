import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SpfEstablishmentsScreen from '../screens/spfEstablishmentsScreen';

// Mock Location
 const mockGetCurrentPositionAsync = jest.fn();
 const mockRequestForegroundPermissionsAsync = jest.fn();

jest.mock('expo-location', () => ({
  getCurrentPositionAsync: mockGetCurrentPositionAsync,
  requestForegroundPermissionsAsync: mockRequestForegroundPermissionsAsync,
}));

// Mock SPF API
const mockGetSpfStations = jest.fn();
jest.mock('../apis/spf', () => ({
  getSpfStations: mockGetSpfStations,
}));

// Mock Navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Mock React Native
const mockAlert = jest.fn();
const mockLinkingOpenURL = jest.fn();

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  TextInput: 'TextInput',
  ActivityIndicator: 'ActivityIndicator',
  RefreshControl: 'RefreshControl',
  StyleSheet: { 
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style)
  },
  Dimensions: { 
    get: jest.fn(() => ({ width: 400, height: 800 })) 
  },
  Alert: { alert: mockAlert },
  Linking: { openURL: mockLinkingOpenURL }
}));

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaView: ({ children, ...props }) => <View {...props}>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    initialWindowMetrics: {
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    },
  };
});


// Test suite
describe('SpfEstablishmentsScreen', () => {
  const mockStationData = [
    {
      geometry: {
        coordinates: [103.8198, 1.3521],
      },
      properties: {
        Description:
          '<th>STREET_NAME</th><td>Marina Bay Station</td><th>TELEPHONE</th><td>6221-0000</td><th>POSTAL_CODE</th><td>018956</td><th>OPERATING_HOURS</th><td>24 hours</td>',
      },
    },
    {
      geometry: {
        coordinates: [103.8067, 1.2966],
      },
      properties: {
        Description:
          '<th>STREET_NAME</th><td>Orchard Station</td><th>TELEPHONE</th><td>6733-0000</td><th>POSTAL_CODE</th><td>238872</td><th>OPERATING_HOURS</th><td>24 hours</td>',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 1.3521, longitude: 103.8198 },
    });
    mockGetSpfStations.mockResolvedValue(mockStationData);
    mockLinkingOpenURL.mockResolvedValue(true);
  });

  // Navigation test
  it('navigates to Home when back button is pressed', async () => {
    const { getByText } = render(<SpfEstablishmentsScreen />);
    
    await waitFor(() => {
      expect(getByText('Police Stations')).toBeTruthy();
    });

    fireEvent.press(getByText('←'));
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });

  // Error handling tests
  it('shows error message when API fails', async () => {
    mockGetSpfStations.mockRejectedValue(new Error('API Error'));

    const { getByText } = render(<SpfEstablishmentsScreen />);
    
    await waitFor(() => {
      expect(getByText('⚠️ Failed to load station data.')).toBeTruthy();
    });
  });

  it('shows "No stations available" when no data is returned', async () => {
    mockGetSpfStations.mockResolvedValue([]);

    const { getByText } = render(<SpfEstablishmentsScreen />);
    
    await waitFor(() => {
      expect(getByText('No stations available')).toBeTruthy();
    });
  });

});