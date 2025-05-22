"use client"; 
import { ApexOptions } from "apexcharts";
import React, { useState } from "react";
import dynamic from "next/dynamic";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

const options: ApexOptions = {
  chart: {
    type: "donut",
    animations: {
      enabled: true,
      easing: "easeinout",
      speed: 800,
    },
  },
  colors: ["#10B981", "#375E83", "#259AE6", "#FFA70B"],
  labels: ["Product A", "Product B", "Product C", "Product D"],
  legend: {
    show: true,
    position: "bottom",
    horizontalAlign: "center",
    fontSize: "14px",
    labels: {
      colors: "#6B7280",
    },
    itemMargin: {
      horizontal: 10,
      vertical: 5,
    },
    onItemClick: {
      toggleDataSeries: true,
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: "18px",
            color: "#6B7280",
          },
          value: {
            show: true,
            fontSize: "16px",
            color: "#6B7280",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          width: "100%",
        },
        legend: {
          fontSize: "12px",
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 250,
        },
        legend: {
          position: "bottom",
        },
      },
    },
  ],
};

interface ChartThreeState {
  series: number[];
}

const ChartThree: React.FC = () => {
  const [state, setState] = useState<ChartThreeState>({
    series: [45, 30, 15, 10],
  });

  const handleLegendClick = (index: number) => {
    const newSeries = [...state.series];
    newSeries[index] = newSeries[index] === 0 ? [45, 30, 15, 10][index] : 0;
    setState({ series: newSeries });
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 p-8 rounded-xl shadow-xl">
      <h4 className="text-2xl font-bold text-gray-900 mb-6">Top Selling Products</h4>
      <div className="relative mb-6">
        <ApexCharts options={options} series={state.series} type="donut" height={320} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {options.labels?.map((label, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-2 transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => handleLegendClick(index)}
          >
            <span
              className="h-4 w-4 rounded-full mb-2"
              style={{ backgroundColor: options.colors?.[index] }}
            ></span>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {state.series[index]}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartThree;
