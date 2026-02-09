// components/MemberLookup.tsx
"use client";
import { useEffect, useState } from "react";
import { checkMemberStatus } from "@/app/actions/debtActions";

export default function MemberLookup() {
  const [accion, setAccion] = useState("");
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    data?: { name: string; totalDebt: number; debtCount: number; details: unknown[] };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [bcvRate, setBcvRate] = useState(0);

  const handleSearch = async () => {
    setLoading(true);
    const res = await checkMemberStatus(Number(accion));
    setResult(res);
    setLoading(false);
  };

  useEffect(() => {
  fetch('/api/bcv')
    .then(res => res.json())
    .then(data => setBcvRate(data.rate));
}, []);


  return (
    <div className="p-4 max-w-md mx-auto">
      <input 
        type="number" 
        placeholder="Número de Acción (e.g. 4502)"
        className="w-full p-4 mb-4 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-lg"
        value={accion}
        onChange={(e) => setAccion(e.target.value)}
      />
      <button 
        onClick={handleSearch}
        className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold"
        disabled={loading}
      >
        {loading ? "Checking..." : "Verify Member"}
      </button>

      {result?.data && (
        <div className={`mt-6 p-6 rounded-xl border-4 ${result.data.totalDebt > 0 ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
          <h2 className="text-2xl font-bold">{result.data.name}</h2>
          <p className="text-xl">
            Status: {result.data.totalDebt > 0 ? '🔴 DEBT PENDING' : '🟢 CLEAR'}
          </p>
          {result.data.totalDebt > 0 && (
            <div className="mt-2 text-red-700">
              <p className="font-bold text-3xl">${result.data.totalDebt.toFixed(2)}</p>
              <p>Owed across {result.data.debtCount} location(s)</p>
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">Equivalent in Bolívares (BCV):</p>
            <p className="text-2xl font-black text-blue-900">
               Bs. {(result.data.totalDebt * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </p>
         </div>

          
        </div>
      )}
    </div>
  );
}