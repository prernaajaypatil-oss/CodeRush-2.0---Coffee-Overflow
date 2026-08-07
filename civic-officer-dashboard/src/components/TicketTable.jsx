import React from 'react';

export default function TicketTable({ complaints = [] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-sm font-bold text-gray-700">Active Grievances</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.length > 0 ? (
              complaints.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">#{item.id || index + 1}</td>
                  <td className="p-3 text-slate-600">{item.category || 'General'}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      {item.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-slate-400">
                  No grievances found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}