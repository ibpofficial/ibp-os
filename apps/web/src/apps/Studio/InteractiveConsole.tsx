import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Square,
  Copy,
  Check,
  Terminal as TerminalIcon,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { InputRequest } from '@ibp/vm';
import { ExecutionStatus } from '@ibp/engine';

export interface ConsoleLine {
  id: string;
  type: 'output' | 'input' | 'error' | 'system' | 'prompt';
  text: string;
  mode?: 'say' | 'shout' | 'whisper';
}

interface InteractiveConsoleProps {
  logs: ConsoleLine[];
  status: ExecutionStatus | 'waiting-for-input';
  durationMs?: number;
  inputRequest: InputRequest | null;
  onSendInput: (value: string) => void;
  onRun: () => void;
  onStop: () => void;
  onRestart: () => void;
  onClear: () => void;
  isRunning: boolean;
  isLight: boolean;
}

export const InteractiveConsole: React.FC<InteractiveConsoleProps> = ({
  logs,
  status,
  durationMs,
  inputRequest,
  onSendInput,
  onRun,
  onStop,
  onRestart,
  onClear,
  isRunning,
  isLight,
}) => {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll when logs change or input request arrives
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, inputRequest]);

  // Autofocus input when program asks for input
  useEffect(() => {
    if (inputRequest) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [inputRequest]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputRequest) return;

    const answer = inputText;
    setInputText('');
    setHistoryIdx(-1);
    if (answer.trim()) {
      setInputHistory((prev) => [...prev, answer]);
    }
    onSendInput(answer);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (inputHistory.length > 0) {
        const nextIdx = historyIdx < 0 ? inputHistory.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setInputText(inputHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx >= 0) {
        const nextIdx = historyIdx + 1;
        if (nextIdx >= inputHistory.length) {
          setHistoryIdx(-1);
          setInputText('');
        } else {
          setHistoryIdx(nextIdx);
          setInputText(inputHistory[nextIdx]);
        }
      }
    } else if (e.key === 'Escape') {
      onStop();
    }
  };

  const copyTranscript = () => {
    const text = logs.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>Running</span>
          </span>
        );
      case 'waiting-for-input':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Waiting for input</span>
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span>Paused</span>
          </span>
        );
      case 'stopped':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <span>Stopped</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Check size={11} />
            <span>Finished {durationMs !== undefined ? `(${durationMs} ms)` : ''}</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertCircle size={11} />
            <span>Error</span>
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <span>Idle</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full font-mono text-xs select-text">
      {/* Console Top Control Bar */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 border-b text-[11px] ${
          isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          <span className="text-slate-500 text-[10px]">
            {logs.length} line{logs.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {!isRunning ? (
            <button
              onClick={onRun}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-medium text-[11px] shadow transition"
              title="Run / Run again (Ctrl+Enter)"
            >
              <Play size={10} fill="currentColor" />
              <span>{logs.length > 0 ? 'Run again' : 'Run'}</span>
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-sans font-medium text-[11px] shadow transition"
              title="Stop (Esc)"
            >
              <Square size={10} fill="currentColor" />
              <span>Stop</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded transition ${
              isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Restart (clear state and run)"
          >
            <RotateCcw size={11} />
            <span className="font-sans">Restart</span>
          </button>

          <button
            onClick={onClear}
            className={`p-1 rounded transition ${
              isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Clear Console (Ctrl+L)"
          >
            <span className="font-sans text-[11px]">Clear</span>
          </button>

          <button
            onClick={copyTranscript}
            className={`flex items-center space-x-1 p-1 rounded transition ${
              isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Copy Transcript"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          </button>
        </div>
      </div>

      {/* Transcript Log Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {logs.length === 0 && !inputRequest ? (
          <div className="text-slate-500 italic p-2">
            No program output yet. Click "Run" or press Ctrl+Enter to execute.
          </div>
        ) : (
          logs.map((log) => {
            if (log.type === 'error') {
              return (
                <div key={log.id} className="text-rose-400 whitespace-pre-wrap py-0.5">
                  {log.text}
                </div>
              );
            }
            if (log.type === 'input') {
              return (
                <div key={log.id} className="text-sky-400 font-semibold py-0.5">
                  {log.text}
                </div>
              );
            }
            if (log.type === 'prompt') {
              return (
                <div key={log.id} className="text-amber-400 py-0.5">
                  {log.text}
                </div>
              );
            }
            if (log.mode === 'shout') {
              return (
                <div
                  key={log.id}
                  className="font-bold text-amber-300 bg-amber-500/10 px-1 py-0.5 rounded tracking-wide uppercase inline-block"
                >
                  {log.text}
                </div>
              );
            }
            if (log.mode === 'whisper') {
              return (
                <div key={log.id} className="italic text-slate-400 py-0.5">
                  {log.text}
                </div>
              );
            }
            return (
              <div
                key={log.id}
                className={isLight ? 'text-slate-800 py-0.5' : 'text-slate-200 py-0.5'}
              >
                {log.text}
              </div>
            );
          })
        )}

        {/* Inline Input Field when program hits `ask` */}
        {inputRequest && (
          <div className="flex items-center space-x-2 pt-1 pb-2 animate-in fade-in">
            <span className="text-sky-400 font-semibold select-none">
              {inputRequest.prompt || 'Input:'}
            </span>
            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  inputRequest.kind === 'number'
                    ? 'Enter a number (press Enter)...'
                    : 'Type answer and press Enter...'
                }
                className={`w-full px-2 py-1 rounded outline-none border transition font-mono text-xs ${
                  isLight
                    ? 'bg-white border-sky-400 text-slate-900 focus:ring-1 focus:ring-sky-500'
                    : 'bg-slate-950 border-sky-500/60 text-sky-100 focus:border-sky-400 focus:ring-1 focus:ring-sky-400'
                }`}
              />
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="ml-2 px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-sans font-medium shadow"
              >
                Send
              </button>
            </div>
            {inputRequest.kind === 'number' && (
              <span className="text-[10px] text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded">
                number expected
              </span>
            )}
          </div>
        )}

        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};

