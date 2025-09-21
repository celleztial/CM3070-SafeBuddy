import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ShareToScreen from '../screens/ShareToScreen';
import { Alert } from 'react-native';

// Mocks dependencies
jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({ coords: { latitude: 1.0, longitude: 2.0 } })
  ),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

jest.mock('../firebase/contactService', () => ({
  getContacts: jest.fn(() =>
    Promise.resolve([
      { id: 'u1', name: 'Alice' },
      { id: 'u2', name: 'Bob' },
    ])
  ),
}));

jest.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: { uid: 'mockUser' } }),
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock('../firebase/locationShare', () => ({
  sendOneTimeLocation: jest.fn(),
  startLiveLocationShare: jest.fn(),
  startLiveLocationUpdates: jest.fn(),
}));

jest.mock('../FirebaseConfig', () => ({
  auth: { currentUser: { uid: 'sender123' } },
}));

const mockGoBack = jest.fn();
const mockRoute = {
  params: {
    isLive: false,
    duration: 1,
    location: null,
  },
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
  useRoute: () => mockRoute,
}));

jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

// Test suite
describe('ShareToScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Render test
  it('renders contacts list and title', async () => {
    const { getByText } = render(<ShareToScreen />);
    await waitFor(() => {
      expect(getByText('Select Contact to Share')).toBeTruthy();
      expect(getByText('Alice')).toBeTruthy();
      expect(getByText('Bob')).toBeTruthy();
    });
  });

  // Alert test
  it('shows confirmation alert when contact is tapped', async () => {
    const { getByText } = render(<ShareToScreen />);
    await waitFor(() => fireEvent.press(getByText('Alice')));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Share Location',
      'Share your one-time location with Alice?',
      expect.any(Array)
    );
  });

  // Sharing tests
  it('sends one-time location on confirm', async () => {
    const { getByText } = render(<ShareToScreen />);
    await waitFor(() => fireEvent.press(getByText('Bob')));

    const [, , buttons] = Alert.alert.mock.calls[0];
    const shareButton = buttons?.find(b => b.text === 'Send');
    expect(shareButton).toBeDefined();
    await act(async () => shareButton.onPress());

    const { sendOneTimeLocation } = require('../firebase/locationShare');
    expect(sendOneTimeLocation).toHaveBeenCalledWith(
      'mockUser',
      'u2',
      expect.objectContaining({ latitude: 1.0, longitude: 2.0 })
    );
  });

  it('sends live location if isLive is true', async () => {
    mockRoute.params.isLive = true;
    const { getByText } = render(<ShareToScreen />);
    await waitFor(() => fireEvent.press(getByText('Alice')));

    const [, , buttons] = Alert.alert.mock.calls[0];
    const shareButton = buttons?.find(b => b.text === 'Send');
    expect(shareButton).toBeDefined();
    await act(async () => shareButton.onPress());

    const { startLiveLocationShare, startLiveLocationUpdates } = require('../firebase/locationShare');
    expect(startLiveLocationShare).toHaveBeenCalled();
    expect(startLiveLocationUpdates).toHaveBeenCalled();
  });

  // Error handling test
  it('shows error alert if something fails', async () => {
  mockRoute.params.isLive = false; 

  const { sendOneTimeLocation } = require('../firebase/locationShare');
  sendOneTimeLocation.mockRejectedValue(new Error('Sharing failed'));

  const { getByText } = render(<ShareToScreen />);
  await waitFor(() => fireEvent.press(getByText('Bob')));

  const [, , buttons] = Alert.alert.mock.calls[0];
  const shareButton = buttons?.find(b => b.text === 'Send');
  expect(shareButton).toBeDefined();
  await act(async () => shareButton.onPress());

  await waitFor(() =>
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to share location.')
  );
});

  // Navigation test
  it('navigates back when back button is pressed', async () => {
    const { getByText } = render(<ShareToScreen />);
    fireEvent.press(getByText('←'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
