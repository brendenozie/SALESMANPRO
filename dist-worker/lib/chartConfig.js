"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartJS = void 0;
// app/lib/chartConfig.ts
const chart_js_1 = require("chart.js");
Object.defineProperty(exports, "ChartJS", { enumerable: true, get: function () { return chart_js_1.Chart; } });
// ✨ Register Chart.js components once globally
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.ArcElement);
