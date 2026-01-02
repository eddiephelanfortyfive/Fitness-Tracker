import React, { useEffect } from 'react';
import { 
  Home, 
  Footprints, 
  Bike, 
  Dumbbell, 
  Calendar, 
  TrendingUp, 
  Scale, 
  Snowflake,
  Flower,
  Settings,
  X
} from 'lucide-react';

const SidebarMenu = ({ isOpen, onClose, activeSheet, setActiveSheet, setShowSettings }) => {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home size={20} />,
      onClick: () => {
        setActiveSheet('home');
        onClose();
      }
    },
    {
      type: 'divider',
      label: 'Training'
    },
    {
      id: 'running',
      label: 'Running',
      icon: <Footprints size={20} />,
      onClick: () => {
        setActiveSheet('running');
        onClose();
      }
    },
    {
      id: 'cycling',
      label: 'Cycling',
      icon: <Bike size={20} />,
      onClick: () => {
        setActiveSheet('cycling');
        onClose();
      }
    },
    {
      id: 'weights',
      label: 'Weights',
      icon: <Dumbbell size={20} />,
      onClick: () => {
        setActiveSheet('weights');
        onClose();
      }
    },
    {
      id: 'yoga',
      label: 'Yoga',
      icon: <Flower size={20} />,
      onClick: () => {
        setActiveSheet('yoga');
        onClose();
      }
    },
    {
      type: 'divider',
      label: 'Tracking'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: <Calendar size={20} />,
      onClick: () => {
        setActiveSheet('schedule');
        onClose();
      }
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: <TrendingUp size={20} />,
      onClick: () => {
        setActiveSheet('progress');
        onClose();
      }
    },
    {
      id: 'weightlog',
      label: 'Weight Log',
      icon: <Scale size={20} />,
      onClick: () => {
        setActiveSheet('weightlog');
        onClose();
      }
    },
    {
      id: 'coldexposure',
      label: 'Cold Exposure',
      icon: <Snowflake size={20} />,
      onClick: () => {
        setActiveSheet('coldexposure');
        onClose();
      }
    },
    {
      type: 'divider'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />,
      onClick: () => {
        setShowSettings(true);
        onClose();
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-800 border-r border-slate-700 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Menu</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-2">
          {menuItems.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div key={`divider-${index}`} className="my-4">
                  {item.label && (
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                      {item.label}
                    </p>
                  )}
                  <div className="border-t border-slate-700" />
                </div>
              );
            }

            const isActive = activeSheet === item.id;
            
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default SidebarMenu;

