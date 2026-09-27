import React, { useState } from 'react';
import { 
  FileText, 
  Trash2, 
  Download, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Wrench, 
  Info,
  Clock
} from 'lucide-react';
import { SystemLog } from '../types';

interface LogsTabProps {
  logs: SystemLog[];
  onClearLogs: () => void;
  onRefreshLogs: () => void;
}

export const LogsTab: React.FC<LogsTabProps> = ({
  logs,
  onClearLogs,
  onRefreshLogs,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesSearch =
      !searchTerm ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleExportLogs = () => {
    const content = logs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.source}]: ${l.message}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_logs_${Date.now()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <CheckCircle className="w-3 h-3" /> SUCCESS
          </span>
        );
      case 'TOOL':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            <Wrench className="w-3 h-3" /> TOOL
          </span>
        );
      case 'ERROR':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800/60">
            <AlertCircle className="w-3 h-3" /> ERROR
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/80 text-blue-400 border border-blue-800/60">
            <Info className="w-3 h-3" /> INFO
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d111a] select-none">
      {/* Controls Bar */}
      <div className="p-3 bg-[#111622] border-b border-[#1f283c] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Tizim Hodisalari & Agent Loglari ({filteredLogs.length})
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Level Filter Buttons */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#161e2e] border border-[#25334c]">
            {['ALL', 'INFO', 'TOOL', 'SUCCESS', 'ERROR'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2 py-1 text-[11px] font-bold rounded transition-all ${
                  filterLevel === lvl
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl === 'ALL' ? 'Barchasi' : lvl}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-[#161e2e] border border-[#25334c] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-36 sm:w-48"
            />
          </div>

          <button
            onClick={onRefreshLogs}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-[#1a2336] hover:bg-[#222e44] border border-[#283750] transition-colors"
            title="Yangilash"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExportLogs}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-200 bg-[#1a2336] hover:bg-[#222e44] border border-[#283750] transition-colors"
            title="Log faylni yuklab olish"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Eksport (.log)</span>
          </button>

          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 bg-[#1a2336] hover:bg-[#222e44] border border-[#283750] transition-colors"
            title="Tozalash"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono select-text">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            Loglar topilmadi yoki filtr bo‘yicha natija yo‘q.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-[#111724] border border-[#1d273a] hover:border-[#2a3852] transition-colors flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="shrink-0 mt-0.5">{getLevelBadge(log.level)}</span>
                <div className="min-w-0">
                  <div className="text-slate-200 leading-snug break-words">
                    {log.message}
                  </div>
                  {log.details && (
                    <div className="text-[11px] text-slate-400 mt-1 whitespace-pre-wrap bg-[#090d14] p-1.5 rounded border border-[#1b2536]">
                      {log.details}
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end text-[10px] text-slate-400 select-none">
                <span className="text-slate-300 font-bold px-1.5 py-0.5 rounded bg-[#182233] border border-[#24334c]">
                  {log.source}
                </span>
                <span className="flex items-center gap-1 mt-1 text-slate-500">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
