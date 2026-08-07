import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AnalyticsSection({ complaints = [] }) {
  const categoryData = {
    labels: ['Road Damage', 'Water Supply', 'Sanitation', 'Streetlights'],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
        borderWidth: 1,
      },
    ],
  };

  const slaData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Avg. Resolution Speed (Hours)',
        data: [2.1, 6.4, 18.0, 36.0],
        backgroundColor: '#6366f1',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Complaints by Category</h3>
        <div className="h-56 flex justify-center items-center">
          <Doughnut data={categoryData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">SLA Resolution Speed (Hours)</h3>
        <div className="h-56">
          <Bar data={slaData} options={{ maintainAspectRatio: false, responsive: true }} />
        </div>
      </div>
    </div>
  );
}