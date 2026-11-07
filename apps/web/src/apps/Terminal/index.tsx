import React, { useState, useRef, useEffect } from 'react';
import { defaultVFS } from '@ibp/vfs';
import { executeIBP, IBP_TIPS, parse } from '@ibp/engine';
import confetti from 'canvas-confetti';

interface OutputLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  text: string;
}

export const TerminalApp: React.FC = () => {
  const [cwd, setCwd] = useState('IBP://USERS/guest/projects');
  const [history, setHistory] = useState<OutputLine[]>([
    { type: 'info', text: '🪐 IBP OS Virtual Terminal (v0.1.0)' },
    { type: 'info', text: 'Type "ibp help" or "help" for a list of available commands.\n' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isReplMode, setIsReplMode] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const line = inputValue.trim();
      setInputValue('');
      setHistoryIdx(-1);

      if (line.length > 0) {
        setCmdHistory((prev) => [...prev, line]);
      }

      setHistory((prev) => [
        ...prev,
        { type: 'input', text: `${isReplMode ? 'ibp>' : cwd + ' $'} ${line}` },
      ]);

      if (isReplMode) {
        if (line === 'exit' || line === 'quit') {
          setIsReplMode(false);
          setHistory((prev) => [...prev, { type: 'info', text: 'Exited IBP REPL.' }]);
          return;
        }

        try {
          const { errors } = parse(line);
          if (errors.length > 0) {
            setHistory((prev) => [...prev, { type: 'error', text: errors[0].format(line) }]);
          } else {
            const { output, error } = executeIBP(line, {
              onEvent: (ev) => {
                if (ev.type === 'celebrate') {
                  confetti({ particleCount: 60, spread: 50 });
                }
              },
            });
            output.forEach((out) => {
              setHistory((prev) => [...prev, { type: 'output', text: out }]);
            });
            if (error) {
              setHistory((prev) => [...prev, { type: 'error', text: error.format(line) }]);
            }
          }
        } catch (err: any) {
          setHistory((prev) => [...prev, { type: 'error', text: `REPL Error: ${err.message || err}` }]);
        }
        return;
      }

      try {
        await executeTerminalCommand(line);
      } catch (err: any) {
        setHistory((prev) => [...prev, { type: 'error', text: `Command error: ${err.message || err}` }]);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputValue(cmdHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= cmdHistory.length) {
        setHistoryIdx(-1);
        setInputValue('');
      } else {
        setHistoryIdx(nextIdx);
        setInputValue(cmdHistory[nextIdx]);
      }
    }
  };

  const executeTerminalCommand = async (line: string) => {
    const parts = line.split(' ').filter(Boolean);
    let cmd = parts[0] || '';
    if (cmd === 'ibp') {
      cmd = parts[1] || 'help';
      parts.shift();
    }

    switch (cmd.toLowerCase()) {
      case 'help':
        setHistory((prev) => [
          ...prev,
          {
            type: 'info',
            text: `Available Commands:
  ibp help              Show this help menu
  ibp version           Show engine & system version
  ibp run <file>        Execute an IBP source file
  ibp repl              Enter interactive REPL session
  ibp list              List files in current folder
  ibp create <name>     Create a new project starter
  ibp system            Show memory and process stats
  ibp memory            Display heap memory usage
  ibp tip               Display a helpful language tip
  ibp clear             Clear terminal screen
  cd <path>             Change directory
  pwd                   Print current working directory`,
          },
        ]);
        break;

      case 'version':
        setHistory((prev) => [...prev, { type: 'info', text: 'IBP OS & Engine v0.1.0' }]);
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'pwd':
        setHistory((prev) => [...prev, { type: 'output', text: cwd }]);
        break;

      case 'tip': {
        const t = IBP_TIPS[Math.floor(Math.random() * IBP_TIPS.length)];
        setHistory((prev) => [...prev, { type: 'success', text: `💡 IBP Tip: ${t}` }]);
        break;
      }

      case 'repl':
        setIsReplMode(true);
        setHistory((prev) => [
          ...prev,
          { type: 'info', text: 'Entering IBP Interactive REPL (v0.1.0). Type "exit" to leave.' },
        ]);
        break;

      case 'list':
      case 'ls': {
        const items = await defaultVFS.listFolder(cwd);
        if (items.length === 0) {
          setHistory((prev) => [...prev, { type: 'info', text: 'Folder is empty.' }]);
        } else {
          const listText = items
            .map((f) => (f.isFolder ? `📁 ${f.name}/` : `📄 ${f.name} (${f.size} B)`))
            .join('\n');
          setHistory((prev) => [...prev, { type: 'output', text: listText }]);
        }
        break;
      }

      case 'cd': {
        const target = parts[1] || 'IBP://USERS/guest/projects';
        const newPath = defaultVFS.normalizePath(target.startsWith('IBP://') ? target : `${cwd}/${target}`);
        if (await defaultVFS.exists(newPath)) {
          setCwd(newPath);
        } else {
          setHistory((prev) => [...prev, { type: 'error', text: `cd: directory not found: ${target}` }]);
        }
        break;
      }

      case 'create': {
        const name = parts[1] || 'my-project.ibp';
        const fullPath = `${cwd}/${name.endsWith('.ibp') ? name : name + '.ibp'}`;
        await defaultVFS.writeFile(fullPath, `# ${name}\nsay "Hello from ${name}!"\n`);
        setHistory((prev) => [...prev, { type: 'success', text: `✔ Created ${fullPath}` }]);
        break;
      }

      case 'run': {
        const file = parts[1];
        if (!file) {
          setHistory((prev) => [...prev, { type: 'error', text: 'Usage: ibp run <file.ibp>' }]);
          return;
        }
        const fullPath = defaultVFS.normalizePath(file.startsWith('IBP://') ? file : `${cwd}/${file}`);
        if (!(await defaultVFS.exists(fullPath))) {
          setHistory((prev) => [...prev, { type: 'error', text: `File not found: ${fullPath}` }]);
          return;
        }

        const content = await defaultVFS.readFile(fullPath);
        const { output, error } = executeIBP(content, {
          onEvent: (ev) => {
            if (ev.type === 'celebrate') {
              confetti({ particleCount: 70, spread: 60 });
            }
          },
        });

        output.forEach((line) => {
          setHistory((prev) => [...prev, { type: 'output', text: line }]);
        });

        if (error) {
          setHistory((prev) => [...prev, { type: 'error', text: error.format(content) }]);
        }
        break;
      }

      case 'system':
      case 'memory': {
        setHistory((prev) => [
          ...prev,
          {
            type: 'info',
            text: `System Architecture:
  Kernel: IBP Resumable Generator Virtual Machine
  Filesystem: IndexedDB Dexie Storage (IBP://)
  Virtual Clock: Active
  Heap Status: Healthy (Browser Sandboxed)`,
          },
        ]);
        break;
      }

      default:
        if (line.trim().length > 0) {
          setHistory((prev) => [
            ...prev,
            { type: 'error', text: `Unknown command "${cmd}". Run "ibp help" for available commands.` },
          ]);
        }
        break;
    }
  };

  return (
    <div
      className="h-full flex flex-col bg-[#0B1120] text-slate-100 font-mono text-xs p-3 overflow-hidden cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {history.map((h, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap ${
              h.type === 'input'
                ? 'text-sky-300 font-semibold'
                : h.type === 'error'
                ? 'text-rose-400'
                : h.type === 'success'
                ? 'text-emerald-400'
                : h.type === 'info'
                ? 'text-cyan-400'
                : 'text-slate-200'
            }`}
          >
            {h.text}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      <div className="flex items-center space-x-2 pt-2 border-t border-slate-800 shrink-0">
        <span className="text-sky-400 font-semibold select-none">
          {isReplMode ? 'ibp>' : `${defaultVFS.getBasename(cwd)} $`}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent text-slate-100 outline-none border-none font-mono text-xs"
        />
      </div>
    </div>
  );
};

