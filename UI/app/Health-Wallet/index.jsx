import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { getAuth } from "firebase/auth";
import { addDoc, collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AddRecordModal from "../../components/AddRecordModal";
import ViewRecordModal from "../../components/ViewRecordModal";

const HealthWalletScreen = () => {
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isViewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  // 🔥 Fetch data in real time for current user
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "records"), where("uid", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRecords = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecords(fetchedRecords);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Add new record to Firestore
  const handleAddRecord = async (newRecord) => {
    try {
      const user = auth.currentUser;
      if (!user) return alert("You must be logged in!");

      await addDoc(collection(db, "records"), {
        uid: user.uid,
        name: newRecord.name,
        type: newRecord.type,
        date: newRecord.date,
        issuer: newRecord.issuer,
        images: newRecord.images || [],
        createdAt: new Date(),
      });

      setAddModalVisible(false);
    } catch (e) {
      console.error("Error adding record:", e);
      alert("Failed to save record. Please try again.");
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setViewModalVisible(true);
  };

  const filteredRecords = useMemo(() => {
    if (activeTab === "All") return records;
    const filterType = activeTab.slice(0, -1); // Removes 's'
    return records.filter((record) => record.type.includes(filterType));
  }, [activeTab, records]);

  const renderRecordItem = ({ item }) => (
    <View style={styles.recordItem}>
      <View style={styles.recordInfo}>
        <Text style={styles.recordName}>{item.name}</Text>
        <Text style={styles.recordDetails}>
          {item.type} • {item.date}
        </Text>
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
      <Stack.Screen
        name="Health-Wallet"
        options={{
          title:"Health Wallet",
        }}
      />
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
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filteredRecords}
          renderItem={renderRecordItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No records found</Text>}
        />
      )}

      {/* --- MODALS --- */}
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
    backgroundColor: "#F0F4F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  addButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 120,
    justifyContent: "center",
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tab: {
    paddingBottom: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#3B82F6",
  },
  tabText: {
    fontSize: 16,
    color: "#64748B",
  },
  activeTabText: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  listContainer: {
    padding: 20,
  },
  recordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
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
    fontWeight: "600",
    color: "#1E293B",
  },
  recordDetails: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  viewButton: {
    backgroundColor: "#10B981",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  viewButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default HealthWalletScreen;
