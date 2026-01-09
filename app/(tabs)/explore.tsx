import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Aktifkan animasi Layout untuk Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 1. DATA FAQ (Disesuaikan dengan konteks AI)
const faqData = [
  {
    id: 1,
    question: "Apa arti status 'PANIK'?",
    answer:
      "Status ini muncul ketika Artificial Intelligence (AI) pada perangkat wearable mendeteksi pola fisik yang tidak wajar, seperti lonjakan detak jantung mendadak yang dikombinasikan dengan suhu atau gerakan tertentu, yang mengindikasikan anak sedang panik atau dalam bahaya.",
  },
  {
    id: 2,
    question: "Apakah anak perlu menekan tombol?",
    answer:
      "Tidak perlu. Sistem ini berjalan otomatis (Pasif Monitoring). Alat akan terus membaca sensor tubuh anak dan AI akan memprediksi kondisi tanpa anak harus melakukan apa-apa.",
  },
  {
    id: 3,
    question: "Seberapa akurat prediksi AI?",
    answer:
      "AI dilatih untuk mengenali pola umum kecemasan atau tantrum. Namun, tetap disarankan untuk memeriksa kondisi fisik anak secara langsung jika peringatan muncul untuk memastikan kebenarannya.",
  },
  {
    id: 4,
    question: "Mengapa data BPM/Suhu strip (--)?",
    answer:
      "Pastikan perangkat wearable anak terhubung ke internet. Jika perangkat mati atau sinyal hilang, data sensor tidak dapat dikirim ke server untuk dianalisis.",
  },
  {
    id: 5,
    question: "Bagaimana cara mematikan alarm?",
    answer:
      "Alarm di aplikasi akan berhenti otomatis ketika sensor tubuh anak kembali stabil (rileks) dan AI memutuskan bahwa kondisi sudah 'AMAN'.",
  },
];

export default function ExploreScreen() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Fungsi untuk Buka/Tutup Accordion dengan Animasi
  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedId === id) {
      setExpandedId(null); // Tutup jika diklik lagi
    } else {
      setExpandedId(id); // Buka yang baru
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="px-5 pt-6 pb-20">
        {/* Header Explore */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-slate-800">
            Pusat Bantuan
          </Text>
          <Text className="text-slate-500 mt-1">
            Temukan jawaban seputar penggunaan alat monitoring.
          </Text>
        </View>

        {/* Banner Kontak Support (Opsional) */}
        <View className="bg-sky-500 rounded-2xl p-5 mb-8 shadow-md flex-row items-center">
          <View className="bg-white/20 p-3 rounded-full mr-4">
            <MessageCircle color="white" size={24} />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">Butuh Bantuan?</Text>
            <Text className="text-sky-100 text-xs">
              Hubungi tim teknis kami jika alat bermasalah (081299997777).
            </Text>
          </View>
        </View>

        {/* Section FAQ */}
        <View className="flex-row items-center mb-4 gap-2">
          <HelpCircle size={20} color="#64748b" />
          <Text className="text-lg font-bold text-slate-700">
            Sering Ditanyakan
          </Text>
        </View>

        <View className="mb-24">
          {faqData.map((item) => {
            const isOpen = expandedId === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => toggleExpand(item.id)}
                className={`bg-white rounded-xl mb-3 border border-slate-100 shadow-sm overflow-hidden ${
                  isOpen ? "border-sky-200" : ""
                }`}
              >
                {/* Bagian Judul (Selalu Tampil) */}
                <View className="p-4 flex-row justify-between items-center">
                  <Text
                    className={`flex-1 font-semibold text-base ${
                      isOpen ? "text-sky-600" : "text-slate-700"
                    }`}
                  >
                    {item.question}
                  </Text>
                  {isOpen ? (
                    <ChevronUp size={20} color="#0ea5e9" />
                  ) : (
                    <ChevronDown size={20} color="#94a3b8" />
                  )}
                </View>

                {/* Bagian Jawaban (Muncul saat dibuka) */}
                {isOpen && (
                  <View className="px-4 pb-4">
                    <View className="h-[1px] bg-slate-100 w-full mb-3" />
                    <Text className="text-slate-500 leading-6 text-sm">
                      {item.answer}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
