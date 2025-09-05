// BloodDonationScreen.jsx
import { Stack } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Card, Provider as PaperProvider, Text, TextInput } from 'react-native-paper';
import { db } from '../../firebase'; // adjust path if needed

// Standard set we always show
const BASE_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const normalizeGroup = (g) =>
  typeof g === 'string' ? g.toUpperCase().replace(/\s+/g, '') : '';

export default function BloodDonationScreen() {
  const [allDonors, setAllDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState('');
  const [bloodGroup, setBloodGroup] = useState('ALL'); // "ALL" instead of null
  const [open, setOpen] = useState(false);

  const [bloodGroupItems, setBloodGroupItems] = useState([
    { label: 'All Groups', value: 'ALL' },
    ...BASE_GROUPS.map(g => ({ label: g, value: g })),
  ]);

  // Fetch donors who are willing to donate
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const donorQuery = query(usersCollection, where('willingToDonate', '==', true));
        const querySnapshot = await getDocs(donorQuery);
        const donorList = [];
        querySnapshot.forEach((docSnap) => donorList.push({ id: docSnap.id, ...docSnap.data() }));
        setAllDonors(donorList);

        // (Optional) include any non-standard groups present in data:
        const observed = new Set(
          donorList
            .map(d => normalizeGroup(d.bloodGroup))
            .filter(Boolean)
        );
        const extras = [...observed]
          .filter(g => !BASE_GROUPS.includes(g))
          .map(g => ({ label: g, value: g }));

        // Ensure dropdown always shows all standard groups + any extras found
        setBloodGroupItems([
          { label: 'All Groups', value: 'ALL' },
          ...BASE_GROUPS.map(g => ({ label: g, value: g })),
          ...extras,
        ]);
      } catch (error) {
        console.error('Error fetching donors: ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  // Get the current user's ID
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid ?? null; // null if not logged in

  // Filtering
  const filteredDonors = useMemo(() => {
    const selected = bloodGroup; // 'ALL' or actual group
    return allDonors.filter((donor) => {
      const locOk =
        location === '' ||
        (donor.location &&
          donor.location.toLowerCase().includes(location.toLowerCase()));

      if (selected === 'ALL') {
        return locOk && donor.id !== currentUserId; // Exclude current user
      }

      const donorGroupNorm = normalizeGroup(donor.bloodGroup);
      return locOk && donorGroupNorm === selected && donor.id !== currentUserId; // Exclude current user
    });
  }, [allDonors, location, bloodGroup, currentUserId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Blood Donors' }} />

        {/* Search + Filter */}
        <View style={styles.searchRow}>
          <TextInput
            mode="outlined"
            placeholder="Search Location"
            style={styles.searchInput}
            value={location}
            onChangeText={setLocation}
            left={<TextInput.Icon icon="map-marker-outline" />}
            textColor="#000000"
          />

          {/* Give dropdown a higher zIndex only when open to avoid overlap issues */}
          <View style={[styles.dropdownWrapper, open ? { zIndex: 3000 } : { zIndex: 1 }]}>
            <DropDownPicker
              open={open}
              value={bloodGroup}
              items={bloodGroupItems}
              setOpen={setOpen}
              setValue={setBloodGroup}
              setItems={setBloodGroupItems}
              placeholder="Blood Group"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={3000}
              zIndexInverse={1000}
              listMode="SCROLLVIEW"
              dropDownDirection="AUTO"
            />
          </View>
        </View>

        {/* Donor List */}
        <FlatList
          data={filteredDonors}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No donors found with the selected criteria.</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title
                title={item.name}
                subtitle={item.location || 'N/A'}
                titleStyle={styles.name}
                subtitleStyle={styles.location}
              />
              <Card.Content>
                <Text style={styles.phone}>Contact: {item.contact || 'N/A'}</Text>
                <Text style={styles.bloodGroup}>Blood Group: {item.bloodGroup || 'N/A'}</Text>
              </Card.Content>
            </Card>
          )}
        />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
  },
  dropdownWrapper: {
    width: 160,
  },
  dropdown: {
    borderColor: '#ccc',
  },
  dropdownContainer: {
    borderColor: '#ccc',
    maxHeight: 400, // Increased to fit 9+ items comfortably
  },
  card: {
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  location: {
    fontSize: 14,
    color: 'gray',
  },
  phone: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  bloodGroup: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D32F2F',
    marginTop: 4,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
  },
});
