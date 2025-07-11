"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PatientHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.id;
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    const fetchHistory = async () => {
      setLoading(true);
      const res = await fetch(`/api/patients/${patientId}/history`);
      const data = await res.json();
      setHistory(data.history || []);
      setLoading(false);
    };
    fetchHistory();
  }, [patientId]);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button onClick={() => router.back()} className="mb-4">Back</Button>
      <h2 className="text-2xl font-bold mb-4">Recommendation History</h2>
      {loading ? (
        <div>Loading...</div>
      ) : history.length === 0 ? (
        <div>No history found.</div>
      ) : (
        <ul className="space-y-4">
          {history.map((rec) => (
            <li key={rec.id} className="p-3 bg-muted rounded">
              <div><b>Date:</b> {rec.createdAt ? new Date(rec.createdAt * 1000).toLocaleString() : '—'}</div>
              <div><b>Symptoms:</b> {rec.symptoms || '—'}</div>
              <div><b>Severity:</b> {rec.severity || '—'}</div>
              <div>
                <b>Recommended Medicines:</b>
                <ul>
                  {rec.recommendedMedicines && Array.isArray(JSON.parse(rec.recommendedMedicines)) ?
                    JSON.parse(rec.recommendedMedicines).map((med: any, idx: number) => (
                      <li key={idx}>{typeof med === 'string' ? med : med.name}</li>
                    )) : <li>—</li>}
                </ul>
              </div>
              {rec.doctorId && <div><b>Doctor:</b> {rec.doctorId}</div>}
              {rec.verified && rec.doctorName && (
                <div><b>Verified by Dr. {rec.doctorName}</b></div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 