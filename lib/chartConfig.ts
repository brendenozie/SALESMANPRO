// app/lib/chartConfig.ts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// ✨ Register Chart.js components once globally
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// You can export ChartJS if needed elsewhere, but the main purpose is the side effect of registration
export { ChartJS };
