import { db } from '../FirebaseConfig';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

// Check if a user exists by email
export const checkUserByEmail = async (email) => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (data.email === email) {
        return { uid: docSnap.id, ...data };
      }
    }
    return null;
  } catch (error) {
    console.error('Error checking user by email:', error);
    return null;
  }
};

// Add a contact to the current user's contact list
export const addContact = async (currentUid, contactUid, label = 'Friend') => {
  try {
    const contactRef = doc(db, 'users', currentUid, 'contacts', contactUid);
    await setDoc(contactRef, {
      label,
    });
  } catch (error) {
    console.error('Error adding contact:', error);
  }
};

// Get all contacts for the current user with their details
export const getContacts = async (currentUid) => {
  const contacts = [];
  try {
    const contactsRef = collection(db, 'users', currentUid, 'contacts');
    const snapshot = await getDocs(contactsRef);
    for (const docSnap of snapshot.docs) {
      const contactUid = docSnap.id;
      const contactData = docSnap.data();

      const userDoc = await getDoc(doc(db, 'users', contactUid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      contacts.push({
        id: contactUid,
        name: userData.name || 'Unknown',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        ...contactData,
      });

    }
  } catch (error) {
    console.error('Error getting contacts:', error);
  }
  return contacts;
};

// Update contact details (e.g., label)
export const updateContact = async (currentUid, contactUid, updates) => {
  try {
    const ref = doc(db, 'users', currentUid, 'contacts', contactUid);
    await setDoc(ref, updates, { merge: true });
  } catch (error) {
    console.error('Error updating contact:', error);
  }
};

// Delete a contact from the current user's contact list
export const deleteContact = async (currentUid, contactUid) => {
  try {
    const ref = doc(db, 'users', currentUid, 'contacts', contactUid);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error deleting contact:', error);
  }
};