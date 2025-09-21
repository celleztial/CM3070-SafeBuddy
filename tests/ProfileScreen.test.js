import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../screens/ProfileScreen';
import { auth, db } from '../FirebaseConfig';
import * as Haptics from 'expo-haptics';
import * as notifications from '../components/notifications';
import { Alert } from 'react-native';

// Mock dependencies
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockUpdateDoc = jest.fn();
const mockGetDoc = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => 'mock-doc-ref'),
  getDoc: jest.fn(() => mockGetDoc()),
  updateDoc: jest.fn(() => mockUpdateDoc()),
}));

jest.mock('../FirebaseConfig', () => ({
  auth: { currentUser: { uid: 'mock-uid' } },
  db: {},
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'Success' },
}));

jest.mock('../components/notifications', () => ({
  scheduleDailyReminder: jest.fn(),
  cancelDailyReminder: jest.fn(),
  requestNotificationPermissions: jest.fn(),
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
});

// Test suite
describe('ProfileScreen', () => {
  it('renders all profile fields and buttons', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ name: 'Jane', phone: '999', address: 'Somewhere', dailyRemindersEnabled: true }),
    });

    const { getByDisplayValue, getByText } = render(<ProfileScreen />);

    await waitFor(() => {
      expect(getByDisplayValue('Jane')).toBeTruthy();
      expect(getByDisplayValue('999')).toBeTruthy();
      expect(getByDisplayValue('Somewhere')).toBeTruthy();
      expect(getByText('Save Changes')).toBeTruthy();
    });
  });

  // Update profile test
  it('updates profile and triggers haptics and navigation', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({}) });

    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => fireEvent.press(getByText('Save Changes')));

    expect(mockUpdateDoc).toHaveBeenCalled();
    expect(Haptics.notificationAsync).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Profile updated!');
    expect(mockGoBack).toHaveBeenCalled();
  });

  // Daily reminder toggle tests
  it('toggles daily reminder ON with permission granted', async () => {
    notifications.requestNotificationPermissions.mockResolvedValue(true);
    notifications.scheduleDailyReminder.mockResolvedValue(true);
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({}) });

    const { getByLabelText } = render(<ProfileScreen />);

    await waitFor(() => {
      const toggle = getByLabelText('Daily Reminders');
      fireEvent(toggle, 'valueChange', true);
    });

    expect(notifications.scheduleDailyReminder).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith('Success', expect.stringContaining('Daily reminders enabled'));
  });

  it('toggles daily reminder OFF', async () => {
    notifications.cancelDailyReminder.mockResolvedValue(true);
    notifications.requestNotificationPermissions.mockResolvedValue(true);
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({}) });

    const { getByLabelText } = render(<ProfileScreen />);

    await waitFor(() => {
      const toggle = getByLabelText('Daily Reminders');
      fireEvent(toggle, 'valueChange', false);
    });

    expect(notifications.cancelDailyReminder).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith('Success', expect.stringContaining('disabled'));
  });
});