import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Hardcoded colors for light mode
const themeColors = {
    background: "#F6FBFF",
    card: "#FFFFFF",
    secondaryCard: "#EEF5FB",
    text: "#0B2540",
    subText: "#456173",
    accent: "#0EA5A4",
    accent2: "#60A5FA",
    inputBg: "#FFFFFF",
    progressTrack: "#E1ECF8",
    inputBorder: "#E6F0FB",
    placeholder: "#7A8A99"
};

// --- Keys for AsyncStorage ---
const REM_KEY = "REMINDERS_V1";

const todayISO = () => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
};

const sampleReminders = [
    { id: String(Date.now() + 1), title: "Lisinopril - 10mg", timeStr: "09:00 AM", takenTodayDate: null },
    { id: String(Date.now() + 2), title: "Atorvastatin - 20mg", timeStr: "08:00 PM", takenTodayDate: null },
    { id: String(Date.now() + 3), title: "Metformin - 500mg", timeStr: "08:00 AM", takenTodayDate: todayISO() },
    { id: String(Date.now() + 4), title: "Vitamin D3 - 1000 IU", timeStr: "09:00 AM", takenTodayDate: todayISO() },
];

export default function MedicationReminderScreen() {
    // --- State and Refs for Reminders ---
    const [reminders, setReminders] = useState([]);
    const [titleInput, setTitleInput] = useState("");
    const [timeInput, setTimeInput] = useState("");
    const isRemindersInitialMount = useRef(true);

    // --- COMPUTED VALUES (useMemo) ---
    const takenToday = useMemo(() => reminders.filter((r) => r.takenTodayDate === todayISO()), [reminders]);
    const upcoming = useMemo(() => reminders.filter((r) => r.takenTodayDate !== todayISO()), [reminders]);
    const completionPercent = useMemo(() => {
        const total = reminders.length || 1;
        const taken = takenToday.length;
        return Math.round((taken / total) * 100);
    }, [reminders, takenToday]);

    // --- EFFECTS for Reminders ---
    useEffect(() => {
        const loadReminders = async () => {
            try {
                const rawRem = await AsyncStorage.getItem(REM_KEY);
                setReminders(rawRem ? JSON.parse(rawRem) : sampleReminders);
            } catch (e) {
                console.warn("Load reminders error", e);
            }
        };
        loadReminders();
    }, []);

    useEffect(() => {
        if (isRemindersInitialMount.current) {
            isRemindersInitialMount.current = false;
        } else {
            AsyncStorage.setItem(REM_KEY, JSON.stringify(reminders)).catch((e) => console.warn(e));
        }
    }, [reminders]);

    const addReminder = () => {
        const title = titleInput.trim();
        const time = timeInput.trim();
        if (!title) {
            Alert.alert("Add reminder", "Please enter a medicine name or title.");
            return;
        }
        const newRem = {
            id: String(Date.now()),
            title,
            timeStr: time || "Time not set",
            takenTodayDate: null,
        };
        setReminders((p) => [newRem, ...p]);
        setTitleInput("");
        setTimeInput("");
    };

    const toggleTaken = (id) => {
        setReminders((prev) =>
            prev.map((r) =>
                r.id === id ? { ...r, takenTodayDate: r.takenTodayDate === todayISO() ? null : todayISO() } : r
            )
        );
    };

    const takeNow = (id) => {
        setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, takenTodayDate: todayISO() } : r)));
    };

    const deleteReminder = (id) => {
        Alert.alert("Delete", "Do you want to delete this reminder?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => setReminders((p) => p.filter((r) => r.id !== id)),
            },
        ]);
    };

    const RemCard = ({ item, showTakeNow = true }) => {
        const taken = item.takenTodayDate === todayISO();
        return (
            <View style={[styles.card, { backgroundColor: themeColors.card }]}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: themeColors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.cardTime, { color: themeColors.subText }]}>{item.timeStr}</Text>
                </View>
                <View style={{ justifyContent: "center", alignItems: "flex-end", marginLeft: 8 }}>
                    <TouchableOpacity onPress={() => toggleTaken(item.id)} style={[styles.checkbox, { borderColor: taken ? themeColors.accent : "#2F3F4B", backgroundColor: taken ? themeColors.accent : "transparent" }]}>
                        {taken && <Text style={styles.checkboxTick}>✓</Text>}
                    </TouchableOpacity>
                    {showTakeNow && <TouchableOpacity onPress={() => takeNow(item.id)} style={[styles.takeNowBtn, { backgroundColor: themeColors.secondaryCard }]}><Text style={{ color: themeColors.text, fontWeight: "600" }}>Take Now</Text></TouchableOpacity>}
                    <TouchableOpacity onPress={() => deleteReminder(item.id)} style={{ marginTop: 8 }}><Text style={{ color: "#ff6b6b", fontSize: 12 }}>Remove</Text></TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]}>
            <Stack.Screen options={{ title: "Medication Reminders" }} />
            <StatusBar style="dark" />
            
            <View style={[styles.header, { borderBottomColor: themeColors.inputBorder }]}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={[styles.iconBox, { backgroundColor: themeColors.card }]}><Text style={{ color: themeColors.accent2, fontWeight: "700" }}>⚡</Text></View>
                    <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.title, { color: themeColors.text }]}>Medication Reminders</Text>
                        <Text style={[styles.subTitle, { color: themeColors.subText }]}>Stay on top of your medication schedule.</Text>
                    </View>
                </View>
            </View>
            <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View>
                        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Daily Progress</Text>
                        <Text style={[styles.smallText, { color: themeColors.subText }]}>{takenToday.length} of {reminders.length} completed</Text>
                    </View>
                    <Text style={{ color: themeColors.accent, fontWeight: "700" }}>{completionPercent}%</Text>
                </View>
                <View style={{ marginTop: 12 }}>
                    <View style={[styles.progressBarTrack, { backgroundColor: themeColors.progressTrack }]}><View style={[styles.progressBarFill, { width: `${completionPercent}%`, backgroundColor: themeColors.accent }]} /></View>
                </View>
                <View style={{ flexDirection: "row", marginTop: 16, alignItems: "center" }}>
                    <TextInput value={titleInput} onChangeText={setTitleInput} placeholder="Medicine name..." placeholderTextColor={themeColors.placeholder} style={[styles.input, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.inputBorder }]} />
                    <TextInput value={timeInput} onChangeText={setTimeInput} placeholder="e.g., 09:00 AM" placeholderTextColor={themeColors.placeholder} style={[styles.inputMini, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.inputBorder }]} />
                    <TouchableOpacity onPress={addReminder} style={[styles.addBtn, { backgroundColor: themeColors.accent }]}><Text style={{ color: "#fff", fontWeight: "700", fontSize: 20 }}>＋</Text></TouchableOpacity>
                </View>
            </View>
            <ScrollView style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text, marginLeft: 6 }]}>Upcoming</Text>
                    <View style={{ paddingTop: 8 }}>
                        {upcoming.length > 0 ? (upcoming.map((item) => <RemCard key={item.id} item={item} />)) : (<View style={{ padding: 20 }}><Text style={{ color: themeColors.subText }}>No upcoming reminders.</Text></View>)}
                    </View>
                    <View style={{ marginTop: 18 }}>
                        <Text style={[styles.sectionTitle, { color: themeColors.text, marginLeft: 6 }]}>Taken Today</Text>
                        <View style={{ paddingTop: 8, paddingBottom: 40 }}>
                            {takenToday.length > 0 ? (takenToday.map((item) => <RemCard key={item.id} item={item} showTakeNow={false} />)) : (<View style={{ padding: 20 }}><Text style={{ color: themeColors.subText }}>You haven't taken anything today.</Text></View>)}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1 },
    iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 20, fontWeight: "800" },
    subTitle: { fontSize: 12 },
    sectionTitle: { fontSize: 18, fontWeight: "700" },
    smallText: { fontSize: 12, marginTop: 2 },
    progressBarTrack: { height: 8, width: "100%", borderRadius: 999, overflow: "hidden" },
    progressBarFill: { height: "100%", borderRadius: 999 },
    input: { flex: 1, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginRight: 8, fontSize: 14, borderWidth: 1 },
    inputMini: { width: 120, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, marginRight: 8, fontSize: 14, borderWidth: 1 },
    addBtn: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    card: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, marginVertical: 8, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: "700" },
    cardTime: { fontSize: 13, marginTop: 6 },
    checkbox: { width: 36, height: 36, borderRadius: 10, borderWidth: 2, justifyContent: "center", alignItems: "center", marginBottom: 12 },
    checkboxTick: { color: "#0b1220", fontWeight: "900" },
    takeNowBtn: { marginTop: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
});