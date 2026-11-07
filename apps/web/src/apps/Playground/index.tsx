import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Trophy, CheckCircle, Sparkles, AlertCircle, Play, Star, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CHALLENGES, Challenge } from './challenges';
import { executeIBP } from '@ibp/engine';
import { configureMonaco } from '../../components/Editor/monacoConfig';

export const PlaygroundApp: React.FC = () => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(CHALLENGES[0].id);
  const [code, setCode] = useState<string>(CHALLENGES[0].starterCode);
  const [solvedIds, setSolvedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('ibp_solved_challenges');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [testResult, setTestResult] = useState<{ passed: boolean; message: string } | null>(null);

  const activeChallenge = CHALLENGES.find((c) => c.id === selectedChallengeId) || CHALLENGES[0];

  useEffect(() => {
    setCode(activeChallenge.starterCode);
    setTestResult(null);
  }, [selectedChallengeId]);

  const totalXP = solvedIds.reduce((sum, id) => {
    const ch = CHALLENGES.find((c) => c.id === id);
    return sum + (ch ? ch.xp : 0);
  }, 0);

  const currentLevel = Math.floor(totalXP / 250) + 1;
  const nextLevelXP = currentLevel * 250;
  const currentLevelProgress = totalXP % 250;

  const handleTestSolution = () => {
    setTestResult(null);
    const combinedCode = `${code}\n\n# --- Verification Suite ---\n${activeChallenge.testCheck}\n`;

    const { events, error } = executeIBP(combinedCode);

    if (error) {
      setTestResult({
        passed: false,
        message: `Runtime or Syntax Error:\n${error.format(combinedCode)}`,
      });
      return;
    }

    const failedChecks = events.filter((e) => e.type === 'check-failed');
    if (failedChecks.length > 0) {
      const fail = failedChecks[0] as any;
      setTestResult({
        passed: false,
        message: fail.message || 'Expect assertion failed.',
      });
      return;
    }

    // Success!
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setTestResult({
      passed: true,
      message: `🎉 Outstanding! Challenge passed. +${activeChallenge.xp} XP awarded!`,
    });

    if (!solvedIds.includes(activeChallenge.id)) {
      const updated = [...solvedIds, activeChallenge.id];
      setSolvedIds(updated);
      try {
        localStorage.setItem('ibp_solved_challenges', JSON.stringify(updated));
      } catch {}
    }
  };

  return (
    <div className="flex h-full bg-[#0B1120] text-slate-100 font-sans text-xs select-none">
      {/* 1. Left Challenges Sidebar */}
      <div className="w-72 bg-[#0E1526] border-r border-slate-800 flex flex-col">
        {/* User Stats Card */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                <Trophy size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">Level {currentLevel} Coder</div>
                <div className="text-[10px] text-slate-400">{totalXP} Total XP</div>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-semibold">
              {solvedIds.length}/{CHALLENGES.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${(currentLevelProgress / 250) * 100}%` }}
            />
          </div>
        </div>

        {/* Challenge list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {CHALLENGES.map((ch) => {
            const isSolved = solvedIds.includes(ch.id);
            const isSelected = selectedChallengeId === ch.id;

            return (
              <div
                key={ch.id}
                onClick={() => setSelectedChallengeId(ch.id)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                  isSelected
                    ? 'bg-sky-950/60 border border-sky-500 text-sky-200'
                    : 'bg-slate-900/30 border border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  {isSolved ? (
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Star size={14} className="text-slate-500 shrink-0" />
                  )}
                  <span className="truncate text-[11px] font-medium">{ch.title}</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                    ch.difficulty === 'Beginner'
                      ? 'bg-sky-500/10 text-sky-400'
                      : ch.difficulty === 'Easy'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : ch.difficulty === 'Medium'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  +{ch.xp} XP
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Challenge Details & Code Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B1120]">
        {/* Header Description */}
        <div className="p-4 bg-[#111827] border-b border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <span>{activeChallenge.title}</span>
              <span className="text-[10px] font-normal text-slate-400 px-2 py-0.5 bg-slate-800 rounded">
                {activeChallenge.category}
              </span>
            </h2>
            <button
              onClick={handleTestSolution}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow transition"
            >
              <Play size={13} fill="currentColor" />
              <span>Test Solution</span>
            </button>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">{activeChallenge.description}</p>
        </div>

        {/* Code Editor */}
        <div className="flex-1 relative">
          <Editor
            height="100%"
            language="ibp"
            theme="ibp-dark"
            beforeMount={configureMonaco}
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 13,
              fontFamily: "'Fira Code', monospace",
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
            }}
          />
        </div>

        {/* Test Result Bar */}
        {testResult && (
          <div
            className={`p-3 border-t font-mono text-xs flex items-start space-x-2 ${
              testResult.passed
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            {testResult.passed ? (
              <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="whitespace-pre-wrap">{testResult.message}</div>
          </div>
        )}
      </div>
    </div>
  );
};

