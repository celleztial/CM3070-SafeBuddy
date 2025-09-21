import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import NavBar from '../components/navbar';
import { getContacts } from '../firebase/contactService';
import { getAuth } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';


// ContactsScreen displays the user's contact list with search and navigation to details
export default function ContactsScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const currentUser = getAuth().currentUser;
  const animations = useRef([]); 

  // Fetch contacts and setup animations
  const fetchContacts = async () => {
    const data = await getContacts(currentUser.uid);
    setContacts(data);
    
    // Init animation values
    animations.current = data.map(() => new Animated.Value(0));

    // Animate each card in with stagger
    Animated.stagger(100, animations.current.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    )).start();
  };

  // Refresh contacts when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchContacts();
    }, [])
  );

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render the main contacts screen
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Contact Book</Text>

        <TextInput
          placeholder="Search contacts..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />

        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddContact')}>
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>

        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact, index) => {
            const phoneText = contact.phone
              ? contact.phone
              : `${contact.name} hasn't added a phone number`;

            const addressText = contact.address
              ? contact.address
              : `${contact.name} hasn't added an address`;

              // Animated card for each contact
              return (
              <Animated.View
              key={contact.id}
              style={[
                styles.card,
                {
                  opacity: animations.current[index] || new Animated.Value(1),
                  transform: [{
                    translateY: animations.current[index]
                      ? animations.current[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        })
                      : 0,
                  }],
                }
              ]}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => navigation.navigate('ContactDetails', { contactId: contact.id })}
              >
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardName}>
                    {contact.name} {contact.label ? `(${contact.label})` : ''}
                  </Text>
                  <Text style={styles.cardSubText}>{phoneText}</Text>
                  <Text style={styles.cardSubText}>{addressText}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No contacts yet. Add someone you trust!</Text>
        )}
      </ScrollView>
      <NavBar />
    </SafeAreaView>
  );
}

// Get device width/height for responsive map sizing
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EEFFF3',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.12,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#1A2B44',
    marginBottom: height * 0.02,
  },
  searchBar: {
    backgroundColor: '#faf8f6',
    borderColor: '#1A2B44',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.012,
    fontSize: 14,
    marginBottom: height * 0.025,
    color: '#1A2B44',
  },
  addButton: {
    backgroundColor: '#1A2B44',
    paddingVertical: height * 0.015,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  addButtonText: {
    color: '#EEFFF3',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    borderRadius: 15,
    padding: width * 0.05,
    marginBottom: height * 0.025,
    backgroundColor: '#faf8f6',
    alignItems: 'center',
    shadowColor: '#1A2B44',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTextContainer: {
    flex: 1,
    marginRight: width * 0.03,
  },
  cardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A2B44',
    marginBottom: 4,
  },
  cardSubText: {
    fontSize: 12,
    color: '#444',
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    marginTop: height * 0.04,
    textAlign: 'center',
  },
});
