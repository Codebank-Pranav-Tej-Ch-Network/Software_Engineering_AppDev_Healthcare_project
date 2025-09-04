import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddRecordModal from '../../components/AddRecordModal';
import ViewRecordModal from '../../components/ViewRecordModal';

// You can fetch this data from a database or API later.
const INITIAL_RECORDS = [
  {
    id: '1',
    name: 'Complete Blood Count',
    type: 'Lab Report',
    date: '2023-10-15',
    issuer: 'City General Hospital',
    images: [],
  },
  {
    id: '2',
    name: 'COVID-19 Booster',
    type: 'Vaccination',
    date: '2023-09-20',
    issuer: 'Community Health Clinic',
    images: [],
  },
  {
    id: '3',
    name: 'Amoxicillin 500mg',
    type: 'Prescription',
    date: '2023-11-01',
    issuer: 'Dr. Emily Carter',
    images: [],
  },
  {
    id: '4',
    name: 'Lipid Panel',
    type: 'Lab Report',
    date: '2023-10-15',
    issuer: 'City General Hospital',
    images: [],
  },
];

const HealthWalletScreen = () => {
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [activeTab, setActiveTab] = useState('All');
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isViewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleAddRecord = (newRecord) => {
    setRecords(prevRecords => [newRecord, ...prevRecords]);
    setAddModalVisible(false); // Close the modal after saving
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setViewModalVisible(true);
  };

  const filteredRecords = useMemo(() => {
    if (activeTab === 'All') {
      return records;
    }
    const filterType = activeTab.slice(0, -1); // Removes 's' from "Lab Reports" etc.
    return records.filter(record => record.type.includes(filterType));
  }, [activeTab, records]);


  const renderRecordItem = ({ item }) => (
    <View style={styles.recordItem}>
      <View style={styles.recordInfo}>
        <Text style={styles.recordName}>{item.name}</Text>
        <Text style={styles.recordDetails}>{item.type} • {item.date}</Text>
        <Text style={styles.recordDetails}>Issuer: {item.issuer}</Text>
      </View>
      <TouchableOpacity style={styles.viewButton} onPress={() => handleViewRecord(item)}>
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  const Tab = ({ name }) => (
    <TouchableOpacity onPress={() => setActiveTab(name)}>
      <View style={[styles.tab, activeTab === name && styles.activeTab]}>
        <Text style={[styles.tabText, activeTab === name && styles.activeTabText]}>{name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <View>
          
          <Text style={styles.headerSubtitle}>You can add your record here</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Record</Text>
        </TouchableOpacity>
      </View>

      {/* --- Filter Tabs --- */}
      <View style={styles.tabContainer}>
        <Tab name="All" />
        <Tab name="Lab Reports" />
        <Tab name="Vaccinations" />
        <Tab name="Prescriptions" />
      </View>

      {/* --- Records List --- */}
      <FlatList
        data={filteredRecords}
        renderItem={renderRecordItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.listHeader}>
             <Text style={styles.listHeaderText}>Record Name</Text>
          </View>
        }
      />

      {/* --- MODALS (Pop-ups) --- */}
      <AddRecordModal
        visible={isAddModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleAddRecord}
      />

      <ViewRecordModal
        visible={isViewModalVisible}
        record={selectedRecord}
        onClose={() => setViewModalVisible(false)}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
 
   container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16, // Ensure consistent padding for touch area
    borderRadius: 8,
    flexDirection: 'row', // Re-add this to align icon and text
    alignItems: 'center', // Center icon and text vertically
    minWidth: 120, // Give it a minimum width
    justifyContent: 'center', // Center content horizontally
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16, // Make sure text is readable
  },
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    paddingBottom: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    color: '#64748B',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  // List
  listContainer: {
    padding: 20,
  },
  listHeader: {
    paddingBottom: 10,
  },
  listHeaderText: {
    color: '#64748B',
    fontSize: 14,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  recordDetails: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  viewButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HealthWalletScreen;
