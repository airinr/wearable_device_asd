// hooks/useMonitoring.ts
import { useCallback, useEffect, useState } from "react";
import { getSensorData, SensorData } from "../services/api"; // Import dari file services

export function useMonitoring() {
  const [data, setData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi fetch data yang dibungkus useCallback
  const fetchData = useCallback(async () => {
    try {
      const result = await getSensorData();
      setData(result);
      setError(null);
    } catch (err) {
      setError("Gagal terhubung ke sensor");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect untuk Auto Refresh interval 2 detik
  useEffect(() => {
    fetchData(); // Panggil pertama kali
    const interval = setInterval(fetchData, 2000); // Ulangi tiap 2 detik

    return () => clearInterval(interval); // Bersihkan timer saat layar ditutup
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
