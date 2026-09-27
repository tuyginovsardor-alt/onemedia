import React from 'react';
import { X, Settings, Key, Sliders, Database, Cpu, CheckCircle } from 'lucide-react';
import { AgentConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AgentConfig;
  onChangeConfig: (newConfig: Partial<AgentConfig>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121826] border border-[#24334c] rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-[#162033] border-b border-[#24334c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Agent Sozlamalari</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#22314d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">
              Standart Model
            </label>
            <select
              value={config.model}
              onChange={(e) => onChangeConfig({ model: e.target.value })}
              className="w-full bg-[#162033] border border-[#273854] text-white rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Tavsiya etiladi)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
              <option value="local-engine">Local Rule Engine (Oflayn)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-bold mb-1">
              <span>Temperature</span>
              <span className="text-cyan-400 font-mono">{config.temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.temperature}
              onChange={(e) => onChangeConfig({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-bold mb-1">
              <span>Top P</span>
              <span className="text-cyan-400 font-mono">{config.topP}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.topP}
              onChange={(e) => onChangeConfig({ topP: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#0e1422] border border-[#202c42] space-y-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide block">
              Mahalliy Integratsiyalar
            </span>
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>SQLite Baza Fayli:</span>
              <span className="text-amber-400 font-mono">agent.db</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Windows GUI Freymvorki:</span>
              <span className="text-cyan-400 font-mono">Tkinter (Built-in)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Python Talabi:</span>
              <span className="text-emerald-400 font-mono">Python 3.8+</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#162033] border-t border-[#24334c] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            Saqlash va Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
