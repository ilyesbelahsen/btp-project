import { Tabs } from "expo-router";
import { Clock, History, UserCircle } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ea580c",
        tabBarInactiveTintColor: "#a8a29e",
        tabBarStyle: {
          backgroundColor: "#1c1917",
          borderTopColor: "#292524",
          borderTopWidth: 1,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="pointage"
        options={{
          title: "Pointage",
          tabBarIcon: ({ color }) => <Clock size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          title: "Historique",
          tabBarIcon: ({ color }) => <History size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <UserCircle size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
