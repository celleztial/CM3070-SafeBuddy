// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn()
}));

// Mock FirebaseConfig
jest.mock('../FirebaseConfig', () => ({
  db: 'mock-db'
}));

const {
  checkUserByEmail,
  addContact,
  getContacts,
  updateContact,
  deleteContact
} = require('../firebase/contactService');

const {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc
} = require('firebase/firestore');

// Test suite
describe('contactService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkUserByEmail', () => {
    it('should return user data when email is found', async () => {
      // Mock data
      const mockUserData = {
        email: 'test@example.com',
        name: 'Test User'
      };
      
      const mockDocSnap = {
        id: 'user123',
        data: () => mockUserData
      };

      const mockSnapshot = {
        docs: [mockDocSnap]
      };

      // Setup mocks
      collection.mockReturnValue('mock-collection');
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await checkUserByEmail('test@example.com');

      expect(result).toEqual({
        uid: 'user123',
        email: 'test@example.com',
        name: 'Test User'
      });
      expect(collection).toHaveBeenCalledWith('mock-db', 'users');
      expect(getDocs).toHaveBeenCalledWith('mock-collection');
    });

    it('should return null when email is not found', async () => {
      const mockSnapshot = {
        docs: []
      };

      getDocs.mockResolvedValue(mockSnapshot);

      const result = await checkUserByEmail('notfound@example.com');

      expect(result).toBeNull();
    });

    it('should return null when error occurs', async () => {
      getDocs.mockRejectedValue(new Error('Firebase error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await checkUserByEmail('test@example.com');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error checking user by email:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('addContact', () => {
    it('should add contact with default label', async () => {
      doc.mockReturnValue('mock-doc-ref');
      setDoc.mockResolvedValue();

      await addContact('user1', 'user2');

      expect(doc).toHaveBeenCalledWith('mock-db', 'users', 'user1', 'contacts', 'user2');
      expect(setDoc).toHaveBeenCalledWith('mock-doc-ref', {
        label: 'Friend'
      });
    });

    it('should add contact with custom label', async () => {
      doc.mockReturnValue('mock-doc-ref');
      setDoc.mockResolvedValue();

      await addContact('user1', 'user2', 'Family');

      expect(setDoc).toHaveBeenCalledWith('mock-doc-ref', {
        label: 'Family'
      });
    });

    it('should handle errors gracefully', async () => {
      setDoc.mockRejectedValue(new Error('Firebase error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await addContact('user1', 'user2');

      expect(consoleSpy).toHaveBeenCalledWith('Error adding contact:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  // getContacts tests
  describe('getContacts', () => {
    it('should return contacts with user data', async () => {
      const mockContactDoc = {
        id: 'contact1',
        data: () => ({ label: 'Friend' })
      };
      
      const mockContactsSnapshot = {
        docs: [mockContactDoc]
      };

      const mockUserDoc = {
        exists: () => true,
        data: () => ({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          address: '123 Main St'
        })
      };

      collection.mockReturnValue('mock-contacts-collection');
      getDocs.mockResolvedValue(mockContactsSnapshot);
      doc.mockReturnValue('mock-user-doc');
      getDoc.mockResolvedValue(mockUserDoc);

      const result = await getContacts('currentUser');

      expect(result).toEqual([{
        id: 'contact1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        address: '123 Main St',
        label: 'Friend'
      }]);
    });

    it('should handle missing user data', async () => {
      const mockContactDoc = {
        id: 'contact1',
        data: () => ({ label: 'Friend' })
      };
      
      const mockContactsSnapshot = {
        docs: [mockContactDoc]
      };

      const mockUserDoc = {
        exists: () => false,
        data: () => ({})
      };

      getDocs.mockResolvedValue(mockContactsSnapshot);
      getDoc.mockResolvedValue(mockUserDoc);

      const result = await getContacts('currentUser');

      expect(result).toEqual([{
        id: 'contact1',
        name: 'Unknown',
        email: '',
        phone: '',
        address: '',
        label: 'Friend'
      }]);
    });

    it('should return empty array on error', async () => {
      getDocs.mockRejectedValue(new Error('Firebase error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getContacts('currentUser');

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error getting contacts:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  // updateContact tests
  describe('updateContact', () => {
    it('should update contact with merge option', async () => {
      doc.mockReturnValue('mock-doc-ref');
      setDoc.mockResolvedValue();

      const updates = { label: 'Best Friend' };
      await updateContact('user1', 'contact1', updates);

      expect(doc).toHaveBeenCalledWith('mock-db', 'users', 'user1', 'contacts', 'contact1');
      expect(setDoc).toHaveBeenCalledWith('mock-doc-ref', updates, { merge: true });
    });

    it('should handle errors gracefully', async () => {
      setDoc.mockRejectedValue(new Error('Firebase error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await updateContact('user1', 'contact1', {});

      expect(consoleSpy).toHaveBeenCalledWith('Error updating contact:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  // deleteContact tests
  describe('deleteContact', () => {
    it('should delete contact', async () => {
      doc.mockReturnValue('mock-doc-ref');
      deleteDoc.mockResolvedValue();

      await deleteContact('user1', 'contact1');

      expect(doc).toHaveBeenCalledWith('mock-db', 'users', 'user1', 'contacts', 'contact1');
      expect(deleteDoc).toHaveBeenCalledWith('mock-doc-ref');
    });

    it('should handle errors gracefully', async () => {
      deleteDoc.mockRejectedValue(new Error('Firebase error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await deleteContact('user1', 'contact1');

      expect(consoleSpy).toHaveBeenCalledWith('Error deleting contact:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});