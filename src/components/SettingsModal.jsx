import React, { useState, useEffect } from 'react';
import { X, Calendar, RefreshCw } from 'lucide-react';

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  startDate, 
  setProgramStartDate, 
  clearStartDate,
  activeLevel,
  setActiveLevel,
  handleRefresh,
  maxHeartRate,
  setMaxHeartRate
}) => {
  const [dateInput, setDateInput] = useState(
    startDate ? startDate.toISOString().split('T')[0] : ''
  );
  const [maxHRInput, setMaxHRInput] = useState(
    maxHeartRate ? maxHeartRate.toString() : ''
  );

  useEffect(() => {
    if (isOpen) {
      setDateInput(startDate ? startDate.toISOString().split('T')[0] : '');
      setMaxHRInput(maxHeartRate ? maxHeartRate.toString() : '');
    }
  }, [isOpen, startDate, maxHeartRate]);

  const handleSave = () => {
    if (dateInput) {
      setProgramStartDate(new Date(dateInput));
    } else {
      clearStartDate();
    }
    
    // Save max HR
    const hrValue = maxHRInput.trim();
    if (hrValue === '') {
      setMaxHeartRate(null);
    } else {
      const hrNum = parseInt(hrValue, 10);
      if (!isNaN(hrNum) && hrNum >= 100 && hrNum <= 250) {
        setMaxHeartRate(hrNum);
      }
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar size={24} />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close settings"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Program Start Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Program Start Date
            </label>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-400 mt-2">
              When did you start Week 1? Leave empty to use manual week selection.
            </p>
            {startDate && (
              <p className="text-xs text-green-400 mt-1">
                Currently set to: {startDate.toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Level Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Training Level
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveLevel(1)}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeLevel === 1
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Level 1
              </button>
              <button
                onClick={() => setActiveLevel(2)}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeLevel === 2
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Level 2
              </button>
            </div>
          </div>

          {/* Maximum Heart Rate */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Maximum Heart Rate (bpm)
            </label>
            <input
              type="number"
              min="100"
              max="250"
              value={maxHRInput}
              onChange={(e) => setMaxHRInput(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., 200"
            />
            <p className="text-xs text-slate-400 mt-2">
              Set your maximum heart rate to see BPM ranges alongside HR percentages (e.g., "65-75% HR (130-150 bpm)"). Leave empty to hide BPM.
            </p>
            {maxHeartRate && (
              <p className="text-xs text-green-400 mt-1">
                Currently set to: {maxHeartRate} bpm
              </p>
            )}
          </div>

          {/* Refresh Button */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              App Updates
            </label>
            <button
              onClick={handleRefresh}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh App
            </button>
            <p className="text-xs text-slate-400 mt-2">
              Get the latest version of the app
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

