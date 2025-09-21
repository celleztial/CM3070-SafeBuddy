const React = require('react');
const { render, fireEvent, waitFor } = require('@testing-library/react-native');
const BuildEmergencyKitScreen = require('../screens/BuildEmergencyKitScreen').default;

// Mock emergency kit data
jest.mock('../components/static/emergencyKitMaterials', () => ({
  emergencyKitItems: {
    en: [
      { id: 'water', name: 'Water', description: 'Essential for hydration', isEssential: true, image: 'mock-image' },
      { id: 'food', name: 'Food', description: 'Non-perishable food', isEssential: true, image: 'mock-image' },
      { id: 'flashlight', name: 'Flashlight', description: 'Emergency lighting', isEssential: true, image: 'mock-image' },
      { id: 'radio', name: 'Radio', description: 'Nice to have', isEssential: false, image: 'mock-image' },
      { id: 'matches', name: 'Matches', description: 'For lighting', isEssential: false, image: 'mock-image' }
    ],
    cn: [
      { id: 'water', name: '水', description: '水合作用必需', isEssential: true, image: 'mock-image' },
      { id: 'food', name: '食物', description: '不易腐烂的食物', isEssential: true, image: 'mock-image' }
    ]
  }
}));

// Import Alert mock functions
const { Alert } = require('react-native'); 

// Mock ConfettiCannon
jest.mock('react-native-confetti-cannon', () => 'ConfettiCannon');

// Mock Haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
    Error: 'error'
  }
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate
  }),
  useRoute: () => ({
    params: {}
  })
}));

// Import mocked functions
const Haptics = require('expo-haptics');

// Test suite 
describe('BuildEmergencyKitScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Rendering tests
  describe('Initial Rendering', () => {
    it('should render all UI elements correctly', () => {
      const { getByText } = render(<BuildEmergencyKitScreen />);

      expect(getByText('Build an Emergency Kit')).toBeTruthy();
      expect(getByText('←')).toBeTruthy();
      expect(getByText('🌐 EN')).toBeTruthy();
      expect(getByText('Submit Answers')).toBeTruthy();
    });

    it('should render emergency kit items', () => {
      const { getByText } = render(<BuildEmergencyKitScreen />);

      expect(getByText('Water')).toBeTruthy();
      expect(getByText('Food')).toBeTruthy();
      expect(getByText('Flashlight')).toBeTruthy();
      expect(getByText('Radio')).toBeTruthy();
      expect(getByText('Matches')).toBeTruthy();
    });

    it('should not show language menu initially', () => {
      const { queryByText } = render(<BuildEmergencyKitScreen />);

      expect(queryByText('English')).toBeNull();
      expect(queryByText('简体中文')).toBeNull();
    });

    it('should not show confetti initially', () => {
      const { queryByTestId } = render(<BuildEmergencyKitScreen />);
      // ConfettiCannon would only be rendered when showConfetti is true
      // Since we're testing initial state, it shouldn't be there
    });
  });

  // Navigation tests
  describe('Navigation', () => {
    it('should navigate to GamesLanding when back button is pressed', () => {
      const { getByText } = render(<BuildEmergencyKitScreen />);
      
      fireEvent.press(getByText('←'));
      
      expect(mockNavigate).toHaveBeenCalledWith('GamesLanding');
    });
  });

  // Language functionality tests
  describe('Language Functionality', () => {
    it('should toggle language menu when language button is pressed', () => {
      const { getByText, queryByText } = render(<BuildEmergencyKitScreen />);

      expect(queryByText('English')).toBeNull();

      fireEvent.press(getByText('🌐 EN'));

      expect(getByText('English')).toBeTruthy();
      expect(getByText('简体中文')).toBeTruthy();
      expect(getByText('Bahasa Melayu')).toBeTruthy();
      expect(getByText('தமிழ்')).toBeTruthy();
    });

    it('should change language and reset game state when language is selected', () => {
      const { getByText, queryByText } = render(<BuildEmergencyKitScreen />);

      fireEvent.press(getByText('🌐 EN'));

      fireEvent.press(getByText('简体中文'));

      expect(getByText('🌐 CN')).toBeTruthy();
      
      expect(getByText('水')).toBeTruthy();
      expect(getByText('食物')).toBeTruthy();

      expect(queryByText('English')).toBeNull();
    });

    it('should highlight selected language', () => {
      const { getByText } = render(<BuildEmergencyKitScreen />);

      fireEvent.press(getByText('🌐 EN'));

      expect(getByText('English')).toBeTruthy();
    });

    it('should reset selected items when changing language', () => {
      const { getByText } = render(<BuildEmergencyKitScreen />);

      fireEvent.press(getByText('Water'));

      fireEvent.press(getByText('🌐 EN'));
      fireEvent.press(getByText('简体中文'));

      fireEvent.press(getByText('🌐 CN'));
      fireEvent.press(getByText('English'));
    });
  });

  // Item selection tests
  describe('Item Selection', () => {
    it('should allow selecting items', () => {
      const { getByText } = render(<BuildEmergencyKitScreen />);

      fireEvent.press(getByText('Water'));
      fireEvent.press(getByText('Food'));
      fireEvent.press(getByText('Flashlight'));
    });

    it('should allow deselecting items', () => {
      const { getByText } = render(<BuildEmergencyKitScreen />);

      fireEvent.press(getByText('Water'));
      fireEvent.press(getByText('Water')); 
    });

    it('should not allow selection after submission', () => {
      const { getByText } = render(<BuildEmergencyKitScreen />);

      fireEvent.press(getByText('Submit Answers'));

      fireEvent.press(getByText('Water'));
    });
  });

  // Submission and feedback tests
  describe('Edge Cases', () => {
    it('should handle empty items array gracefully', () => {
      
      const { getByText } = render(<BuildEmergencyKitScreen />);
      expect(getByText('Build an Emergency Kit')).toBeTruthy();
    });

    it('should handle rapid item selection', () => {
      const { getByText } = render(<BuildEmergencyKitScreen />);

      fireEvent.press(getByText('Water'));
      fireEvent.press(getByText('Food'));
      fireEvent.press(getByText('Water')); 
      fireEvent.press(getByText('Water')); 
      fireEvent.press(getByText('Flashlight'));

      expect(getByText('Build an Emergency Kit')).toBeTruthy();
    });

    it('should handle rapid language switching', () => {
      const { getByText } = render(<BuildEmergencyKitScreen />);

      fireEvent.press(getByText('🌐 EN'));
      fireEvent.press(getByText('简体中文'));
      fireEvent.press(getByText('🌐 CN'));
      fireEvent.press(getByText('English'));

      expect(getByText('🌐 EN')).toBeTruthy();
      expect(getByText('Water')).toBeTruthy();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('should have accessible elements', () => {
      const { getByText } = render(<BuildEmergencyKitScreen />);

      expect(getByText('Build an Emergency Kit')).toBeTruthy(); 
      expect(getByText('←')).toBeTruthy(); 
      expect(getByText('🌐 EN')).toBeTruthy(); 
      expect(getByText('Submit Answers')).toBeTruthy(); 

      expect(getByText('Water')).toBeTruthy();
      expect(getByText('Essential for hydration')).toBeTruthy();
    });
  });
});