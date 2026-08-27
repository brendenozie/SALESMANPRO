"use client"; 
import { ApexOptions } from "apexcharts";
import React, { useState } from "react";
import dynamic from "next/dynamic";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

const options: ApexOptions = {
  colors: ["#3C50E0", "#80CAEE", "#FFA70B"],
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "bar",
    height: 350,
    stacked: true,
    toolbar: {
      show: true,
    },
    zoom: {
      enabled: false,
    },
    background: "transparent",
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        plotOptions: {
          bar: {
            borderRadius: 5,
            columnWidth: "35%",
          },
        },
        legend: {
          fontSize: "12px",
        },
      },
    },
  ],
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 10,
      columnWidth: "30%",
      borderRadiusApplication: "end",
      borderRadiusWhenStacked: "last",
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      style: {
        colors: "#6B7280",
        fontSize: "12px",
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: "#6B7280",
        fontSize: "12px",
      },
    },
  },
  grid: {
    strokeDashArray: 5,
    borderColor: "#E5E7EB",
  },
  legend: {
    position: "top",
    horizontalAlign: "center",
    fontFamily: "Satoshi",
    fontWeight: 500,
    fontSize: "14px",
    markers: {
      size: 12,
    },
    itemMargin: {
      horizontal: 10,
      vertical: 5,
    },
  },
  fill: {
    opacity: 0.9,
    colors: ["#3C50E0", "#80CAEE", "#FFA70B"],
  },
  tooltip: {
    theme: "light",
    style: {
      fontSize: "12px",
      fontFamily: "Satoshi",
    },
  },
};

interface ChartTwoState {
  series: {
    name: string;
    data: number[];
  }[];
}

const ChartTwo: React.FC = () => {
  const [state, setState] = useState<ChartTwoState>({
    series: [
      {
        name: "Revenue",
        data: [42000, 55000, 61000, 75000, 82000, 90000, 100000],
      },
      {
        name: "Expenses",
        data: [30000, 40000, 45000, 48000, 50000, 52000, 54000],
      },
      {
        name: "Profit",
        data: [12000, 15000, 16000, 27000, 32000, 38000, 46000],
      },
    ],
  });

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 p-8 rounded-xl shadow-xl">
      <h4 className="text-2xl font-bold text-gray-900 mb-6">Monthly Financial Overview</h4>
      <div className="relative">
        <ApexCharts options={options} series={state.series} type="bar" height={400} />
      </div>
    </div>
  );
};

export default ChartTwo;
