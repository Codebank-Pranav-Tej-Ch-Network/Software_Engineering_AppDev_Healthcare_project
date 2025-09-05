// MedicationReminderScreen.jsx
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged } from "firebase/auth";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    updateDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Keyboard,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../../firebase"; // adjust path if needed

// Theme
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
  placeholder: "#7A8A99",
};

// helpers
const todayISO = () => new Date().toISOString().slice(0, 10);

// parse whatever Firestore returns into milliseconds (number) or null
const parseStoredTimeToMs = (t) => {
  if (t == null) return null;
  if (typeof t === "number") return t;
  // Firestore Timestamp has toDate()
  if (typeof t === "object" && typeof t.toDate === "function") {
    return t.toDate().getTime();
  }
  if (typeof t === "string") {
    const n = Date.parse(t);
    return Number.isNaN(n) ? null : n;
  }
  return null;
};

const formatTimeLabel = (timeVal) => {
  const ms = parseInt(timeVal, 10);
  if (!ms || Number.isNaN(ms)) return "--:--";
  const d = new Date(ms);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const isPM = hours >= 12;
  hours = ((hours + 11) % 12) + 1;
  const mm = String(minutes).padStart(2, "0");
  return `${hours}:${mm} ${isPM ? "PM" : "AM"}`;
};

