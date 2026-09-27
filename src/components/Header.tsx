import React, { useState } from 'react';
import { 
  Bot, 
  Download, 
  HelpCircle, 
  Settings, 
  CheckCircle2, 
  Terminal, 
  Database, 
  Sparkles,
  Layers,
  FolderArchive
} from 'lucide-react';
import JSZip from 'jszip';
import { PYTHON_FILES } from '../data/pythonFiles';

interface HeaderProps {
  onOpenSetup: () => void;
  onOpenSettings: () => void;
  backendOnline: boolean;
  totalLogs: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSetup,
  onOpenSettings,
  backendOnline,
  totalLogs,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();

      // Add all python and support files
      PYTHON_FILES.forEach((file) => {
        zip.file(file.name, file.content);
      });

      // Add .env.example
      zip.file(
        '.env.example',
        '# Gemini API kalitingiz (Ixtiyoriy)\nGEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE\n'
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Local_AI_Studio_Agent_Windows.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('ZIP yaratishda xato:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <header className="h-14 bg-[#111622] border-b border-[#21283b] flex items-center justify-between px-4 z-20 select-none">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-md shadow-cyan-900/20 text-white">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white">
              Local AI Studio <span className="text-cyan-400 font-mono">Agent IDE</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              v1.2.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Google AI Studio Architecture • Windows Desktop & Local Engine
          </p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#182133] border border-[#27354f] text-xs">
          <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-slate-300 font-medium text-[11px]">
            {backendOnline ? 'Backend Faol' : 'Oflayn Rejim'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#182133] border border-[#27354f] text-xs">
          <Database className="w-3 h-3 text-cyan-400" />
          <span className="text-slate-300 font-medium text-[11px]">
            SQLite (agent.db)
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#182133] border border-[#27354f] text-xs">
          <Terminal className="w-3 h-3 text-emerald-400" />
          <span className="text-slate-300 font-medium text-[11px]">
            {totalLogs} ta hodisa
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownloadZip}
          disabled={downloading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
            downloadSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/30'
          }`}
          title="Windows kompyuteringiz uchun barcha .py, setup.py va run.bat fayllarini yuklab olish"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Yuklab Olindi!</span>
            </>
          ) : downloading ? (
            <>
              <FolderArchive className="w-3.5 h-3.5 animate-spin" />
              <span>Tayyorlanmoqda...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Yuklab Olish (.ZIP)</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenSetup}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#1a2233] hover:bg-[#222d44] text-slate-200 border border-[#2b3a55] transition-colors"
          title="Windowsda o'rnatish va setup.py yo'riqnomasi"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Qo‘llanma</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-[#1a2233] hover:bg-[#222d44] border border-[#2b3a55] transition-colors"
          title="Sozlamalar"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
