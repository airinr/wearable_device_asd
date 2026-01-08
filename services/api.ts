// services/api.ts

// Kita definisikan tipe data di sini agar bisa dipakai di file lain
export interface SensorData {
  bpm: number;
  temp: number;
  status: string;
  battery?: number;
}

const API_URL = "https://backend.rutherweb.my.id/sensor/latest";

export const getSensorData = async (): Promise<SensorData> => {
  try {
    // Tambahkan timestamp agar tidak di-cache
    const response = await fetch(`${API_URL}?t=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    // Mapping data JSON ke format interface kita
    return {
      bpm: Number(json.bpm),
      temp: Number(json.temp),
      status: json.status,
    };
  } catch (error) {
    console.error("API Error:", error);
    throw error; // Lempar error agar bisa ditangkap di Hook/UI
  }
};
