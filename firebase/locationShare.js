import { db } from '../FirebaseConfig';
import { doc, setDoc, deleteDoc, serverTimestamp, getDoc,
} from 'firebase/firestore';
import { sendLocationShareNotification } from '../components/notifications';
import * as Location from 'expo-location';

// Globally track live share watcher
let liveWatcher = null; 

// Send a one-time location to recipient
export const sendOneTimeLocation = async (senderUid, recipientUid, location) => {
  try {
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    const ref = doc(db, 'users', recipientUid, 'sharedLocations', senderUid);
    await setDoc(ref, {
      type: 'current',
      coords: location,
      timestamp: serverTimestamp(),
      expiresAt,
    });

    // Get sender's name for notification
    const senderRef = doc(db, 'users', senderUid);
    const senderDoc = await getDoc(senderRef);
    const senderName = senderDoc.exists() ? senderDoc.data().name || 'Someone' : 'Someone';

    // Send notification
    await sendLocationShareNotification(recipientUid, senderName, 'current');

  } catch (error) {
    console.error('Error sending current location:', error);
  }
};

// Start live location sharing with expiration in ms
export const startLiveLocationShare = async (senderUid, recipientUid, location, durationMs) => {
  try {
    const expiresAt = Date.now() + durationMs;
    const ref = doc(db, 'users', recipientUid, 'sharedLocations', senderUid);
    await setDoc(ref, {
      type: 'live',
      coords: location,
      startedAt: Date.now(),
      expiresAt,
    });

    // Get sender's name for notification
    const senderRef = doc(db, 'users', senderUid);
    const senderDoc = await getDoc(senderRef);
    const senderName = senderDoc.exists() ? senderDoc.data().name || 'Someone' : 'Someone';

    // Convert duration from ms to hours for notification
    const durationHours = Math.round(durationMs / (1000 * 60 * 60));

    // Send notification
    await sendLocationShareNotification(recipientUid, senderName, 'live', durationHours);
  } catch (error) {
    console.error('Error starting live location share:', error);
  }
};

// Stop sharing 
export const stopSharingLocation = async (senderUid, recipientUid) => {
  try {
    const ref = doc(db, 'users', recipientUid, 'sharedLocations', senderUid);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error stopping location share:', error);
  }
};

export const stopLiveLocationUpdates = async () => {
  if (liveWatcher) {
  await liveWatcher.remove();
  liveWatcher = null;
  }
};

export const startLiveLocationUpdates = async (senderUid, recipientUid, ) => {
  try {
    // Clear any previous watcher
    if (liveWatcher) {
      await liveWatcher.remove();
      liveWatcher = null;
    }
    liveWatcher = await Location.watchPositionAsync(
    {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000, // 5 seconds
    distanceInterval: 10, // or every 10 meters
    },
    async (location) => {
      const ref = doc(db, 'users', recipientUid, 'sharedLocations', senderUid);
      const existingSnap = await getDoc(ref);


      if (existingSnap.exists() && existingSnap.data().type === 'live') {
        const { expiresAt: docExpiresAt } = existingSnap.data();
        const now = Date.now();

        if (now < docExpiresAt) {
          await setDoc(ref, {
          ...existingSnap.data(),
          coords: location.coords,
          updatedAt: Date.now(),
          });
        } else {
        // Time expired, clean up
        await stopLiveLocationUpdates();
        await deleteDoc(ref);
        }
      } else {
        await stopLiveLocationUpdates();
      }
    });
  } catch (error) {
    console.error('Error starting live location updates:', error);
  }
};
