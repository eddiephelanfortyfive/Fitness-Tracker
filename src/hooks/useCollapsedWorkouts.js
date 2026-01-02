import { useState, useEffect } from 'react';

// Hook to manage collapsed state for workouts
export const useCollapsedWorkouts = (activeLevel) => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_collapsedWorkouts_level${activeLevel}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading collapsed state from localStorage:', e);
    }
    return {};
  });

  // Update data when level changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_collapsedWorkouts_level${activeLevel}`);
      if (saved) {
        setCollapsed(JSON.parse(saved));
      } else {
        setCollapsed({});
      }
    } catch (e) {
      console.error('Error loading collapsed state for level:', e);
      setCollapsed({});
    }
  }, [activeLevel]);

  // Save to localStorage whenever collapsed state changes
  useEffect(() => {
    try {
      localStorage.setItem(`fitnessTracker_collapsedWorkouts_level${activeLevel}`, JSON.stringify(collapsed));
    } catch (e) {
      console.error('Error saving collapsed state to localStorage:', e);
    }
  }, [collapsed, activeLevel]);

  // Check if a workout is collapsed
  const isCollapsed = (identifier) => {
    return collapsed[identifier] === true;
  };

  // Toggle collapsed state
  const toggleCollapsed = (identifier) => {
    setCollapsed(prev => ({
      ...prev,
      [identifier]: !prev[identifier]
    }));
  };

  // Set collapsed state explicitly
  const setCollapsedState = (identifier, isCollapsed) => {
    setCollapsed(prev => ({
      ...prev,
      [identifier]: isCollapsed
    }));
  };

  return { isCollapsed, toggleCollapsed, setCollapsedState };
};

