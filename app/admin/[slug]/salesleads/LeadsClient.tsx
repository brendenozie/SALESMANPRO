"use client";

import { useState } from "react";

export default function LeadsClient({ initialLeads, companyId }: { initialLeads: any[]; companyId: string }) {
  const [leads, setLeads] = useState(initialLeads);

  const stages = ["cold", "replied", "interested", "negotiating", "paid"];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">WhatsApp Sales Pipeline</h1>

      <div className="grid grid-cols-5 gap-4">
        {stages.map((stage) => (
          <div key={stage} className="bg-gray-900 p-4 rounded">
            <h2 className="font-semibold mb-3 capitalize">{stage}</h2>

            {leads
              .filter((l) => l.stage === stage)
              .map((lead) => (
                <div
                  key={lead.id}
                  className="bg-gray-800 p-3 mb-3 rounded"
                >
                  <p className="font-bold">{lead.phone}</p>
                  <p className="text-sm text-gray-400">
                    {lead.businessType || "Unknown"}
                  </p>

                  <select
                    value={lead.stage}
                    onChange={async (e) => {
                      const stage = e.target.value;
                      await fetch(`/api/admin/leads/${lead.id}`, {
                        method: "PUT",
                        body: JSON.stringify({ stage }),
                      });
                    }}
                    className="mt-2 w-full bg-black p-1 rounded"
                  >
                    {stages.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
