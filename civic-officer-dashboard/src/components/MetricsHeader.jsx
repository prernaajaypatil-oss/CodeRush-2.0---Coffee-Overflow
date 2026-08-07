import React from 'react';

export default function MetricsHeader({ complaints = [] }) {
  const totalTickets = complaints.length;
  const criticalTickets = complaints.filter(c => c.priority === 'CRITICAL').length;
  const resolvedTickets = complaints.filter(c => c.status === 'Resolved').length;
  const mergedCount = complaints.reduce((acc, curr) => acc + (curr.duplicateCount || 1) - 1, 0);

  return (
    <header className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      {/* Branding */}
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-bold text-slate-800">Nagrik AI</h1>
        <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
          Officer Portal
        </span>
      </div>

      {/* Dynamic Metrics */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-slate-500">Total Issues: </span>
          <span className="font-semibold text-slate-800">{totalTickets}</span>
        </div>
        <div className="px-3 py-1.5 bg-red-50 rounded-lg border border-red-100">
          <span className="text-red-600 font-medium">Critical: </span>
          <span className="font-bold text-red-700">{criticalTickets}</span>
        </div>
        <div className="px-3 py-1.5 bg-green-50 rounded-lg border border-green-100">
          <span className="text-green-600 font-medium">Resolved: </span>
          <span className="font-bold text-green-700">{resolvedTickets}</span>
        </div>
        <div className="px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-100">
          <span className="text-purple-600 font-medium">Duplicates Merged: </span>
          <span className="font-bold text-purple-700">+{mergedCount}</span>
        </div>
      </div>
    </header>
  );
}