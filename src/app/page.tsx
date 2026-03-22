"use client";
import { useState } from "react";

export default function LegalContractPage() {
  const [contractType, setContractType] = useState("NDA");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, type: "legal-contract", contractType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">⚖️ AI Legal Contract Generator</h1>
          <p className="text-gray-600 text-lg">Generate professional contracts from structured inputs</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contract Type</label>
            <select
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="NDA">NDA (Non-Disclosure Agreement)</option>
              <option value="MSA">MSA (Master Service Agreement)</option>
              <option value="SOW">SOW (Statement of Work)</option>
              <option value="Employment">Employment Agreement</option>
              <option value="Consulting">Consulting Agreement</option>
              <option value="Partnership">Partnership Agreement</option>
            </select>
          </div>

          <label className="block text-sm font-semibold text-gray-700 mb-2">Contract Details</label>
          <textarea
            className="w-full border border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            rows={10}
            placeholder={`Enter details for your ${contractType}:\n\n- Party A (Full legal name, address):\n- Party B (Full legal name, address):\n- Effective date:\n- Key terms / special conditions:\n- Scope of work or obligation:\n- Duration / term:\n- Any specific clauses needed:`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="mt-4 w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "🔄 Drafting Contract..." : "📝 Generate Contract"}
          </button>
          {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
        </div>

        {result && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">✅ Draft Contract</h2>
            <pre className="bg-gray-50 rounded-xl p-4 text-sm overflow-x-auto whitespace-pre-wrap text-gray-800">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
