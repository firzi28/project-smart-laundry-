import React from 'react';
import { Outlet } from '../types';
import { Plus, Store, Sparkles } from 'lucide-react';

interface HeaderProps {
  outlets: Outlet[];
  currentOutlet: Outlet;
  onSelectOutlet: (outlet: Outlet) => void;
  onOpenAddOutlet: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  outlets,
  currentOutlet,
  onSelectOutlet,
  onOpenAddOutlet,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-0.5 shadow-sm border border-amber-300/80 flex items-center justify-center shrink-0">
            <img
              src="/src/assets/images/smart_laundry_logo_modern_1790622189834.jpg"
              alt="Logo Smart Laundry"
              className="w-full h-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
              onError={e => {
                // styled SVG fallback
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 uppercase">
                Smart Laundry
              </span>
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-400/90 px-1.5 py-0.2 rounded">
                <Sparkles className="w-2.5 h-2.5" /> POS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Sistem Kasir & Manajemen Laundry Profesional
            </p>
          </div>
        </div>

        {/* Outlet Selector Dropdown + '+' Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 hover:border-amber-400 transition-colors">
            <Store className="w-4 h-4 text-amber-600 mr-2 shrink-0" />
            <select
              value={currentOutlet.id}
              onChange={e => {
                const found = outlets.find(o => o.id === e.target.value);
                if (found) onSelectOutlet(found);
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 pr-3 focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[200px] truncate"
              title="Pilih Cabang / Outlet"
            >
              {outlets.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Outlet Button */}
          <button
            type="button"
            onClick={onOpenAddOutlet}
            className="w-8 h-8 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold flex items-center justify-center shadow-xs transition-colors shrink-0"
            title="Tambah Outlet Baru"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
};
