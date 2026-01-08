import { useRouter } from "expo-router";
import { CheckCircle2, Router, Wifi } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import WifiManager from "react-native-wifi-reborn";

const ESP_SSID = "ESP32-Medic";
const ESP_IP = "http://192.168.4.1";

const SetupScreen = () => {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWebView, setShowWebView] = useState(false);

  // --- 1. LOGIKA IZIN (WAJIB BUAT ANDROID) ---
  const requestWifiPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        // Android 13 (SDK 33) ke atas butuh NEARBY_WIFI_DEVICES
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
            {
              title: "Izin WiFi Dibutuhkan",
              message: "Aplikasi butuh izin untuk menghubungkan ke alat IoT.",
              buttonNeutral: "Nanti",
              buttonNegative: "Tolak",
              buttonPositive: "Izinkan",
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        // Android 12 ke bawah butuh FINE_LOCATION
        else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Izin Lokasi Dibutuhkan",
              message: "Android mewajibkan izin lokasi untuk memindai WiFi.",
              buttonNeutral: "Nanti",
              buttonNegative: "Tolak",
              buttonPositive: "Izinkan",
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS setup via Xcode Capabilities
  };

  // --- 2. LOGIKA KONEKSI ---
  const connectToESP = async () => {
    setIsConnecting(true);

    // Cek Izin Dulu
    const hasPermission = await requestWifiPermissions();
    if (!hasPermission) {
      setIsConnecting(false);
      Alert.alert(
        "Izin Ditolak",
        "Mohon izinkan akses Lokasi/WiFi agar aplikasi bisa bekerja."
      );
      return;
    }

    try {
      // Proses Konek
      await WifiManager.connectToSSID(ESP_SSID);
      console.log("Berhasil konek ke ESP32!");

      // Jeda 2 detik agar IP assigned stabil sebelum buka WebView
      setTimeout(() => {
        setIsConnecting(false);
        setShowWebView(true);
      }, 2000);
    } catch (error) {
      setIsConnecting(false);
      console.log("Gagal konek:", error);
      Alert.alert(
        "Gagal Terhubung",
        "1. Pastikan alat menyala.\n2. Pastikan GPS HP Aktif.\n3. Jika muncul popup sistem, pilih 'Connect/Join'."
      );
    }
  };

  // --- 3. LOGIKA PUTUS KONEKSI (CLEANUP) ---
  const disconnectAndFinish = async () => {
    try {
      // Putuskan koneksi agar HP kembali ke Internet (4G/WiFi Rumah)
      await WifiManager.disconnect();

      // Khusus Android: Lepaskan 'binding' network
      if (Platform.OS === "android") {
        await WifiManager.forceWifiUsage(false);
      }
      console.log("Disconnected from ESP32");
    } catch (error) {
      console.log("Error disconnecting:", error);
    } finally {
      // Reset State & Pindah Halaman
      setShowWebView(false);
      // Ganti '/monitoring' sesuai route halaman dashboard kamu
      router.replace("/monitoring");
    }
  };

  const handleWebViewNavigation = (navState: { url: any }) => {
    console.log("URL:", navState.url);
  };

  // --- TAMPILAN 1: WEBVIEW (SAAT SETUP WIFI) ---
  if (showWebView) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* Header WebView */}
        <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100 bg-white shadow-sm z-10">
          <View>
            <Text className="text-lg font-bold text-slate-800">
              Konfigurasi WiFi
            </Text>
            <Text className="text-xs text-slate-400">
              Isi SSID & Password Rumah
            </Text>
          </View>

          {/* Tombol Selesai Custom */}
          <TouchableOpacity
            onPress={disconnectAndFinish}
            className="bg-sky-500 px-4 py-2 rounded-full flex-row items-center space-x-1"
          >
            <Text className="text-white font-bold text-sm">Selesai</Text>
            <CheckCircle2 size={16} color="white" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <WebView
          source={{ uri: ESP_IP }}
          onNavigationStateChange={handleWebViewNavigation}
          style={{ flex: 1 }}
          onError={() =>
            Alert.alert(
              "Info",
              "Jika layar putih/error, alat mungkin sudah restart dan terhubung ke internet. Silakan tekan tombol Selesai."
            )
          }
        />
      </SafeAreaView>
    );
  }

  // --- TAMPILAN 2: HALAMAN UTAMA (INSTRUKSI) ---
  return (
    <SafeAreaView className="flex-1 bg-white px-6 justify-center">
      {/* Ilustrasi Header */}
      <View className="items-center mb-10">
        <View className="bg-sky-100 w-24 h-24 rounded-full items-center justify-center mb-6 shadow-sm">
          <Router size={48} color="#0ea5e9" />
        </View>
        <Text className="text-2xl font-bold text-slate-800 text-center">
          Hubungkan Alat
        </Text>
        <Text className="text-slate-500 text-center mt-2 px-4 leading-5">
          Ikuti langkah di bawah ini untuk menghubungkan alat ke internet.
        </Text>
      </View>

      {/* Kartu Instruksi */}
      <View className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 space-y-3">
        <View className="flex-row items-start">
          <View className="bg-sky-500 w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5">
            <Text className="text-white font-bold text-xs">1</Text>
          </View>
          <Text className="text-slate-600 flex-1 leading-5">
            Nyalakan alat monitoring Anda.
          </Text>
        </View>

        <View className="flex-row items-start">
          <View className="bg-sky-500 w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5">
            <Text className="text-white font-bold text-xs">2</Text>
          </View>
          <Text className="text-slate-600 flex-1 leading-5">
            Tunggu hingga layar alat menampilkan:{" "}
            <Text className="font-bold text-sky-600">WiFi: {ESP_SSID}</Text>
          </Text>
        </View>

        <View className="flex-row items-start">
          <View className="bg-sky-500 w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5">
            <Text className="text-white font-bold text-xs">3</Text>
          </View>
          <Text className="text-slate-600 flex-1 leading-5">
            Tekan tombol Mulai Setup di bawah.
          </Text>
        </View>
      </View>

      {/* Tombol Aksi */}
      <View>
        {isConnecting ? (
          <TouchableOpacity
            disabled
            className="w-full bg-slate-100 py-4 rounded-2xl flex-row justify-center items-center space-x-2"
          >
            <ActivityIndicator size="small" color="#0ea5e9" />
            <Text className="text-slate-500 font-bold ml-2">
              Menghubungkan...
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={connectToESP}
            className="w-full bg-sky-500 py-4 rounded-2xl shadow-lg shadow-sky-200 flex-row justify-center items-center"
          >
            <Wifi size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              Mulai Setup WiFi
            </Text>
          </TouchableOpacity>
        )}

        <Text className="text-center text-slate-300 text-xs mt-4">
          Pastikan Bluetooth & Lokasi (GPS) aktif
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SetupScreen;
