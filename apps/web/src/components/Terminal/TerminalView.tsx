import React, { useState, useRef, useEffect } from 'react';
import { defaultVFS } from '@ibp/vfs';
import {
  executeIBP,
  formatIBP,
  parse,
  findClosest,
  IBP_TIPS,
  IBPSession,
  EngineEvent,
  IBPError,
  valueToString,
} from '@ibp/engine';
import { IBPVirtualMachine, InputRequest } from '@ibp/vm';
import { useDesktopStore } from '../../stores/desktopStore';
import { useVFSStore } from '../../stores/vfsStore';
import confetti from 'canvas-confetti';

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info' | 'prompt';
  text: string;
}

export interface TerminalViewProps {
  initialCwd?: string;
  initialCommand?: string;
  compact?: boolean;
}

const KNOWN_COMMANDS = [
  'ibp',
  'ibp run',
  'ibp repl',
  'ibp check',
  'ibp test',
  'ibp fmt',
  'ibp new',
  'ibp create',
  'ibp tip',
  'ibp help',
  'ibp version',
  'ibp system',
  'ibp memory',
  'ls',
  'dir',
  'cd',
  'pwd',
  'cat',
  'type',
  'mkdir',
  'md',
  'touch',
  'rm',
  'del',
  'mv',
  'cp',
  'edit',
  'open',
  'clear',
  'cls',
  'help',
  'echo',
];

const TEMPLATES: Record<string, string> = {
  hello: `# Hello World
keep name = "Explorer"
say "Hello, {name}!"
celebrate
`,
  calculator: `# Calculator Example
recipe add(a, b) => a + b
recipe subtract(a, b) => a - b
recipe multiply(a, b) => a * b
recipe divide(a, b) {
  when b is 0 { raise "Cannot divide by zero" }
  give a / b
}

ask "Operator (+, -, *, /) or quit:" into op
when op is "quit" {
  say "Goodbye!"
} otherwise {
  ask number "First number:" into a
  ask number "Second number:" into b
  say "Result: {add(a, b)}"
}
`,
  game: `# Number Guessing Game
keep secret = luck(1, 100)
say "I'm thinking of a number between 1 and 100."
keep attempts = 0

forever {
  ask number "Your guess:" into guess
  attempts = attempts + 1
  when guess is secret {
    say "🎉 You got it in {attempts} tries!"
    celebrate
    stop
  } orwhen guess < secret {
    say "Higher!"
  } otherwise {
    say "Lower!"
  }
}
`,
};

const formatError = (err: any, src: string): string => {
  if (err && typeof err.format === 'function') {
    return err.format(src);
  }
  return err?.message || String(err);
};

