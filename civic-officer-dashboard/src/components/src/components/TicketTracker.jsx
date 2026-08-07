import React, { useState } from 'react';

export default function TicketTracker({ complaints = [] }) {
  const [searchId, setSearchId] = useState('');
  const [ticket, setTicket] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    const found = complaints.find((c) => String(c.id) === searchId.trim());
    setTicket(found || null);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md max-w-2xl mx-auto my-6">
      <h3 className="text-lg font-bold text-slate-900 mb-1">Track Grievance Status</h3>
      <p className="text-xs text-slate-500 mb-4">Enter your Ticket ID to view live resolution updates</p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="e.g. 101 or 102"
          required
          className="flex-grow border border-slate-300 p-3 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
        >
          Track
        </button>
      </form>

      {searched && ticket && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">TICKET #{ticket.id}</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {ticket.status}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-800">{ticket.category}</h4>
          <p className="text-xs text-slate-600">Location: {ticket.location || 'Central Ward'}</p>

          <div className="pt-3 border-t border-slate-200 grid grid-cols-3 text-center text-xs gap-2">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800 font-bold">1. Logged</div>
            <div className={`p-2 rounded-lg font-bold ${ticket.status !== 'Pending' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-500'}`}>
              2. Assigned
            </div>
            <div className={`p-2 rounded-lg font-bold ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
              3. Resolved
            </div>
          </div>
        </div>
      )}

      {searched && !ticket && (
        <p className="text-center text-xs text-red-500 font-semibold mt-2">
          ❌ No ticket found with ID "{searchId}". Try searching for 101 or 102.
        </p>
      )}
    </div>
  );
}