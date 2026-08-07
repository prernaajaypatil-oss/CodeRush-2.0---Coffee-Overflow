import React, { useState, useEffect } from 'react';
import AnalyticsSection from './components/AnalyticsSection';
import OfficerMap from './components/OfficerMap';
import TicketTable from './components/TicketTable';

// --- MULTILINGUAL DICTIONARY ---
const translations = {
  en: {
    title: 'Lodge a Public Grievance',
    subtitle: 'Unified Municipal Grievance Redressal Portal',
    categoryLabel: 'Select Department / Issue Type',
    descLabel: 'Grievance Description',
    descPlaceholder: 'Provide specific details regarding the issue or use voice input...',
    locationLabel: 'Incident Address / Location',
    detectLocation: 'Detect GPS Location',
    photoLabel: 'Attach Photographic Evidence',
    submitBtn: 'Submit Official Grievance',
    listening: 'Listening... Speak clearly',
    micBtn: 'Voice Input',
    aiDetected: 'Assigned Response Priority',
  },
  hi: {
    title: 'जन शिकायत दर्ज करें',
    subtitle: 'एकीकृत नगर निगम शिकायत निवारण पोर्टल',
    categoryLabel: 'विभाग / शिकायत का प्रकार चुनें',
    descLabel: 'शिकायत का विवरण',
    descPlaceholder: 'समस्या का विस्तृत विवरण दें या वॉयस इनपुट का उपयोग करें...',
    locationLabel: 'घटना स्थल का पता',
    detectLocation: 'GPS स्थान खोजें',
    photoLabel: 'फ़ोटो साक्ष्य संलग्न करें',
    submitBtn: 'शिकायत सबमिट करें',
    listening: 'सुन रहा है... अब बोलें',
    micBtn: 'आवाज इनपुट',
    aiDetected: 'निर्धारित प्राथमिकता',
  },
  mr: {
    title: 'सार्वजनिक तक्रार नोंदवा',
    subtitle: 'एकात्मिक महानगरपालिका तक्रार निवारण पोर्टल',
    categoryLabel: 'विभाग / तक्रारीचा प्रकार निवडा',
    descLabel: 'तक्रारीचा तपशील',
    descPlaceholder: 'समस्येचे सविस्तर वर्णन करा किंवा व्हॉइस इनपुट वापरा...',
    locationLabel: 'घटनास्थळाचा पत्ता',
    detectLocation: 'GPS स्थान मिळवा',
    photoLabel: 'फोटो पुरावा जोडा',
    submitBtn: 'तक्रार सबमिट करा',
    listening: 'ऐकत आहे... बोला',
    micBtn: 'व्हॉइस इनपुट',
    aiDetected: 'नियुक्त प्राधान्य',
  },
};

