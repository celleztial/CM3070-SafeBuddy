import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';


// NavBar component for bottom navigation
export default function NavBar() {
  const navigation = useNavigation();
  const route = useRoute();
  const currentRoute = route.name;

  return (
    <View style={styles.container}>
      {/* Home */}
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Home')}>
        <Image 
          source={currentRoute === 'Home' 
            ? require('../assets/navigation/home-button-active.png') 
            : require('../assets/navigation/home-button.png')
          } 
          style={styles.icon} 
        />
        <Text style={styles.label}>Home</Text>
      </TouchableOpacity>

      {/* Games */}
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('GamesLanding')}>
        <Image 
          source={currentRoute === 'GamesLanding' 
            ? require('../assets/navigation/games-button-active.png') 
            : require('../assets/navigation/games-button.png')
          } 
          style={styles.icon} 
        />
        <Text style={styles.label}>Games</Text>
      </TouchableOpacity>

      {/* Contacts */}
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Contacts')}>
        <Image 
          source={currentRoute === 'Contacts' 
            ? require('../assets/navigation/contacts-button-active.png') 
            : require('../assets/navigation/contacts-button.png')
          } 
          style={styles.icon} 
        />
        <Text style={styles.label}>Contacts</Text>
      </TouchableOpacity> 
    </View>
  );
}

// Get device width/height for responsive map sizing
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: width * 0.03,
    backgroundColor: '#F0FFF0',
    borderTopWidth: 1,
    borderTopColor: '#1C2A49',
  },
  tab: {
    alignItems: 'center',
  },
  icon: {
    width: width * 0.075, 
    height: width * 0.075,
    resizeMode: 'contain',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    color: '#1C2A49',
  },
});
