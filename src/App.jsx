import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { workoutDaysLevel1, workoutDaysLevel2 } from './data/workoutPlans';
import { useRunningData, useCyclingData, useWeightData } from './hooks/useTrainingData';
import { useWeightLog } from './hooks/useWeightLog';
import { useRunningCharts, useCyclingCharts, useBodyWeightCharts, useWeightTrainingCharts } from './hooks/useCharts';
import { exportToCSV } from './utils/export';
import { getLastWeekWeight } from './utils/calculations';
import Header from './components/Header';
import Navigation from './components/Navigation';
import WeekSelector from './components/WeekSelector';
import ScheduleView from './components/ScheduleView';
import RunningView from './components/RunningView';
import CyclingView from './components/CyclingView';
import WeightsView from './components/WeightsView';
import WeightLogView from './components/WeightLogView';
import ProgressView from './components/ProgressView';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const App = () => {
  const [activeLevel, setActiveLevel] = useState(() => {
    try {
      const saved = localStorage.getItem('fitnessTracker_activeLevel');
      return saved ? parseInt(saved) : 1;
    } catch (e) {
      return 1;
    }
  });
  const [activeSheet, setActiveSheet] = useState('schedule');
  const [activeWeek, setActiveWeek] = useState(1);

  const maxWeeks = activeLevel === 1 ? 8 : 10;
  const workoutDays = activeLevel === 1 ? workoutDaysLevel1 : workoutDaysLevel2;

  // Use custom hooks for data management
  const { runningData, setRunningData, updateRunning } = useRunningData(activeLevel);
  const { cyclingData, setCyclingData, updateCycling } = useCyclingData(activeLevel);
  const { weightData, setWeightData, updateWeight, updateNumSets } = useWeightData(activeLevel);
  const { 
    weightLogData, 
    setWeightLogData, 
    targetWeight, 
    setTargetWeight, 
    addWeightEntry, 
    updateWeightEntry, 
    deleteWeightEntry 
  } = useWeightLog(activeLevel);

  // Use custom hooks for charts
  const { runningDistanceData, runningPaceData } = useRunningCharts(runningData, activeLevel, maxWeeks);
  const { cyclingDistanceData, cyclingPaceData } = useCyclingCharts(cyclingData, maxWeeks);
  const { bodyWeightTrendData, bodyWeightWeeklyData } = useBodyWeightCharts(weightLogData, targetWeight, maxWeeks);
  const { getWeightChartData } = useWeightTrainingCharts(weightData, workoutDays, maxWeeks);

  // Save active level to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fitnessTracker_activeLevel', activeLevel.toString());
    } catch (e) {
      console.error('Error saving active level to localStorage:', e);
    }
  }, [activeLevel]);

  // Reset to week 1 when level changes
  useEffect(() => {
    setActiveWeek(1);
  }, [activeLevel]);

  // Status update function - cycles through: not_done → completed → skipped → not_done
  const updateWorkoutStatus = (type, identifier, currentStatus) => {
    // Determine next status
    let nextStatus = 'not_done';
    if (currentStatus === 'not_done') {
      nextStatus = 'completed';
    } else if (currentStatus === 'completed') {
      nextStatus = 'skipped';
    } else if (currentStatus === 'skipped') {
      nextStatus = 'not_done';
    }

    if (type === 'running') {
      // Identifier format: { week, day, run }
      const newData = [...runningData];
      const index = newData.findIndex(r => 
        r.week === identifier.week && 
        r.day === identifier.day && 
        r.run === identifier.run
      );
      if (index !== -1) {
        newData[index].status = nextStatus;
        setRunningData(newData);
      }
    } else if (type === 'cycling') {
      // For cycling, update all segments in a week (week-level status)
      // Identifier format: { week, day }
      const newData = [...cyclingData];
      newData.forEach(c => {
        if (c.week === identifier.week && c.day === identifier.day) {
          c.status = nextStatus;
        }
      });
      setCyclingData(newData);
    } else if (type === 'weights') {
      // For weights, update all exercises in a workout (workout-level status)
      // Identifier format: { week, day, workoutName }
      const newData = [...weightData];
      newData.forEach(w => {
        if (w.week === identifier.week && 
            w.day === identifier.day && 
            w.workoutName === identifier.workoutName) {
          w.status = nextStatus;
        }
      });
      setWeightData(newData);
    }
  };

  // Refresh function to get latest version of the app
  const handleRefresh = () => {
    // Force reload from server to get latest version (bypass cache)
    // Add timestamp to force cache bypass
    const url = new URL(window.location.href);
    url.searchParams.set('_refresh', Date.now().toString());
    window.location.href = url.toString();
  };

  // Export CSV handler
  const handleExportToCSV = () => {
    exportToCSV(activeSheet, activeWeek, runningData, cyclingData, weightData, getLastWeekWeight);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-2 sm:p-4 relative">
      <div className="max-w-7xl mx-auto">
        <Header 
          activeLevel={activeLevel} 
          setActiveLevel={setActiveLevel} 
          handleRefresh={handleRefresh} 
          maxWeeks={maxWeeks} 
        />

        <Navigation 
          activeSheet={activeSheet} 
          setActiveSheet={setActiveSheet} 
          activeWeek={activeWeek} 
          maxWeeks={maxWeeks}
          handleExportToCSV={handleExportToCSV}
        />

        <WeekSelector 
          activeWeek={activeWeek} 
          setActiveWeek={setActiveWeek} 
          maxWeeks={maxWeeks} 
          activeSheet={activeSheet}
        />

        {/* Schedule View */}
        {activeSheet === 'schedule' && (
          <ScheduleView
            maxWeeks={maxWeeks}
            runningData={runningData}
            cyclingData={cyclingData}
            weightData={weightData}
            workoutDays={workoutDays}
            activeLevel={activeLevel}
            updateWorkoutStatus={updateWorkoutStatus}
          />
        )}

        {/* Running View */}
        {activeSheet === 'running' && (
          <RunningView
            activeWeek={activeWeek}
            runningData={runningData}
            updateRunning={updateRunning}
            updateWorkoutStatus={updateWorkoutStatus}
            activeLevel={activeLevel}
          />
        )}

        {/* Cycling View */}
        {activeSheet === 'cycling' && (
          <CyclingView
            activeWeek={activeWeek}
            cyclingData={cyclingData}
            updateCycling={updateCycling}
            updateWorkoutStatus={updateWorkoutStatus}
            activeLevel={activeLevel}
          />
        )}

        {/* Weights View */}
        {activeSheet === 'weights' && (
          <WeightsView
            activeWeek={activeWeek}
            weightData={weightData}
            workoutDays={workoutDays}
            updateWeight={updateWeight}
            updateNumSets={updateNumSets}
            updateWorkoutStatus={updateWorkoutStatus}
          />
        )}

        {/* Weight Log View */}
        {activeSheet === 'weightlog' && (
          <WeightLogView
            activeWeek={activeWeek}
            setActiveWeek={setActiveWeek}
            maxWeeks={maxWeeks}
            weightLogData={weightLogData}
            targetWeight={targetWeight}
            setTargetWeight={setTargetWeight}
            addWeightEntry={addWeightEntry}
            updateWeightEntry={updateWeightEntry}
            deleteWeightEntry={deleteWeightEntry}
          />
        )}

        {/* Progress View */}
        {activeSheet === 'progress' && (
          <ProgressView
            runningData={runningData}
            cyclingData={cyclingData}
            weightData={weightData}
            weightLogData={weightLogData}
            targetWeight={targetWeight}
            workoutDays={workoutDays}
            activeLevel={activeLevel}
            maxWeeks={maxWeeks}
            runningDistanceData={runningDistanceData}
            runningPaceData={runningPaceData}
            cyclingDistanceData={cyclingDistanceData}
            cyclingPaceData={cyclingPaceData}
            bodyWeightTrendData={bodyWeightTrendData}
            bodyWeightWeeklyData={bodyWeightWeeklyData}
            getWeightChartData={getWeightChartData}
          />
        )}
      </div>
    </div>
  );
};

export default App;