// --- CITIZEN PORTAL COMPONENT ---
function InlineCitizenPortal({ onComplaintSubmitted }) {
  const [lang, setLang] = useState('en');
  const [category, setCategory] = useState('Road Damage');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [aiPriority, setAiPriority] = useState('Standard');
  const [slaHours, setSlaHours] = useState('48 Hours');

  const t = translations[lang];

  useEffect(() => {
    const text = description.toLowerCase();
    if (
      text.includes('fire') ||
      text.includes('spark') ||
      text.includes('danger') ||
      text.includes('wire') ||
      text.includes('आग') ||
      text.includes('धोका')
    ) {
      setAiPriority('Emergency');
      setSlaHours('4 Hours');
    } else if (
      text.includes('overflow') ||
      text.includes('water') ||
      text.includes('pothole') ||
      text.includes('sewage') ||
      text.includes('पानी') ||
      text.includes('खड्डा')
    ) {
      setAiPriority('High');
      setSlaHours('24 Hours');
    } else {
      setAiPriority('Standard');
      setSlaHours('48 Hours');
    }
  }, [description]);

  // --- REVERSE GEOCODING (GPS TO STREET ADDRESS) ---
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocation('Fetching exact street address from GIS...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.display_name) {
            setLocation(data.display_name);
          } else {
            setLocation(`Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`);
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          setLocation(`Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        alert('Unable to retrieve GPS coordinates. Please ensure location services are enabled.');
        setIsLocating(false);
        setLocation('');
      }
    );
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newId = String(Math.floor(100000 + Math.random() * 900000));
    if (onComplaintSubmitted) {
      onComplaintSubmitted({
        id: newId,
        category,
        description,
        location: location || 'Ward 12, Main Central Market, City Zone 3',
        photo,
        priority: aiPriority,
        officerPriorityOverride: null,
        sla: slaHours,
        status: 'Under Assessment',
        upvotes: 1,
        timestamp: new Date().toLocaleTimeString(),
        rating: null,
      });
    }
    setDescription('');
    setLocation('');
    setPhoto(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-300 shadow-md max-w-3xl mx-auto my-6 overflow-hidden">
      {/* Official Form Header */}
      <div className="bg-slate-800 text-white p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-amber-500">
        <div>
          <h2 className="text-xl font-bold tracking-wide">{t.title}</h2>
          <p className="text-xs text-slate-300">{t.subtitle}</p>
        </div>
        <div className="flex gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-700">
          {['en', 'hi', 'mr'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={`px-3 py-1 text-xs font-semibold rounded transition ${
                lang === code ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              {code === 'en' ? 'English' : code === 'hi' ? 'हिंदी' : 'मराठी'}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{t.categoryLabel}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-800 outline-none"
            >
              <option value="Road Damage">Road & Pothole Maintenance</option>
              <option value="Water Supply">Water Supply & Leakage</option>
              <option value="Sanitation">Solid Waste & Sanitation</option>
              <option value="Streetlights">Street Lighting Infrastructure</option>
              <option value="Electrical Hazard">Electrical Infrastructure & Safety</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{t.aiDetected}</label>
            <div
              className={`p-2.5 rounded-lg text-xs font-bold text-center border flex justify-between items-center ${
                aiPriority === 'Emergency'
                  ? 'bg-red-50 text-red-800 border-red-300'
                  : aiPriority === 'High'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              <span className="font-semibold">Expected Resolution Time:</span>
              <span className="uppercase tracking-wider px-2 py-0.5 rounded bg-white border font-bold">{aiPriority} ({slaHours})</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t.descLabel}</label>
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`text-xs px-3 py-1 rounded font-semibold flex items-center gap-1 border transition ${
                isListening ? 'bg-red-600 text-white border-red-700 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              🎤 {isListening ? t.listening : t.micBtn}
            </button>
          </div>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descPlaceholder}
            required
            className="w-full border border-slate-300 p-3 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-800 outline-none"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{t.locationLabel}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Locating via GIS or type full street address..."
              className="flex-grow border border-slate-300 p-2.5 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-800 outline-none"
            />
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg font-semibold transition flex items-center whitespace-nowrap disabled:opacity-50"
            >
              📍 {isLocating ? 'Resolving Address...' : t.detectLocation}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">{t.photoLabel}</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer border rounded-lg p-1 bg-slate-50"
          />
          {photo && (
            <div className="mt-3 relative w-28 h-28 border rounded-lg overflow-hidden shadow-inner">
              <img src={photo} alt="Attached Evidence" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg text-sm shadow-md transition uppercase tracking-wider"
        >
          {t.submitBtn}
        </button>
      </form>
    </div>
  );
}

// --- OFFICIAL TICKET TRACKER COMPONENT ---
function InlineTicketTracker({ complaints = [], onUpvote }) {
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
    <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-md max-w-3xl mx-auto my-6">
      <div className="border-b border-slate-200 pb-3 mb-4">
        <h3 className="text-lg font-bold text-slate-900">Track Grievance Application Status</h3>
        <p className="text-xs text-slate-500">Enter your 6-digit Grievance Reference Number (GRN)</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="e.g. 101248, 101249"
          required
          className="flex-grow border border-slate-300 p-3 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-800 outline-none"
        />
        <button
          type="submit"
          className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-lg text-sm transition uppercase tracking-wider"
        >
          Search Record
        </button>
      </form>

      {searched && ticket && (
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-300 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">GRN #{ticket.id}</span>
            <span
              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                ticket.status === 'Resolved'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : ticket.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {ticket.status}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">{ticket.category}</h4>
            <p className="text-xs text-slate-600 mt-1">📍 <strong>Location:</strong> {ticket.location}</p>
            <p className="text-xs text-slate-600 mt-2 bg-white p-3 rounded border border-slate-200 font-mono">
              "{ticket.description}"
            </p>
          </div>

          <div className="p-3 bg-white rounded border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Department SLA:</span>
              <span className="font-semibold text-slate-800">{ticket.sla || '48 Hours'}</span>
            </div>
            {ticket.assignedOfficer && (
              <div className="flex justify-between">
                <span className="text-slate-500">Designated Inspecting Officer:</span>
                <span className="font-bold text-slate-900">{ticket.assignedOfficer}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center bg-slate-100 p-3 rounded border border-slate-200">
            <span className="text-xs font-semibold text-slate-700">
              👥 Supported by {ticket.upvotes || 1} local residents
            </span>
            <button
              onClick={() => onUpvote(ticket.id)}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded transition"
            >
              + Support Grievance
            </button>
          </div>
        </div>
      )}

      {searched && !ticket && (
        <p className="text-center text-xs text-red-600 font-bold mt-4 p-3 bg-red-50 border border-red-200 rounded">
          ❌ No official record found matching Reference Number "{searchId}". Please verify the number.
        </p>
      )}
    </div>
  );
}

// --- MUNICIPAL DUPLICATE CONSOLIDATION PANEL ---
function ConsolidationPanel({ complaints, onApproveMerge, onRejectMerge }) {
  const duplicateMap = {};
  complaints.forEach((c) => {
    const key = `${c.category}-${c.location}`;
    if (!duplicateMap[key]) duplicateMap[key] = [];
    duplicateMap[key].push(c);
  });

  const suggestions = Object.values(duplicateMap).filter((group) => group.length > 1);

  return (
    <div className="bg-slate-800 text-white p-5 rounded-xl shadow-md mb-6 border-l-4 border-amber-500">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
            📂 Automated Case Grouping & Duplicate Consolidation
          </h3>
          <p className="text-xs text-slate-300">
            System identified matching public reports for identical locations. Inspect before consolidation.
          </p>
        </div>
        <span className="bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded">
          {suggestions.length} Consolidation Groups
        </span>
      </div>

      {suggestions.length === 0 ? (
        <div className="bg-slate-900 p-3 rounded text-center text-xs text-slate-400">
          ✅ No duplicate cases detected across current active records.
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((group, idx) => (
            <div key={idx} className="bg-slate-900 p-4 rounded border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">
                  Consolidation Proposal ({group.length} Linked Complaints)
                </span>
                <span className="text-xs text-slate-200">
                  Category: <strong>{group[0].category}</strong> | Location: <strong>{group[0].location}</strong>
                </span>
                <div className="text-[11px] text-slate-400 mt-1">
                  Reference Numbers: {group.map((g) => `#${g.id}`).join(', ')}
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => onApproveMerge(group)}
                  className="flex-1 md:flex-none bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded transition"
                >
                  Confirm Consolidation
                </button>
                <button
                  onClick={() => onRejectMerge(group)}
                  className="flex-1 md:flex-none bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold px-3 py-2 rounded transition"
                >
                  Keep Separate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- OFFICER ACTION MODAL ---
function OfficerActionModal({ ticket, onClose, onUpdateTicket }) {
  const [status, setStatus] = useState(ticket.status);
  const [priorityOverride, setPriorityOverride] = useState(ticket.officerPriorityOverride || ticket.priority);
  const [officerNotes, setOfficerNotes] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState(ticket.assignedOfficer || 'Inspector R. K. Sharma');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateTicket(ticket.id, {
      status,
      officerPriorityOverride: priorityOverride,
      officerNotes,
      assignedOfficer,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl border border-slate-300">
        <div className="border-b pb-3 mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            Official Case File Verification — GRN #{ticket.id}
          </h3>
          <p className="text-xs text-slate-500">Municipal Officer Inspection & Status Dispatch</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Designated Inspecting Officer</label>
            <input
              type="text"
              value={assignedOfficer}
              onChange={(e) => setAssignedOfficer(e.target.value)}
              className="w-full border p-2.5 rounded bg-slate-50 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border p-2.5 rounded bg-slate-50 font-semibold"
              >
                <option value="Under Assessment">Under Assessment</option>
                <option value="In Progress">In Progress (Field Crew Dispatched)</option>
                <option value="Resolved">Resolved (Work Certified)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Priority Override</label>
              <select
                value={priorityOverride}
                onChange={(e) => setPriorityOverride(e.target.value)}
                className="w-full border p-2.5 rounded bg-slate-50 font-semibold"
              >
                <option value="Emergency">Emergency</option>
                <option value="High">High</option>
                <option value="Standard">Standard</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Inspection & Audit Notes</label>
            <textarea
              rows="3"
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              placeholder="Enter field inspection notes or resolution verification comments..."
              className="w-full border p-2.5 rounded bg-slate-50"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-200 text-slate-700 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-emerald-700 text-white font-bold hover:bg-emerald-800"
            >
              Sign-Off & Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- MASTER APPLICATION ---
export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [selectedTicketForAction, setSelectedTicketForAction] = useState(null);

  const [complaints, setComplaints] = useState([
    {
      id: '101248',
      category: 'Road & Pothole Maintenance',
      description: 'Severe road surface damage causing traffic congestion near main intersection.',
      status: 'Under Assessment',
      priority: 'High',
      officerPriorityOverride: null,
      sla: '24 Hours',
      location: 'Ward 12 Main Road, MG Avenue, Zone 3',
      upvotes: 14,
      assignedOfficer: 'Inspector R. K. Sharma',
    },
    {
      id: '101249',
      category: 'Road & Pothole Maintenance',
      description: 'Deep road cavity causing vehicle rim damage on Ward 12 Main Road.',
      status: 'Under Assessment',
      priority: 'High',
      officerPriorityOverride: null,
      sla: '24 Hours',
      location: 'Ward 12 Main Road, MG Avenue, Zone 3',
      upvotes: 5,
      assignedOfficer: 'Unassigned',
    },
    {
      id: '101250',
      category: 'Water Supply & Leakage',
      description: 'Major underground pipeline leak causing water logging in Sector 4.',
      status: 'Resolved',
      priority: 'Standard',
      officerPriorityOverride: 'Standard',
      sla: '48 Hours',
      location: 'Sector 4 Main Road, Green Park Area',
      upvotes: 8,
      assignedOfficer: 'Inspector V. P. Patil',
    },
  ]);

  const handleComplaintSubmitted = (newComplaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    alert(`Grievance Successfully Lodged. Reference Number: GRN #${newComplaint.id}`);
    setActiveTab('tracker');
  };

  const handleUpvote = (id) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, upvotes: (c.upvotes || 1) + 1 } : c))
    );
  };

  const handleApproveMerge = (group) => {
    const masterId = group[0].id;
    const totalUpvotes = group.reduce((sum, g) => sum + (g.upvotes || 1), 0);
    const mergedIds = group.map((g) => g.id).join(' & ');

    const updated = complaints.filter((c) => !group.some((g) => g.id === c.id));
    const masterCase = {
      ...group[0],
      id: `MASTER-${masterId}`,
      description: `[CONSOLIDATED CASE - GRNs ${mergedIds}]: ${group[0].description}`,
      upvotes: totalUpvotes,
      priority: 'Emergency',
      officerPriorityOverride: 'Emergency',
    };

    setComplaints([masterCase, ...updated]);
    alert(`Successfully consolidated records (${mergedIds}) under Master Case GRN #MASTER-${masterId}`);
  };

  const handleRejectMerge = (group) => {
    alert(`Case consolidation declined. Individual records will remain separate.`);
  };

  const handleUpdateTicket = (ticketId, updatedFields) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === ticketId ? { ...c, ...updatedFields } : c))
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Official Government Banner */}
      <div className="bg-slate-950 text-slate-300 text-[11px] px-6 py-1.5 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-bold text-amber-500">GOVERNMENT OF INDIA</span>
          <span>|</span>
          <span>MINISTRY OF HOUSING AND URBAN AFFAIRS</span>
        </div>
        <div className="flex gap-4">
          <a href="#accessibility" className="hover:underline">Accessibility Options</a>
          <a href="#sitemap" className="hover:underline">Sitemap</a>
        </div>
      </div>

      {/* Main Government Header */}
      <header className="bg-slate-900 text-white shadow-md border-b-4 border-amber-500 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="bg-amber-500 text-slate-950 font-black px-3 py-1.5 rounded text-xl shadow">N</div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">Nagrik<span className="text-amber-500">AI</span></span>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">National Public Grievance Portal</p>
            </div>
          </div>

          <nav className="flex flex-wrap justify-center gap-1 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
            {[
              { id: 'landing', label: 'Home' },
              { id: 'citizen', label: 'Lodge Grievance' },
              { id: 'tracker', label: 'Track Application' },
              { id: 'officer', label: 'Department Portal' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === tab.id ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Ticker Banner */}
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-6 py-1.5 text-xs flex items-center gap-2 font-medium">
        <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Notice</span>
        <span>All civic grievances lodged through NagrikAI are mapped directly with designated ward officers for time-bound resolution.</span>
      </div>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6">
        {activeTab === 'landing' && (
          <div className="py-10">
            {/* Hero Section */}
            <div className="bg-white border border-slate-300 rounded-xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-sm">
              <span className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded border border-slate-300 uppercase tracking-wider">
                Official Redressal System
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-4">
                Unified Municipal Grievance Redressal
              </h1>
              <p className="text-slate-600 text-sm md:text-base mb-8 max-w-2xl mx-auto leading-relaxed">
                NagrikAI enables citizens to report public infrastructure issues directly to municipal departments with automatic GIS address mapping and SLA-based resolution tracking.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setActiveTab('citizen')}
                  className="bg-emerald-700 text-white px-6 py-3 rounded font-bold hover:bg-emerald-800 shadow transition uppercase text-xs tracking-wider"
                >
                  Lodge Grievance Now
                </button>
                <button
                  onClick={() => setActiveTab('tracker')}
                  className="bg-slate-800 text-white border px-6 py-3 rounded font-bold hover:bg-slate-900 transition uppercase text-xs tracking-wider"
                >
                  Track Existing GRN
                </button>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-6">
              <div className="bg-white p-5 rounded-xl border border-slate-300 text-center">
                <div className="text-2xl font-black text-slate-900">98.4%</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">SLA Compliance Rate</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-300 text-center">
                <div className="text-2xl font-black text-slate-900">&lt; 24 Hrs</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Avg Response Time</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-300 text-center">
                <div className="text-2xl font-black text-slate-900">100%</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Geotagged Verification</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'citizen' && (
          <InlineCitizenPortal onComplaintSubmitted={handleComplaintSubmitted} />
        )}

        {activeTab === 'tracker' && (
          <InlineTicketTracker complaints={complaints} onUpvote={handleUpvote} />
        )}

        {activeTab === 'officer' && (
          <div>
            <div className="mb-6 border-b border-slate-300 pb-3">
              <h2 className="text-2xl font-extrabold text-slate-900">Departmental Command Center</h2>
              <p className="text-xs text-slate-600">Official Municipal Portal for Inspection, Ward Verification, and Case Management</p>
            </div>

            <ConsolidationPanel
              complaints={complaints}
              onApproveMerge={handleApproveMerge}
              onRejectMerge={handleRejectMerge}
            />

            <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Pending Action Queue</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                      <th className="p-3">GRN</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Location Address</th>
                      <th className="p-3">SLA Priority</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">#{c.id}</td>
                        <td className="p-3 font-semibold text-slate-700">{c.category}</td>
                        <td className="p-3 font-medium text-slate-600 truncate max-w-xs">{c.location}</td>
                        <td className="p-3">
                          <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold text-[11px]">{c.priority}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-800">{c.status}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedTicketForAction(c)}
                            className="bg-slate-800 text-white px-3 py-1 rounded font-bold hover:bg-slate-900 transition"
                          >
                            Inspect & Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <AnalyticsSection complaints={complaints} />
            <OfficerMap complaints={complaints} />
            <TicketTable complaints={complaints} />
          </div>
        )}
      </main>

      {selectedTicketForAction && (
        <OfficerActionModal
          ticket={selectedTicketForAction}
          onClose={() => setSelectedTicketForAction(null)}
          onUpdateTicket={handleUpdateTicket}
        />
      )}

      {/* Official Government Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t-4 border-amber-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h4 className="text-white font-bold mb-2">NagrikAI Portal</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Official Grievance Redressal Mechanism designed to facilitate transparent municipal management and public infrastructure servicing.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-2">Helpdesk & Support</h4>
            <p className="text-slate-400 text-[11px]">Toll Free Civic Helpline: 1800-XXX-XXXX</p>
            <p className="text-slate-400 text-[11px]">Email: support@nagrik.gov.in</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-2">Legal & Policies</h4>
            <p className="text-slate-400 text-[11px]">Privacy Policy | Terms of Service | Hyperlinking Policy</p>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-4 text-center text-[11px] text-slate-500">
          © 2026 NagrikAI Municipal Governance Systems. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}