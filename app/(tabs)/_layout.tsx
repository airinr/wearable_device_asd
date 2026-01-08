import { Tabs } from "expo-router";
import { Activity, FileQuestion, Wifi } from "lucide-react-native";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 5,
          backgroundColor: "#ffffff",
          borderRadius: 20,
          height: 60,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 10,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "#0ea5e9",
        tabBarInactiveTintColor: "#94a3b8",
      }}
    >
      <Tabs.Screen
        name="monitoring"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              className={`p-3 rounded-full -mt-8 shadow-lg ${
                focused ? "bg-sky-500" : "bg-slate-400"
              }`}
            >
              <Activity size={24} color="white" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          // KITA TERAPKAN STYLE YANG SAMA DI SINI
          tabBarIcon: ({ focused }) => (
            <View
              // Class yang sama: padding 3, bulat penuh, margin atas negatif (biar naik), shadow
              className={`p-3 rounded-full -mt-8 shadow-lg ${
                focused ? "bg-sky-500" : "bg-slate-400"
              }`}
            >
              {/* Ikon User berwarna putih agar kontras */}
              <FileQuestion size={24} color="white" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="wifiSetup"
        options={{
          // KITA TERAPKAN STYLE YANG SAMA DI SINI
          tabBarIcon: ({ focused }) => (
            <View
              // Class yang sama: padding 3, bulat penuh, margin atas negatif (biar naik), shadow
              className={`p-3 rounded-full -mt-8 shadow-lg ${
                focused ? "bg-sky-500" : "bg-slate-400"
              }`}
            >
              {/* Ikon User berwarna putih agar kontras */}
              <Wifi size={24} color="white" />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
