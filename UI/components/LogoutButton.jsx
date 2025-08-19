import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext'; // 1. Import your useAuth hook

export default function LogoutButton() {
  // 2. Get the logout function from the context
  const { logout } = useAuth();

  // 3. Create a handler function to show the confirmation alert
  const handleLogout = () => {
    Alert.alert(
      "Sign Out", // Title of the alert
      "Are you sure you want to sign out?", // Message
      [
        // Button Array
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          onPress: logout, // 4. If the user confirms, call the logout function
          style: "destructive",
        },
      ],
      { cancelable: true } // Allows user to tap outside the alert to cancel
    );
  };

  return (
    // 5. The button now calls the handler function
    <TouchableOpacity onPress={handleLogout} style={styles.button}>
      <Ionicons name="log-out-outline" size={26} color="#333" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 15,
    padding: 5,
  },
});