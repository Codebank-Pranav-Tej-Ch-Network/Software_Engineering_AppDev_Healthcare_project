import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Dialog,
  Divider,
  Provider as PaperProvider,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { db } from '../../firebase';

export default function MedicineScreen() {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [tabletName, setTabletName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [uploader, setUploader] = useState(null);
  const auth = getAuth();

  // Fetch medicines with uploader details
  const fetchMedicines = async () => {
    try {
      const q = query(collection(db, 'medicines'));
      const snapshot = await getDocs(q);
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const med = { id: docSnap.id, ...docSnap.data() };
          if (med.uploaderId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', med.uploaderId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                med.uploader = {
                  name: userData.name || 'Unknown',
                  contact: userData.contact || 'N/A',
                  location: userData.location || 'Location N/A',
                };
              } else {
                med.uploader = { name: 'Unknown', contact: 'N/A', location: 'Location N/A' };
              }
            } catch (err) {
              console.error('Error fetching uploader info: ', err);
              med.uploader = { name: 'Unknown', contact: 'N/A', location: 'Location N/A' };
            }
          } else {
            med.uploader = { name: 'Unknown', contact: 'N/A', location: 'Location N/A' };
          }
          return med;
        })
      );
      data.sort((a, b) => a.tabletName.localeCompare(b.tabletName, 'en', { sensitivity: 'base' }));
      setMedicines(data);
      setFilteredMedicines(data); // Initialize filtered list
    } catch (err) {
      console.error('Error fetching medicines: ', err);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Handle search query
  useEffect(() => {
    const filtered = medicines.filter((med) =>
      med.tabletName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMedicines(filtered);
  }, [searchQuery, medicines]);

  const handleAddMedicine = async () => {
    if (!tabletName || !expiryDate || !newPrice) return;
    try {
      await addDoc(collection(db, 'medicines'), {
        tabletName,
        expiryDate,
        newPrice,
        uploaderId: auth.currentUser?.uid,
      });
      setTabletName('');
      setExpiryDate('');
      setNewPrice('');
      setAdding(false);
      fetchMedicines();
    } catch (err) {
      console.error('Error adding medicine: ', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'medicines', id));
      fetchMedicines();
    } catch (err) {
      console.error('Error deleting medicine: ', err);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString();
      setExpiryDate(formatted);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Stack.Screen
          name="Mental-State-Assessment"
          options={{
            headerShown: true,
            title: 'Medicine Recycle',
          }}
        />
        {/* Search Bar */}
        <TextInput
          placeholder="Search medicines..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          left={<TextInput.Icon icon="magnify" />}
        />
        {/* Add Medicine Header */}
        <View style={styles.headerRow}>
          <Text style={styles.addText}>Do you want to add medicine?</Text>
          <Button
            mode="contained"
            onPress={() => setAdding(true)}
            style={styles.addButton}
            labelStyle={{ color: 'white' }}
          >
            Add Medicine
          </Button>
        </View>
        <Divider style={{ marginVertical: 8 }} />
        {/* Section Heading */}
        <Text style={styles.sectionHeading}>Recycle Medicine Info</Text>
        {/* Medicines List */}
        <FlatList
          data={filteredMedicines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title title={item.tabletName} titleStyle={styles.tabletName} />
              <Card.Content>
                <View style={styles.row}>
                  <Text style={styles.rowText}>Expiry: {item.expiryDate}</Text>
                  <Text style={styles.rowText}>₹{item.newPrice}</Text>
                  <Text style={styles.rowText}>{item.uploader?.location}</Text>
                  <Button
                    mode="contained"
                    style={styles.infoButton}
                    onPress={() => {
                      setUploader(item.uploader);
                      setViewVisible(true);
                    }}
                  >
                    View Info
                  </Button>
                  {auth.currentUser?.uid === item.uploaderId && (
                    <Button
                      mode="contained"
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}
        />
        {/* Add Medicine Dialog */}
        <Portal>
          <Dialog visible={adding} onDismiss={() => setAdding(false)} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Add Medicine</Dialog.Title>
            <Dialog.Content style={styles.dialogContent}>
              <TextInput
                label="Tablet Name"
                value={tabletName}
                onChangeText={setTabletName}
                style={styles.input}
                textColor="#1E293B" // Black text for light mode
              />
              <TextInput
                label="Expiry Date"
                value={expiryDate}
                style={styles.input}
                onFocus={() => setShowDatePicker(true)}
                textColor="#1E293B" // Black text for light mode
              />
              <TextInput
                label="New Price"
                value={newPrice}
                onChangeText={(val) => setNewPrice(val.replace(/[^0-9]/g, ''))}
                style={styles.input}
                keyboardType="numeric"
                textColor="#1E293B" // Black text for light mode
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleAddMedicine} style={styles.actionButton}>Save</Button>
              <Button onPress={() => setAdding(false)} style={styles.actionButton}>Cancel</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        {/* Real Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}
        {/* View Info Dialog */}
        <Portal>
          <Dialog visible={viewVisible} onDismiss={() => setViewVisible(false)} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Uploader Info</Dialog.Title>
            <Dialog.Content style={styles.dialogContent}>
              {uploader ? (
                <>
                  <Text style={styles.infoText}>Name: {uploader.name}</Text>
                  <Text style={styles.infoText}>Phone: {uploader.contact}</Text>
                </>
              ) : (
                <Text style={styles.infoText}>Uploader info not found</Text>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setViewVisible(false)} style={styles.actionButton}>Close</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // Light mode background
    padding: 16,
  },
  searchBar: {
    width: '90%',
    backgroundColor: '#F8FAFC', // Light background for search bar
    borderRadius: 10,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginBottom: 16,
  },
  addText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B', // Dark text for light mode
  },
  addButton: {
    backgroundColor: '#3B82F6', // Blue accent
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#1E293B', // Dark text for light mode
    width: '90%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    marginVertical: 8,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tabletName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B', // Dark text for light mode
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rowText: {
    fontSize: 16,
    color: '#495057', // Softer dark text
    fontWeight: '500',
    marginRight: 12,
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#EF4444', // Red for delete
    marginLeft: 8,
    borderRadius: 8,
  },
  infoButton: {
    backgroundColor: '#3B82F6', // Blue for info
    marginLeft: 8,
    borderRadius: 8,
  },
  input: {
    marginVertical: 8,
    backgroundColor: '#F8FAFC', // Light input background
    borderRadius: 8,
  },
  dialog: {
    backgroundColor: 'white', // Light mode dialog
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dialogTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B', // Dark text for light mode
  },
  dialogContent: {
    backgroundColor: '#F8FAFC', // Light background for content
    borderRadius: 10,
    padding: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#1E293B', // Dark text for visibility in light mode
    marginVertical: 4,
  },
  actionButton: {
    color: '#3B82F6', // Blue accent for buttons
  },
  // Dark mode styles
  '@media (prefers-color-scheme: dark)': {
    container: {
      backgroundColor: '#1E293B', // Dark mode background
    },
    searchBar: {
      backgroundColor: '#475569', // Dark background for search bar
      color: '#F8FAFC', // Light text for dark mode
    },
    addText: {
      color: '#F8FAFC', // Light text for dark mode
    },
    sectionHeading: {
      color: '#F8FAFC', // Light text for dark mode
    },
    card: {
      backgroundColor: '#334155', // Dark card background
    },
    tabletName: {
      color: '#F8FAFC', // Light text for dark mode
    },
    rowText: {
      color: '#CBD5E1', // Softer light text for dark mode
    },
    input: {
      backgroundColor: '#475569', // Dark input background
      textColor: '#1E293B', // Black text for inputs in dark mode
    },
    dialog: {
      backgroundColor: '#334155', // Dark mode dialog
    },
    dialogTitle: {
      color: '#F8FAFC', // Light text for dark mode
    },
    dialogContent: {
      backgroundColor: '#475569', // Dark content background
    },
    infoText: {
      color: '#F8FAFC', // Light text for visibility in dark mode
    },
    actionButton: {
      color: '#3B82F6', // Keep blue accent for buttons
    },
  },
});
