import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Trophy, CheckCircle, AlertCircle, Play, Square, Star, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CHALLENGES, Challenge } from './challenges';
import { configureMonaco } from '../../components/Editor/monacoConfig';
import { IBPVirtualMachine, InputRequest } from '@ibp/vm';
import { ExecutionStatus, IBPError } from '@ibp/engine';
import { InteractiveConsole, ConsoleLine } from '../Studio/InteractiveConsole';

export const PlaygroundApp: React.FC = () => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(CHALLENGES[0].id);
  const [code, setCode] = useState<string>(CHALLENGES[0].starterCode);
  const [showHint, setShowHint] = useState(false);
  const [solvedIds, setSolvedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('ibp_solved_challenges');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [testResult, setTestResult] = useState<{ passed: boolean; message: string } | null>(null);

  // Runtime State for Worker VM and Interactive Console
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLine[]>([]);
  const [runStatus, setRunStatus] = useState<ExecutionStatus | 'waiting-for-input'>('idle');
  const [durationMs, setDurationMs] = useState<number | undefined>(undefined);
  const [inputRequest, setInputRequest] = useState<InputRequest | null>(null);

  const vmRef = useRef<IBPVirtualMachine | null>(null);
  const activeChallenge = CHALLENGES.find((c) => c.id === selectedChallengeId) || CHALLENGES[0];

  useEffect(() => {
    setCode(activeChallenge.starterCode);
    setTestResult(null);
    setShowHint(false);
    setConsoleLogs([]);
    setRunStatus('idle');
    setInputRequest(null);
    if (vmRef.current) {
      vmRef.current.stop();
    }
  }, [selectedChallengeId]);

  useEffect(() => {
    return () => {
      if (vmRef.current) {
        vmRef.current.stop();
      }
    };
  }, []);

  const totalXP = solvedIds.reduce((sum, id) => {
    const ch = CHALLENGES.find((c) => c.id === id);
    return sum + (ch ? ch.xp : 0);
  }, 0);

  const currentLevel = Math.floor(totalXP / 250) + 1;
  const currentLevelProgress = totalXP % 250;

  const createVM = () => {
    return new IBPVirtualMachine({
      workerFactory: () =>
        new Worker(new URL('../../workers/ibp.worker.ts', import.meta.url), { type: 'module' }),
    });
  };

  const handleRun = useCallback(async () => {
    if (vmRef.current) {
      vmRef.current.stop();
    }

    setConsoleLogs([]);
    setRunStatus('running');
    setDurationMs(undefined);
    setInputRequest(null);
    setTestResult(null);

    const vm = createVM();
    vmRef.current = vm;

    const startTime = Date.now();

    const res = await vm.run({
      code,
      onInputRequest: (req: InputRequest) => {
        setInputRequest(req);
        setRunStatus('waiting-for-input');
      },
      onStatusChange: (status: ExecutionStatus) => {
        setRunStatus(status);
      },
      onOutput: (text: string, mode: any) => {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: String(Date.now() + Math.random()),
            type: 'output',
            text,
            mode,
          },
        ]);
      },
      onEvent: (ev: any) => {
        if (ev.type === 'celebrate') {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        }
      },
    });

    const elapsed = Date.now() - startTime;
    setDurationMs(elapsed);
    setInputRequest(null);

    if (res.error) {
      setRunStatus('error');
      const safeErr =
        res.error instanceof IBPError
          ? res.error
          : new IBPError({
              kind: (res.error as any)?.kind || 'RaisedError',
              message: (res.error as any)?.message || String(res.error),
              span: (res.error as any)?.span,
              hint: (res.error as any)?.hint,
            });
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: String(Date.now() + Math.random()),
          type: 'error',
          text: typeof safeErr.format === 'function' ? safeErr.format(code) : safeErr.message || String(safeErr),
        },
      ]);
    } else {
      setRunStatus('completed');
    }
  }, [code]);

  const handleStop = useCallback(() => {
    if (vmRef.current) {
      vmRef.current.stop();
      setRunStatus('stopped');
      setInputRequest(null);
    }
  }, []);

  const handleConsoleInput = useCallback((value: string) => {
    if (!inputRequest || !vmRef.current) return;

    setConsoleLogs((prev) => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        type: 'input',
        text: `${inputRequest.prompt} ${value}`,
      },
    ]);

    vmRef.current.provideInput(value);
    setInputRequest(null);
    setRunStatus('running');
  }, [inputRequest]);

  const handleTestSolution = useCallback(async () => {
    if (vmRef.current) {
      vmRef.current.stop();
    }

    setConsoleLogs([]);
    setTestResult(null);
    setRunStatus('running');
    setDurationMs(undefined);
    setInputRequest(null);

    const combinedCode = `${code}\n\n# --- Verification Suite ---\n${activeChallenge.testCheck}\n`;
    const vm = createVM();
    vmRef.current = vm;

    const startTime = Date.now();
    let hasFailedCheck = false;
    let failedCheckMessage = '';

    const res = await vm.run({
      code: combinedCode,
      scriptedInput: activeChallenge.scriptedInput,
      onInputRequest: (req: InputRequest) => {
        setInputRequest(req);
        setRunStatus('waiting-for-input');
      },
      onStatusChange: (status: ExecutionStatus) => {
        setRunStatus(status);
      },
      onOutput: (text: string, mode: any) => {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: String(Date.now() + Math.random()),
            type: 'output',
            text,
            mode,
          },
        ]);
      },
      onEvent: (ev: any) => {
        if (ev.type === 'check-failed') {
          hasFailedCheck = true;
          failedCheckMessage = ev.message || 'Expect assertion failed.';
        }
      },
    });

    const elapsed = Date.now() - startTime;
    setDurationMs(elapsed);
    setInputRequest(null);

    if (res.error) {
      setRunStatus('error');
      const safeErr =
        res.error instanceof IBPError
          ? res.error
          : new IBPError({
              kind: (res.error as any)?.kind || 'RaisedError',
              message: (res.error as any)?.message || String(res.error),
              span: (res.error as any)?.span,
              hint: (res.error as any)?.hint,
            });
      const formatted =
        typeof safeErr.format === 'function' ? safeErr.format(combinedCode) : safeErr.message || String(safeErr);
      const msg = `Runtime or Syntax Error:\n${formatted}`;
      setTestResult({ passed: false, message: msg });
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: String(Date.now() + Math.random()),
          type: 'error',
          text: msg,
        },
      ]);
      return;
    }

    if (hasFailedCheck) {
      setRunStatus('error');
      setTestResult({ passed: false, message: failedCheckMessage });
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: String(Date.now() + Math.random()),
          type: 'error',
          text: `Check failed: ${failedCheckMessage}`,
        },
      ]);
      return;
    }

    // Success!
    setRunStatus('completed');
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
  }, [code, activeChallenge, solvedIds]);

  return (
    <div className="flex h-full bg-[#0B1120] text-slate-100 font-sans text-xs select-none">
      {/* 1. Left Challenges Sidebar */}
      <div className="w-64 bg-[#0E1526] border-r border-slate-800 flex flex-col shrink-0">
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
                  +{ch.xp}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Challenge Details, Editor & Interactive Console */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B1120]">
        {/* Header Description & Actions */}
        <div className="p-3 bg-[#111827] border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-sm font-bold text-slate-100 truncate">{activeChallenge.title}</h2>
              <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 bg-slate-800 rounded">
                {activeChallenge.category}
              </span>
              <button
                onClick={() => setShowHint((h) => !h)}
                className="text-[10px] text-amber-400/90 hover:text-amber-300 flex items-center space-x-1 ml-2"
                title="Toggle Hint"
              >
                <HelpCircle size={12} />
                <span>Hint</span>
              </button>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed truncate">{activeChallenge.description}</p>
            {showHint && (
              <div className="mt-1 text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-500/30 px-2 py-1 rounded">
                💡 {activeChallenge.hint}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {runStatus === 'running' || runStatus === 'waiting-for-input' ? (
              <button
                onClick={handleStop}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold shadow transition"
              >
                <Square size={13} fill="currentColor" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={handleRun}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold shadow transition"
              >
                <Play size={13} fill="currentColor" />
                <span>Run</span>
              </button>
            )}

            <button
              onClick={handleTestSolution}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow transition"
            >
              <CheckCircle size={13} />
              <span>Test Solution</span>
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 relative min-h-[160px]">
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

        {/* Test Result Banner */}
        {testResult && (
          <div
            className={`p-2.5 border-t font-mono text-xs flex items-start space-x-2 ${
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

        {/* Bottom Interactive Console */}
        <div className="h-56 border-t border-slate-800 flex flex-col min-w-0">
          <InteractiveConsole
            logs={consoleLogs}
            status={runStatus}
            inputRequest={inputRequest}
            durationMs={durationMs}
            onSendInput={handleConsoleInput}
            onRun={handleRun}
            onStop={handleStop}
            onRestart={handleRun}
            onClear={() => setConsoleLogs([])}
            isRunning={runStatus === 'running' || runStatus === 'waiting-for-input'}
            isLight={false}
          />
        </div>
      </div>
    </div>
  );
};
