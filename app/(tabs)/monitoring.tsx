import {
  AlertTriangle,
  Heart,
  Move,
  RefreshCcw,
  ShieldCheck,
  Thermometer,
  Wifi,
} from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMonitoring } from "../../hooks/useMonitoring";

// --- 1. UPDATE INTERFACE SESUAI JSON BACKEND ANDA ---
interface SensorData {
  status: string;
  bpm: number;
  temp: number;
  score: number;
  ax: number;
  ay: number;
  az: number;
  timestamp: string;
  wifi: number;
}

export default function MonitoringScreen() {
  const { data, loading, error } = useMonitoring() as {
    data: SensorData | null;
    loading: boolean;
    error: any;
  };

  const isAlertShown = useRef(false);
  const isPanic = data?.status === "PANIK";

  // LOGIKA FEEDBACK UI (Alert & Vibrate)
  useEffect(() => {
    if (isPanic) {
      Vibration.vibrate([500, 500, 500], true);
      if (!isAlertShown.current) {
        isAlertShown.current = true;
        Alert.alert(
          "⚠️ PERINGATAN AI!",
          "Sistem mendeteksi tanda kecemasan pada anak. Segera cek kondisi!",
          [{ text: "MENGERTI", onPress: () => {} }]
        );
      }
    } else {
      Vibration.cancel();
      isAlertShown.current = false;
    }
    return () => Vibration.cancel();
  }, [isPanic]);

  const handleCall = () => {
    Linking.openURL(`tel:08123456789`);
  };

  // --- 2. LOGIKA PERHITUNGAN FRONTEND (DISEDERHANAKAN) ---

  const calculateMotion = () => {
    const x = data?.ax ?? 0;
    const y = data?.ay ?? 0;
    const z = data?.az ?? 0;

    // Rumus Magnitude
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const intensity = Math.abs(magnitude - 9.8);

    // --- LOGIKA BARU: HANYA 2 KONDISI ---
    // Angka 4.0 adalah sensitivitas.
    // Jika terlalu sensitif (sedikit gerak langsung "Banyak Bergerak"), naikkan jadi 5.0 atau 6.0
    // Jika kurang sensitif, turunkan jadi 3.0
    if (intensity > 4.0) {
      return "Banyak Bergerak";
    }

    return "Tenang"; // Kondisi default (sedang diam/duduk/jalan santai)
  };

  const motionStatus = calculateMotion();
  const isMovingALot = motionStatus === "Banyak Bergerak"; // Untuk helper warna

  // Data Dummy
  const rssi = data?.wifi ?? 0;

  // Warna Indikator
  const signalColor =
    rssi > -70 ? "#22c55e" : rssi > -85 ? "#eab308" : "#ef4444";
  const signalText = rssi > -70 ? "Kuat" : rssi > -85 ? "Sedang" : "Lemah";

  if (loading && !data) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="text-slate-400 mt-2">Menghubungkan...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${isPanic ? "bg-red-600" : "bg-slate-50"}`}
    >
      <ScrollView className="px-5 pt-6">
        {/* HEADER */}
        <View className="mb-6 flex-row justify-between items-center">
          <View>
            <Text
              className={`font-bold text-xl ${
                isPanic ? "text-red-100" : "text-slate-700"
              }`}
            >
              Sistem Monitoring
            </Text>
            <Text
              className={`text-xs ${
                isPanic ? "text-red-200" : "text-slate-400"
              }`}
            >
              Last Data: {data?.timestamp || "--:--:--"}
            </Text>
          </View>
        </View>

        {/* STATUS CARD UTAMA */}
        <View
          className={`rounded-3xl p-6 mb-6 items-center shadow-md ${
            isPanic ? "bg-white" : "bg-white border border-slate-200"
          }`}
        >
          {isPanic ? (
            <AlertTriangle
              size={64}
              color="#dc2626"
              className="mb-2 animate-bounce"
            />
          ) : (
            <ShieldCheck size={64} color="#16a34a" className="mb-2" />
          )}

          <Text
            className={`text-3xl font-black mt-2 text-center ${
              isPanic ? "text-red-600" : "text-green-600"
            }`}
          >
            {isPanic ? "PANIK TERDETEKSI" : "KONDISI AMAN"}
          </Text>

          <Text className="text-slate-400 text-center mt-1 px-2 mb-4">
            {isPanic
              ? "AI mendeteksi anomali pada sensor tubuh anak!"
              : "Semua sensor dalam batas normal."}
          </Text>
        </View>

        {error && (
          <View className="bg-orange-100 p-3 rounded-xl mb-4 flex-row items-center justify-center">
            <RefreshCcw color="#c2410c" size={18} />
            <Text className="text-orange-800 ml-2 font-medium">
              Koneksi terputus...
            </Text>
          </View>
        )}

        {/* --- KARTU AKTIVITAS FISIK (SIMPLIFIED) --- */}
        <View className="mb-4">
          <View
            className={`w-full bg-white p-4 rounded-2xl shadow-sm border-l-4 ${
              isMovingALot ? "border-orange-500" : "border-blue-500"
            }`}
          >
            <View className="flex-row items-center mb-2">
              <Move size={16} color={isMovingALot ? "#f97316" : "#3b82f6"} />
              <Text className="text-xs font-bold text-slate-500 ml-1 uppercase">
                Aktivitas Fisik
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text
                className={`text-lg font-bold leading-6 ${
                  isMovingALot ? "text-orange-600" : "text-slate-800"
                }`}
                numberOfLines={1}
              >
                {motionStatus}
              </Text>

              {/* Badge Status Kecil di kanan */}
              <View
                className={`${
                  isMovingALot ? "bg-orange-100" : "bg-blue-50"
                } px-3 py-1 rounded-full`}
              >
                <Text
                  className={`${
                    isMovingALot ? "text-orange-700" : "text-blue-600"
                  } text-[10px] font-bold tracking-wider`}
                >
                  {isMovingALot ? "AKTIF" : "STABIL"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* DATA SENSOR (BPM & SUHU) */}
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1 bg-white p-5 rounded-2xl shadow-sm">
            <View className="bg-rose-100 w-10 h-10 rounded-full items-center justify-center mb-3">
              <Heart size={20} color="#e11d48" fill="#e11d48" />
            </View>
            <Text className="text-slate-400 text-xs font-bold uppercase">
              Detak Jantung
            </Text>
            <Text className="text-3xl font-bold text-slate-800 mt-1">
              {data?.bpm ?? "--"}{" "}
              <Text className="text-sm font-normal text-slate-400">BPM</Text>
            </Text>
          </View>

          <View className="flex-1 bg-white p-5 rounded-2xl shadow-sm">
            <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mb-3">
              <Thermometer size={20} color="#0284c7" />
            </View>
            <Text className="text-slate-400 text-xs font-bold uppercase">
              Suhu Tubuh
            </Text>
            <Text className="text-3xl font-bold text-slate-800 mt-1">
              {data?.temp ?? "--"}{" "}
              <Text className="text-sm font-normal text-slate-400">°C</Text>
            </Text>
          </View>
        </View>

        {/* KONEKSI WIFI */}
        <View className="bg-white p-4 rounded-2xl shadow-sm mb-10 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="bg-slate-100 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Wifi size={18} color={signalColor} />
            </View>
            <View>
              <Text className="text-slate-800 font-bold text-sm">
                Sinyal {signalText}
              </Text>
              <Text className="text-slate-400 text-xs">RSSI: {rssi} dBm</Text>
            </View>
          </View>
          {/* Bar Sinyal */}
          <View className="flex-row items-end h-5 gap-1">
            <View
              className={`w-1 rounded-sm ${
                rssi > -90 ? "bg-slate-400 h-2" : "bg-slate-200 h-2"
              }`}
            />
            <View
              className={`w-1 rounded-sm ${
                rssi > -80 ? "bg-slate-500 h-3" : "bg-slate-200 h-3"
              }`}
            />
            <View
              className={`w-1 rounded-sm ${
                rssi > -70 ? "bg-slate-600 h-4" : "bg-slate-200 h-4"
              }`}
            />
            <View
              className={`w-1 rounded-sm ${
                rssi > -60 ? "bg-slate-800 h-5" : "bg-slate-200 h-5"
              }`}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
