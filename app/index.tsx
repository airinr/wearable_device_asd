import { useRouter } from "expo-router";
import { Activity, Wifi } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-6">
      {/* Bagian Header / Judul */}
      <View className="items-center mb-10">
        <View className="bg-sky-100 p-6 rounded-full mb-4">
          <Activity size={48} color="#0ea5e9" />
        </View>
        <Text className="text-3xl font-bold text-slate-800 text-center">
          Wearable SIC
        </Text>
        <Text className="text-slate-500 text-center mt-2">
          Sistem Monitoring Kesehatan & Keamanan Anak
        </Text>
      </View>

      {/* Bagian Tombol Aksi */}
      <View className="space-y-4 gap-4">
        {/* Tombol 1: Masuk ke Dashboard Monitoring */}
        <TouchableOpacity
          onPress={() => router.push("/monitoring")}
          className="bg-sky-500 py-4 px-6 rounded-2xl flex-row items-center justify-center shadow-lg shadow-sky-200"
        >
          <Activity size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-3">
            Mulai Monitoring
          </Text>
        </TouchableOpacity>

        {/* Tombol 2: Masuk ke Setup WiFi */}
        <TouchableOpacity
          // PERBAIKAN: Saya ubah jadi "/wifiSetup" sesuai nama file di screenshot Anda
          onPress={() => router.push("/wifiSetup")}
          className="bg-white border border-slate-200 py-4 px-6 rounded-2xl flex-row items-center justify-center"
        >
          <Wifi size={24} color="#64748b" />
          <Text className="text-slate-700 font-bold text-lg ml-3">
            Setup WiFi Alat
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-slate-400 text-center mt-10 text-xs">
        v1.0.0 - Development Build
      </Text>
    </SafeAreaView>
  );
}
