const React = require('react');
const { render, fireEvent, waitFor } = require('@testing-library/react-native');
const { Alert } = require('react-native');
const AddContactScreen = require('../screens/AddContactScreen').default;


// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate
  })
}));

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'current-user-123' }
  })
}));

jest.mock('../firebase/contactService', () => ({
  checkUserByEmail: jest.fn(),
  addContact: jest.fn()
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
    Error: 'error'
  }
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock navigation functions
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

// Import mocked functions
const { checkUserByEmail, addContact } = require('../firebase/contactService');
const Haptics = require('expo-haptics');

// Test suite 
describe('AddContactScreen', () => {
  const getAddButton = (getAllByText) => {
    const buttons = getAllByText('Add Contact');
    return buttons[1]; 
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert.mockImplementation(() => {});
  });

  // Rendering tests
  describe('Rendering', () => {
    it('should render all UI elements correctly', () => {
      const { getAllByText, getByText, getByPlaceholderText } = render(<AddContactScreen />);

      expect(getAllByText('Add Contact')).toHaveLength(2); 
      expect(getByText('←')).toBeTruthy();
      expect(getByPlaceholderText("Enter contact's registered email")).toBeTruthy();
    });

    it('should render input with correct props', () => {
      const { getByPlaceholderText } = render(<AddContactScreen />);
      const input = getByPlaceholderText("Enter contact's registered email");

      expect(input.props.keyboardType).toBe('email-address');
      expect(input.props.autoCapitalize).toBe('none');
    });
  });

  // Navigation tests
  describe('Navigation', () => {
    it('should navigate to Contacts when back button is pressed', () => {
      const { getByText } = render(<AddContactScreen />);
      const backButton = getByText('←');

      fireEvent.press(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('Contacts');
    });
  });

  // Input handling tests
  describe('Email Input', () => {
    it('should update email state when text is entered', () => {
      const { getByPlaceholderText } = render(<AddContactScreen />);
      const input = getByPlaceholderText("Enter contact's registered email");

      fireEvent.changeText(input, 'test@example.com');

      expect(input.props.value).toBe('test@example.com');
    });

    it('should allow empty input', () => {
      const { getByPlaceholderText } = render(<AddContactScreen />);
      const input = getByPlaceholderText("Enter contact's registered email");

      fireEvent.changeText(input, 'test@example.com');
      fireEvent.changeText(input, '');

      expect(input.props.value).toBe('');
    });
  });

  // Add contact functionality tests
  describe('Add Contact Functionality', () => {
    it('should show error alert when email is empty', async () => {
      const { getAllByText } = render(<AddContactScreen />);
      const addButton = getAddButton(getAllByText);

      fireEvent.press(addButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter an email');
      });
    });

    it('should show error alert when email is only whitespace', async () => {
      const { getByPlaceholderText, getAllByText } = render(<AddContactScreen />);
      const input = getByPlaceholderText("Enter contact's registered email");
      const addButton = getAddButton(getAllByText);

      fireEvent.changeText(input, '   ');
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter an email');
      });
    });

    it('should show error when user is not found', async () => {
      checkUserByEmail.mockResolvedValue(null);

      const { getByPlaceholderText, getAllByText } = render(<AddContactScreen />);
      const input = getByPlaceholderText("Enter contact's registered email");
      const addButton = getAddButton(getAllByText);

      fireEvent.changeText(input, 'notfound@example.com');
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(checkUserByEmail).toHaveBeenCalledWith('notfound@example.com');
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error', 
          'User not found or not registered with SafeBuddy'
        );
      });
    });

    it('should trim email before checking', async () => {
      checkUserByEmail.mockResolvedValue(null);

      const { getByPlaceholderText, getAllByText } = render(<AddContactScreen />);
      const input = getByPlaceholderText("Enter contact's registered email");
      const addButton = getAddButton(getAllByText);

      fireEvent.changeText(input, '  test@example.com  ');
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(checkUserByEmail).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('should successfully add contact when user is found', async () => {
      const mockUser = { uid: 'found-user-123' };
      checkUserByEmail.mockResolvedValue(mockUser);
      addContact.mockResolvedValue();

      const { getByPlaceholderText, getAllByText } = render(<AddContactScreen />);
      const input = getByPlaceholderText("Enter contact's registered email");
      const addButton = getAddButton(getAllByText);

      fireEvent.changeText(input, 'found@example.com');
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(checkUserByEmail).toHaveBeenCalledWith('found@example.com');
        expect(addContact).toHaveBeenCalledWith('current-user-123', 'found-user-123');
        expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Contact added!');
        expect(mockGoBack).toHaveBeenCalled();
      });
    });

    it('should handle add contact service error', async () => {
      const mockUser = { uid: 'found-user-123' };
      checkUserByEmail.mockResolvedValue(mockUser);
      addContact.mockRejectedValue(new Error('Service error'));

      const { getByPlaceholderText, getAllByText } = render(<AddContactScreen />);
      const input = getByPlaceholderText("Enter contact's registered email");
      const addButton = getAddButton(getAllByText);

      fireEvent.changeText(input, 'found@example.com');
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(addContact).toHaveBeenCalledWith('current-user-123', 'found-user-123');
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to add contact.');
        expect(mockGoBack).not.toHaveBeenCalled();
      });
    });
  });

  // User flow integration tests
  describe('User Flow Integration', () => {
    it('should complete full successful flow', async () => {
      const mockUser = { uid: 'contact-user-456' };
      checkUserByEmail.mockResolvedValue(mockUser);
      addContact.mockResolvedValue();

      const { getByPlaceholderText, getAllByText } = render(<AddContactScreen />);

      const input = getByPlaceholderText("Enter contact's registered email");
      fireEvent.changeText(input, 'newcontact@example.com');

      const addButton = getAddButton(getAllByText);
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(checkUserByEmail).toHaveBeenCalledWith('newcontact@example.com');
        expect(addContact).toHaveBeenCalledWith('current-user-123', 'contact-user-456');
        expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Contact added!');
        expect(mockGoBack).toHaveBeenCalled();
      });
    });

    it('should handle case where user enters email with different casing', async () => {
      const mockUser = { uid: 'contact-user-456' };
      checkUserByEmail.mockResolvedValue(mockUser);
      addContact.mockResolvedValue();

      const { getByPlaceholderText, getAllByText } = render(<AddContactScreen />);
      
      const input = getByPlaceholderText("Enter contact's registered email");
      fireEvent.changeText(input, 'TEST@EXAMPLE.COM');
      
      const addButton = getAddButton(getAllByText);
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(checkUserByEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
      });
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('should have accessible elements', () => {
      const { getAllByText, getByPlaceholderText } = render(<AddContactScreen />);

      expect(getAllByText('Add Contact')).toHaveLength(2); 
      expect(getByPlaceholderText("Enter contact's registered email")).toBeTruthy();
      expect(getAllByText('←')).toHaveLength(1); 
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle multiple rapid button presses', async () => {
      checkUserByEmail.mockResolvedValue(null);

      const { getByPlaceholderText, getAllByText } = render(<AddContactScreen />);
      const input = getByPlaceholderText("Enter contact's registered email");
      const addButton = getAddButton(getAllByText);

      fireEvent.changeText(input, 'test@example.com');
      
      fireEvent.press(addButton);
      fireEvent.press(addButton);
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(checkUserByEmail).toHaveBeenCalledTimes(3);
      });
    });

    it('should handle very long email addresses', async () => {
      checkUserByEmail.mockResolvedValue(null);

      const { getByPlaceholderText, getAllByText } = render(<AddContactScreen />);
      const input = getByPlaceholderText("Enter contact's registered email");
      const addButton = getAddButton(getAllByText);

      const longEmail = 'verylongemailaddressthatexceedsnormallengths@verylongdomainname.com';
      fireEvent.changeText(input, longEmail);
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(checkUserByEmail).toHaveBeenCalledWith(longEmail);
      });
    });
  });
});