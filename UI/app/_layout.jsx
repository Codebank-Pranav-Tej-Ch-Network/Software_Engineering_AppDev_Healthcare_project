import { SplashScreen, Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import LogoutButton from '../components/LogoutButton'; // Make sure this path is correct
import { AuthProvider, useAuth } from '../context/AuthContext'; // Make sure this path is correct

// Prevent the splash screen from auto-hiding while we check the user's login status
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  // Get the user and the loading state from your AuthContext
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Do nothing until the initial auth check is complete
    if (loading) {
      return;
    }

    // Once the auth state is ready, hide the splash screen
    SplashScreen.hideAsync();

    if (user) {
      // If the user is logged in, send them to the main app (home screen)
      router.replace('/');
    } else {
      // If the user is not logged in, send them to the login screen
      router.replace('/login');
    }
  }, [user, loading]); // This logic runs when the auth check is complete or the user logs in/out

  return (
    <Stack>
      {/* The main app screens will have a header with a logout button */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: true,
          title: "Health Services",
          headerRight: () => <LogoutButton />,
        }}
      />
      {/* The login and signup screens will have no header */}
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}