// tests/GamesLandingScreen.test.js
const React = require('react');
const { render, fireEvent, waitFor } = require('@testing-library/react-native');
const GamesLandingScreen = require('../screens/GamesLandingScreen').default;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(),
}));

// Mock NavBar to render some text safely
jest.mock('../components/navbar', () => {
  const RN = require('react-native');
  return () => <RN.Text>NavBar</RN.Text>;
});

// Mock images
jest.mock('../assets/thumbnails/reading.png', () => 'reading.png');
jest.mock('../assets/thumbnails/quiz.png', () => 'quiz.png');
jest.mock('../assets/thumbnails/emergency-kit.png', () => 'emergency-kit.png');

// Test suite
describe('GamesLandingScreen', () => {
  const mockNavigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Render tests
  it('renders title and all cards', () => {
    const { getByText } = render(<GamesLandingScreen navigation={mockNavigation} />);
    expect(getByText('Edu Games')).toBeTruthy();
    expect(getByText('Reading')).toBeTruthy();
    expect(getByText('Quiz')).toBeTruthy();
    expect(getByText(/Build an/)).toBeTruthy();
  });

  it('loads default userProgress from AsyncStorage', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ completedMaterials: ['x'] }));
    render(<GamesLandingScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('userProgress');
    });
  });

  // Navigation tests
  it('navigates to ReadingChoices when Reading card pressed', () => {
    const { getByText } = render(<GamesLandingScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Reading'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ReadingChoices');
  });

  it('navigates to Quiz when Quiz card pressed', () => {
    const { getByText } = render(<GamesLandingScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Quiz'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Quiz');
  });

  it('navigates to EmergencyKit when emergency kit card pressed', () => {
    const { getByText } = render(<GamesLandingScreen navigation={mockNavigation} />);
    fireEvent.press(getByText(/Build an/));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('EmergencyKit');
  });

  it('renders NavBar at the bottom', () => {
    const { getByText } = render(<GamesLandingScreen navigation={mockNavigation} />);
    expect(getByText('NavBar')).toBeTruthy();
  });
});
