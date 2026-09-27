import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Settings, 
  Terminal, 
  Database,
  ExternalLink,
  Info
} from 'lucide-react';
import { PYTHON_FILES, PythonFileItem } from '../data/pythonFiles';

export const CodeTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PythonFileItem>(PYTHON_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (file: PythonFileItem) => {
    if (file.name.endsWith('.bat')) return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
    if (file.name.includes('db') || file.name.includes('data')) return <Database className="w-3.5 h-3.5 text-amber-400" />;
    if (file.name.includes('setup')) return <Settings className="w-3.5 h-3.5 text-cyan-400" />;
    if (file.name.endsWith('.md') || file.name.endsWith('.txt')) return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
  };

  const lines = selectedFile.content.split('\n');

  return (
    <div className="flex h-full bg-[#0d111a] overflow-hidden select-none">
      {/* File Tree Left Sidebar */}
      <div className="w-56 bg-[#101624] border-r border-[#1e273a] flex flex-col shrink-0">
        <div className="p-3 border-b border-[#1e273a] flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Loyiha Fayllari ({PYTHON_FILES.length})
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">.py / .bat</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {PYTHON_FILES.map((file) => {
            const isSelected = selectedFile.name === file.name;
            return (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#161f30]'
                }`}
              >
                {getFileIcon(file)}
                <span className="truncate">{file.name}</span>
              </button>
            );
          })}
        </div>

        {/* Small bottom hint */}
        <div className="p-2.5 border-t border-[#1e273a] bg-[#0c1018] text-[10px] text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Fayllar to‘liq Windows Desktop muhiti uchun optimallashgan</span>
        </div>
      </div>

      {/* Code Editor / Viewer View */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0c1017]">
        {/* File Header Bar */}
        <div className="p-2.5 bg-[#121825] border-b border-[#1e283c] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {getFileIcon(selectedFile)}
            <span className="text-xs font-bold font-mono text-white">
              {selectedFile.name}
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
              — {selectedFile.description}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#192336] text-slate-400 font-mono">
              {lines.length} qator • {selectedFile.language}
            </span>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#1a2336] hover:bg-[#23314c] text-slate-200 border border-[#273752] transition-colors"
              title="Kodni buferga olish"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Nusxalandi</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Nusxalash</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-cyan-700 hover:bg-cyan-600 text-white font-medium transition-colors"
              title="Faqat ushbu faylni yuklab olish"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Yuklab Olish</span>
            </button>
          </div>
        </div>

        {/* Code View with Line Numbers */}
        <div className="flex-1 overflow-auto p-4 select-text font-mono text-xs leading-relaxed flex">
          {/* Line Numbers */}
          <div className="pr-4 text-right text-slate-600 select-none border-r border-[#1a2336] shrink-0 font-mono text-[11px]">
            {lines.map((_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code Content */}
          <div className="pl-4 flex-1 text-slate-200 font-mono text-[11.5px] whitespace-pre overflow-x-auto">
            {lines.map((line, i) => (
              <div key={i} className="leading-6 hover:bg-[#141b29] px-1 rounded">
                {line.startsWith('#') || line.startsWith('"""') || line.startsWith('@') ? (
                  <span className="text-slate-500">{line}</span>
                ) : line.includes('def ') || line.includes('class ') ? (
                  <span className="text-cyan-400 font-bold">{line}</span>
                ) : line.includes('import ') || line.includes('from ') ? (
                  <span className="text-purple-400">{line}</span>
                ) : line.includes('return ') || line.includes('if ') || line.includes('else:') ? (
                  <span className="text-amber-400">{line}</span>
                ) : (
                  <span>{line}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
