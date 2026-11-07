import React from 'react';
import { Compass, Sparkles, Code, Terminal, CheckCircle2, X } from 'lucide-react';
import { useDesktopStore } from '../../stores/desktopStore';

export const OnboardingTour: React.FC = () => {
  const { onboardingStep, setOnboardingStep, openWindow } = useDesktopStore();

  if (onboardingStep === 0) return null;

  const steps = [
    {
      title: 'Welcome to IBP OS! 🪐',
      desc: 'IBP OS is an experimental, beginner-friendly desktop environment powered by the IBP educational programming language. Everything runs locally in your browser with zero servers.',
      icon: <Sparkles size={24} className="text-sky-400" />,
      actionText: 'Next: IBP Studio',
      action: () => {
        openWindow('studio');
        setOnboardingStep(2);
      },
    },
    {
      title: 'IBP Studio & Code Editor 💻',
      desc: 'IBP Studio features Monaco Editor, real-time syntax squiggles from the engine parser, autocomplete, and live variable inspection. Programs run safely with deterministic limits.',
      icon: <Code size={24} className="text-emerald-400" />,
      actionText: 'Next: Terminal & CLI',
      action: () => {
        openWindow('terminal');
        setOnboardingStep(3);
      },
    },
    {
      title: 'Terminal & Virtual Filesystem 📁',
      desc: 'The Terminal and Studio share the exact same IndexedDB virtual filesystem under IBP://. Try running "ibp help" or "ibp repl" to write and test code interactively!',
      icon: <Terminal size={24} className="text-yellow-400" />,
      actionText: 'Finish Tour',
      action: () => {
        setOnboardingStep(0);
      },
    },
  ];

  const current = steps[onboardingStep - 1] || steps[0];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-150">
      <div className="bg-[#0E1526] border border-sky-500/40 rounded-xl shadow-2xl p-6 max-w-md w-full space-y-4 text-xs text-slate-100">
        <div className="flex items-start justify-between">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            {current.icon}
          </div>
          <button
            onClick={() => setOnboardingStep(0)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <div className="text-sm font-bold text-slate-100">{current.title}</div>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{current.desc}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex space-x-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  onboardingStep === i + 1 ? 'bg-sky-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={current.action}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-lg shadow-sky-600/30 text-xs transition"
          >
            {current.actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

