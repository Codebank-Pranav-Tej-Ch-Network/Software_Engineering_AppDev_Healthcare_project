import { Link } from "expo-router";
import Lottie from "lottie-react"; // For Web
import LottieView from "lottie-react-native"; // For iOS/Android
import { FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// 1. Data array based on your folder structure
const features = [
  { id: "1", name: "Blood-Donation", path: "blood-drop" },
  { id: "2", name: "Medication-Remainder", path: "Prescription-Loading" },
  { id: "3", name: "Health-Wallet", path: "Medical-app" },
  { id: "4", name: "Exercise-Plans", path: "Exercise-app" },
  { id: "5", name: "Mental-State-Assessment", path: "Mental-Health-awareness" },
  { id: "6", name: "Personalized-Health-Plans", path: "health-plans" },
  
];

// --- Animation component that handles mobile + web ---
const Animation = ({ path }) => { // CORRECTED: Destructure 'path' from props
  
  // --- THIS IS THE FIX ---
  // Create a map of all possible animations.
  // The 'require' statements here are static, which the bundler can understand.
  const animationMap = {
    'blood-drop': require("../../assets/lottie/blood-drop.json"),
    'Prescription-Loading': require("../../assets/lottie/Prescription-Loading.json"),
    'Medical-app': require("../../assets/lottie/Medical-app.json"), 
    'Exercise-app': require("../../assets/lottie/Exercise-app.json"), 
    'Mental-Health-awareness': require("../../assets/lottie/Mental-Health-awareness.json"), 
    'health-plans': require("../../assets/lottie/health-plans.json"), 
  };

  // Use the 'path' prop to select the correct animation from the map.
  // Provide a fallback to the default animation if the path is not found.
  const animationSource = animationMap[path] || animationMap['blood-drop'];

  if (Platform.OS === "web") {
    return (
      <Lottie
        animationData={animationSource}
        loop
        autoplay
        style={{ width: 80, height: 80 }}
      />
    );
  }

  return (
    <LottieView
      source={animationSource}
      autoPlay
      loop
      style={{ width: 80, height: 80 }}
    />
  );
};

// --- A reusable component for each clickable card ---
const FeatureCard = ({ name, path }) => {
  const title = name.replace(/-/g, " ");

  return (
    <Link href={`/${name}`} asChild>
      <TouchableOpacity style={styles.card}>
        <Animation path={path} />
        <Text style={styles.cardText}>{title}</Text>
      </TouchableOpacity>
    </Link>
  );
};

// --- The main screen component ---
export default function FeatureGridScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Health Services</Text>
      </View>
      <FlatList
        data={features}
        renderItem={({ item }) => <FeatureCard name={item.name} path={item.path} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

// --- Stylesheet for the screen ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  headerContainer: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C2A38",
  },
  listContainer: {
    paddingHorizontal: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    margin: 8,
    minHeight: 140,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#AAB8C2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
    marginTop: 10,
  },
});