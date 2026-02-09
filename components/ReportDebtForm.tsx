// components/ReportDebtForm.tsx
"use client";
import { useState } from "react";
import { reportDebt } from "@/app/actions/debtActions";

export default function ReportDebtForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      accionNumber: Number(formData.get("accion")),
      amountUsd: Number(formData.get("amount")),
      description: formData.get("description") as string,
    };

    const res = await reportDebt(data);
    setLoading(false);

    if (res.success) {
      alert("Debt registered successfully!");
      (e.target as HTMLFormElement).reset();
    } else {
      alert(res.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="text-lg font-bold mb-4">Report Unpaid Tab</h3>
      
      <label className="block mb-2 text-sm font-medium text-gray-900">Acción Number</label>
      <input
        name="accion"
        type="number"
        required
        className="w-full p-3 mb-4 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
      />

      <label className="block mb-2 text-sm font-medium text-gray-900">Amount (USD)</label>
      <input
        name="amount"
        type="number"
        step="0.01"
        required
        className="w-full p-3 mb-4 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
      />

      <label className="block mb-2 text-sm font-medium text-gray-900">Observation (Mesa / Consumo)</label>
      <textarea
        name="description"
        className="w-full p-3 mb-4 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
      />

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-red-600 text-white py-3 rounded font-bold hover:bg-red-700"
      >
        {loading ? "Saving..." : "Register Debt"}
      </button>
    </form>
  );
}