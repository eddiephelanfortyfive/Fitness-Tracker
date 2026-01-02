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
import { useColdExposure } from './hooks/useColdExposure';
import { useYogaData } from './hooks/useYogaData';
import { useRunningCharts, useCyclingCharts, useBodyWeightCharts, useWeightTrainingCharts, useColdExposureCharts, useYogaCharts } from './hooks/useCharts';
import { useCollapsedWorkouts } from './hooks/useCollapsedWorkouts';
import { useProgramStart } from './hooks/useProgramStart';
import { useMaxHeartRate } from './hooks/useMaxHeartRate';
import { exportToCSV } from './utils/export';
import { getLastWeekWeight, calculateCurrentWeek, getDaysIntoProgram, getTodayWeekday, getScheduleForWeek, getNextWorkout, calculateWorkoutDate } from './utils/calculations';
import Header from './components/Header';
import SidebarMenu from './components/SidebarMenu';
import WeekSelector from './components/WeekSelector';
import ScheduleView from './components/ScheduleView';
import RunningView from './components/RunningView';
import CyclingView from './components/CyclingView';
import WeightsView from './components/WeightsView';
import YogaView from './components/YogaView';
import WeightLogView from './components/WeightLogView';
import ColdExposureView from './components/ColdExposureView';
import ProgressView from './components/ProgressView';
import HomeView from './components/HomeView';
import SettingsModal from './components/SettingsModal';

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
  const [activeSheet, setActiveSheet] = useState('home');
  const [activeWeek, setActiveWeek] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const maxWeeks = activeLevel === 1 ? 8 : 10;
  const workoutDays = activeLevel === 1 ? workoutDaysLevel1 : workoutDaysLevel2;

  // Use custom hooks for data management
  const { runningData, setRunningData, updateRunning } = useRunningData(activeLevel);
  const { cyclingData, setCyclingData, updateCycling } = useCyclingData(activeLevel);
  const { weightData, setWeightData, updateWeight, updateNumSets, updateWeightRecommendation } = useWeightData(activeLevel);
  const { 
    weightLogData, 
    setWeightLogData, 
    targetWeight, 
    setTargetWeight, 
    addWeightEntry, 
    updateWeightEntry, 
    deleteWeightEntry 
  } = useWeightLog(activeLevel);
  const {
    coldExposureData,
    addColdExposureEntry,
    updateColdExposureEntry,
    deleteColdExposureEntry
  } = useColdExposure(activeLevel);
  const {
    yogaData,
    setYogaData,
    updateYoga,
    getOrCreateYogaEntry
  } = useYogaData(activeLevel);

  // Use custom hooks for charts
  const { runningDistanceData, runningPaceData } = useRunningCharts(runningData, activeLevel, maxWeeks);
  const { cyclingDistanceData, cyclingPaceData } = useCyclingCharts(cyclingData, maxWeeks);
  const { bodyWeightTrendData, bodyWeightWeeklyData } = useBodyWeightCharts(weightLogData, targetWeight, maxWeeks);
  const { getWeightChartData } = useWeightTrainingCharts(weightData, workoutDays, maxWeeks);
  const { coldExposureDurationData, coldExposureMethodData } = useColdExposureCharts(coldExposureData);
  const { yogaDurationData } = useYogaCharts(yogaData, maxWeeks);

  // Use collapse hook
  const { isCollapsed, toggleCollapsed, setCollapsedState } = useCollapsedWorkouts(activeLevel);

  // Use program start date hook (with activeLevel for level-specific dates)
  const { startDate, setProgramStartDate, clearStartDate } = useProgramStart(activeLevel);
  
  // Use max heart rate hook
  const { maxHeartRate, setMaxHeartRate } = useMaxHeartRate();

  // Calculate current week from start date
  const calculatedWeek = calculateCurrentWeek(startDate, maxWeeks);
  const daysIntoProgram = getDaysIntoProgram(startDate);
  const todayWeekday = getTodayWeekday();
  
  // Check if program has started (start date is today or in the past)
  const programHasStarted = startDate ? new Date() >= new Date(startDate) : false;
  
  // Use calculated week if start date is set and program has started, otherwise use activeWeek
  const effectiveWeek = (startDate && programHasStarted && calculatedWeek) ? calculatedWeek : activeWeek;

  // Get today's workouts (only if program has started)
  const getTodaysWorkouts = () => {
    if (startDate && !programHasStarted) {
      return []; // Program hasn't started yet, no workouts today
    }
    const schedule = getScheduleForWeek(effectiveWeek, runningData, cyclingData, weightData, workoutDays, activeLevel, yogaData, getOrCreateYogaEntry);
    return schedule[todayWeekday] || [];
  };
  const todaysWorkouts = getTodaysWorkouts();

  // Get next workout (if no workouts today)
  // If program hasn't started, start searching from Week 1; otherwise use effectiveWeek
  const weekToSearchFrom = (startDate && !programHasStarted) ? 1 : effectiveWeek;
  const nextWorkout = getNextWorkout(weekToSearchFrom, maxWeeks, runningData, cyclingData, weightData, workoutDays, activeLevel, todayWeekday, programHasStarted, yogaData, getOrCreateYogaEntry);

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

  // Helper function to create workout identifier
  const getWorkoutIdentifier = (type, identifier) => {
    if (type === 'running') {
      return `running-${identifier.week}-${identifier.day}-${identifier.run}`;
    } else if (type === 'cycling') {
      return `cycling-${identifier.week}-${identifier.day}`;
    } else if (type === 'weights') {
      return `weights-${identifier.week}-${identifier.day}-${identifier.workoutName}`;
    } else if (type === 'yoga') {
      return `yoga-${identifier.week}-${identifier.day}`;
    }
    return '';
  };

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
    } else if (type === 'yoga') {
      // For yoga, update the entry for that week/day
      // Identifier format: { week, day }
      const newData = [...yogaData];
      const index = newData.findIndex(y => 
        y.week === identifier.week && 
        y.day === identifier.day
      );
      if (index !== -1) {
        newData[index].status = nextStatus;
        setYogaData(newData);
      } else {
        // Create new entry if it doesn't exist
        const newEntry = {
          week: identifier.week,
          day: identifier.day,
          duration: '',
          status: nextStatus
        };
        setYogaData([...newData, newEntry]);
      }
    }

    // Auto-collapse when status becomes "completed" or "skipped"
    if (nextStatus === 'completed' || nextStatus === 'skipped') {
      const workoutId = getWorkoutIdentifier(type, identifier);
      setCollapsedState(workoutId, true);
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
    exportToCSV(activeSheet, effectiveWeek, runningData, cyclingData, weightData, getLastWeekWeight, coldExposureData, yogaData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-2 sm:p-4 relative">
      <div className="max-w-7xl mx-auto">
        <SidebarMenu
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeSheet={activeSheet}
          setActiveSheet={setActiveSheet}
          setShowSettings={setShowSettings}
        />

        <Header 
          activeLevel={activeLevel} 
          setActiveLevel={setActiveLevel} 
          maxWeeks={maxWeeks}
          activeWeek={activeWeek}
          setActiveWeek={setActiveWeek}
          effectiveWeek={effectiveWeek}
          startDate={startDate}
          activeSheet={activeSheet}
          onMenuClick={() => setIsSidebarOpen(true)}
          handleRefresh={handleRefresh}
        />

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          startDate={startDate}
          setProgramStartDate={setProgramStartDate}
          clearStartDate={clearStartDate}
          activeLevel={activeLevel}
          setActiveLevel={setActiveLevel}
          handleRefresh={handleRefresh}
          maxHeartRate={maxHeartRate}
          setMaxHeartRate={setMaxHeartRate}
        />

        {/* Week Selector - Only show when start date is not set and not on home */}
        {!startDate && activeSheet !== 'home' && (
          <WeekSelector 
            activeWeek={activeWeek} 
            setActiveWeek={setActiveWeek} 
            maxWeeks={maxWeeks} 
            activeSheet={activeSheet}
          />
        )}

        {/* Home View */}
        {activeSheet === 'home' && (
          <HomeView
            maxWeeks={maxWeeks}
            runningData={runningData}
            cyclingData={cyclingData}
            weightData={weightData}
            yogaData={yogaData}
            coldExposureData={coldExposureData}
            workoutDays={workoutDays}
            activeLevel={activeLevel}
            updateWorkoutStatus={updateWorkoutStatus}
            updateRunning={updateRunning}
            updateCycling={updateCycling}
            updateYoga={updateYoga}
            getOrCreateYogaEntry={getOrCreateYogaEntry}
            todaysWorkouts={todaysWorkouts}
            nextWorkout={nextWorkout}
            effectiveWeek={effectiveWeek}
            daysIntoProgram={daysIntoProgram}
            startDate={startDate}
            isCollapsed={isCollapsed}
            toggleCollapsed={toggleCollapsed}
            getWorkoutIdentifier={getWorkoutIdentifier}
            setActiveSheet={setActiveSheet}
            setActiveWeek={setActiveWeek}
            setShowSettings={setShowSettings}
            calculateWorkoutDate={calculateWorkoutDate}
            maxHeartRate={maxHeartRate}
          />
        )}

        {/* Schedule View */}
        {activeSheet === 'schedule' && (
          <ScheduleView
            maxWeeks={maxWeeks}
            runningData={runningData}
            cyclingData={cyclingData}
            weightData={weightData}
            yogaData={yogaData}
            getOrCreateYogaEntry={getOrCreateYogaEntry}
            workoutDays={workoutDays}
            activeLevel={activeLevel}
            updateWorkoutStatus={updateWorkoutStatus}
            isCollapsed={isCollapsed}
            toggleCollapsed={toggleCollapsed}
            getWorkoutIdentifier={getWorkoutIdentifier}
            effectiveWeek={effectiveWeek}
            todayWeekday={todayWeekday}
            startDate={startDate}
            maxHeartRate={maxHeartRate}
          />
        )}

        {/* Running View */}
        {activeSheet === 'running' && (
          <RunningView
            activeWeek={effectiveWeek}
            runningData={runningData}
            updateRunning={updateRunning}
            updateWorkoutStatus={updateWorkoutStatus}
            activeLevel={activeLevel}
            isCollapsed={isCollapsed}
            toggleCollapsed={toggleCollapsed}
            getWorkoutIdentifier={getWorkoutIdentifier}
            maxHeartRate={maxHeartRate}
          />
        )}

        {/* Cycling View */}
        {activeSheet === 'cycling' && (
          <CyclingView
            activeWeek={effectiveWeek}
            cyclingData={cyclingData}
            updateCycling={updateCycling}
            updateWorkoutStatus={updateWorkoutStatus}
            activeLevel={activeLevel}
            isCollapsed={isCollapsed}
            toggleCollapsed={toggleCollapsed}
            getWorkoutIdentifier={getWorkoutIdentifier}
          />
        )}

        {/* Weights View */}
        {activeSheet === 'weights' && (
          <WeightsView
            activeWeek={effectiveWeek}
            weightData={weightData}
            workoutDays={workoutDays}
            updateWeight={updateWeight}
            updateNumSets={updateNumSets}
            updateWorkoutStatus={updateWorkoutStatus}
            isCollapsed={isCollapsed}
            toggleCollapsed={toggleCollapsed}
            getWorkoutIdentifier={getWorkoutIdentifier}
            updateWeightRecommendation={updateWeightRecommendation}
          />
        )}

        {/* Yoga View */}
        {activeSheet === 'yoga' && (
          <YogaView
            activeWeek={effectiveWeek}
            yogaData={yogaData}
            runningData={runningData}
            cyclingData={cyclingData}
            updateYoga={updateYoga}
            updateWorkoutStatus={updateWorkoutStatus}
            activeLevel={activeLevel}
            isCollapsed={isCollapsed}
            toggleCollapsed={toggleCollapsed}
            getWorkoutIdentifier={getWorkoutIdentifier}
            getOrCreateYogaEntry={getOrCreateYogaEntry}
          />
        )}

        {/* Weight Log View */}
        {activeSheet === 'weightlog' && (
          <WeightLogView
            activeWeek={effectiveWeek}
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

        {/* Cold Exposure View */}
        {activeSheet === 'coldexposure' && (
          <ColdExposureView
            coldExposureData={coldExposureData}
            addColdExposureEntry={addColdExposureEntry}
            updateColdExposureEntry={updateColdExposureEntry}
            deleteColdExposureEntry={deleteColdExposureEntry}
            coldExposureDurationData={coldExposureDurationData}
            coldExposureMethodData={coldExposureMethodData}
          />
        )}

        {/* Progress View */}
        {activeSheet === 'progress' && (
          <ProgressView
            runningData={runningData}
            cyclingData={cyclingData}
            weightData={weightData}
            yogaData={yogaData}
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
            coldExposureData={coldExposureData}
            coldExposureDurationData={coldExposureDurationData}
            coldExposureMethodData={coldExposureMethodData}
            yogaDurationData={yogaDurationData}
          />
        )}
      </div>
    </div>
  );
};

export default App;

