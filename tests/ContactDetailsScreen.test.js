const React = require('react');
const { render, fireEvent, waitFor } = require('@testing-library/react-native');
const ContactDetailsScreen = require('../screens/ContactDetailsScreen').default;
const { Alert } = require('react-native');
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock dependencies
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack
  }),
  useRoute: () => ({
    params: { contactId: 'test-contact-123' }
  })
}));

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'current-user-123' }
  })
}));

jest.mock('../firebase/contactService', () => ({
  getContacts: jest.fn(),
  updateContact: jest.fn(),
  deleteContact: jest.fn()
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
    Error: 'error'
  }
}));

// Import mocked functions
const { getContacts, updateContact, deleteContact } = require('../firebase/contactService');
const Haptics = require('expo-haptics');

// Test suite 
describe('ContactDetailsScreen', () => {
  const mockContact = {
    id: 'test-contact-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    label: 'Friend'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getContacts.mockResolvedValue([mockContact]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Loading and Rendering tests
  describe('Loading and Rendering', () => {
    it('should render null when contact is not loaded', () => {
      getContacts.mockResolvedValue([]);
      const { toJSON } = render(<ContactDetailsScreen />);
      expect(toJSON()).toBeNull(); 
    });

    it('should render contact details when contact is loaded', async () => {
      const { getByText, getByDisplayValue } = render(<ContactDetailsScreen />);

      await waitFor(() => {
        expect(getByText('Contact Details')).toBeTruthy();
        expect(getByText('Name')).toBeTruthy();
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Label')).toBeTruthy();
        expect(getByDisplayValue('Friend')).toBeTruthy();
        expect(getByText('Save Changes')).toBeTruthy();
        expect(getByText('Delete Contact')).toBeTruthy();
      });
    });

    it('should render contact with empty label when no label exists', async () => {
      const contactWithoutLabel = { ...mockContact, label: undefined };
      getContacts.mockResolvedValue([contactWithoutLabel]);

      const { getByDisplayValue } = render(<ContactDetailsScreen />);

      await waitFor(() => {
        expect(getByDisplayValue('')).toBeTruthy();
      });
    });

    it('should call getContacts on mount', async () => {
      render(<ContactDetailsScreen />);

      await waitFor(() => {
        expect(getContacts).toHaveBeenCalledWith('current-user-123');
      });
    });
  });

  // Navigation tests
  describe('Navigation', () => {
    it('should navigate back when back button is pressed', async () => {
      const { getByText } = render(<ContactDetailsScreen />);

      await waitFor(() => {
        expect(getByText('←')).toBeTruthy();
      });

      fireEvent.press(getByText('←'));
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  // Label input tests
  describe('Label Input', () => {
    it('should update label when text is changed', async () => {
      const { getByDisplayValue } = render(<ContactDetailsScreen />);

      await waitFor(() => {
        expect(getByDisplayValue('Friend')).toBeTruthy();
      });

      const input = getByDisplayValue('Friend');
      fireEvent.changeText(input, 'Best Friend');

      expect(input.props.value).toBe('Best Friend');
    });

    it('should show placeholder text', async () => {
      const contactWithoutLabel = { ...mockContact, label: '' };
      getContacts.mockResolvedValue([contactWithoutLabel]);

      const { getByPlaceholderText } = render(<ContactDetailsScreen />);

      await waitFor(() => {
        expect(getByPlaceholderText('e.g. Friend, Sibling')).toBeTruthy();
      });
    });
  });

  // Data loading tests
  describe('Data Loading Edge Cases', () => {
    it('should handle when contact is not found', async () => {
      getContacts.mockResolvedValue([]);

      const { queryByText } = render(<ContactDetailsScreen />);

      await waitFor(() => {
        expect(getContacts).toHaveBeenCalled();
      });

      expect(queryByText('Contact Details')).toBeNull();
    });

    it('should find correct contact by id', async () => {
      const multipleContacts = [
        { id: 'other-contact', name: 'Jane Doe', label: 'Colleague' },
        mockContact,
        { id: 'another-contact', name: 'Bob Smith', label: 'Family' }
      ];
      getContacts.mockResolvedValue(multipleContacts);

      const { getByText } = render(<ContactDetailsScreen />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(() => getByText('Jane Doe')).toThrow();
        expect(() => getByText('Bob Smith')).toThrow();
      });
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle empty label save', async () => {
      updateContact.mockResolvedValue();

      const { getByDisplayValue, getByText } = render(<ContactDetailsScreen />);

      await waitFor(() => {
        expect(getByDisplayValue('Friend')).toBeTruthy();
      });

      const input = getByDisplayValue('Friend');
      fireEvent.changeText(input, '');

      fireEvent.press(getByText('Save Changes'));

      await waitFor(() => {
        expect(updateContact).toHaveBeenCalledWith('current-user-123', 'test-contact-123', {
          label: ''
        });
      });
    });

    it('should handle very long label', async () => {
      updateContact.mockResolvedValue();

      const { getByDisplayValue, getByText } = render(<ContactDetailsScreen />);

      await waitFor(() => {
        expect(getByDisplayValue('Friend')).toBeTruthy();
      });

      const longLabel = 'A'.repeat(100);
      const input = getByDisplayValue('Friend');
      fireEvent.changeText(input, longLabel);

      fireEvent.press(getByText('Save Changes'));

      await waitFor(() => {
        expect(updateContact).toHaveBeenCalledWith('current-user-123', 'test-contact-123', {
          label: longLabel
        });
      });
    });
  });
});