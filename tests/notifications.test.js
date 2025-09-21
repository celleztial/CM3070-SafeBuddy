// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn()
}));

// Import functions to test
const {
  requestNotificationPermissions,
  registerForPushNotifications,
  sendLocationShareNotification,
  scheduleLocalNotification,
  scheduleDailyReminder,
  cancelDailyReminder
} = require('../components/notifications');

const Notifications = require('expo-notifications');

// Test suite
describe('notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Request permission tests
  describe('requestNotificationPermissions', () => {
    it('should return true when permission is already granted', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });

      const result = await requestNotificationPermissions();

      expect(result).toBe(true);
      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should request permission when not already granted', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

      const result = await requestNotificationPermissions();

      expect(result).toBe(true);
      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false when permission is denied', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const result = await requestNotificationPermissions();

      expect(result).toBe(false);
      expect(console.log).toHaveBeenCalledWith('Notification permission denied');
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Permission error');
      Notifications.getPermissionsAsync.mockRejectedValue(error);

      const result = await requestNotificationPermissions();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error requesting notification permissions:', error);
    });
  });

  // Register for push notifications tests
  describe('registerForPushNotifications', () => {
    it('should return true when permissions are granted', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });

      const result = await registerForPushNotifications('user123');

      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith('Local notifications enabled for user:', 'user123');
    });

    it('should return false when permissions are denied', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const result = await registerForPushNotifications('user123');

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Registration error');
      Notifications.getPermissionsAsync.mockRejectedValue(error);

      const result = await registerForPushNotifications('user123');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error requesting notification permissions:', error);
    });
  });

  // Send location share notification tests
  describe('sendLocationShareNotification', () => {
    beforeEach(() => {
      Notifications.scheduleNotificationAsync.mockResolvedValue();
    });

    it('should send live location notification with correct content', async () => {
      await sendLocationShareNotification('recipient123', 'John Doe', 'live', 2);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Live Location Shared',
          body: 'John Doe shared their live location with you for 2 hours',
          data: {
            type: 'location_share',
            senderName: 'John Doe',
            locationType: 'live',
            duration: 2
          }
        },
        trigger: null
      });
    });

    it('should send live location notification with singular hour', async () => {
      await sendLocationShareNotification('recipient123', 'Jane Smith', 'live', 1);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Live Location Shared',
          body: 'Jane Smith shared their live location with you for 1 hour',
          data: {
            type: 'location_share',
            senderName: 'Jane Smith',
            locationType: 'live',
            duration: 1
          }
        },
        trigger: null
      });
    });

    it('should send current location notification with correct content', async () => {
      await sendLocationShareNotification('recipient123', 'Bob Wilson', 'current');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Location Shared',
          body: 'Bob Wilson shared their current location with you',
          data: {
            type: 'location_share',
            senderName: 'Bob Wilson',
            locationType: 'current',
            duration: null
          }
        },
        trigger: null
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Notification error');
      Notifications.scheduleNotificationAsync.mockRejectedValue(error);

      await sendLocationShareNotification('recipient123', 'Test User', 'current');

      expect(console.error).toHaveBeenCalledWith('Error sending local notification:', error);
    });

    it('should log successful notification', async () => {
      await sendLocationShareNotification('recipient123', 'Test User', 'current');

      expect(console.log).toHaveBeenCalledWith(
        'Local notification sent:',
        'Location Shared',
        'Test User shared their current location with you'
      );
    });
  });

  // Schedule local notification tests
  describe('scheduleLocalNotification', () => {
    it('should schedule notification with provided content', async () => {
      Notifications.scheduleNotificationAsync.mockResolvedValue();

      await scheduleLocalNotification('Test Title', 'Test Body', { custom: 'data' });

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Test Title',
          body: 'Test Body',
          data: { custom: 'data' }
        },
        trigger: null
      });
    });

    it('should schedule notification with empty data object by default', async () => {
      Notifications.scheduleNotificationAsync.mockResolvedValue();

      await scheduleLocalNotification('Test Title', 'Test Body');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Test Title',
          body: 'Test Body',
          data: {}
        },
        trigger: null
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Schedule error');
      Notifications.scheduleNotificationAsync.mockRejectedValue(error);

      await scheduleLocalNotification('Test Title', 'Test Body');

      expect(console.error).toHaveBeenCalledWith('Error scheduling local notification:', error);
    });
  });

  // Schedule daily reminder tests
  describe('scheduleDailyReminder', () => {
    it('should cancel existing reminder and schedule new one', async () => {
      Notifications.cancelScheduledNotificationAsync.mockResolvedValue();
      Notifications.scheduleNotificationAsync.mockResolvedValue();

      const result = await scheduleDailyReminder();

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('daily-app-reminder');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Stay Connected',
          body: 'Check your location shares and connect with friends today!',
          data: {
            type: 'daily_reminder'
          }
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true
        },
        identifier: 'daily-app-reminder'
      });
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith('Daily reminder scheduled');
    });

    it('should handle errors and return false', async () => {
      const error = new Error('Schedule error');
      Notifications.cancelScheduledNotificationAsync.mockRejectedValue(error);

      const result = await scheduleDailyReminder();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error scheduling daily reminder:', error);
    });
  });

  // Cancel daily reminder tests
  describe('cancelDailyReminder', () => {
    it('should cancel daily reminder successfully', async () => {
      Notifications.cancelScheduledNotificationAsync.mockResolvedValue();

      const result = await cancelDailyReminder();

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('daily-app-reminder');
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith('Daily reminder cancelled');
    });

    it('should handle errors and return false', async () => {
      const error = new Error('Cancel error');
      Notifications.cancelScheduledNotificationAsync.mockRejectedValue(error);

      const result = await cancelDailyReminder();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error cancelling daily reminder:', error);
    });
  });
});