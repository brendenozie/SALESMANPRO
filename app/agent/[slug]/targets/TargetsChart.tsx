"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TargetsChart({ targets }: { targets: any[] }) {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (!targets || !targets.length) return;

    const labels = targets.map((t) => t.product.name);
    const targetValues = targets.map((t) => t.targetValue);
    const achievedValues = targets.map((t) => t.achievedValue);

    setChartData({
      labels,
      datasets: [
        {
          label: "Target Value",
          data: targetValues,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Achieved Value",
          data: achievedValues,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    });
  }, [targets]);

  if (!targets || targets.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-500">
        No target data available.
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex justify-center items-center h-48">
        <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Chart Section */}
      <div style={{ width: "80%", margin: "20px auto" }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Targets vs. Achieved by Product" },
            },
          }}
        />
      </div>

      {/* Targets List Section */}
      <div style={{ width: "80%", margin: "20px auto" }}>
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">Target Details</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {targets.map((target) => (
            <div
              key={target.id}
              className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {target.salesAgent.name}
              </h2>
              <p className="text-gray-600 text-sm mb-4">{target.product.name}</p>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Target: {target.targetValue}</span>
                  <span>Achieved: {target.achievedValue}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      target.achievedValue / target.targetValue >= 1
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        (target.achievedValue / target.targetValue) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <span>Status:</span>
                {target.status === "Achieved" ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>
              <p className="text-sm text-gray-500">
                Start: {new Date(target.startDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                End: {new Date(target.endDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
