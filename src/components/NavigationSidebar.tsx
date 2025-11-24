import { Boxes, TrendingUp, Target, Settings, HelpCircle, User } from 'lucide-react';
import { useState } from 'react';
import SettingsModal from './SettingsModal';
import HelpModal from './HelpModal';

interface NavigationSidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export default function NavigationSidebar({ activePage, onPageChange }: NavigationSidebarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const navItems = [
    { id: '3d', label: 'Track Visualization', icon: Boxes },
    { id: 'insights', label: 'Race Insights', icon: TrendingUp },
    { id: 'strategy', label: 'Strategy & Predictions', icon: Target },
    { id: 'summary', label: 'Driver Summary', icon: User },
  ];

  return (
    <aside className="w-[270px] h-[calc(100vh-8rem)] fixed left-0 top-20 glass-panel border-r-2 border-red-600/30 p-6 flex flex-col gap-4 z-40">
      <div className="mb-2">
        <h2 className="text-xs font-black tracking-[0.2em] text-red-500 mb-4">NAVIGATION</h2>
        <div className="h-px bg-gradient-to-r from-red-600/50 to-transparent mb-4"></div>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full text-left px-4 py-4 rounded font-semibold text-sm tracking-wide transition-all flex items-center gap-3 group ${
                isActive
                  ? 'bg-gradient-to-r from-red-600/30 to-red-600/10 border-2 border-red-600 text-red-400 shadow-lg shadow-red-600/20'
                  : 'bg-black/30 border-2 border-red-600/20 text-gray-400 hover:border-red-600/50 hover:text-red-300 hover:bg-red-600/10'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-red-500' : 'text-gray-500 group-hover:text-red-400'}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}

        <div className="h-px bg-gradient-to-r from-transparent via-cyan-600/30 to-transparent my-2"></div>

        <button 
          onClick={() => setShowSettings(true)}
          className="w-full text-left px-4 py-3 rounded font-semibold text-sm tracking-wide transition-all flex items-center gap-3 bg-black/30 border border-cyan-600/20 text-gray-500 hover:border-cyan-600/50 hover:text-cyan-400 hover:bg-cyan-600/10"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>

        <button 
          onClick={() => setShowHelp(true)}
          className="w-full text-left px-4 py-3 rounded font-semibold text-sm tracking-wide transition-all flex items-center gap-3 bg-black/30 border border-cyan-600/20 text-gray-500 hover:border-cyan-600/50 hover:text-cyan-400 hover:bg-cyan-600/10"
        >
          <HelpCircle className="w-4 h-4" />
          Help
        </button>
      </nav>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <div className="mt-auto">
        <div className="glass-panel rounded p-4 border border-cyan-600/20">
          <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase mb-2">
            System Status
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-400">ML Engine Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              <span className="text-gray-400">Telemetry Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-gray-400">3D Engine Idle</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
