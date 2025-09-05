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
    } catch (err) {
      console.error('Error fetching medicines: ', err);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

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
        {/* Add Medicine Header */}

        <View style={styles.headerRow}>
          <Text style={styles.addText}>Do you want to add medicine?</Text>
          <Button
  mode="contained"
  onPress={() => setAdding(true)}
  style={styles.addButton}
  labelStyle={{ color: 'white' }}   // 👈 change text color here
>
  Add Medicine
</Button>

        </View>

        <Divider style={{ marginVertical: 8 }} />

        {/* Section Heading */}
        <Text style={styles.sectionHeading}>Recycle Medicine Info</Text>

        {/* Medicines List */}
        <FlatList
          data={medicines}
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
          <Dialog visible={adding} onDismiss={() => setAdding(false)}>
            <Dialog.Title>Add Medicine</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Tablet Name"
                value={tabletName}
                onChangeText={setTabletName}
                style={styles.input}
              />
              <TextInput
                label="Expiry Date"
                value={expiryDate}
                style={styles.input}
                onFocus={() => setShowDatePicker(true)}
              />
              <TextInput
                label="New Price"
                value={newPrice}
                onChangeText={(val) => setNewPrice(val.replace(/[^0-9]/g, ''))}
                style={styles.input}
                keyboardType="numeric"
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleAddMedicine}>Save</Button>
              <Button onPress={() => setAdding(false)}>Cancel</Button>
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
          <Dialog visible={viewVisible} onDismiss={() => setViewVisible(false)}>
            <Dialog.Title>Uploader Info</Dialog.Title>
            <Dialog.Content>
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
              <Button onPress={() => setViewVisible(false)}>Close</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  addText: { fontSize: 16, color: 'black', alignSelf: 'center' },
  addButton: { backgroundColor: '#1976d2', },
  sectionHeading: { fontSize: 20, fontWeight: 'bold', marginVertical: 10, color: '#212529' },
  card: { marginVertical: 8, borderRadius: 12, backgroundColor: 'white', padding: 8, elevation: 2 },
  tabletName: { fontSize: 18, fontWeight: 'bold', color: '#212529' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  rowText: { fontSize: 16, color: '#000', fontWeight: '500', marginRight: 8 },
  deleteButton: { backgroundColor: '#d32f2f', marginLeft: 5 },
  infoButton: { backgroundColor: '#1976d2', marginLeft: 5 },
  input: { marginVertical: 5, backgroundColor: 'white' },
  infoText: { fontSize: 15, color: '#333', marginVertical: 2 },
});