export const TerminalView: React.FC<TerminalViewProps> = ({
  initialCwd = 'IBP://USERS/guest/projects',
  initialCommand,
  compact = false,
}) => {
  const { theme, openWindow } = useDesktopStore();
  const isLight = theme === 'light';
  const { activeFilePath, openFile, refreshFiles } = useVFSStore();

  const [cwd, setCwd] = useState(initialCwd);
  const [outputLines, setOutputLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'info',
      text: 'IBP Interactive Terminal & Shell [v0.1.0]',
    },
    {
      id: 'init-2',
      type: 'info',
      text: 'Type "ibp help" or "ls" to explore. Real worker execution active.\n',
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ibp_terminal_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historyIdx, setHistoryIdx] = useState(-1);

  // REPL State
  const [isReplMode, setIsReplMode] = useState(false);
  const [replBuffer, setReplBuffer] = useState('');
  const sessionRef = useRef<IBPSession | null>(null);

  // Active Running Program State
  const [isRunningProgram, setIsRunningProgram] = useState(false);
  const [waitingInputRequest, setWaitingInputRequest] = useState<InputRequest | null>(null);
  const activeVMRef = useRef<IBPVirtualMachine | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputLines, waitingInputRequest]);

  // Execute initial command if provided
  useEffect(() => {
    if (initialCommand) {
      handleCommandLine(initialCommand);
    }
  }, [initialCommand]);

  const saveHistory = (newCmd: string) => {
    if (!newCmd.trim()) return;
    setHistory((prev) => {
      const updated = [...prev.filter((c) => c !== newCmd), newCmd].slice(-100);
      try {
        localStorage.setItem('ibp_terminal_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const addLine = (type: TerminalLine['type'], text: string) => {
    setOutputLines((prev) => [
      ...prev,
      { id: String(Date.now() + Math.random()), type, text },
    ]);
  };

  const toWinPath = (path: string): string => {
    return path
      .replace(/^IBP:\/\/USERS\/guest\//i, 'C:\\Users\\guest\\')
      .replace(/^IBP:\/\/USERS\//i, 'C:\\Users\\')
      .replace(/^IBP:\/\//i, 'C:\\')
      .replace(/\//g, '\\');
  };

  const fromWinPath = (path: string): string => {
    let p = path.trim();
    if (p.startsWith('C:\\Users\\guest')) {
      return p.replace('C:\\Users\\guest', 'IBP://USERS/guest').replace(/\\/g, '/');
    }
    if (p.startsWith('C:\\')) {
      return p.replace('C:\\', 'IBP://').replace(/\\/g, '/');
    }
    return defaultVFS.normalizePath(`${cwd}/${p.replace(/\\/g, '/')}`);
  };

  const handleCommandLine = async (rawLine: string) => {
    const line = rawLine.trim();

    // If waiting for program input (`ask`):
    if (waitingInputRequest && activeVMRef.current) {
      addLine('input', `${waitingInputRequest.prompt || '>'} ${rawLine}`);
      const req = waitingInputRequest;
      setWaitingInputRequest(null);
      activeVMRef.current.provideInput(req.id, rawLine);
      return;
    }

    // In REPL Mode
    if (isReplMode) {
      addLine('input', `${replBuffer ? '...>' : 'ibp>'} ${rawLine}`);
      saveHistory(rawLine);
      await handleReplLine(rawLine);
      return;
    }

    const promptText = compact ? `${cwd}>` : `PS ${toWinPath(cwd)}>`;
    addLine('input', `${promptText} ${rawLine}`);
    saveHistory(rawLine);

    if (!line) return;

    // Redirection: echo ... > file
    if (line.includes('>')) {
      const [left, right] = line.split('>');
      const targetFileName = right.trim();
      let textToEcho = left.replace(/^echo\s+/i, '').trim();
      if (textToEcho.startsWith('"') && textToEcho.endsWith('"')) {
        textToEcho = textToEcho.slice(1, -1);
      }
      const fullPath = fromWinPath(targetFileName);
      await defaultVFS.writeFile(fullPath, textToEcho + '\n');
      await refreshFiles();
      addLine('success', `✔ Wrote to ${targetFileName}`);
      return;
    }

    const parts = line.split(/\s+/).filter(Boolean);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'clear':
      case 'cls':
        setOutputLines([]);
        break;

      case 'pwd':
        addLine('output', cwd);
        break;

      case 'ls':
      case 'dir': {
        const items = await defaultVFS.listFolder(cwd);
        if (items.length === 0) {
          addLine('info', 'Folder is empty.');
        } else {
          const listText = items
            .map((f) => (f.isFolder ? `📁 ${f.name}/` : `📄 ${f.name.padEnd(20)} ${f.size} B`))
            .join('\n');
          addLine('output', listText);
        }
        break;
      }

      case 'cd': {
        const target = args[0];
        if (!target || target === '.') {
          addLine('output', cwd);
          return;
        }
        if (target === '..') {
          const parent = defaultVFS.getParentPath(cwd);
          if (parent) setCwd(parent);
          return;
        }
        if (target === '/' || target === '\\') {
          setCwd('IBP://USERS/guest');
          return;
        }
        const full = fromWinPath(target);
        if (await defaultVFS.exists(full)) {
          setCwd(full);
        } else {
          addLine('error', `cd: no such file or directory: ${target}`);
        }
        break;
      }

      case 'cat':
      case 'type': {
        const target = args[0];
        if (!target) {
          addLine('error', 'Usage: cat <file>');
          return;
        }
        const full = fromWinPath(target);
        if (await defaultVFS.exists(full)) {
          const content = await defaultVFS.readFile(full);
          addLine('output', content);
        } else {
          addLine('error', `File not found: ${target}`);
        }
        break;
      }

      case 'touch': {
        const target = args[0];
        if (!target) {
          addLine('error', 'Usage: touch <file>');
          return;
        }
        const full = fromWinPath(target);
        await defaultVFS.writeFile(full, '');
        await refreshFiles();
        addLine('success', `✔ Created ${target}`);
        break;
      }

      case 'mkdir':
      case 'md': {
        const target = args[0];
        if (!target) {
          addLine('error', 'Usage: mkdir <folder>');
          return;
        }
        const full = fromWinPath(target);
        await defaultVFS.createFolder(full);
        await refreshFiles();
        addLine('success', `✔ Directory created: ${target}`);
        break;
      }

      case 'rm':
      case 'del': {
        const target = args[0];
        if (!target) {
          addLine('error', 'Usage: rm <file>');
          return;
        }
        const full = fromWinPath(target);
        if (await defaultVFS.exists(full)) {
          await defaultVFS.deleteFile(full);
          await refreshFiles();
          addLine('success', `✔ Deleted: ${target}`);
        } else {
          addLine('error', `File not found: ${target}`);
        }
        break;
      }

      case 'mv': {
        const [src, dest] = args;
        if (!src || !dest) {
          addLine('error', 'Usage: mv <source> <dest>');
          return;
        }
        const srcPath = fromWinPath(src);
        const destPath = fromWinPath(dest);
        if (!(await defaultVFS.exists(srcPath))) {
          addLine('error', `Source not found: ${src}`);
          return;
        }
        const content = await defaultVFS.readFile(srcPath);
        await defaultVFS.writeFile(destPath, content);
        await defaultVFS.deleteFile(srcPath);
        await refreshFiles();
        addLine('success', `✔ Moved ${src} -> ${dest}`);
        break;
      }

      case 'cp': {
        const [src, dest] = args;
        if (!src || !dest) {
          addLine('error', 'Usage: cp <source> <dest>');
          return;
        }
        const srcPath = fromWinPath(src);
        const destPath = fromWinPath(dest);
        if (!(await defaultVFS.exists(srcPath))) {
          addLine('error', `Source not found: ${src}`);
          return;
        }
        const content = await defaultVFS.readFile(srcPath);
        await defaultVFS.writeFile(destPath, content);
        await refreshFiles();
        addLine('success', `✔ Copied ${src} -> ${dest}`);
        break;
      }

      case 'edit':
      case 'open': {
        const target = args[0];
        if (!target) {
          addLine('error', 'Usage: edit <file>');
          return;
        }
        const full = fromWinPath(target);
        if (await defaultVFS.exists(full)) {
          await openFile(full);
          openWindow('studio');
          addLine('success', `Opened ${target} in IBP Studio.`);
        } else {
          addLine('error', `File not found: ${target}`);
        }
        break;
      }

      case 'echo': {
        addLine('output', args.join(' '));
        break;
      }

      // --- IBP Commands ---
      case 'ibp': {
        await handleIbpSubcommand(args);
        break;
      }

      case 'help': {
        addLine(
          'info',
          `Available Commands:
  ibp run <file>       Run program interactively in Web Worker
  ibp repl             Launch persistent interactive REPL
  ibp check <file>     Parse only and report syntax errors
  ibp test <file>      Run expect tests and show results
  ibp fmt <file>       Format file in place
  ibp new <name>       Create starter file (template: hello, calculator, game)
  ibp tip              Get a friendly programming tip
  ibp version          Show version
  ibp memory / system  Inspect system resources
  ls, cd, pwd          Navigate files
  cat, touch, rm       File operations
  edit <file>          Open in IBP Studio
  clear / cls          Clear screen`
        );
        break;
      }

      default: {
        const suggestion = findClosest(cmd, KNOWN_COMMANDS);
        let msg = `Command not recognized: "${cmd}".`;
        if (suggestion) {
          msg += ` Did you mean "${suggestion}"?`;
        }
        addLine('error', msg);
        break;
      }
    }
  };

  const handleIbpSubcommand = async (args: string[]) => {
    const sub = (args[0] || 'help').toLowerCase();
    const rest = args.slice(1);

    switch (sub) {
      case 'run': {
        let file = rest[0];
        if (!file) {
          // If no arg, check if file is currently open in Studio
          if (activeFilePath) {
            file = activeFilePath;
          } else {
            addLine('error', 'Usage: ibp run <file.ibp>');
            return;
          }
        }

        const fullPath = fromWinPath(file);
        if (!(await defaultVFS.exists(fullPath))) {
          addLine('error', `File not found: ${file}`);
          return;
        }

        const code = await defaultVFS.readFile(fullPath);
        await runIbpCode(code, fullPath);
        break;
      }

      case 'repl': {
        setIsReplMode(true);
        setReplBuffer('');
        if (!sessionRef.current) {
          sessionRef.current = new IBPSession();
        }
        addLine('info', 'Starting IBP Interactive REPL (v0.1.0)');
        addLine('info', 'Type expressions or statements. Dot commands: .help, .vars, .reset, .load <file>, .exit\n');
        break;
      }

      case 'check': {
        const file = rest[0];
        if (!file) {
          addLine('error', 'Usage: ibp check <file.ibp>');
          return;
        }
        const fullPath = fromWinPath(file);
        if (!(await defaultVFS.exists(fullPath))) {
          addLine('error', `File not found: ${file}`);
          return;
        }
        const code = await defaultVFS.readFile(fullPath);
        const { errors } = parse(code);
        if (errors.length === 0) {
          addLine('success', `✔ Syntax OK: ${file}`);
        } else {
          addLine('error', `✖ Syntax error in ${file}:`);
          errors.forEach((e) => addLine('error', formatError(e, code)));
        }
        break;
      }

      case 'test': {
        const file = rest[0];
        if (!file) {
          addLine('error', 'Usage: ibp test <file.ibp>');
          return;
        }
        const fullPath = fromWinPath(file);
        if (!(await defaultVFS.exists(fullPath))) {
          addLine('error', `File not found: ${file}`);
          return;
        }
        const code = await defaultVFS.readFile(fullPath);
        const checks: { label?: string; passed: boolean; message?: string }[] = [];
        const res = executeIBP(code, {
          onEvent: (ev) => {
            if (ev.type === 'check-passed') {
              checks.push({ label: ev.label, passed: true });
            }
            if (ev.type === 'check-failed') {
              checks.push({ label: ev.label, passed: false, message: ev.message });
            }
          },
        });

        if (res.error) {
          addLine('error', `Execution error in ${file}:\n${formatError(res.error, code)}`);
          return;
        }

        if (checks.length === 0) {
          addLine('info', `No "expect" checks found in ${file}.`);
        } else {
          let passed = 0;
          checks.forEach((c, i) => {
            const name = c.label || `Check #${i + 1}`;
            if (c.passed) {
              passed++;
              addLine('success', `✔ ${name}: PASSED`);
            } else {
              addLine('error', `✖ ${name}: FAILED (${c.message})`);
            }
          });
          addLine(
            passed === checks.length ? 'success' : 'error',
            `\nTest results: ${passed}/${checks.length} passed.`
          );
        }
        break;
      }

      case 'fmt': {
        const file = rest[0];
        if (!file) {
          addLine('error', 'Usage: ibp fmt <file.ibp>');
          return;
        }
        const fullPath = fromWinPath(file);
        if (!(await defaultVFS.exists(fullPath))) {
          addLine('error', `File not found: ${file}`);
          return;
        }
        const code = await defaultVFS.readFile(fullPath);
        try {
          const formatted = formatIBP(code);
          await defaultVFS.writeFile(fullPath, formatted);
          await refreshFiles();
          addLine('success', `✔ Formatted: ${file}`);
        } catch (err: any) {
          addLine('error', `Formatting failed: ${err.message || err}`);
        }
        break;
      }

      case 'new':
      case 'create': {
        const name = rest[0] || 'project.ibp';
        const templateKey = (rest[1] || 'hello').toLowerCase();
        const templateContent = TEMPLATES[templateKey] || TEMPLATES.hello;
        const filename = name.endsWith('.ibp') ? name : `${name}.ibp`;
        const fullPath = fromWinPath(filename);
        await defaultVFS.writeFile(fullPath, templateContent);
        await refreshFiles();
        addLine('success', `✔ Created new project "${filename}" (template: ${templateKey})`);
        break;
      }

      case 'tip': {
        const t = IBP_TIPS[Math.floor(Math.random() * IBP_TIPS.length)];
        addLine('success', `💡 IBP Tip: ${t}`);
        break;
      }

      case 'version': {
        addLine('info', 'IBP OS & Engine v0.1.0 (Interactive Web Worker Execution)');
        break;
      }

      case 'system':
      case 'memory': {
        addLine(
          'output',
          `IBP Virtual Machine Environment:
  Architecture:  WebAssembly / Web Worker / JS Generator
  VFS Engine:    Dexie.js IndexedDB Shared Storage
  Active Memory: 16 MB allocated pool
  Workers:       Multi-threaded streaming runner active`
        );
        break;
      }

      case 'clear': {
        setOutputLines([]);
        break;
      }

      case 'help':
      default: {
        addLine(
          'info',
          `Available ibp commands:
  ibp run <file>    Execute IBP file with interactive input
  ibp repl          Persistent interactive REPL
  ibp check <file>  Syntax check
  ibp test <file>   Run expect assertions
  ibp fmt <file>    Format in place
  ibp new <name>    Create from template (hello, calculator, game)
  ibp tip           Language tip
  ibp version       Version information
  ibp memory        System memory stats`
        );
        break;
      }
    }
  };

  // Run program through worker
  const runIbpCode = async (code: string, filePath?: string) => {
    setIsRunningProgram(true);
    setWaitingInputRequest(null);
    const startT = Date.now();

    const vm = new IBPVirtualMachine({
      workerFactory: () =>
        new Worker(new URL('../../workers/ibp.worker.ts', import.meta.url), { type: 'module' }),
    });
    activeVMRef.current = vm;

    const res = await vm.run({
      code,
      onOutput: (text) => {
        addLine('output', text);
      },
      onInputRequest: (req) => {
        setWaitingInputRequest(req);
      },
      onEvent: (ev) => {
        if (ev.type === 'celebrate') {
          confetti({ particleCount: 70, spread: 60 });
        }
      },
    });

    const elapsed = Date.now() - startT;
    setIsRunningProgram(false);
    setWaitingInputRequest(null);
    activeVMRef.current = null;

    if (res.error) {
      addLine('error', formatError(res.error, code));
      addLine('error', `Exited with code 1.`);
    } else {
      addLine('success', `✔ finished in ${elapsed} ms (exit code 0)`);
    }
  };

  // REPL Evaluation
  const handleReplLine = async (line: string) => {
    if (!sessionRef.current) {
      sessionRef.current = new IBPSession();
    }
    const session = sessionRef.current;

    const trimmed = line.trim();

    // Dot commands
    if (trimmed === '.exit') {
      setIsReplMode(false);
      setReplBuffer('');
      addLine('info', 'Exited REPL session.');
      return;
    }
    if (trimmed === '.help') {
      addLine(
        'info',
        `REPL Commands:
  .vars          List active variables & types
  .reset         Reset session state
  .load <file>   Execute an external file into this session
  .exit          Exit REPL`
      );
      return;
    }
    if (trimmed === '.reset') {
      session.reset();
      addLine('success', '✔ Session reset. All variables and recipes cleared.');
      return;
    }
    if (trimmed === '.vars') {
      const vars = session.getVariables();
      const entries = Object.entries(vars);
      if (entries.length === 0) {
        addLine('info', 'No active variables in session.');
      } else {
        entries.forEach(([name, info]) => {
          addLine('output', `  ${name}: ${info.kind} = ${valueToString(info.value)}`);
        });
      }
      return;
    }
    if (trimmed.startsWith('.load ')) {
      const target = trimmed.slice(6).trim();
      const full = fromWinPath(target);
      if (await defaultVFS.exists(full)) {
        const fileContent = await defaultVFS.readFile(full);
        const res = session.eval(fileContent);
        res.output.forEach((o) => addLine('output', o));
        if (res.error) {
          addLine('error', formatError(res.error, fileContent));
        } else {
          addLine('success', `✔ Loaded ${target} into session.`);
        }
      } else {
        addLine('error', `File not found: ${target}`);
      }
      return;
    }

    // Accumulate multi-line block
    const fullCode = replBuffer ? `${replBuffer}\n${line}` : line;

    if (!session.isComplete(fullCode)) {
      setReplBuffer(fullCode);
      return;
    }

    setReplBuffer('');
    const res = session.eval(fullCode);
    res.output.forEach((o) => addLine('output', o));
    if (res.error) {
      addLine('error', formatError(res.error, fullCode));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl+C: Cancel running program or clear line
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      if (isRunningProgram && activeVMRef.current) {
        activeVMRef.current.stop();
        setIsRunningProgram(false);
        setWaitingInputRequest(null);
        addLine('error', '^C (Program terminated)');
      } else if (isReplMode && replBuffer) {
        setReplBuffer('');
        addLine('info', '^C');
      } else {
        addLine('input', `${inputValue}^C`);
        setInputValue('');
      }
      return;
    }

    // Ctrl+L: Clear screen
    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      setOutputLines([]);
      return;
    }

    // Tab completion
    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
      return;
    }

    if (e.key === 'Enter') {
      const toRun = inputValue;
      setInputValue('');
      setHistoryIdx(-1);
      handleCommandLine(toRun);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx < 0 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputValue(history[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx >= 0) {
        const nextIdx = historyIdx + 1;
        if (nextIdx >= history.length) {
          setHistoryIdx(-1);
          setInputValue('');
        } else {
          setHistoryIdx(nextIdx);
          setInputValue(history[nextIdx]);
        }
      }
    }
  };

  const handleTabCompletion = async () => {
    const val = inputValue;
    const parts = val.split(/\s+/);

    if (parts.length <= 1) {
      // Command completion
      const prefix = (parts[0] || '').toLowerCase();
      const matches = KNOWN_COMMANDS.filter((c) => c.startsWith(prefix));
      if (matches.length === 1) {
        setInputValue(matches[0] + ' ');
      } else if (matches.length > 1) {
        addLine('info', matches.join('  '));
      }
    } else {
      // File / folder completion
      const lastArg = parts[parts.length - 1];
      const items = await defaultVFS.listFolder(cwd);
      const candidates = items.map((i) => i.name);
      const matches = candidates.filter((n) => n.toLowerCase().startsWith(lastArg.toLowerCase()));

      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        setInputValue(parts.join(' ') + ' ');
      } else if (matches.length > 1) {
        addLine('info', matches.join('  '));
      }
    }
  };

  const currentPrompt = waitingInputRequest
    ? waitingInputRequest.prompt || 'Input:'
    : isReplMode
    ? replBuffer
      ? '...>'
      : 'ibp>'
    : compact
    ? `${cwd}>`
    : `PS ${toWinPath(cwd)}>`;

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`h-full flex flex-col font-mono text-xs overflow-hidden select-text cursor-text ${
        isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#0B1120] text-slate-100'
      }`}
    >
      {/* Output log */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {outputLines.map((line) => {
          if (line.type === 'input') {
            return (
              <div key={line.id} className="text-sky-400 font-semibold whitespace-pre-wrap">
                {line.text}
              </div>
            );
          }
          if (line.type === 'error') {
            return (
              <div key={line.id} className="text-rose-400 whitespace-pre-wrap">
                {line.text}
              </div>
            );
          }
          if (line.type === 'success') {
            return (
              <div key={line.id} className="text-emerald-400 whitespace-pre-wrap">
                {line.text}
              </div>
            );
          }
          if (line.type === 'info') {
            return (
              <div key={line.id} className="text-slate-400 whitespace-pre-wrap">
                {line.text}
              </div>
            );
          }
          return (
            <div
              key={line.id}
              className={`${isLight ? 'text-slate-800' : 'text-slate-200'} whitespace-pre-wrap`}
            >
              {line.text}
            </div>
          );
        })}

        {/* Current Active Input Prompt Line */}
        <div className="flex items-center space-x-1.5 pt-0.5">
          <span
            className={`font-semibold select-none shrink-0 ${
              waitingInputRequest
                ? 'text-amber-400'
                : isReplMode
                ? 'text-emerald-400'
                : 'text-sky-400'
            }`}
          >
            {currentPrompt}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent outline-none border-none p-0 m-0 font-mono text-xs text-inherit"
          />
        </div>

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