// ---------- SetTimesModal component ----------
function SetTimesModal({ visible, initialSlots, onSave, onClose }) {
  const [slots, setSlots] = useState({
    morning: { enabled: false, time: new Date().setHours(9, 0, 0, 0) },
    afternoon: { enabled: false, time: new Date().setHours(13, 0, 0, 0) },
    night: { enabled: false, time: new Date().setHours(20, 0, 0, 0) },
  });
  const [showPickerFor, setShowPickerFor] = useState(null);
  const [pickerValue, setPickerValue] = useState(new Date());

  useEffect(() => {
    // when modal opens, copy initialSlots into local state (convert ms -> Date)
    if (visible) {
      setSlots({
        morning: {
          enabled: !!(initialSlots?.morning?.enabled),
          time:
            parseStoredTimeToMs(initialSlots?.morning?.time) ??
            new Date().setHours(9, 0, 0, 0),
        },
        afternoon: {
          enabled: !!(initialSlots?.afternoon?.enabled),
          time:
            parseStoredTimeToMs(initialSlots?.afternoon?.time) ??
            new Date().setHours(13, 0, 0, 0),
        },
        night: {
          enabled: !!(initialSlots?.night?.enabled),
          time:
            parseStoredTimeToMs(initialSlots?.night?.time) ??
            new Date().setHours(20, 0, 0, 0),
        },
      });
    }
  }, [visible, initialSlots]);

  const toggleSlot = (k) =>
    setSlots((s) => ({ ...s, [k]: { ...s[k], enabled: !s[k].enabled } }));

  const openPicker = (k) => {
    setPickerValue(new Date(slots[k].time ?? Date.now()));
    setShowPickerFor(k);
  };

  const onPickerChange = (e, d) => {
    if (Platform.OS !== "ios") setShowPickerFor(null);
    if (!d) return;
    setSlots((s) => ({ ...s, [showPickerFor]: { ...s[showPickerFor], time: d.getTime() } }));
  };

  const handleSave = () => {
    // convert times to ms numbers and return
    const out = {
      morning: {
        enabled: !!slots.morning.enabled,
        time: slots.morning.enabled ? Number(slots.morning.time) : null,
      },
      afternoon: {
        enabled: !!slots.afternoon.enabled,
        time: slots.afternoon.enabled ? Number(slots.afternoon.time) : null,
      },
      night: {
        enabled: !!slots.night.enabled,
        time: slots.night.enabled ? Number(slots.night.time) : null,
      },
    };
    onSave(out);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.backdrop}>
        <View style={modalStyles.modal}>
          <Text style={{ fontWeight: "800", fontSize: 18, marginBottom: 12 }}>Set Times</Text>

          {["morning", "afternoon", "night"].map((k) => {
            const s = slots[k];
            return (
              <View key={k} style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <TouchableOpacity
                  onPress={() => toggleSlot(k)}
                  style={[
                    modalStyles.chip,
                    { backgroundColor: s.enabled ? themeColors.accent : "#fff", borderColor: "#e6eefb" },
                  ]}
                >
                  <Text style={{ color: s.enabled ? "#fff" : themeColors.text, fontWeight: "700", textTransform: "capitalize" }}>
                    {k}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => openPicker(k)}
                  style={[
                    modalStyles.setBtn,
                    { marginLeft: 12, backgroundColor: '#F59E0B'  },
                  ]}
                >
                  <Text style={{ color: '#fff' , fontWeight: "700" }}>{s.enabled ? formatTimeLabel(s.time) : "Set"}</Text>
                </TouchableOpacity>
              </View>
            );
          })}

          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
            <TouchableOpacity onPress={onClose} style={modalStyles.btn}>
              <Text style={{ color: "#333" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[modalStyles.btn, { backgroundColor: themeColors.accent, marginLeft: 8 }]}>
              <Text style={{ color: "#fff" }}>Save</Text>
            </TouchableOpacity>
          </View>

          {showPickerFor && (
            <DateTimePicker
              value={new Date(pickerValue)}
              mode="time"
              is24Hour={false}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onPickerChange}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

// ---------- Main Screen ----------
export default function MedicationReminderScreen() {
  const [user, setUser] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loadingRemote, setLoadingRemote] = useState(true);

  // create area
  const [titleInput, setTitleInput] = useState("");
  const [createSlots, setCreateSlots] = useState({
    morning: { enabled: false, time: new Date().setHours(9, 0, 0, 0) },
    afternoon: { enabled: false, time: new Date().setHours(13, 0, 0, 0) },
    night: { enabled: false, time: new Date().setHours(20, 0, 0, 0) },
  });

  // modal visibility
  const [setTimesModalVisible, setSetTimesModalVisible] = useState(false);

  // time picker for editing existing reminders (shared)
  const [showEditPicker, setShowEditPicker] = useState(false);
  const [editPickerContext, setEditPickerContext] = useState(null); // {remId, slotKey}
  const [editPickerValue, setEditPickerValue] = useState(new Date());

  // keep timers for midnight reset
  const midnightTimerRef = useRef(null);
  const midnightIntervalRef = useRef(null);

  // Cloud function / backend endpoint to receive the daily report; replace with your deployed endpoint
  const DAILY_REPORT_URL = "https://YOUR_CLOUD_FUNCTION/sendDailyReport"; // <--- replace with your function URL
  const DAILY_REPORT_TARGET_EMAIL = "target@example.com"; // <--- replace with the email you want the backend to send to

  // auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
    });
    return () => unsub();
  }, []);

  // subscribe to reminders for user
  useEffect(() => {
    if (!user) {
      // show local sample fallback
      setReminders([]);
      setLoadingRemote(false);
      return;
    }
    setLoadingRemote(true);
    const colRef = collection(db, "users", user.uid, "reminders");
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const arr = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title ?? "",
            times: {
              morning: {
                enabled: !!(data?.times?.morning?.enabled),
                time: parseStoredTimeToMs(data?.times?.morning?.time),
                takenDate: data?.times?.morning?.takenDate ?? null,
              },
              afternoon: {
                enabled: !!(data?.times?.afternoon?.enabled),
                time: parseStoredTimeToMs(data?.times?.afternoon?.time),
                takenDate: data?.times?.afternoon?.takenDate ?? null,
              },
              night: {
                enabled: !!(data?.times?.night?.enabled),
                time: parseStoredTimeToMs(data?.times?.night?.time),
                takenDate: data?.times?.night?.takenDate ?? null,
              },
            },
          };
        });
        setReminders(arr);
        setLoadingRemote(false);
      },
      (err) => {
        console.error("reminders onSnapshot error:", err);
        setReminders([]);
        setLoadingRemote(false);
      }
    );

    return () => unsub();
  }, [user]);

  // schedule midnight reset to clear takenDate fields
  useEffect(() => {
    // clear any existing timers
    if (midnightTimerRef.current) {
      clearTimeout(midnightTimerRef.current);
      midnightTimerRef.current = null;
    }
    if (midnightIntervalRef.current) {
      clearInterval(midnightIntervalRef.current);
      midnightIntervalRef.current = null;
    }

    const schedule = () => {
      const now = new Date();
      const next = new Date(now);
      next.setDate(now.getDate() + 1);
      next.setHours(0, 0, 0, 0); // midnight next day
      const ms = next.getTime() - now.getTime();
      midnightTimerRef.current = setTimeout(async () => {
        try {
          // clear taken dates and also send a daily report
          const report = await clearAllTakenDatesAndBuildReport();
          // send report to backend/cloud function
          try {
            await sendDailyReport(report);
          } catch (e) {
            console.warn("failed to send daily report", e);
          }
        } catch (e) {
          console.warn("midnight clear failed", e);
        }
        // schedule repeating every 24h afterward
        midnightIntervalRef.current = setInterval(async () => {
          try {
            const report = await clearAllTakenDatesAndBuildReport();
            try {
              await sendDailyReport(report);
            } catch (e) {
              console.warn("failed to send daily report", e);
            }
          } catch (e) {
            console.warn("midnight clear failed", e);
          }
        }, 24 * 60 * 60 * 1000);
      }, ms);
    };

    schedule();
    return () => {
      if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
      if (midnightIntervalRef.current) clearInterval(midnightIntervalRef.current);
    };
  }, [user]); // reschedule when user changes

  // clear takenDate fields in Firestore for the current user and build a report of what was taken today
  const clearAllTakenDatesAndBuildReport = async () => {
    const report = { date: todayISO(), taken: [] };

    if (!user) {
      // local fallback: build report from local reminders then clear
      setReminders((prev) => {
        prev.forEach((r) => {
          const times = r.times || {};
          ["morning", "afternoon", "night"].forEach((s) => {
            if (times[s] && times[s].takenDate === todayISO()) {
              report.taken.push({ title: r.title, slot: s, time: times[s].time });
            }
            if (times[s]) times[s].takenDate = null;
          });
        });
        return prev.map((r) => ({ ...r, times: { ...(r.times || {}), morning: { ...(r.times?.morning || {}), takenDate: null }, afternoon: { ...(r.times?.afternoon || {}), takenDate: null }, night: { ...(r.times?.night || {}), takenDate: null } } }));
      });
      return report;
    }

    try {
      const q = collection(db, "users", user.uid, "reminders");
      const snap = await getDocs(q);

      // build report from snapshot BEFORE clearing
      snap.docs.forEach((d) => {
        const data = d.data();
        const title = data.title ?? "";
        const times = data.times || {};
        ["morning", "afternoon", "night"].forEach((slot) => {
          if (times[slot] && times[slot].takenDate === todayISO()) {
            report.taken.push({ title, slot, time: parseStoredTimeToMs(times[slot].time) });
          }
        });
      });

      // now clear takenDate fields
      const updates = [];
      snap.docs.forEach((d) => {
        const id = d.id;
        const docRef = doc(db, "users", user.uid, "reminders", id);
        updates.push(updateDoc(docRef, {
          "times.morning.takenDate": null,
          "times.afternoon.takenDate": null,
          "times.night.takenDate": null,
        }).catch((e) => console.warn("clear taken error for", id, e)));
      });
      await Promise.all(updates);
    } catch (e) {
      console.warn("clearAllTakenDates error", e);
    }

    return report;
  };

  // send daily report to backend/cloud function which will email it
  const sendDailyReport = async (report) => {
    if (!report) return;
    try {
      const payload = {
        uid: user?.uid ?? null,
        email: DAILY_REPORT_TARGET_EMAIL,
        date: report.date,
        taken: report.taken,
      };
      await fetch(DAILY_REPORT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn("sendDailyReport error", e);
      throw e;
    }
  };

  // add reminder (createSlots assumed to be ms numbers or null)
  const addReminder = async () => {
    const title = titleInput.trim();
    if (!title) {
      Alert.alert("Please enter medicine name");
      return;
    }

    const timesObj = {
      morning: {
        enabled: !!createSlots.morning.enabled,
        time: createSlots.morning.enabled ? Number(createSlots.morning.time) : null,
        takenDate: null,
      },
      afternoon: {
        enabled: !!createSlots.afternoon.enabled,
        time: createSlots.afternoon.enabled ? Number(createSlots.afternoon.time) : null,
        takenDate: null,
      },
      night: {
        enabled: !!createSlots.night.enabled,
        time: createSlots.night.enabled ? Number(createSlots.night.time) : null,
        takenDate: null,
      },
    };

    if (!user) {
      // local only
      const newRem = { id: `local-${Date.now()}`, title, times: timesObj };
      setReminders((p) => [newRem, ...p]);
      setTitleInput("");
      setCreateSlots({
        morning: { enabled: false, time: new Date().setHours(9, 0, 0, 0) },
        afternoon: { enabled: false, time: new Date().setHours(13, 0, 0, 0) },
        night: { enabled: false, time: new Date().setHours(20, 0, 0, 0) },
      });
      setSetTimesModalVisible(false);
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "reminders"), {
        title,
        times: {
          morning: { enabled: timesObj.morning.enabled, time: timesObj.morning.time ? new Date(timesObj.morning.time) : null, takenDate: null },
          afternoon: { enabled: timesObj.afternoon.enabled, time: timesObj.afternoon.time ? new Date(timesObj.afternoon.time) : null, takenDate: null },
          night: { enabled: timesObj.night.enabled, time: timesObj.night.time ? new Date(timesObj.night.time) : null, takenDate: null },
        },
        createdAt: new Date(),
      });
      setTitleInput("");
      setCreateSlots({
        morning: { enabled: false, time: new Date().setHours(9, 0, 0, 0) },
        afternoon: { enabled: false, time: new Date().setHours(13, 0, 0, 0) },
        night: { enabled: false, time: new Date().setHours(20, 0, 0, 0) },
      });
      setSetTimesModalVisible(false);
    } catch (e) {
      console.error("addDoc error", e);
      Alert.alert("Failed to add reminder");
    }
  };

  // open edit picker
  const openEditPicker = (remId, slotKey, currentMs, shouldEnable = false) => {
    setEditPickerValue(currentMs ? new Date(currentMs) : new Date());
    setEditPickerContext({ remId, slotKey, shouldEnable });
    setShowEditPicker(true);
  };

  // handle edit picker change
  const onEditTimeChange = async (selectedDate) => {
    if (!editPickerContext || !selectedDate) return;
    const { remId, slotKey, shouldEnable } = editPickerContext;
    const field = {};
    // store as Date so Firestore stores Timestamp (safe)
    field[`times.${slotKey}.time`] = selectedDate;
    if (shouldEnable) {
      field[`times.${slotKey}.enabled`] = true;
      field[`times.${slotKey}.takenDate`] = null;
    }
    try {
      if (!user) {
        // local fallback
        setReminders((prev) => prev.map((r) => {
          if (r.id !== remId) return r;
          const newTimes = { ...(r.times || {}) };
          newTimes[slotKey] = { ...(newTimes[slotKey] || {}), time: selectedDate.getTime(), enabled: shouldEnable ? true : (newTimes[slotKey]?.enabled ?? false), takenDate: shouldEnable ? null : newTimes[slotKey]?.takenDate ?? null };
          return { ...r, times: newTimes };
        }));
      } else {
        const dref = doc(db, "users", user.uid, "reminders", remId);
        await updateDoc(dref, field);
      }
    } catch (e) {
      console.error("update time error", e);
    } finally {
      setShowEditPicker(false);
      setEditPickerContext(null);
    }
  };

  const toggleTakenSlot = async (remId, slotKey) => {
    const rem = reminders.find((r) => r.id === remId);
    const currentTaken = rem?.times?.[slotKey]?.takenDate === todayISO();
    const val = currentTaken ? null : todayISO();
    const field = {};
    field[`times.${slotKey}.takenDate`] = val;
    try {
      if (!user) {
        setReminders((prev) => prev.map((r) => (r.id === remId ? { ...r, times: { ...(r.times || {}), [slotKey]: { ...(r.times?.[slotKey] || {}), takenDate: val } } } : r)));
      } else {
        const dref = doc(db, "users", user.uid, "reminders", remId);
        await updateDoc(dref, field);
      }
    } catch (e) {
      console.error("toggleTakenSlot error", e);
    }
  };

  const toggleSlotEnabledRemote = async (remId, slotKey) => {
    const rem = reminders.find((r) => r.id === remId);
    const current = rem?.times?.[slotKey]?.enabled ?? false;
    const field = {};
    field[`times.${slotKey}.enabled`] = !current;
    if (current) field[`times.${slotKey}.takenDate`] = null;
    try {
      if (!user) {
        setReminders((prev) => prev.map((r) => (r.id === remId ? { ...r, times: { ...(r.times || {}), [slotKey]: { ...(r.times?.[slotKey] || {}), enabled: !current, takenDate: null } } } : r)));
      } else {
        const dref = doc(db, "users", user.uid, "reminders", remId);
        await updateDoc(dref, field);
      }
    } catch (e) {
      console.error("toggleSlotEnabledRemote error", e);
    }
  };

  const deleteReminder = async (remId) => {
    Alert.alert("Delete", "Do you want to delete this reminder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (!user) {
              setReminders((p) => p.filter((r) => r.id !== remId));
            } else {
              await deleteDoc(doc(db, "users", user.uid, "reminders", remId));
            }
          } catch (e) {
            console.error("delete reminder error", e);
            Alert.alert("Failed to delete reminder");
          }
        },
      },
    ]);
  };

  // derived lists
  const takenToday = useMemo(
    () =>
      reminders.filter((r) => {
        const s = r.times || {};
        return s.morning?.takenDate === todayISO() || s.afternoon?.takenDate === todayISO() || s.night?.takenDate === todayISO();
      }),
    [reminders]
  );

  // UI card (updated to full-width buttons)
  const RemCard = ({ item }) => {
    const slots = item.times || {};
    return (
      <View style={[styles.card, { backgroundColor: themeColors.card }]}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={[styles.cardTitle, { color: themeColors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <TouchableOpacity onPress={() => deleteReminder(item.id)}>
              <Text style={{ color: "#ff6b6b", fontSize: 13 }}>Delete</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 10 }}>
            {["morning", "afternoon", "night"].map((slotKey) => {
              const slot = slots[slotKey] || {};
              if (!slot.enabled) return null;
              const taken = slot.takenDate === todayISO();
              const timeLabel = slot.time ? formatTimeLabel(slot.time) : "--:--";
              return (
                <View key={slotKey} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <TouchableOpacity
                        onPress={() => toggleTakenSlot(item.id, slotKey)}
                        style={[
                          styles.checkbox,
                          { borderColor: taken ? themeColors.accent : "#2F3F4B", backgroundColor: taken ? themeColors.accent : "transparent" },
                        ]}
                      >
                        {taken && <Text style={styles.checkboxTick}>✓</Text>}
                      </TouchableOpacity>

                      <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontWeight: "700", color: themeColors.text, textTransform: "capitalize" }}>{slotKey}</Text>
                        <Text style={{ color: themeColors.subText, marginTop: 4 }}>{timeLabel}</Text>
                      </View>
                    </View>

                    {/* Inline action buttons on the same row */}
                    <View style={{ flexDirection: "row", marginLeft: 12, alignItems: "center" }}>
                      {slot.enabled ? (
                        <>
                          <TouchableOpacity onPress={() => openEditPicker(item.id, slotKey, slot.time, false)} style={styles.inlineBtn}>
                            <Text style={styles.inlineBtnText}>Change</Text>
                          </TouchableOpacity>

                          <TouchableOpacity onPress={() => toggleSlotEnabledRemote(item.id, slotKey)} style={[styles.inlineBtn, styles.inlineDisableBtn]}>
                            <Text style={styles.inlineBtnText}>Disable</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity onPress={() => openEditPicker(item.id, slotKey, slot.time, true)} style={styles.inlineBtn}>
                          <Text style={styles.inlineBtnText}>Set Time</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  // compute progress percent (taken slots / enabled slots)
  const progressPercent = (() => {
    const totalSlots = reminders.reduce((acc, r) => acc + (r.times?.morning?.enabled ? 1 : 0) + (r.times?.afternoon?.enabled ? 1 : 0) + (r.times?.night?.enabled ? 1 : 0), 0) || 1;
    const takenSlots = reminders.reduce((acc, r) => acc + (r.times?.morning?.takenDate === todayISO() ? 1 : 0) + (r.times?.afternoon?.takenDate === todayISO() ? 1 : 0) + (r.times?.night?.takenDate === todayISO() ? 1 : 0), 0);
    return Math.round((takenSlots / totalSlots) * 100);
  })();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]}>
      <Stack.Screen options={{ title: "Medication Reminders" }} />
      <StatusBar style="dark" />

      <View style={[styles.header, { borderBottomColor: themeColors.inputBorder }]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={[styles.iconBox, { backgroundColor: themeColors.card }]}>
            <Text style={{ color: themeColors.accent2, fontWeight: "700" }}>⚡</Text>
          </View>
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
            <Text style={[styles.smallText, { color: themeColors.subText }]}>
              {takenToday.length} taken today
            </Text>
          </View>
          <Text style={{ color: themeColors.accent, fontWeight: "700" }}>{progressPercent}%</Text>
        </View>

        <View style={{ marginTop: 12 }}>
          <View style={[styles.progressBarTrack, { backgroundColor: themeColors.progressTrack }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: themeColors.accent }]} />
          </View>
        </View>

        {/* create row */}
        <View style={{ flexDirection: "row", marginTop: 16, alignItems: "center" }}>
          <TextInput
            value={titleInput}
            onChangeText={setTitleInput}
            placeholder="Medicine name..."
            placeholderTextColor={themeColors.placeholder}
            style={[styles.input, { backgroundColor: themeColors.inputBg, color: themeColors.text, borderColor: themeColors.inputBorder }]}
          />

          <TouchableOpacity
            onPress={() => {
              setSetTimesModalVisible(true);
              Keyboard.dismiss();
            }}
            style={[styles.setTimeBtn, { backgroundColor: '#F59E0B' }]} 
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Set Times</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={addReminder} style={[styles.addBtn, { backgroundColor: themeColors.accent }]}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 20 }}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 120 }}>
          {/* Single unified heading as requested */}
          <Text style={[styles.sectionTitle, { color: themeColors.text, marginLeft: 6 }]}>Reminders list</Text>
          <View style={{ paddingTop: 8 }}>
            {reminders.length > 0 ? reminders.slice().sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase())).map((item) => <RemCard key={item.id} item={item} />) : <View style={{ padding: 20 }}><Text style={{ color: themeColors.subText }}>No reminders yet.</Text></View>}
          </View>
        </View>
      </ScrollView>

      {/* SetTimes Modal */}
      <SetTimesModal
        visible={setTimesModalVisible}
        initialSlots={createSlots}
        onClose={() => setSetTimesModalVisible(false)}
        onSave={(updatedSlots) => {
          // updatedSlots contains ms numbers or null
          setCreateSlots({
            morning: { enabled: !!updatedSlots.morning.enabled, time: updatedSlots.morning.time ?? new Date().setHours(9, 0, 0, 0) },
            afternoon: { enabled: !!updatedSlots.afternoon.enabled, time: updatedSlots.afternoon.time ?? new Date().setHours(13, 0, 0, 0) },
            night: { enabled: !!updatedSlots.night.enabled, time: updatedSlots.night.time ?? new Date().setHours(20, 0, 0, 0) },
          });
          setSetTimesModalVisible(false);
        }}
      />

      {/* Edit Time Picker for existing reminders */}
      {showEditPicker && editPickerContext && (
        <DateTimePicker
          value={editPickerValue}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(e, d) => {
            setShowEditPicker(false);
            if (!d) return;
            onEditTimeChange(d);
          }}
        />
      )}

      {/* Shared DateTimePicker inside the SetTimesModal handled there */}

      {/* Bottom navigation background spacer — keeps app content from going under the system/tab bar */}
      <View style={styles.bottomNavBackground} pointerEvents="none" />

    </SafeAreaView>
  );
}

// ---------- styles ----------
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
  setTimeBtn: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, marginRight: 8 },
  addBtn: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  slotChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: themeColors.inputBorder },
  card: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, marginVertical: 8, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardTime: { fontSize: 13, marginTop: 6 },
  checkbox: { width: 36, height: 36, borderRadius: 10, borderWidth: 2, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  checkboxTick: { color: "#0b1220", fontWeight: "900" },
  fullActionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 8, backgroundColor: themeColors.accent },
  disableBtn: { backgroundColor: '#ef4444', marginRight: 0 },
  inlineBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginLeft: 8, minWidth: 88, alignItems: 'center', justifyContent: 'center', backgroundColor: themeColors.accent },
  inlineDisableBtn: { backgroundColor: '#ef4444' },
  inlineBtnText: { color: '#fff', fontWeight: '700' },
  bottomNavBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    zIndex: 10,
  },
});

// modal styles
const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  setBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
