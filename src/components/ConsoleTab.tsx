import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Play, 
  Trash2, 
  CornerDownLeft, 
  Copy, 
  Check,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface ConsoleTabProps {
  onExecuteCommand: (cmd: string) => Promise<string>;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  output: string;
  timestamp: string;
}

export const ConsoleTab: React.FC<ConsoleTabProps> = ({ onExecuteCommand }) => {
  const [inputCmd, setInputCmd] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      id: 'init-1',
      command: 'system --init',
      output: `Local AI Studio Agent Console v1.2.0 (Windows/Linux)
Python 3.10.12 Environment Ready.
Mahalliy agent va SQLite ma'lumotlar bazasi (agent.db) ulangan.
Yordam uchun: 'help' yoki 'setup.py' deb yozing.`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

  const handleRunCommand = async (cmdToRun: string) => {
    const cmd = cmdToRun.trim();
    if (!cmd || loading) return;

    if (cmd === 'clear' || cmd === 'cls') {
      setHistory([]);
      setInputCmd('');
      return;
    }

    setLoading(true);
    setInputCmd('');
    setHistoryIndex(null);

    try {
      const output = await onExecuteCommand(cmd);
      setHistory((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: cmd,
          output,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: cmd,
          output: `Xatolik yuz berdi: ${err.message || 'Noma‘lum xato'}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunCommand(inputCmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputCmd(history[nextIdx]?.command || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(null);
        setInputCmd('');
      } else {
        setHistoryIndex(nextIdx);
        setInputCmd(history[nextIdx]?.command || '');
      }
    }
  };

  const handleCopyOutput = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickCommands = [
    'python setup.py',
    'python gui_app.py',
    'python agent.py --run',
    'python -m pip list',
    'status',
    'help'
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] text-slate-200 font-mono select-none">
      {/* Console Top Toolbar */}
      <div className="p-2.5 bg-[#101520] border-b border-[#1d273a] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">
            Windows PowerShell & CLI Boshqaruv Paneli
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
            Interactive
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setHistory([])}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-[#172030] hover:bg-[#202c44] text-slate-300 hover:text-white border border-[#24334c] transition-colors"
            title="Terminalni tozalash"
          >
            <Trash2 className="w-3 h-3" />
            <span>Tozalash (Clear)</span>
          </button>
        </div>
      </div>

      {/* Quick Command Suggestions */}
      <div className="px-3 py-2 bg-[#0e131d] border-b border-[#1b2434] flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] text-slate-400 font-sans font-semibold shrink-0">
          Tezkor buyruqlar:
        </span>
        {quickCommands.map((cmd, i) => (
          <button
            key={i}
            onClick={() => handleRunCommand(cmd)}
            disabled={loading}
            className="px-2 py-0.5 rounded bg-[#162030] hover:bg-[#22314a] text-cyan-300 border border-[#273854] text-[11px] shrink-0 transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Output Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3.5 select-text text-xs leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((item) => (
          <div key={item.id} className="group">
            {/* Command Line */}
            <div className="flex items-center justify-between text-slate-400 mb-1 select-none">
              <div className="flex items-center gap-1 text-emerald-400">
                <span className="text-slate-500 font-bold">C:\AgentWorkspace&gt;</span>
                <span className="text-white font-bold">{item.command}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>{item.timestamp}</span>
                <button
                  onClick={() => handleCopyOutput(item.id, item.output)}
                  className="hover:text-white"
                  title="Nusxalash"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Output */}
            <pre className="p-2.5 rounded bg-[#0d121c] border border-[#1b2536] text-slate-300 whitespace-pre-wrap font-mono text-[11.5px] leading-snug">
              {item.output}
            </pre>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 py-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Buyruq bajarilmoqda...</span>
          </div>
        )}

        <div ref={consoleEndRef} />
      </div>

      {/* Bottom Command Prompt Input */}
      <div className="p-3 bg-[#0d121c] border-t border-[#1d273a] flex items-center gap-2">
        <span className="text-emerald-400 font-bold text-xs select-none">
          C:\AgentWorkspace&gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputCmd}
          onChange={(e) => setInputCmd(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Buyruqni yozing (masalan: python setup.py, help)..."
          className="flex-1 bg-transparent text-xs text-white focus:outline-none font-mono caret-cyan-400 placeholder:text-slate-600"
          autoFocus
        />
        <button
          onClick={() => handleRunCommand(inputCmd)}
          disabled={!inputCmd.trim() || loading}
          className="px-3 py-1 rounded bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-40"
        >
          <span>Bajarish</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
