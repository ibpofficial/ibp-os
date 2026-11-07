import React, { useState, useEffect } from 'react';
import { Play, ArrowRight, UserCheck } from 'lucide-react';
import { useDesktopStore } from '../../stores/desktopStore';

export const BootScreen: React.FC = () => {
  const { setBooted, currentUser, setUser } = useDesktopStore();
  const [progress, setProgress] = useState(0);
  const [bootPhase, setBootPhase] = useState<'booting' | 'login'>('booting');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setBootPhase('login');
          return 100;
        }
        return p + 25;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleSkip = () => {
    setBooted(true);
  };

  const handleLogin = () => {
    setBooted(true);
  };

  return (
    <div className="fixed inset-0 bg-[#0B1120] text-slate-100 flex flex-col items-center justify-center select-none z-50 font-sans">
      {/* Animated Glowing Planet Logo */}
      <div className="flex flex-col items-center space-y-4 max-w-sm w-full px-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center text-4xl shadow-2xl shadow-sky-500/30 animate-pulse">
            🪐
          </div>
          <div className="absolute inset-0 rounded-full border border-sky-400/40 animate-ping opacity-25" />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-wider text-slate-100 font-mono">IBP OS</h1>
          <p className="text-slate-400 text-xs mt-1">Experimental Educational Operating System</p>
        </div>

        {bootPhase === 'booting' ? (
          <div className="w-full space-y-3 pt-4">
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-sky-400 to-blue-600 h-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>Mounting IBP Virtual Machine...</span>
              <span>{progress}%</span>
            </div>
            <div className="pt-2 text-center">
              <button
                onClick={handleSkip}
                className="text-xs text-sky-400 hover:text-sky-300 underline font-medium transition"
              >
                Skip Boot Sequence
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-4 pt-4 animate-in fade-in duration-300">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  G
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-200">guest</div>
                  <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
                    <UserCheck size={11} />
                    <span>Default User</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-sky-600/30 transition"
            >
              <span>Launch Desktop</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
