import { useRouter, useFocusEffect } from "expo-router";
import { CheckCircle2, Router as RouterIcon, Wifi } from "lucide-react-native";
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
import { useCallback } from "react";

const ESP_SSID = "ESP32-Medic";
const ESP_IP = "http://192.168.4.1";

const SetupScreen = () => {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWebView, setShowWebView] = useState(false);

  // --- 1. LOGIKA IZIN (WAJIB BUAT ANDROID) ---
  const requestConnectionPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        // 1. Untuk Android 13 ke atas (SDK 33+)
        // Wajib pakai izin khusus: NEARBY_WIFI_DEVICES
        if (Platform.Version >= 33) {
          const granted1 = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
            {
              title: "Izin Koneksi Perangkat",
              message:
                "Aplikasi butuh izin untuk memindai dan terhubung ke alat IoT di sekitar.",
              buttonNeutral: "Nanti",
              buttonNegative: "Tolak",
              buttonPositive: "Izinkan",
            }
          );
          const granted2 = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Izin Lokasi Diperlukan",
              message:
                "Aplikasi ini membutuhkan akses lokasi untuk mendeteksi Wi-Fi ESP32.",
              buttonNeutral: "Nanti",
              buttonNegative: "Tolak",
              buttonPositive: "Izinkan",
            }
          );
          return (
            granted1 === PermissionsAndroid.RESULTS.GRANTED &&
            granted2 === PermissionsAndroid.RESULTS.GRANTED
          );
        }

        // 2. Untuk Android 12 ke bawah
        // Masih pakai cara lama: FINE_LOCATION
        else {
          const granted1 = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Izin Lokasi Diperlukan",
              message:
                "Android versi ini mewajibkan akses lokasi untuk mendeteksi sinyal WiFi alat.",
              buttonNeutral: "Nanti",
              buttonNegative: "Tolak",
              buttonPositive: "Izinkan",
            }
          );
          return granted1 === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn("Error requesting permission:", err);
        return false;
      }
    }
    return true; // iOS biasanya tidak butuh request runtime sekompleks Android
  };

  // --- 2. LOGIKA KONEKSI ---
  const connectToESP = async () => {
    setIsConnecting(true);

    // 1️⃣ Cek izin dulu
    const hasPermission = await requestConnectionPermissions();
    if (!hasPermission) {
      setIsConnecting(false);
      Alert.alert(
        "Izin Ditolak",
        "Mohon izinkan akses Lokasi/WiFi agar aplikasi bisa bekerja."
      );
      return;
    }

    try {
      // 2️⃣ DEBUG (boleh hapus nanti)
      console.log("WifiManager keys:", Object.keys(WifiManager));

      // 3️⃣ Paksa Android pakai WiFi (WAJIB Android 10+)
      await WifiManager.forceWifiUsage(true);

      // 4️⃣ Konek ke ESP32 (OPEN NETWORK)
      await WifiManager.connectToProtectedSSID(
        ESP_SSID, // "ESP32-Medic"
        "", // password kosong (open AP)
        false, // bukan WEP
        false // joinOnce (tidak disimpan permanen)
      );

      console.log("Berhasil konek ke ESP32!");

      // 5️⃣ Jeda biar DHCP stabil
      setTimeout(() => {
        setIsConnecting(false);
        setShowWebView(true);
      }, 2000);
    } catch (error) {
      setIsConnecting(false);

      console.log("Gagal konek:", error);

      Alert.alert(
        "Gagal Terhubung",
        "1. Pastikan alat menyala.\n" +
          "2. Pastikan WiFi & GPS aktif.\n" +
          "3. Jika muncul popup sistem, pilih 'Connect / Join'."
      );
    }
  };

  // --- 3. LOGIKA PUTUS KONEKSI (CLEANUP) ---
  const disconnectAndFinish = async () => {
    try {
      await WifiManager.disconnect();
      await WifiManager.forceWifiUsage(false);
    } catch (e) {
      console.log(e);
    } finally {
      setShowWebView(false);

      // delay kecil biar context aman
      setTimeout(() => {
        router.replace("/(tabs)/monitoring");
      }, 100);
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
        <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100 bg-white z-10">
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
          <RouterIcon size={48} color="#0ea5e9" />
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
