// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-server-timestamp'),
  getDoc: jest.fn()
}));

// Mock FirebaseConfig
jest.mock('../FirebaseConfig', () => ({
  db: 'mock-db'
}));

// Mock notifications
jest.mock('../components/notifications', () => ({
  sendLocationShareNotification: jest.fn()
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  watchPositionAsync: jest.fn(),
  Accuracy: {
    High: 'high'
  }
}));

// Import mocked functions
const {
sendOneTimeLocation,
  startLiveLocationShare,
  stopSharingLocation,
  stopLiveLocationUpdates,
  startLiveLocationUpdates
} = require('../firebase/locationShare');

const {
  doc,
  setDoc,
  deleteDoc,
  getDoc
} = require('firebase/firestore');

const { sendLocationShareNotification } = require('../components/notifications');
const Location = require('expo-location');

// Test suite
describe('locationShare', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendOneTimeLocation', () => {
    const mockLocation = {
      latitude: 37.7749,
      longitude: -122.4194
    };

    // Send one-time location test
    it('should send one-time location successfully', async () => {
      // Mock sender document
      const mockSenderDoc = {
        exists: () => true,
        data: () => ({ name: 'John Doe' })
      };

      doc.mockReturnValue('mock-doc-ref');
      setDoc.mockResolvedValue();
      getDoc.mockResolvedValue(mockSenderDoc);
      sendLocationShareNotification.mockResolvedValue();

      await sendOneTimeLocation('sender123', 'recipient456', mockLocation);

      expect(doc).toHaveBeenCalledWith('mock-db', 'users', 'recipient456', 'sharedLocations', 'sender123');
      expect(setDoc).toHaveBeenCalledWith('mock-doc-ref', {
        type: 'current',
        coords: mockLocation,
        timestamp: 'mock-server-timestamp',
        expiresAt: 1000000 + (5 * 60 * 1000) 
      });

      expect(doc).toHaveBeenCalledWith('mock-db', 'users', 'sender123');
      expect(getDoc).toHaveBeenCalled();

      expect(sendLocationShareNotification).toHaveBeenCalledWith('recipient456', 'John Doe', 'current');
    });

    // Fallback name tests
    it('should use "Someone" as fallback name when sender doc does not exist', async () => {
      const mockSenderDoc = {
        exists: () => false,
        data: () => ({})
      };

      getDoc.mockResolvedValue(mockSenderDoc);
      doc.mockReturnValue('mock-doc-ref');
      setDoc.mockResolvedValue();
      sendLocationShareNotification.mockResolvedValue();

      await sendOneTimeLocation('sender123', 'recipient456', mockLocation);

      expect(sendLocationShareNotification).toHaveBeenCalledWith('recipient456', 'Someone', 'current');
    });

    it('should use "Someone" as fallback when sender has no name', async () => {
      const mockSenderDoc = {
        exists: () => true,
        data: () => ({ email: 'test@example.com' }) 
      };

      getDoc.mockResolvedValue(mockSenderDoc);
      doc.mockReturnValue('mock-doc-ref');
      setDoc.mockResolvedValue();
      sendLocationShareNotification.mockResolvedValue();

      await sendOneTimeLocation('sender123', 'recipient456', mockLocation);

      expect(sendLocationShareNotification).toHaveBeenCalledWith('recipient456', 'Someone', 'current');
    });

    it('should handle errors gracefully', async () => {
      setDoc.mockRejectedValue(new Error('Firebase error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await sendOneTimeLocation('sender123', 'recipient456', mockLocation);

      expect(consoleSpy).toHaveBeenCalledWith('Error sending current location:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  // Start live location share tests
  describe('startLiveLocationShare', () => {
    const mockLocation = {
      latitude: 37.7749,
      longitude: -122.4194
    };
    const durationMs = 2 * 60 * 60 * 1000; 

    it('should start live location share successfully', async () => {
      const mockSenderDoc = {
        exists: () => true,
        data: () => ({ name: 'Jane Smith' })
      };

      doc.mockReturnValue('mock-doc-ref');
      setDoc.mockResolvedValue();
      getDoc.mockResolvedValue(mockSenderDoc);
      sendLocationShareNotification.mockResolvedValue();

      await startLiveLocationShare('sender123', 'recipient456', mockLocation, durationMs);

      expect(setDoc).toHaveBeenCalledWith('mock-doc-ref', {
        type: 'live',
        coords: mockLocation,
        startedAt: 1000000,
        expiresAt: 1000000 + durationMs
      });

      expect(sendLocationShareNotification).toHaveBeenCalledWith('recipient456', 'Jane Smith', 'live', 2);
    });

    it('should handle fractional hours correctly', async () => {
      const mockSenderDoc = {
        exists: () => true,
        data: () => ({ name: 'Test User' })
      };

      const durationMs15Hours = 1.5 * 60 * 60 * 1000;

      getDoc.mockResolvedValue(mockSenderDoc);
      doc.mockReturnValue('mock-doc-ref');
      setDoc.mockResolvedValue();
      sendLocationShareNotification.mockResolvedValue();

      await startLiveLocationShare('sender123', 'recipient456', mockLocation, durationMs15Hours);

      // Should round 1.5 hours to 2
      expect(sendLocationShareNotification).toHaveBeenCalledWith('recipient456', 'Test User', 'live', 2);
    });

    it('should handle errors gracefully', async () => {
      setDoc.mockRejectedValue(new Error('Firebase error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await startLiveLocationShare('sender123', 'recipient456', mockLocation, durationMs);

      expect(consoleSpy).toHaveBeenCalledWith('Error starting live location share:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  // Stop sharing location tests
  describe('stopSharingLocation', () => {
    it('should delete shared location document', async () => {
      doc.mockReturnValue('mock-doc-ref');
      deleteDoc.mockResolvedValue();

      await stopSharingLocation('sender123', 'recipient456');

      expect(doc).toHaveBeenCalledWith('mock-db', 'users', 'recipient456', 'sharedLocations', 'sender123');
      expect(deleteDoc).toHaveBeenCalledWith('mock-doc-ref');
    });

    it('should handle errors gracefully', async () => {
      deleteDoc.mockRejectedValue(new Error('Firebase error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await stopSharingLocation('sender123', 'recipient456');

      expect(consoleSpy).toHaveBeenCalledWith('Error stopping location share:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  // Stop live location updates test
  describe('stopLiveLocationUpdates', () => {
    it('should remove watcher when it exists', async () => {
      const mockWatcher = {
        remove: jest.fn().mockResolvedValue()
      };
      
      Location.watchPositionAsync.mockResolvedValue(mockWatcher);
      
      await startLiveLocationUpdates('sender123', 'recipient456');
      
      await stopLiveLocationUpdates();

      expect(mockWatcher.remove).toHaveBeenCalled();
    });

    it('should handle case when no watcher exists', async () => {
      await expect(stopLiveLocationUpdates()).resolves.not.toThrow();
    });
  });

  // Start live location updates tests
  describe('startLiveLocationUpdates', () => {
    const mockWatcher = {
      remove: jest.fn().mockResolvedValue()
    };

    beforeEach(() => {
      Location.watchPositionAsync.mockResolvedValue(mockWatcher);
    });

    it('should start watching position', async () => {
      await startLiveLocationUpdates('sender123', 'recipient456');

      expect(Location.watchPositionAsync).toHaveBeenCalledWith(
        {
          accuracy: 'high',
          timeInterval: 5000,
          distanceInterval: 10
        },
        expect.any(Function)
      );
    });

    it('should clear previous watcher before starting new one', async () => {
      await startLiveLocationUpdates('sender123', 'recipient456');
      
      await startLiveLocationUpdates('sender123', 'recipient456');

      expect(mockWatcher.remove).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      Location.watchPositionAsync.mockRejectedValue(new Error('Location error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await startLiveLocationUpdates('sender123', 'recipient456');

      expect(consoleSpy).toHaveBeenCalledWith('Error starting live location updates:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should update location when live share is active and not expired', async () => {
      const mockLocationUpdate = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      };

      const mockExistingDoc = {
        exists: () => true,
        data: () => ({
          type: 'live',
          expiresAt: 2000000 
        })
      };

      doc.mockReturnValue('mock-doc-ref');
      getDoc.mockResolvedValue(mockExistingDoc);
      setDoc.mockResolvedValue();

      await startLiveLocationUpdates('sender123', 'recipient456');

      const positionCallback = Location.watchPositionAsync.mock.calls[0][1];

      await positionCallback(mockLocationUpdate);

      expect(setDoc).toHaveBeenCalledWith('mock-doc-ref', {
        type: 'live',
        expiresAt: 2000000,
        coords: mockLocationUpdate.coords,
        updatedAt: 1000000
      });
    });

    it('should clean up when live share has expired', async () => {
      const mockLocationUpdate = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      };

      const mockExistingDoc = {
        exists: () => true,
        data: () => ({
          type: 'live',
          expiresAt: 500000 
        })
      };

      doc.mockReturnValue('mock-doc-ref');
      getDoc.mockResolvedValue(mockExistingDoc);
      deleteDoc.mockResolvedValue();

      await startLiveLocationUpdates('sender123', 'recipient456');

      const positionCallback = Location.watchPositionAsync.mock.calls[0][1];

      await positionCallback(mockLocationUpdate);

      expect(deleteDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(mockWatcher.remove).toHaveBeenCalled();
    });

    it('should stop updates when document does not exist', async () => {
      const mockLocationUpdate = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      };

      const mockExistingDoc = {
        exists: () => false
      };

      getDoc.mockResolvedValue(mockExistingDoc);

      await startLiveLocationUpdates('sender123', 'recipient456');

      const positionCallback = Location.watchPositionAsync.mock.calls[0][1];

      await positionCallback(mockLocationUpdate);

      expect(mockWatcher.remove).toHaveBeenCalled();
    });
  });
});