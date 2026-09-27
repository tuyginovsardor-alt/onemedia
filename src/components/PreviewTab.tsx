import React, { useState } from 'react';
import { 
  Play, 
  Monitor, 
  Database, 
  Terminal, 
  Cpu, 
  CheckCircle, 
  ExternalLink, 
  Sparkles,
  Layers,
  FileCode,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { ChatMessage } from '../types';

interface PreviewTabProps {
  lastMessage?: ChatMessage;
  onRunTest: (prompt: string) => void;
  onSwitchTab: (tab: 'logs' | 'console' | 'database' | 'code') => void;
  totalLogs: number;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({
  lastMessage,
  onRunTest,
  onSwitchTab,
  totalLogs,
}) => {
  const [activePreviewMode, setActivePreviewMode] = useState<'agent_output' | 'windows_gui_mock' | 'architecture'>('agent_output');

  return (
    <div className="flex flex-col h-full bg-[#0d111a] overflow-y-auto p-4 select-none">
      {/* Top Banner & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#1f283c]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <span>Agent Natijalari & Jonli Preview</span>
          </h2>
          <p className="text-xs text-slate-400">
            Agentning so‘nggi harakatlari, ishlab chiqarilgan kodlari va Windows GUI holati
          </p>
        </div>

        {/* View mode buttons */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#141b29] border border-[#222c3f]">
          <button
            onClick={() => setActivePreviewMode('agent_output')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activePreviewMode === 'agent_output'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Agent Natijasi
          </button>
          <button
            onClick={() => setActivePreviewMode('windows_gui_mock')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activePreviewMode === 'windows_gui_mock'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Windows GUI Simulyatori
          </button>
          <button
            onClick={() => setActivePreviewMode('architecture')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activePreviewMode === 'architecture'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tizim Arxitekturasi
          </button>
        </div>
      </div>

      {/* Main Content Area based on mode */}
      {activePreviewMode === 'agent_output' && (
        <div className="space-y-4">
          {/* Output Card */}
          <div className="bg-[#121824] border border-[#222c40] rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1c2538]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  Oxirgi Generatsiya / Agent Javobi
                </span>
              </div>
              {lastMessage && (
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(lastMessage.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>

            {lastMessage ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#0a0e16] border border-[#1b2333] text-xs font-mono text-cyan-300">
                  <span className="text-slate-400 font-bold block mb-1">Topshiriq (Prompt):</span>
                  {lastMessage.role === 'assistant' ? 'Agent so‘rovi yakunlandi.' : lastMessage.content}
                </div>

                <div className="p-4 rounded-lg bg-[#0e1420] border border-[#222e44] text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap select-text">
                  {lastMessage.content}
                </div>

                {lastMessage.toolCalls && lastMessage.toolCalls.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Bajarilgan Asboblar (Tool Calls):
                    </span>
                    <div className="space-y-1.5">
                      {lastMessage.toolCalls.map((tc, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-[#151e2d] border border-[#24334b] text-xs flex flex-col gap-1 font-mono"
                        >
                          <span className="text-cyan-400 font-bold">🛠️ {tc.tool}</span>
                          <span className="text-slate-300 text-[11px]">{tc.result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <p className="text-xs">
                  Hali hech qanday so‘rov yuborilmadi. Chap paneldan agentga savol bering yoki quyidagi tezkor sinov tugmalarini bosing.
                </p>
              </div>
            )}
          </div>

          {/* Quick Action Test Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Tezkor Interaktiv Sinovlar (Interactive Tests)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => onRunTest('SQLite bazasidagi barcha jadvallar va statistikani ko‘rsat')}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#131a27] hover:bg-[#1a2436] border border-[#222e44] hover:border-cyan-500/50 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    1. SQLite Database Sinovi
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    agent.db bazasini tekshirish va jadvallar sonini sanash
                  </p>
                </div>
              </button>

              <button
                onClick={() => onRunTest('Python agent.py va gui_app.py qanday bog‘langanini tushuntir')}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#131a27] hover:bg-[#1a2436] border border-[#222e44] hover:border-cyan-500/50 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    2. Python Kod Struktura Sinovi
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Modullar, kutubxonalar va Windows Tkinter integratsiyasi
                  </p>
                </div>
              </button>

              <button
                onClick={() => onRunTest('setup.py skripti qanday vazifalarni avtomatik bajaradi?')}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#131a27] hover:bg-[#1a2436] border border-[#222e44] hover:border-cyan-500/50 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    3. setup.py Avtomatizatsiya Sinovi
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Paketlarni o‘rnatish va 1-bosish bilan ishga tushirish
                  </p>
                </div>
              </button>

              <button
                onClick={() => onSwitchTab('console')}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#131a27] hover:bg-[#1a2436] border border-[#222e44] hover:border-cyan-500/50 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    4. Jonli Console / Terminalni Ochish
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Python buyruqlarini interaktiv konsolda bajarish
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Windows GUI Desktop Mockup */}
      {activePreviewMode === 'windows_gui_mock' && (
        <div className="space-y-4">
          <div className="bg-[#101520] border border-[#27354d] rounded-xl overflow-hidden shadow-2xl">
            {/* Windows Window Title Bar */}
            <div className="bg-[#1c2436] px-3 py-2 flex items-center justify-between border-b border-[#2d3b55]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200 font-mono">
                  🖥️ Local AI Studio Agent - Windows Desktop (Tkinter GUI)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                  Online
                </span>
              </div>

              {/* Windows Window Control Buttons */}
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-600 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              </div>
            </div>

            {/* Inner Window Body: Dual Pane Mockup */}
            <div className="grid grid-cols-12 min-h-[380px] bg-[#0c1018]">
              {/* Left Pane (Agent) */}
              <div className="col-span-5 border-r border-[#202a3d] p-3 flex flex-col justify-between bg-[#121824]">
                <div>
                  <div className="text-[11px] font-bold text-cyan-400 mb-1">
                    Agent Configuration & Chat
                  </div>
                  <div className="p-2 rounded bg-[#0b0e14] border border-[#1e2738] text-[10px] text-slate-400 mb-2 font-mono">
                    System: Sen mahalliy AI agentsan...
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 rounded bg-[#1e273a] text-white text-[11px] max-w-[85%] ml-auto">
                      Assalomu alaykum, Windowsda qanday ishga tushiraman?
                    </div>
                    <div className="p-2 rounded bg-[#172030] text-slate-200 text-[11px] max-w-[90%] border border-[#25334c]">
                      Salom! ZIP ni ochib, run.bat ni bosing. Dastur avtomatik o‘rnatiladi!
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#1e283b] flex gap-1.5">
                  <div className="flex-1 bg-[#0b0e14] border border-[#243046] rounded px-2 py-1 text-[11px] text-slate-400 font-mono">
                    Yozing...
                  </div>
                  <button className="px-2.5 py-1 bg-blue-600 text-white rounded text-[11px] font-bold">
                    Yuborish ▶
                  </button>
                </div>
              </div>

              {/* Right Pane (Tabs Mockup) */}
              <div className="col-span-7 p-3 flex flex-col justify-between bg-[#0e131d]">
                <div>
                  {/* Tab Header */}
                  <div className="flex items-center gap-1 border-b border-[#212c40] pb-1.5 mb-2">
                    <span className="px-2 py-1 bg-[#1a2334] text-cyan-400 rounded text-[10px] font-bold">
                      👁️ Preview
                    </span>
                    <span className="px-2 py-1 text-slate-400 hover:text-white rounded text-[10px]">
                      📜 Logs
                    </span>
                    <span className="px-2 py-1 text-slate-400 hover:text-white rounded text-[10px]">
                      💻 Console
                    </span>
                    <span className="px-2 py-1 text-slate-400 hover:text-white rounded text-[10px]">
                      🗄️ Database
                    </span>
                    <span className="px-2 py-1 text-slate-400 hover:text-white rounded text-[10px]">
                      📝 Code
                    </span>
                  </div>

                  <div className="p-3 bg-[#0a0d14] border border-[#1d273a] rounded text-[11px] font-mono text-emerald-400 space-y-1">
                    <div>[Tkinter Windows Engine] v1.2.0 faol</div>
                    <div>[SQLite] agent.db ulandi, jadvallar OK</div>
                    <div>[GUI] 2-panel Google AI Studio tartibi yuklandi</div>
                    <div className="text-slate-400">Kutmoqda: Foydalanuvchi buyruqlari...</div>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-[#141b27] border border-[#222e42] rounded flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Windows OS: Windows 10/11 Compatible</span>
                  <span className="text-cyan-400 font-bold">python gui_app.py</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Architecture View */}
      {activePreviewMode === 'architecture' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#121824] border border-[#222c40]">
              <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center mb-3">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">
                1. Mahalliy Yadro (agent.py)
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Gemini 3.8 Flash modeli va oflayn qoidalar mexanizmi. Tool calling orqali kod va bazani boshqaradi.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#121824] border border-[#222c40]">
              <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center mb-3">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">
                2. SQLite Persistence (database.py)
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <code className="text-amber-300">agent.db</code> faylida suhbatlar, tizim loglari, xotira va vazifalar to‘liq saqlanadi.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#121824] border border-[#222c40]">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">
                3. Avtomatik Setup (setup.py & run.bat)
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Python muhitini tekshiradi, paketlarni o‘rnatadi va Windows Tkinter GUI darchasini ochadi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
