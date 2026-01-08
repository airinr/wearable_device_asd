import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          // 1. Hapus garis bayangan (shadow) agar terlihat flat & modern
          headerShadowVisible: false,

          // 2. Judul di tengah (standar iOS, tapi bagus dipaksa untuk Android juga)
          headerTitleAlign: "center",

          // 3. Warna Background Header
          headerStyle: {
            backgroundColor: isDark ? "#09090b" : "#ffffff", // Zinc-950 atau White
          },

          // 4. Warna Teks Judul & Tombol Back
          headerTintColor: isDark ? "#ffffff" : "#0f172a", // White atau Slate-900

          // 5. Gaya Font Judul
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
          },

          // 6. Animasi Transisi (Opsional, agar mulus seperti iOS)
          animation: "slide_from_right",
        }}
      >
        {/* Halaman Utama (Tabs) - Header disembunyikan karena Tabs punya header sendiri */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Modal - Animasi dari bawah */}
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Info Detail",
            // Jika ingin header modal beda warna:
            // headerStyle: { backgroundColor: isDark ? '#18181b' : '#f1f5f9' }
          }}
        />
      </Stack>

      {/* Status Bar mengikuti tema (Otomatis Putih/Hitam teksnya) */}
      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
}
