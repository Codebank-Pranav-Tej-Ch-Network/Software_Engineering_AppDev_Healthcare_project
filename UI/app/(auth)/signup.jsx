import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../../firebase';

const AuthToggle = ({ activeScreen }) => {
  const router = useRouter();
  return (
    <View style={styles.toggleContainer}>
      <TouchableOpacity
        style={[styles.toggleButton, activeScreen === 'signup' ? styles.activeButton : styles.inactiveButton]}
        onPress={() => router.replace('/signup')}
      >
        <Text style={[styles.toggleText, activeScreen === 'signup' ? styles.activeText : styles.inactiveText]}>Sign up</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.toggleButton, activeScreen === 'login' ? styles.activeButton : styles.inactiveButton]}
        onPress={() => router.replace('/login')}
      >
        <Text style={[styles.toggleText, activeScreen === 'login' ? styles.activeText : styles.inactiveText]}>Sign in</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState(''); // displayed as DD/MM/YYYY string
  const [dobDateObj, setDobDateObj] = useState(null); // actual Date object
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bloodGroup, setBloodGroup] = useState(''); // picker
  const [gender, setGender] = useState(''); // picker
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);

  // inline error messages
  const [errors, setErrors] = useState({
    name: '',
    dob: '',
    bloodGroup: '',
    gender: '',
    location: '',
    contact: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // ---------- Validation helpers ----------
  const emailIsValid = (em) => {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(String(em).toLowerCase());
  };

  const dobIsValid = (d) => {
    if (!d) return false;
    const m = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return false;
    const day = Number(m[1]), month = Number(m[2]), year = Number(m[3]);
    if (month < 1 || month > 12) return false;
    const mdays = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day < 1 || day > mdays[month - 1]) return false;
    const now = new Date();
    if (year < 1900 || year > now.getFullYear()) return false;
    const dobDate = new Date(year, month - 1, day);
    if (dobDate > now) return false;
    return true;
  };

  const cityIsValid = (c) => {
    return /^[a-zA-Z\s]{2,}$/.test(c.trim());
  };

  const phoneIsValid = (p) => {
    const digits = p.replace(/\D/g, '');
    return digits.length >= 7;
  };

  // ---------- Field-level validators (set inline error) ----------
  const validateName = () => {
    if (!name.trim()) setErrors((e) => ({ ...e, name: 'Name is required.' }));
    else setErrors((e) => ({ ...e, name: '' }));
  };

  const validateDob = () => {
    if (!dobIsValid(dob)) setErrors((e) => ({ ...e, dob: 'Enter valid DOB (DD/MM/YYYY).' }));
    else setErrors((e) => ({ ...e, dob: '' }));
  };

  const validateBloodGroup = () => {
    if (!bloodGroup) setErrors((e) => ({ ...e, bloodGroup: 'Please select blood group.' }));
    else setErrors((e) => ({ ...e, bloodGroup: '' }));
  };

  const validateGender = () => {
    if (!gender) setErrors((e) => ({ ...e, gender: 'Please select gender.' }));
    else setErrors((e) => ({ ...e, gender: '' }));
  };

  const validateLocation = () => {
    if (!cityIsValid(location)) setErrors((e) => ({ ...e, location: 'Enter valid nearby city.' }));
    else setErrors((e) => ({ ...e, location: '' }));
  };

  const validateContact = () => {
    if (!phoneIsValid(contact)) setErrors((e) => ({ ...e, contact: 'Enter valid contact number.' }));
    else setErrors((e) => ({ ...e, contact: '' }));
  };

  const validateEmail = () => {
    if (!emailIsValid(email)) setErrors((e) => ({ ...e, email: 'Enter a valid email address.' }));
    else setErrors((e) => ({ ...e, email: '' }));
  };

  const validatePassword = () => {
    if (password.length < 6) setErrors((e) => ({ ...e, password: 'Password must be at least 6 characters.' }));
    else setErrors((e) => ({ ...e, password: '' }));
  };

  const validateConfirmPassword = () => {
    if (confirmPassword !== password) setErrors((e) => ({ ...e, confirmPassword: 'Passwords do not match.' }));
    else setErrors((e) => ({ ...e, confirmPassword: '' }));
  };

  // ---------- Signup ----------
  const handleSignUp = async () => {
    // run all validators and collect any errors
    validateName();
    validateDob();
    validateBloodGroup();
    validateGender();
    validateLocation();
    validateContact();
    validateEmail();
    validatePassword();
    validateConfirmPassword();

    // check if any error exists after validations
    const hasError = Object.values({
      name: !name.trim(),
      dob: !dobIsValid(dob),
      bloodGroup: !bloodGroup,
      gender: !gender,
      location: !cityIsValid(location),
      contact: !phoneIsValid(contact),
      email: !emailIsValid(email),
      password: password.length < 6,
      confirmPassword: confirmPassword !== password,
    }).some(Boolean);

    if (hasError) {
      // stop and show inline errors (already set)
      // optionally scroll to first error field:
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const profileData = {
        name: name.trim(),
        dob,
        bloodGroup,
        gender,
        location: location.trim(),
        contact,
        email,
        createdAt: new Date().toISOString(),
      };

      const docRef = doc(db, `users/${user.uid}/profile`, 'data');
      await setDoc(docRef, profileData);

      Alert.alert('Success', 'Account created successfully.');
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Date Picker handlers ----------
  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // keep for iOS, hide for Android after selection
    if (selectedDate) {
      setDobDateObj(selectedDate);
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const yy = String(selectedDate.getFullYear());
      const formatted = `${dd}/${mm}/${yy}`;
      setDob(formatted);
      setErrors((e) => ({ ...e, dob: '' }));
    }
  };

  // keyboardVerticalOffset: header height + small gap
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 100 : 80;

  return (
    <LinearGradient colors={['#2c1a42', '#3a2d5a']} style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Create Account',
          headerStyle: { backgroundColor: '#2c1a42' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <AuthToggle activeScreen="signup" />

              <Text style={styles.title}>Create an account</Text>

              {/* Name */}
              <View>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#9e9e9e" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="#9e9e9e"
                    value={name}
                    onChangeText={setName}
                    returnKeyType="next"
                    onBlur={validateName}
                  />
                </View>
                {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

             {/* Date of Birth (picker) */}
<View>
  <TouchableOpacity onPress={openDatePicker} activeOpacity={0.8}>
    <View style={styles.inputContainer}>
      <Ionicons name="calendar-outline" size={20} color="#9e9e9e" style={styles.inputIcon} />
      {/* use dobText so the label is vertically centered */}
      <Text style={[styles.dobText, !dob ? styles.placeholderText : null]}>
        {dob || 'Select Date of Birth'}
      </Text>
    </View>
  </TouchableOpacity>
  {!!errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
  {showDatePicker && (
    <DateTimePicker
      value={dobDateObj || new Date(2000, 0, 1)}
      mode="date"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={onDateChange}
      maximumDate={new Date()}
    />
  )}
</View>


              {/* Blood Group (picker) */}
              <View>
                <View style={[styles.inputContainer, styles.pickerWrapper]}>
                  <Ionicons name="water-outline" size={20} color="#9e9e9e" style={styles.inputIcon} />
                  <View style={styles.pickerBox}>
                    <Picker
                      selectedValue={bloodGroup}
                      onValueChange={(itemValue) => { setBloodGroup(itemValue); setErrors((e) => ({ ...e, bloodGroup: '' })); }}
                      style={styles.picker}
                      dropdownIconColor="#fff"
                    >
                      <Picker.Item label="Select Blood Group" value="" enabled={false} color="#9e9e9e" />
                      <Picker.Item label="A+" value="A+" />
                      <Picker.Item label="A-" value="A-" />
                      <Picker.Item label="B+" value="B+" />
                      <Picker.Item label="B-" value="B-" />
                      <Picker.Item label="O+" value="O+" />
                      <Picker.Item label="O-" value="O-" />
                      <Picker.Item label="AB+" value="AB+" />
                      <Picker.Item label="AB-" value="AB-" />
                    </Picker>
                  </View>
                </View>
                {!!errors.bloodGroup && <Text style={styles.errorText}>{errors.bloodGroup}</Text>}
              </View>

              {/* Gender (picker) */}
              <View>
                <View style={[styles.inputContainer, styles.pickerWrapper]}>
                  <Ionicons name="male-female-outline" size={20} color="#9e9e9e" style={styles.inputIcon} />
                  <View style={styles.pickerBox}>
                    <Picker
                      selectedValue={gender}
                      onValueChange={(itemValue) => { setGender(itemValue); setErrors((e) => ({ ...e, gender: '' })); }}
                      style={styles.picker}
                      dropdownIconColor="#fff"
                    >
                      <Picker.Item label="Select Gender" value="" enabled={false} color="#9e9e9e" />
                      <Picker.Item label="Male" value="Male" />
                      <Picker.Item label="Female" value="Female" />
                    </Picker>
                  </View>
                </View>
                {!!errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
              </View>

              {/* Location */}
              <View>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#9e9e9e" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nearby City"
                    placeholderTextColor="#9e9e9e"
                    value={location}
                    onChangeText={setLocation}
                    returnKeyType="next"
                    onBlur={validateLocation}
                  />
                </View>
                {!!errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
              </View>

              {/* Contact No */}
              <View>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#9e9e9e" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contact Number"
                    placeholderTextColor="#9e9e9e"
                    value={contact}
                    onChangeText={setContact}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    onBlur={validateContact}
                  />
                </View>
                {!!errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}
              </View>

              {/* Email */}
              <View>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#9e9e9e" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#9e9e9e"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                    onBlur={validateEmail}
                  />
                </View>
                {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Password */}
              <View>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9e9e9e" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#9e9e9e"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    returnKeyType="next"
                    onBlur={validatePassword}
                  />
                </View>
                {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Confirm Password */}
              <View>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9e9e9e" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#9e9e9e"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    returnKeyType="done"
                    onBlur={validateConfirmPassword}
                  />
                </View>
                {!!errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign up</Text>}
              </TouchableOpacity>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 30,
    padding: 4,
    marginBottom: 40,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 26,
    alignItems: 'center',
  },
  activeButton: { backgroundColor: '#4A376D' },
  inactiveButton: { backgroundColor: 'transparent' },
  toggleText: { fontSize: 16, fontWeight: '600' },
  activeText: { color: '#fff' },
  inactiveText: { color: '#aaa' },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 15,
    marginBottom: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    height: 56,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    height: '100%',
    color: '#fff',
    fontSize: 16,
  },
  placeholderText: {
    color: '#9e9e9e',
  },
  pickerWrapper: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  pickerBox: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    height: '100%',
  },
  picker: {
    flex: 1,
    color: '#fff',
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: '#8A63D2',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff6b6b',
    marginTop: 6,
    marginBottom: 8,
    marginLeft: 6,
    fontSize: 13,
  },
  dobText: {
  flex: 1,
  alignSelf: 'center',        // vertical center inside inputContainer
  color: '#fff',
  fontSize: 16,
  // Android: ensure vertical centering in some cases
  textAlignVertical: 'center',
},

});
