import { LayoutDashboard, Receipt, Plus, Wallet, BarChart3, Calendar, Download } from 'lucide-react';
import { Tab } from '../types';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Home', Icon: LayoutDashboard },
  { id: 'expenses', label: 'History', Icon: Receipt },
  { id: 'add', label: 'Add', Icon: Plus },
  { id: 'assets', label: 'Assets', Icon: Wallet },
  { id: 'analytics', label: 'Stats', Icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', Icon: Calendar },
  { id: 'export', label: 'Export', Icon: Download },
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe flex">
      {TABS.map(({ id, label, Icon }) => {
        const isAdd = id === 'add';
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center justify-center transition-all duration-200 py-2 ${
              isAdd ? 'relative' : ''
            }`}
          >
            {isAdd ? (
              <span className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 -mt-6 border-4 border-slate-900">
                <Icon size={20} className="text-white" />
              </span>
            ) : (
              <>
                <Icon
                  size={18}
                  className={`transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}
                />
                <span
                  className={`text-[10px] mt-1 font-medium transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
}
