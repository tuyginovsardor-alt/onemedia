import React from 'react';
import { 
  X, 
  Download, 
  Terminal, 
  Monitor, 
  CheckCircle, 
  FolderArchive, 
  Key, 
  FileCode,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadZip: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  isOpen,
  onClose,
  onDownloadZip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121826] border border-[#24334c] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-[#162033] border-b border-[#24334c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Windows Kompyuteringizda Ishga Tushirish Yo‘riqnomasi
              </h3>
              <p className="text-[11px] text-slate-400">
                1-bosqichli avtomatik setup va Windows Desktop Tkinter GUI integratsiyasi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#22314d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-300">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-[#0f1522] border border-[#202c42] flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-100 text-xs mb-1">
                Loyiha ZIP Arxivini Yuklab Oling
              </h4>
              <p className="text-slate-400 text-[11.5px] leading-relaxed mb-2.5">
                Yuqori o‘ng burchakdagi yoki quyidagi tugma orqali barcha fayllarni (.py, setup.py, run.bat, requirements.txt) o‘z ichiga olgan ZIP arxivini yuklab oling.
              </p>
              <button
                onClick={onDownloadZip}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ZIP Arxivini Yuklab Olish</span>
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-[#0f1522] border border-[#202c42] flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-100 text-xs mb-1">
                ZIP Arxivini Papkaga Ochish (Unzip)
              </h4>
              <p className="text-slate-400 text-[11.5px] leading-relaxed">
                Yuklab olingan faylni sichqonchaning o‘ng tugmasi bilan bosing va <strong>"Extract All..."</strong> (Hammasini ajratish) ni tanlang.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-[#0f1522] border border-[#202c42] flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-100 text-xs mb-1">
                run.bat yoki setup.py orqali Avtomatik O‘rnatish va Ishga Tushirish
              </h4>
              <p className="text-slate-400 text-[11.5px] leading-relaxed mb-2">
                Papkadagi <code className="text-emerald-400 font-bold bg-[#172134] px-1 py-0.5 rounded">run.bat</code> faylini 2 marta bosing. U avtomatik tarzda:
              </p>
              <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside bg-[#141d2e] p-2.5 rounded-lg border border-[#22314a]">
                <li>Python versiyasini (3.8+) tekshiradi;</li>
                <li>Kerakli kutubxonalarni (<code className="text-cyan-300">google-genai</code>, <code className="text-cyan-300">requests</code>, <code className="text-cyan-300">python-dotenv</code>) o‘rnatadi;</li>
                <li><code className="text-amber-300">agent.db</code> SQLite ma'lumotlar bazasini initsializatsiya qiladi;</li>
                <li>Windows Tkinter Desktop GUI darchasini ochadi!</li>
              </ul>

              <div className="mt-2.5 text-[11px] text-slate-400">
                Konsol yoki Terminaldan ishga tushirish uchun:
                <pre className="mt-1 p-2 bg-[#090d14] rounded border border-[#1a2436] font-mono text-emerald-400">
python setup.py
                </pre>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-xl bg-[#0f1522] border border-[#202c42] flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">
              4
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-100 text-xs mb-1">
                Gemini API Kaliti (Ixtiyoriy)
              </h4>
              <p className="text-slate-400 text-[11.5px] leading-relaxed">
                Agent kalitsiz ham mustaqil oflayn rejimda ishlaydi. Agar Google AI Studio modeli bilan to‘liq quvvatda ishlatmoqchi bo‘lsangiz, papkada <code className="text-purple-300 font-bold">.env</code> faylida kalitni belgilang:
              </p>
              <pre className="mt-1 p-2 bg-[#090d14] rounded border border-[#1a2436] font-mono text-purple-300 text-[11px]">
GEMINI_API_KEY=AIzaSy...
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#162033] border-t border-[#24334c] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#212d46] hover:bg-[#2b3a59] text-white transition-colors"
          >
            Tushunarli, yopish
          </button>
        </div>
      </div>
    </div>
  );
};
