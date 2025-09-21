import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ContactsScreen from '../screens/ContactsScreen';

// Mock firebase getContacts
const mockGetContacts = jest.fn();
jest.mock('../firebase/contactService', () => ({
  getContacts: (...args) => mockGetContacts(...args),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useFocusEffect: (cb) => cb(), // call immediately
}));

// Mock firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'user123' },
  }),
}));

// Mock NavBar
jest.mock('../components/navbar', () => 'NavBar');

// Test suite
describe('ContactsScreen', () => {
  const contacts = [
    { id: '1', name: 'Alice', phone: '111-111', address: 'Wonderland', label: 'Friend' },
    { id: '2', name: 'Bob', phone: '', address: '', label: '' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetContacts.mockResolvedValue(contacts);
  });

  // Render test
  it('renders the title, search bar and add button', async () => {
    const { getByText, getByPlaceholderText } = render(<ContactsScreen />);

    await waitFor(() => {
      expect(getByText('Contact Book')).toBeTruthy();
    });
    expect(getByPlaceholderText('Search contacts...')).toBeTruthy();
    expect(getByText('Add Contact')).toBeTruthy();
  });

  it('renders contacts after fetching', async () => {
    const { getByText } = render(<ContactsScreen />);
    await waitFor(() => {
      expect(getByText(/Alice/)).toBeTruthy();
      expect(getByText(/^Bob$/)).toBeTruthy();
    });
  });

  // Navigation tests
  it('navigates to AddContact when add button pressed', async () => {
    const { getByText } = render(<ContactsScreen />);
    await waitFor(() => getByText('Add Contact'));
    fireEvent.press(getByText('Add Contact'));
    expect(mockNavigate).toHaveBeenCalledWith('AddContact');
  });

  it('navigates to ContactDetails when a contact pressed', async () => {
    const { getByText } = render(<ContactsScreen />);
    await waitFor(() => getByText('Alice (Friend)'));
    fireEvent.press(getByText('Alice (Friend)'));
    expect(mockNavigate).toHaveBeenCalledWith('ContactDetails', { contactId: '1' });
  });

  // Search functionality tests
  it('filters contacts when typing in search bar', async () => {
    const { getByPlaceholderText, queryByText } = render(<ContactsScreen />);
    await waitFor(() => {});
    fireEvent.changeText(getByPlaceholderText('Search contacts...'), 'Alice');
    expect(queryByText('Alice (Friend)')).toBeTruthy();
    expect(queryByText('Bob')).toBeNull();
  });

  it('shows empty text when no contacts', async () => {
    mockGetContacts.mockResolvedValue([]);
    const { getByText } = render(<ContactsScreen />);
    await waitFor(() => {
      expect(getByText('No contacts yet. Add someone you trust!')).toBeTruthy();
    });
  });

  it('shows placeholder text for missing phone and address', async () => {
    const { getByText } = render(<ContactsScreen />);
    await waitFor(() => {
      expect(getByText("Bob hasn't added a phone number")).toBeTruthy();
      expect(getByText("Bob hasn't added an address")).toBeTruthy();
    });
  });
});
