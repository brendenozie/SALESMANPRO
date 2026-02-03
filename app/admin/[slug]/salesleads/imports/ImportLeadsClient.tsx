"use client";

import { useState } from "react";

interface ImportLeadsClientProps {
  companyId: string;
}

export default function ImportLeadsClient({ companyId }: ImportLeadsClientProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return alert("Upload users.json");

    setLoading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("companyId", companyId);

    const res = await fetch("/api/admin/leads/import", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Import Users → Leads</h1>

      <input
        type="file"
        accept=".json"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-indigo-600 px-4 py-2 rounded"
      >
        {loading ? "Importing..." : "Import"}
      </button>

      {result && (
        <pre className="mt-4 bg-black p-3 rounded text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
