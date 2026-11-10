import React, { useState, useEffect, useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import {
  Play,
  Square,
  StepForward,
  Bug,
  Save,
  Wand2,
  FolderTree,
  Sliders,
  Terminal as TerminalIcon,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  FileText,
  Plus,
  Trash2,
  X,
  Minus,
  Maximize2,
  Minimize2,
  Monitor,
  Check,
  RotateCcw,
  Download,
  ScrollText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useVFSStore } from '../../stores/vfsStore';
import { useDesktopStore } from '../../stores/desktopStore';
import { configureMonaco, updateEditorMarkers } from '../../components/Editor/monacoConfig';
import { formatIBP, EngineEvent, IBPError } from '@ibp/engine';
import { IBPVirtualMachine, InputRequest } from '@ibp/vm';
import { InteractiveConsole, ConsoleLine } from './InteractiveConsole';
import { TerminalView } from '../../components/Terminal/TerminalView';

export const StudioApp: React.FC = () => {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const {
    openTabs,
    activeFilePath,
    openFile,
    closeTab,
    updateTabContent,
    saveActiveFile,
    createFile,
    deleteNode,
    files,
  } = useVFSStore();

  const { theme, openWindow } = useDesktopStore();
  const isLight = theme === 'light';

  const [activeBottomTab, setActiveBottomTab] = useState<
    'console' | 'terminal' | 'output' | 'errors' | 'tests' | 'todo' | 'logs'
  >('console');
  const [showExplorer, setShowExplorer] = useState(true);
  const [showInspector, setShowInspector] = useState(true);

  // Bottom terminal & dock controls
  const [isBottomOpen, setIsBottomOpen] = useState(true);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(230);
  const [desktopToast, setDesktopToast] = useState<string | null>(null);

  const isDraggingBottom = useRef(false);

  // Runtime state
  const [isRunning, setIsRunning] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<any>('idle');
  const [durationMs, setDurationMs] = useState<number | undefined>(undefined);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLine[]>([]);
  const [outputLogs, setOutputLogs] = useState<{ text: string; mode: string }[]>([]);
  const [errorsList, setErrorsList] = useState<IBPError[]>([]);
  const [testResults, setTestResults] = useState<{ label?: string; passed: boolean; message?: string }[]>([]);
  const [todoList, setTodoList] = useState<string[]>([]);
  const [eventLogs, setEventLogs] = useState<EngineEvent[]>([]);
  const [liveVariables, setLiveVariables] = useState<Record<string, { kind: string; value: string }>>({});
  const [currentInputRequest, setCurrentInputRequest] = useState<InputRequest | null>(null);

  const vmRef = useRef<IBPVirtualMachine | null>(null);
  const activeTab = openTabs.find((t) => t.path === activeFilePath);

  // Factory to create VM with web worker
  const createVM = () => {
    return new IBPVirtualMachine({
      workerFactory: () =>
        new Worker(new URL('../../workers/ibp.worker.ts', import.meta.url), { type: 'module' }),
    });
  };

  // Configure Monaco on mount
  useEffect(() => {
    if (monaco) {
      configureMonaco(monaco);
    }
  }, [monaco]);

  // Update error squiggles when code changes
  useEffect(() => {
    if (monaco && activeTab) {
      const model = monaco.editor.getModels()[0];
      if (model) {
        updateEditorMarkers(monaco, model, activeTab.content);
      }
    }
  }, [monaco, activeTab?.content]);

  // Execute Code
  const handleRun = async () => {
    if (!activeTab || isRunning) return;

    // Autosave current file before running
    await saveActiveFile();

    // Default to Console tab when running
    setActiveBottomTab('console');
    setIsBottomOpen(true);
    setIsBottomCollapsed(false);

    setIsRunning(true);
    setExecutionStatus('running');
    setConsoleLogs([]);
    setOutputLogs([]);
    setErrorsList([]);
    setTestResults([]);
    setTodoList([]);
    setEventLogs([]);
    setLiveVariables({});
    setCurrentInputRequest(null);

    const vm = createVM();
    vmRef.current = vm;

    const startTime = Date.now();

    const res = await vm.run({
      code: activeTab.content,
      onInputRequest: (req) => {
        setCurrentInputRequest(req);
        setExecutionStatus('waiting-for-input');
      },
      onStatusChange: (st) => {
        setExecutionStatus(st);
      },
      onOutput: (text, mode) => {
        setOutputLogs((prev) => [...prev, { text, mode }]);
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
      onEvent: (ev) => {
        setEventLogs((prev) => [...prev.slice(-100), ev]);
        if (ev.type === 'celebrate') {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        }
        if (ev.type === 'todo') {
          setTodoList((prev) => [...prev, ev.text]);
        }
        if (ev.type === 'check-passed') {
          setTestResults((prev) => [...prev, { label: ev.label, passed: true }]);
        }
        if (ev.type === 'check-failed') {
          setTestResults((prev) => [
            ...prev,
            { label: ev.label, passed: false, message: ev.message },
          ]);
        }
        if (ev.type === 'variable-changed') {
          let strVal = '';
          try {
            if (ev.newValue === null || ev.newValue === undefined) strVal = 'empty';
            else if (typeof ev.newValue === 'object') {
              if ('value' in ev.newValue) strVal = String(ev.newValue.value);
              else if (ev.newValue.kind === 'recipe') strVal = `<recipe ${ev.newValue.name || 'fn'}>`;
              else if (ev.newValue.kind === 'list')
                strVal = `[ ${(ev.newValue.elements || []).map((x: any) => x?.value ?? x?.kind).join(', ')} ]`;
              else if (ev.newValue.kind === 'box') {
                const keys =
                  ev.newValue.fields instanceof Map
                    ? Array.from(ev.newValue.fields.keys())
                    : Object.keys(ev.newValue.fields || {});
                strVal = `{ ${keys.join(', ')} }`;
              }
              else strVal = JSON.stringify(ev.newValue);
            } else {
              strVal = String(ev.newValue);
            }
          } catch {
            strVal = '[Complex Value]';
          }
          setLiveVariables((prev) => ({
            ...prev,
            [ev.name]: {
              kind: ev.newValue?.kind || typeof ev.newValue,
              value: strVal,
            },
          }));
        }
      },
      onError: (err) => {
        const rawErr = err as any;
        const safeErr =
          err instanceof IBPError
            ? err
            : new IBPError({
                kind: rawErr?.kind || 'RaisedError',
                message: rawErr?.message || String(rawErr),
                span: rawErr?.span,
                hint: rawErr?.hint,
              });
        setErrorsList((prev) => [...prev, safeErr]);
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: String(Date.now() + Math.random()),
            type: 'error',
            text:
              typeof safeErr.format === 'function'
                ? safeErr.format(activeTab.content)
                : safeErr.message || String(safeErr),
          },
        ]);
        setExecutionStatus('error');
      },
    });

    const elapsed = Date.now() - startTime;
    setDurationMs(elapsed);
    setIsRunning(false);
    setCurrentInputRequest(null);

    if (res.error) {
      const rawResErr = res.error as any;
      const safeErr =
        res.error instanceof IBPError
          ? res.error
          : new IBPError({
              kind: rawResErr?.kind || 'RaisedError',
              message: rawResErr?.message || String(rawResErr),
              span: rawResErr?.span,
              hint: rawResErr?.hint,
            });
      setErrorsList([safeErr]);
      setExecutionStatus('error');
    } else {
      setExecutionStatus('completed');
    }
  };

  const handleStop = () => {
    if (vmRef.current) {
      vmRef.current.stop();
    }
    setIsRunning(false);
    setCurrentInputRequest(null);
    setExecutionStatus('stopped');
  };

  const handleSendInput = (answer: string) => {
    if (vmRef.current && currentInputRequest) {
      vmRef.current.provideInput(currentInputRequest.id, answer);
      setCurrentInputRequest(null);
      setExecutionStatus('running');
    }
  };

  const handleRestart = async () => {
    handleStop();
    await new Promise((r) => setTimeout(r, 60));
    handleRun();
  };

  const handleClearConsole = () => {
    setConsoleLogs([]);
  };

  const handleFormat = () => {
    if (!activeTab) return;
    try {
      const formatted = formatIBP(activeTab.content);
      updateTabContent(activeTab.path, formatted);
    } catch {
      // gracefully ignore syntax errors during formatting
    }
  };

  const handleExport = () => {
    if (!activeTab) return;
    const blob = new Blob([activeTab.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab.name.endsWith('.ibp') ? activeTab.name : `${activeTab.name}.ibp`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunInTerminal = async () => {
    if (!activeTab) return;
    await saveActiveFile();
    openWindow('terminal', { initialCommand: `ibp run ${activeTab.path}` });
  };

  const handleStep = () => {
    if (vmRef.current) {
      vmRef.current.step();
    }
  };

  const handleCreateNewFile = async () => {
    const filename = prompt('Enter new file name (e.g. main.ibp):', 'script.ibp');
    if (!filename) return;
    const fullPath = `IBP://USERS/guest/projects/${filename}`;
    await createFile(fullPath, '# New IBP file\nsay "Hello IBP!"\n');
  };

  const handleSaveToDesktop = async () => {
    if (!activeTab) return;
    try {
      const filename = activeTab.name.endsWith('.ibp') ? activeTab.name : `${activeTab.name}.ibp`;
      const desktopPath = `IBP://USERS/guest/Desktop/${filename}`;
      await createFile(desktopPath, activeTab.content);
      setDesktopToast(`Saved "${filename}" directly to Desktop!`);
      setTimeout(() => setDesktopToast(null), 3500);
    } catch (err: any) {
      setDesktopToast(`Failed to save: ${err.message || err}`);
      setTimeout(() => setDesktopToast(null), 3500);
    }
  };

  const jumpToError = (err: IBPError) => {
    if (editorRef.current && err.span) {
      const line = err.span.start.line;
      const col = err.span.start.column;
      editorRef.current.revealPositionInCenter({ lineNumber: line, column: col });
      editorRef.current.setPosition({ lineNumber: line, column: col });
      editorRef.current.focus();
    }
  };

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingBottom.current = true;
    const startY = e.clientY;
    const startH = bottomHeight;

    const handleMouseMove = (moveEv: MouseEvent) => {
      if (!isDraggingBottom.current) return;
      const dy = startY - moveEv.clientY;
      setBottomHeight(Math.max(90, Math.min(550, startH + dy)));
    };

    const handleMouseUp = () => {
      isDraggingBottom.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Keyboard shortcuts (Ctrl+Enter to run, Ctrl+S to save, Esc to stop, Ctrl+L to clear)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveActiveFile();
      }
      if (e.key === 'Escape' && isRunning) {
        e.preventDefault();
        handleStop();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        handleClearConsole();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, isRunning]);

  return (
    <div
      className={`flex flex-col h-full overflow-hidden font-sans ${
        isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#0B1120] text-slate-100'
      }`}
    >
      {/* 1. Studio Visible Toolbar */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b select-none ${
          isLight ? 'bg-slate-200/90 border-slate-300' : 'bg-[#111827] border-slate-800'
        }`}
      >
        <div className="flex items-center space-x-1.5 flex-wrap">
          {!isRunning ? (
            <button
              onClick={handleRun}
              className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow transition"
              title="Run Code (Ctrl+Enter)"
            >
              <Play size={13} fill="currentColor" />
              <span>Run</span>
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center space-x-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold shadow transition"
              title="Stop Execution (Esc)"
            >
              <Square size={13} fill="currentColor" />
              <span>Stop</span>
            </button>
          )}

          <button
            onClick={handleRun}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition ${
              isLight
                ? 'bg-slate-100 hover:bg-white text-slate-700 border border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Debug Program"
          >
            <Bug size={13} className="text-amber-400" />
            <span>Debug</span>
          </button>

          <button
            onClick={handleStep}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition ${
              isLight
                ? 'bg-slate-100 hover:bg-white text-slate-700 border border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Step Next Statement"
          >
            <StepForward size={13} />
            <span>Step</span>
          </button>

          <button
            onClick={saveActiveFile}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition ${
              isLight
                ? 'bg-slate-100 hover:bg-white text-slate-700 border border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Save File (Ctrl+S)"
          >
            <Save size={13} />
            <span>Save</span>
          </button>

          <button
            onClick={handleFormat}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition ${
              isLight
                ? 'bg-slate-100 hover:bg-white text-slate-700 border border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Format Code"
          >
            <Wand2 size={13} />
            <span>Format</span>
          </button>

          <button
            onClick={handleExport}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition ${
              isLight
                ? 'bg-slate-100 hover:bg-white text-slate-700 border border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Export .ibp file"
          >
            <Download size={13} />
            <span>Export</span>
          </button>

          {/* Run in Terminal button */}
          <button
            onClick={handleRunInTerminal}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
              isLight
                ? 'bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300'
                : 'bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/30'
            }`}
            title="Open in Terminal and run"
          >
            <TerminalIcon size={13} />
            <span>Run in Terminal</span>
          </button>

          <button
            onClick={handleSaveToDesktop}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition ${
              isLight
                ? 'text-slate-600 hover:bg-slate-300/70'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
            title="Save Current File directly to OS Desktop"
          >
            <Monitor size={12} />
            <span>Desktop</span>
          </button>

          {desktopToast && (
            <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] animate-in fade-in">
              <Check size={12} />
              <span>{desktopToast}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              setIsBottomOpen(true);
              setIsBottomCollapsed(false);
            }}
            className={`p-1.5 rounded text-xs transition ${
              isBottomOpen && !isBottomCollapsed
                ? 'bg-sky-500/20 text-sky-400'
                : isLight
                ? 'text-slate-600 hover:bg-slate-300/80'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle Console & Dock"
          >
            <TerminalIcon size={15} />
          </button>
          <button
            onClick={() => setShowExplorer(!showExplorer)}
            className={`p-1.5 rounded text-xs transition ${
              showExplorer
                ? 'bg-sky-500/20 text-sky-400'
                : isLight
                ? 'text-slate-600 hover:bg-slate-300/80'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle File Explorer"
          >
            <FolderTree size={15} />
          </button>
          <button
            onClick={() => setShowInspector(!showInspector)}
            className={`p-1.5 rounded text-xs transition ${
              showInspector
                ? 'bg-sky-500/20 text-sky-400'
                : isLight
                ? 'text-slate-600 hover:bg-slate-300/80'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle Variables Inspector"
          >
            <Sliders size={15} />
          </button>
        </div>
      </div>

      {/* 2. Main Middle Area (Explorer + Editor + Inspector) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Explorer Sidebar */}
        {showExplorer && (
          <div
            className={`w-56 border-r flex flex-col ${
              isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#0E1526] border-slate-800'
            }`}
          >
            <div
              className={`flex items-center justify-between px-3 py-2 border-b text-xs font-semibold ${
                isLight ? 'border-slate-300 text-slate-700' : 'border-slate-800 text-slate-300'
              }`}
            >
              <span>PROJECT EXPLORER</span>
              <button
                onClick={handleCreateNewFile}
                className="p-1 hover:bg-slate-700/30 rounded text-sky-400"
                title="Create New File"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {files
                .filter((f) => !f.isFolder)
                .map((file) => (
                  <div
                    key={file.path}
                    onClick={() => openFile(file.path)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer group ${
                      activeFilePath === file.path
                        ? isLight
                          ? 'bg-sky-100 text-sky-900 font-medium'
                          : 'bg-sky-900/40 text-sky-300 font-medium'
                        : isLight
                        ? 'text-slate-700 hover:bg-slate-200'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText size={14} className="text-sky-500 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete ${file.name}?`)) deleteNode(file.path);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className={`flex-1 flex flex-col min-w-0 ${isLight ? 'bg-white' : 'bg-[#0B1120]'}`}>
          {/* Editor Tabs Bar */}
          <div
            className={`flex items-center border-b overflow-x-auto ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#111827] border-slate-800'
            }`}
          >
            {openTabs.map((tab) => (
              <div
                key={tab.path}
                onClick={() => openFile(tab.path)}
                className={`flex items-center space-x-2 px-3 py-2 border-r text-xs cursor-pointer select-none transition ${
                  isLight ? 'border-slate-300' : 'border-slate-800'
                } ${
                  activeFilePath === tab.path
                    ? isLight
                      ? 'bg-white text-sky-600 border-t-2 border-t-sky-500 font-medium'
                      : 'bg-[#0B1120] text-sky-400 border-t-2 border-t-sky-400'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-200'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span>{tab.name}</span>
                {tab.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.path);
                  }}
                  className="hover:text-rose-400 p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative">
            {activeTab ? (
              <Editor
                height="100%"
                language="ibp"
                theme={isLight ? 'ibp-light' : 'ibp-dark'}
                beforeMount={configureMonaco}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
                value={activeTab.content}
                onChange={(val) => updateTabContent(activeTab.path, val || '')}
                options={{
                  fontSize: 13,
                  fontFamily: "'Fira Code', monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  lineNumbersMinChars: 3,
                  tabSize: 2,
                  insertSpaces: true,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                No file open. Select a file from the explorer or create one.
              </div>
            )}
          </div>
        </div>

        {/* Inspector Panel */}
        {showInspector && (
          <div
            className={`w-64 border-l flex flex-col text-xs ${
              isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#0E1526] border-slate-800'
            }`}
          >
            <div
              className={`px-3 py-2 border-b font-semibold ${
                isLight ? 'border-slate-300 text-slate-700' : 'border-slate-800 text-slate-300'
              }`}
            >
              MEMORY & VARIABLES
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {Object.keys(liveVariables).length === 0 ? (
                <div className="text-slate-500 italic p-2">No active variables</div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(liveVariables).map(([name, info]) => (
                    <div
                      key={name}
                      className={`p-2 rounded border ${
                        isLight
                          ? 'bg-white border-slate-200 shadow-sm'
                          : 'bg-slate-800/60 border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-mono font-semibold ${
                            isLight ? 'text-sky-700' : 'text-sky-300'
                          }`}
                        >
                          {name}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] ${
                            isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {info.kind}
                        </span>
                      </div>
                      <div
                        className={`font-mono text-[11px] truncate ${
                          isLight ? 'text-slate-800' : 'text-slate-200'
                        }`}
                      >
                        {info.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Panel (Resizable, Minimizable & Closable Dock) */}
      {!isBottomOpen ? (
        <div
          className={`h-6 flex items-center justify-between px-3 border-t text-[11px] select-none ${
            isLight
              ? 'bg-slate-200 border-slate-300 text-slate-600'
              : 'bg-[#0E1526] border-slate-800 text-slate-400'
          }`}
        >
          <span>Bottom dock is closed</span>
          <button
            onClick={() => {
              setIsBottomOpen(true);
              setIsBottomCollapsed(false);
            }}
            className="text-sky-400 hover:underline flex items-center space-x-1 font-semibold"
          >
            <Plus size={12} />
            <span>Open Console / Dock</span>
          </button>
        </div>
      ) : isBottomCollapsed ? (
        <div
          className={`h-7 flex items-center justify-between px-3 border-t text-xs select-none ${
            isLight
              ? 'bg-slate-200 border-slate-300 text-slate-700'
              : 'bg-[#0E1526] border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <TerminalIcon size={13} className="text-sky-400" />
            <span className="font-semibold text-[11px]">Console & Dock (Minimized)</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsBottomCollapsed(false)}
              className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
              title="Restore Dock"
            >
              <Maximize2 size={12} />
            </button>
            <button
              onClick={() => setIsBottomOpen(false)}
              className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-rose-400"
              title="Close Dock"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{ height: `${bottomHeight}px` }}
          className={`border-t flex flex-col ${
            isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#0E1526] border-slate-800'
          }`}
        >
          {/* Resizable Drag Handle */}
          <div
            onMouseDown={handleMouseDownResize}
            className="h-1.5 w-full bg-slate-700/40 hover:bg-sky-500 cursor-row-resize transition-colors"
            title="Drag to resize height"
          />

          {/* Bottom Tab Headers + Controls */}
          <div
            className={`flex items-center justify-between border-b px-2 ${
              isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-[#111827] border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-1">
              {/* Primary Console Tab */}
              <button
                onClick={() => setActiveBottomTab('console')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 transition ${
                  activeBottomTab === 'console'
                    ? 'border-sky-400 text-sky-500 bg-sky-500/10'
                    : isLight
                    ? 'border-transparent text-slate-600 hover:text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <TerminalIcon size={13} />
                <span>Console</span>
              </button>

              {/* Embedded Terminal Tab */}
              <button
                onClick={() => setActiveBottomTab('terminal')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 transition ${
                  activeBottomTab === 'terminal'
                    ? 'border-sky-400 text-sky-500 bg-sky-500/10'
                    : isLight
                    ? 'border-transparent text-slate-600 hover:text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <TerminalIcon size={13} />
                <span>Terminal</span>
              </button>

              <button
                onClick={() => setActiveBottomTab('output')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium border-b-2 transition ${
                  activeBottomTab === 'output'
                    ? 'border-sky-400 text-sky-500 bg-sky-500/10'
                    : isLight
                    ? 'border-transparent text-slate-600 hover:text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ScrollText size={13} />
                <span>Output ({outputLogs.length})</span>
              </button>

              <button
                onClick={() => setActiveBottomTab('errors')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium border-b-2 transition ${
                  activeBottomTab === 'errors'
                    ? 'border-rose-400 text-rose-500 bg-rose-500/10'
                    : isLight
                    ? 'border-transparent text-slate-600 hover:text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertCircle size={13} />
                <span>Errors ({errorsList.length})</span>
              </button>

              <button
                onClick={() => setActiveBottomTab('tests')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium border-b-2 transition ${
                  activeBottomTab === 'tests'
                    ? 'border-emerald-400 text-emerald-500 bg-emerald-500/10'
                    : isLight
                    ? 'border-transparent text-slate-600 hover:text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 size={13} />
                <span>Checks ({testResults.length})</span>
              </button>

              <button
                onClick={() => setActiveBottomTab('todo')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium border-b-2 transition ${
                  activeBottomTab === 'todo'
                    ? 'border-amber-400 text-amber-500 bg-amber-500/10'
                    : isLight
                    ? 'border-transparent text-slate-600 hover:text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListTodo size={13} />
                <span>Todos ({todoList.length})</span>
              </button>
            </div>

            {/* Right dock controls: Minimize, Close */}
            <div className="flex items-center space-x-1 py-1">
              <button
                onClick={() => setIsBottomCollapsed(true)}
                className={`p-1 rounded text-xs transition ${
                  isLight
                    ? 'text-slate-600 hover:bg-slate-300'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title="Minimize Dock"
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() => setIsBottomOpen(false)}
                className={`p-1 rounded text-xs transition ${
                  isLight
                    ? 'text-slate-600 hover:bg-slate-300 hover:text-rose-600'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-rose-400'
                }`}
                title="Close Dock"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Bottom Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activeBottomTab === 'console' && (
              <InteractiveConsole
                logs={consoleLogs}
                status={executionStatus}
                durationMs={durationMs}
                inputRequest={currentInputRequest}
                onSendInput={handleSendInput}
                onRun={handleRun}
                onStop={handleStop}
                onRestart={handleRestart}
                onClear={handleClearConsole}
                isRunning={isRunning}
                isLight={isLight}
              />
            )}

            {activeBottomTab === 'terminal' && (
              <div className="h-full overflow-hidden">
                <TerminalView compact initialCwd="IBP://USERS/guest/projects" />
              </div>
            )}

            {activeBottomTab === 'output' && (
              <div className="h-full overflow-y-auto p-3 font-mono text-xs">
                {outputLogs.length === 0 ? (
                  <div className="text-slate-500 italic">No output yet.</div>
                ) : (
                  <div className="space-y-1">
                    {outputLogs.map((log, i) => (
                      <div key={i} className={isLight ? 'text-slate-800' : 'text-slate-200'}>
                        {log.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeBottomTab === 'errors' && (
              <div className="h-full overflow-y-auto p-3 font-mono text-xs">
                {errorsList.length === 0 ? (
                  <div className="text-slate-500 italic">No errors detected.</div>
                ) : (
                  <div className="space-y-2">
                    {errorsList.map((err, i) => (
                      <div
                        key={i}
                        onClick={() => jumpToError(err)}
                        className="cursor-pointer p-2 rounded bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 transition group"
                        title="Click to jump to line in editor"
                      >
                        <pre className="text-rose-400 whitespace-pre-wrap font-mono text-xs">
                          {typeof err?.format === 'function'
                            ? err.format(activeTab?.content)
                            : err?.message || String(err)}
                        </pre>
                        {err.span && (
                          <div className="mt-1 text-[11px] text-sky-400 opacity-80 group-hover:opacity-100 flex items-center space-x-1">
                            <span>Jump to line {err.span.start.line}, column {err.span.start.column} &rarr;</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeBottomTab === 'tests' && (
              <div className="h-full overflow-y-auto p-3 font-mono text-xs">
                {testResults.length === 0 ? (
                  <div className="text-slate-500 italic">
                    No expect checks found. Use `expect a is b` in your code.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {testResults.map((t, i) => (
                      <div
                        key={i}
                        className={`flex items-center space-x-2 ${
                          t.passed ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {t.passed ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        <span>
                          {t.label || `Check #${i + 1}`}: {t.passed ? 'PASSED' : t.message || 'FAILED'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeBottomTab === 'todo' && (
              <div className="h-full overflow-y-auto p-3 font-mono text-xs">
                {todoList.length === 0 ? (
                  <div className="text-slate-500 italic">
                    No todo statements found. Use `todo "description"` in your code.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {todoList.map((td, i) => (
                      <div key={i} className="text-amber-500 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{td}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
