import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Hardcoded colors for light mode
const themeColors = {
    background: '#f0f4f8',
    card: '#ffffff',
    text: '#333333',
    subtleText: '#a0a0a0',
    headerText: '#333',
    iconBg: '#fff0e9',
    appointmentCard: '#ffe5d8',
    appointmentText: '#555',
};

// A small component for the menu items
const ProfileMenuItem = ({ icon, name, iconType }) => {
    const IconComponent = iconType === 'Material' ? MaterialCommunityIcons : Ionicons;
    return (
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: themeColors.card }]}>
            <View style={[styles.menuIconContainer, { backgroundColor: themeColors.iconBg }]}>
                <IconComponent name={icon} size={22} color="#ff8c61" />
            </View>
            <Text style={[styles.menuText, { color: themeColors.text }]}>{name}</Text>
            <Ionicons name="chevron-forward" size={24} color={themeColors.subtleText} />
        </TouchableOpacity>
    );
};

export default function MyProfileScreen() {
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
            <Stack.Screen options={{ title: 'My Profile' }} />
            
            <ScrollView style={styles.container}>
                {/* --- Header --- */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.headerName, { color: themeColors.headerText }]}>Virginia Fowler</Text>
                        <Text style={[styles.headerTitle, { color: themeColors.subtleText }]}>Art Director</Text>
                    </View>
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=26' }}
                        style={styles.profileImage}
                    />
                </View>

                {/* --- Stats Grid --- */}
                <View style={[styles.statsContainer, { backgroundColor: themeColors.card }]}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statLabel, { color: themeColors.subtleText }]}>AGE</Text>
                        <Text style={[styles.statValue, { color: themeColors.text }]}>24 <Text style={styles.statUnit}>year old</Text></Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statLabel, { color: themeColors.subtleText }]}>BLOOD</Text>
                        <Text style={[styles.statValue, { color: themeColors.text }]}>AB</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statLabel, { color: themeColors.subtleText }]}>HEIGHT</Text>
                        <Text style={[styles.statValue, { color: themeColors.text }]}>180 <Text style={styles.statUnit}>cm</Text></Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={[styles.statLabel, { color: themeColors.subtleText }]}>WEIGHT</Text>
                        <Text style={[styles.statValue, { color: themeColors.text }]}>64 <Text style={styles.statUnit}>kg</Text></Text>
                    </View>
                </View>

                {/* --- Appointment Card --- */}
                <TouchableOpacity style={[styles.appointmentCard, { backgroundColor: themeColors.appointmentCard }]}>
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=32' }}
                        style={styles.doctorImage}
                    />
                    <View style={styles.appointmentTextContainer}>
                        <Text style={[styles.appointmentTitle, { color: themeColors.appointmentText }]}>Checking your healthcare</Text>
                        <Text style={[styles.appointmentSubtitle, { color: themeColors.subtleText }]}>Dr. Ann Carlson</Text>
                    </View>
                    <Text style={[styles.appointmentTime, { color: themeColors.subtleText }]}>8am - 9am</Text>
                </TouchableOpacity>

                {/* --- Menu List --- */}
                <View style={styles.menuContainer}>
                    <ProfileMenuItem icon="flame-outline" name="Goal Settings" />
                    <ProfileMenuItem icon="heart-outline" name="Doctor Favorites" />
                    {/* Dark Mode Toggle has been removed */}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// --- Stylesheet (no changes needed here) ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    headerName: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 16,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        borderRadius: 15,
        padding: 10,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    statBox: {
        width: '48%',
        padding: 15,
    },
    statLabel: {
        fontSize: 12,
        marginBottom: 5,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statUnit: {
        fontSize: 14,
        fontWeight: 'normal',
    },
    appointmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
    },
    doctorImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 15,
    },
    appointmentTextContainer: {
        flex: 1,
    },
    appointmentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    appointmentSubtitle: {
        fontSize: 14,
    },
    appointmentTime: {
        fontSize: 12,
    },
    menuContainer: {
        marginTop: 10,
        paddingBottom: 40,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 5,
    },
    menuIconContainer: {
        padding: 8,
        borderRadius: 8,
        marginRight: 15,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
});