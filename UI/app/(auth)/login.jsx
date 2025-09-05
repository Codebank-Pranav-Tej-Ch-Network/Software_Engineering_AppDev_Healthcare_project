import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router'; // 1. Import Stack
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebase';

// This is the reusable toggle component
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your credentials.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#2c1a42', '#3a2d5a']}
      style={styles.container}
    >
      {/* 2. Add the Stack.Screen component to configure the header */}
      <Stack.Screen options={{
          headerShown: true, // Make sure the header is visible
          headerTitle: "Sign In", // Set the title
          headerStyle: { backgroundColor: '#2c1a42' }, // Match the gradient
          headerTintColor: '#fff', // White title text
          headerShadowVisible: false, // Hide the bottom border line
        }} 
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          <AuthToggle activeScreen="login" />
          
          <Text style={styles.title}>Welcome back</Text>

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
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9e9e9e" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9e9e9e"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 16,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    height: 55,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#8A63D2',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
