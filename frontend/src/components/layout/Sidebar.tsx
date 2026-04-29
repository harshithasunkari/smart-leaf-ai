import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Scan, 
  History, 
  FlaskConical, 
  Settings, 
  LogOut,
  Leaf,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/src/utils/helpers';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'detection', label: 'Single Scan', icon: Scan },
  { id: 'multi', label: 'Batch Scan', icon: History },
  { id: 'manual', label: 'Recommendations', icon: FlaskConical },
  { id: 'history', label: 'Scan History', icon: MessageSquare },
];

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 88 : 256 }}
      className="h-screen bg-brand-900 flex flex-col sticky top-0 transition-all overflow-hidden z-20 text-emerald-50 shrink-0"
    >
      <div className="h-20 flex items-center px-6 mb-8 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center shadow-lg">
            <Leaf size={24} className="text-brand-950" />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight uppercase"
            >
              LegumeCare
            </motion.span>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group",
              activeTab === item.id 
                ? "bg-emerald-800/50 border border-emerald-700/50 text-white" 
                : "text-emerald-200/70 hover:bg-emerald-800/30 hover:text-emerald-50"
            )}
          >
            <item.icon size={20} className="shrink-0" />
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium text-sm"
              >
                {item.label}
              </motion.span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        {!isCollapsed && (
          <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800 mb-6">
            <p className="text-[10px] text-emerald-300 mb-2 uppercase tracking-widest font-bold">Plan Status</p>
            <div className="w-full bg-emerald-900 rounded-full h-1.5 mb-2">
              <div className="bg-emerald-400 h-1.5 rounded-full w-[65%]" />
            </div>
            <p className="text-[10px] text-emerald-400 font-medium">65 / 100 Scans used</p>
          </div>
        )}

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-300 hover:bg-rose-500/10 hover:text-rose-400 transition-all font-medium text-sm"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-4 w-full flex items-center justify-center p-2 text-emerald-500 hover:text-emerald-300 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </motion.aside>
  );
}
