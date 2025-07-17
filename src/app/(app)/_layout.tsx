import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#FFFFFF', // Optional: Set a header background color
                },
                headerShadowVisible: false,
                headerTitleStyle: {
                    color: '#F18437', // Set header title color
                    fontWeight: 'bold',
                },
                headerTitleAlign: 'center', // Center the title
                headerTintColor: '#F18437', // Set the color of the back button and icons
                headerBackVisible: true,
                contentStyle: {
                    backgroundColor: 'white'
                }
            }}
        >
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="announcement/index"
                options={{
                    title: "Announcements",
                }}
            />
            <Stack.Screen
                name="announcement/create"
                options={{
                    title: "Create Announcement",
                }}
            />
            <Stack.Screen
                name="announcement/[id]"
                options={{
                    title: "Modify Announcement"
                }}
            />
            <Stack.Screen
                name="event/[id]/index"
                options={{
                    title: "Event Details",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="event/create"
                options={{
                    title: "Create Event",
                }}
            />
            <Stack.Screen
                name="event/[id]/edit"
                options={{
                    title: "Modify Event"
                }}
            />
            <Stack.Screen
                name="cca/[id]"
                options={{
                    title: "CCA Details"
                }}
            />
        </Stack>
    );
}
