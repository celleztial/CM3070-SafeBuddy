// components/notifications.js - Simple local notifications only
import * as Notifications from 'expo-notifications';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Simple registration 
export const registerForPushNotifications = async (userId) => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (hasPermission) {
      console.log('Local notifications enabled for user:', userId);
    }
    return hasPermission;
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return false;
  }
};

// Send  notification  
export const sendLocationShareNotification = async (recipientUid, senderName, locationType, duration = null) => {
  try {
    let title, body;
    if (locationType === 'live') {
      title = 'Live Location Shared';
      body = `${senderName} shared their live location with you for ${duration} hour${duration > 1 ? 's' : ''}`;
    } else {
      title = 'Location Shared';
      body = `${senderName} shared their current location with you`;
    }
    
    // Schedule immediate local notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: {
          type: 'location_share',
          senderName: senderName,
          locationType: locationType,
          duration: duration
        },
      },
      trigger: null, // Show immediately
    });
    
    console.log('Local notification sent:', title, body);
    
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
};

// Schedule a local notification
export const scheduleLocalNotification = async (title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Error scheduling local notification:', error);
  }
};

// Daily reminder notification functions
const DAILY_REMINDER_ID = 'daily-app-reminder';

export const scheduleDailyReminder = async () => {
  try {
    // Cancel any existing daily reminder
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
    
    // Schedule new daily reminder at 9 AM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Stay Connected',
        body: 'Check your location shares and connect with friends today!',
        data: {
          type: 'daily_reminder',
        },
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
      identifier: DAILY_REMINDER_ID,
    });
    
    console.log('Daily reminder scheduled');
    return true;
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
    return false;
  }
};

// Cancel the daily reminder notification
export const cancelDailyReminder = async () => {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
    console.log('Daily reminder cancelled');
    return true;
  } catch (error) {
    console.error('Error cancelling daily reminder:', error);
    return false;
  }
};