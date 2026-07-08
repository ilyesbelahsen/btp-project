import { Tabs } from "expo-router";
import { Briefcase, Clock, Receipt, UserCircle } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#2563eb" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Chantiers",
          tabBarIcon: ({ color }) => <Briefcase size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pointage"
        options={{
          title: "Pointage",
          tabBarIcon: ({ color }) => <Clock size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="depenses"
        options={{
          title: "Dépenses",
          tabBarIcon: ({ color }) => <Receipt size={22} color={color} />,
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
