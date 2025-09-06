import LottieView from "lottie-react-native";
import { useState } from "react";
import { Stack } from "expo-router";
import {
  Dimensions,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import exercisePlans from "../../data/exercise_plans.json";
import yogaData from "../../data/yoga_poses.json";

const animationSources = {
  padmasan: require("../../assets/lottie/padmasan.json"),
  vrukshasan: require("../../assets/lottie/vrukshasan.json"),
  bhujangasan: require("../../assets/lottie/bhujangasan.json"),
  "yoga-header": require("../../assets/lottie/yoga-header.json"),
  "plank-twist": require("../../assets/lottie/plank-twist.json"),
  "dead-bug": require("../../assets/lottie/dead-bug.json"),
  "squat-rotation": require("../../assets/lottie/squat-rotation.json"),
};

const poseDescriptions = {
  Padmasan:
    "Padmasan is a classic seated yoga posture where the legs are crossed and the feet rest on opposite thighs. It encourages deep relaxation, improves flexibility in hips and knees, and calms the mind—making it a favored pose for meditation and breathwork. Regular practice is known to help reduce stress and support inner focus.",
  Vrukshasan:
    "Vrukshasan is a balancing pose performed while standing on one leg, with the other foot placed against the inner thigh or calf. This pose enhances concentration, strengthens leg and core muscles, and improves overall body stability. Practicing Tree Pose also helps cultivate patience and mental steadiness.",
  Bhujangasan:
    "Bhujangasan involves lying on the belly and lifting the chest upwards using the strength of the back and arms. It is effective for opening up the chest, improving spinal flexibility, and relieving tension from the shoulders and lower back. The pose helps energize the body and supports a healthy posture.",
};

const exerciseDescriptions = {
  "Plank Twist":
    "The Plank Twist is a challenging core exercise that involves twisting the torso while holding the plank position to engage oblique muscles and improve stability.",
  "Dead Bug":
    "The Dead Bug exercise enhances core stability through controlled limb movements while lying on your back, helping to strengthen abdominal muscles and improve coordination.",
  "Squat with Rotation":
    "Squat with Rotation combines traditional squats with torso rotation, targeting the lower body and core simultaneously, improving strength and rotational mobility."
};

export default function YogaExerciseScreen() {
  const [search, setSearch] = useState("");
  const [sortTypeYoga, setSortTypeYoga] = useState("name");
  const [sortTypeExercise, setSortTypeExercise] = useState("name");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // "yoga" or "exercise"

  // Sort & filter yoga poses
  const sortedYoga = [...yogaData].sort((a, b) => {
    if (sortTypeYoga === "name") return a.name.localeCompare(b.name);
    if (sortTypeYoga === "difficulty") return a.difficulty.localeCompare(b.difficulty);
    return 0;
  });
  const filteredYogaData = sortedYoga.filter(
    (pose) =>
      pose.name.toLowerCase().includes(search.toLowerCase()) ||
      pose.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  // Sort & filter exercise plans
  const sortedExercises = [...exercisePlans].sort((a, b) => {
    if (sortTypeExercise === "name") return a.name.localeCompare(b.name);
    if (sortTypeExercise === "difficulty") return a.difficulty.localeCompare(b.difficulty);
    return 0;
  });
  const filteredExercisePlans = sortedExercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.description.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);
    setModalVisible(true);
  };

  const windowWidth = Dimensions.get("window").width;
  const cardWidth = (windowWidth - 48) / 2;

  return (
    <View style={styles.container}>
       <Stack.Screen
        name="Exercise-Plans"
        options={{
          headerShown: true,
          title: "Exercise Plans",

        }}
      />
      {/* Header animation */}
      <LottieView
        source={animationSources["yoga-header"]}
        autoPlay
        loop
        style={styles.headerAnimation}
      />
      <Text style={styles.title}>Yoga & Exercise Reference</Text>

      {/* Search input */}
      <TextInput
        style={styles.searchBox}
        placeholder="Search yoga poses or exercises..."
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Yoga Asanas Section */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeader}>Yoga Asanas</Text>
          <View style={styles.sortButtonsContainer}>
            <TouchableOpacity onPress={() => setSortTypeYoga("name")} style={styles.sortBtn}>
              <Text>Name</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSortTypeYoga("difficulty")} style={styles.sortBtn}>
              <Text>Difficulty</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardsWrapper}>
          {filteredYogaData.map((pose) => (
            <TouchableOpacity
              key={pose.id}
              style={[styles.card, { width: cardWidth }]}
              onPress={() => openModal(pose, "yoga")}
              activeOpacity={0.8}
            >
              <LottieView
                source={animationSources[pose.animation]}
                autoPlay
                loop
                style={styles.animationSmall}
              />
              <Text style={styles.cardTitle}>{pose.name}</Text>
              <Text style={styles.cardSubtitle}>{pose.difficulty}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Exercise Plans Section */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeader}>Exercise Plans</Text>
          <View style={styles.sortButtonsContainer}>
            <TouchableOpacity onPress={() => setSortTypeExercise("name")} style={styles.sortBtn}>
              <Text>Name</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSortTypeExercise("difficulty")} style={styles.sortBtn}>
              <Text>Difficulty</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardsWrapper}>
          {filteredExercisePlans.map((ex) => (
            <TouchableOpacity
              key={ex.id}
              style={[styles.card, { width: cardWidth }]}
              onPress={() => openModal(ex, "exercise")}
              activeOpacity={0.8}
            >
              <LottieView
                source={animationSources[ex.animation]}
                autoPlay
                loop
                style={styles.animationSmall}
              />
              <Text style={styles.cardTitle}>{ex.name}</Text>
              <Text style={styles.cardSubtitle}>{ex.difficulty}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modal for Yoga or Exercise details */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
            <Text style={styles.modalDescription}>
              {selectedType === "yoga"
                ? poseDescriptions[selectedItem?.name] || "Description not available."
                : exerciseDescriptions[selectedItem?.name] || selectedItem?.description || "Description not available."}
            </Text>
            <Text style={styles.modalLevel}>Level: {selectedItem?.difficulty}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(selectedItem?.article_url || selectedItem?.article_url)}>
              <Text style={styles.modalLink}>Read More</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ====== Styles =======
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", paddingHorizontal: 16 },
  headerAnimation: { height: 30, alignSelf: "center" },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginVertical: 8, color: "#222" },
  searchBox: {
    backgroundColor: "white",
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    fontSize: 16,
    shadowColor: "#000",
    shadowRadius: 6,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  sectionHeaderContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionHeader: { fontSize: 22, fontWeight: "700", color: "#344055" },
  sortButtonsContainer: { flexDirection: "row" },
  sortBtn: {
    marginLeft: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cardsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },
  animationSmall: { width: 72, height: 72 },
  cardTitle: { fontSize: 17, fontWeight: "600", color: "#222", marginTop: 10, textAlign: "center" },
  cardSubtitle: { fontSize: 13, color: "#6c757d", textTransform: "capitalize" },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.32)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    alignItems: "center",
  },
  modalTitle: { fontSize: 24, fontWeight: "700", color: "#222" },
  modalDescription: { fontSize: 16, marginVertical: 14, color: "#444", textAlign: "center" },
  modalLevel: { fontSize: 14, color: "#6c757d" },
  modalLink: { fontSize: 16, color: "#007bff", marginTop: 12, fontWeight: "600" },
  modalCloseBtn: {
    marginTop: 18,
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  modalCloseText: { color: "white", fontWeight: "bold" },
});
