import { SplashScreen, Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import LogoutButton from '../components/LogoutButton';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Prevent the splash screen from auto-hiding while we check the user's login status
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }
    SplashScreen.hideAsync();

    if (user) {
      router.replace('/');
    } else {
      router.replace('/login');
    }
  }, [user, loading]);

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: true,
          title: "Health Services",
          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Test-Result-Analysis"
        options={{
          headerShown: true,
          title: "Test Report Analyzer",
          headerRight: () => <LogoutButton />,
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
