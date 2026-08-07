import React, { useState, useEffect } from 'react';

// Multilingual Translations Object
const translations = {
  en: {
    title: 'File a Civic Grievance',
    subtitle: 'AI Smart Municipal Redressal System',
    categoryLabel: 'Issue Category',
    descLabel: 'Description',
    descPlaceholder: 'Describe the issue or click the mic to speak...',
    locationLabel: 'Incident Location',
    detectLocation: 'Detect My Location (GPS)',
    photoLabel: 'Upload Photo Proof',
    submitBtn: 'Submit Grievance to AI Portal',
    listening: 'Listening... Speak now',
    micBtn: 'Record Voice',
    aiDetected: 'AI Priority Detected',
  },
  hi: {
    title: 'नागरिक शिकायत दर्ज करें',
    subtitle: 'एआई स्मार्ट नगर निगम निवारण प्रणाली',
    categoryLabel: 'समस्या की श्रेणी',
    descLabel: 'विवरण',
    descPlaceholder: 'समस्या का विवरण दें या बोलने के लिए माइक पर क्लिक करें...',
    locationLabel: 'घटना का स्थान',
    detectLocation: 'मेरा स्थान खोजें (GPS)',
    photoLabel: 'फ़ोटो प्रमाण अपलोड करें',
    submitBtn: 'एआई पोर्टल पर शिकायत भेजें',
    listening: 'सुन रहा है... अब बोलें',
    micBtn: 'आवाज रिकॉर्ड करें',
    aiDetected: 'एआई प्राथमिकता का पता चला',
  },
  mr: {
    title: 'नागरिक तक्रार नोंदवा',
    subtitle: 'एआय स्मार्ट महानगरपालिका निवारण प्रणाली',
    categoryLabel: 'समस्येचा प्रकार',
    descLabel: 'तपशील',
    descPlaceholder: 'समस्येचे वर्णन करा किंवा बोलण्यासाठी मायक्रोफोन वापरा...',
    locationLabel: 'घटनेचे ठिकाण',
    detectLocation: 'माझे स्थान शोधा (GPS)',
    photoLabel: 'फोटो पुरावा अपलोड करा',
    submitBtn: 'एआय पोर्टलवर तक्रार सबमिट करा',
    listening: 'ऐकत आहे... आता बोला',
    micBtn: 'आवाज रेकॉर्ड करा',
    aiDetected: 'एआय प्राधान्य ओळखले गेले',
  },
};

export default function CitizenPortal({ onComplaintSubmitted }) {
  const [lang, setLang] = useState('en');
  const [category, setCategory] = useState('Road Damage');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [aiPriority, setAiPriority] = useState('Medium');

  const t = translations[lang];

  // AI Logic: Detect Priority & Auto-Category based on description keywords
  useEffect(() => {
    const text = description.toLowerCase();
    if (text.includes('fire') || text.includes('spark') || text.includes('danger') || text.includes('आग') || text.includes('धोका')) {
      setAiPriority('Critical');
    } else if (text.includes('overflow') || text.includes('water') || text.includes('pothole') || text.includes('पानी') || text.includes('खड्डा')) {
      setAiPriority('High');
    } else {
      setAiPriority('Medium');
    }
  }, [description]);

  // Handle GPS Geolocation
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)} (GPS Confirmed)`);
        },
        () => {
          alert('Unable to retrieve GPS coordinates. Please type location manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Handle Speech-to-Text Microphone Integration
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Google Chrome.');
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

  // Handle Photo File Pick
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onComplaintSubmitted) {
      onComplaintSubmitted({
        id: Date.now(),
        category,
        description,
        location: location || 'Auto-Detected City Center',
        photo,
        priority: aiPriority,
        status: 'Pending',
        timestamp: new Date().toLocaleTimeString(),
      });
    }
    // Reset Form
    setDescription('');
    setLocation('');
    setPhoto(null);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md max-w-2xl mx-auto my-4">
      {/* Language Selector Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t.title}</h2>
          <p className="text-xs text-slate-500">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          {['en', 'hi', 'mr'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={`px-3 py-1 text-xs font-bold rounded-lg uppercase transition ${
                lang === code ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {code === 'en' ? 'English' : code === 'hi' ? 'हिंदी' : 'मराठी'}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.categoryLabel}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-300 p-2.5 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Road Damage">🛣️ Road Damage / Pothole</option>
              <option value="Water Supply">💧 Water Supply Leakage</option>
              <option value="Sanitation">🧹 Sanitation / Garbage Dump</option>
              <option value="Streetlights">💡 Streetlight Failure</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.aiDetected}</label>
            <div className={`p-2.5 rounded-xl text-sm font-bold text-center border ${
              aiPriority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
              aiPriority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              ⚡ {aiPriority} Priority
            </div>
          </div>
        </div>

        {/* Description + Voice Recognition */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-700">{t.descLabel}</label>
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`text-xs px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              🎙️ {isListening ? t.listening : t.micBtn}
            </button>
          </div>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descPlaceholder}
            required
            className="w-full border border-slate-300 p-3 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          ></textarea>
        </div>

        {/* Location Detection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t.locationLabel}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Near Bus Stand, Ward 4"
              className="flex-grow border border-slate-300 p-2.5 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="button"
              onClick={handleDetectLocation}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl font-semibold transition flex items-center whitespace-nowrap"
            >
              📍 {t.detectLocation}
            </button>
          </div>
        </div>

        {/* Photo Upload & Preview */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t.photoLabel}</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          {photo && (
            <div className="mt-3 relative w-28 h-28 border rounded-xl overflow-hidden shadow-sm">
              <img src={photo} alt="Proof Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition"
        >
          {t.submitBtn}
        </button>
      </form>
    </div>
  );
}