import { getHistoryEntries } from '@/lib/services/history-store';

export default async function HistoryPage() {
  const history = await getHistoryEntries();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Recommendation History</h1>
      {history.length === 0 ? (
        <p>No history found.</p>
      ) : (
        <div className="space-y-8">
          {history.map((entry, idx) => (
            <div key={idx} className="border rounded p-4 bg-white shadow">
              <div className="mb-2 text-sm text-gray-500">{new Date(entry.timestamp).toLocaleString()}</div>
              <div className="mb-2"><b>Symptoms:</b> {entry.symptoms}</div>
              <table className="w-full border mt-2">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Dose</th>
                    <th className="border px-2 py-1">Quantity</th>
                    <th className="border px-2 py-1">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.medicines.map((med, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{med.name}</td>
                      <td className="border px-2 py-1">{med.dose}</td>
                      <td className="border px-2 py-1">{med.quantity}</td>
                      <td className="border px-2 py-1">{med.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 