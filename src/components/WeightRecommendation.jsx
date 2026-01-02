import React from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

const WeightRecommendation = ({ recommendation, onChange, exerciseIndex, exerciseDataIndex }) => {
  const getRecommendationDisplay = () => {
    switch (recommendation) {
      case 'drop':
        return {
          icon: <ArrowDown size={18} />,
          color: 'text-red-400 hover:text-red-300',
          title: 'Drop weight'
        };
      case 'stay':
        return {
          icon: <Minus size={18} />,
          color: 'text-amber-400 hover:text-amber-300',
          title: 'Stay at same weight'
        };
      case 'increase':
        return {
          icon: <ArrowUp size={18} />,
          color: 'text-green-400 hover:text-green-300',
          title: 'Increase weight'
        };
      default:
        return {
          icon: null,
          color: 'text-slate-400 hover:text-slate-300',
          title: 'Set weight recommendation (click to cycle)'
        };
    }
  };

  const cycleRecommendation = () => {
    const nextState = recommendation === null 
      ? 'drop' 
      : recommendation === 'drop' 
      ? 'stay' 
      : recommendation === 'stay' 
      ? 'increase' 
      : null;
    onChange(exerciseDataIndex, nextState);
  };

  const display = getRecommendationDisplay();

  return (
    <button
      onClick={cycleRecommendation}
      className={`min-w-[28px] h-7 px-1.5 rounded transition-all flex items-center justify-center ${display.color} ${recommendation === null ? 'border border-slate-600 hover:border-slate-500 bg-slate-800/50' : ''}`}
      title={display.title}
    >
      {display.icon || <span className="text-base font-semibold">○</span>}
    </button>
  );
};

export default WeightRecommendation;
