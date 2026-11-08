import React, { useState, useRef, useEffect } from 'react';
import { defaultVFS } from '@ibp/vfs';
import { executeIBP, IBP_TIPS, parse } from '@ibp/engine';
import confetti from 'canvas-confetti';
import { Terminal as TerminalIcon, Sparkles, Monitor, Trash2 } from 'lucide-react';
import { useDesktopStore } from '../../stores/desktopStore';

interface OutputLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  text: string;
}

type TerminalShellMode = 'powershell' | 'cmd';

export const TerminalApp: React.FC = () => {
  const { theme } = useDesktopStore();
  const isLight = theme === 'light';

  const [shellMode, setShellMode] = useState<TerminalShellMode>('cmd');
  const [cwd, setCwd] = useState('IBP://USERS/guest/projects');
  const [inputValue, setInputValue] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isReplMode, setIsReplMode] = useState(false);

  // History per shell
  const [cmdOutput, setCmdOutput] = useState<OutputLine[]>([
    { type: 'info', text: 'Microsoft Windows [Version 10.0.22631.3007]' },
    { type: 'info', text: '(c) Microsoft Corporation. All rights reserved.\n' },
    { type: 'output', text: 'Type "help" or "dir" to explore real system files.' },
  ]);

  const [psOutput, setPsOutput] = useState<OutputLine[]>([
    { type: 'info', text: 'Windows PowerShell - IBP Virtual Shell v0.1.0' },
    { type: 'info', text: 'Type "ibp help" or "Get-Help" for available commands.\n' },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeOutput = shellMode === 'cmd' ? cmdOutput : psOutput;
  const setActiveOutput = (fn: (prev: OutputLine[]) => OutputLine[]) => {
    if (shellMode === 'cmd') setCmdOutput(fn);
    else setPsOutput(fn);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [cmdOutput, psOutput]);

  // Convert IBP:// path to realistic Windows path (C:\Users\guest\...)
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

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const line = inputValue.trim();
      setInputValue('');
      setHistoryIdx(-1);

      if (line.length > 0) {
        setCmdHistory((prev) => [...prev, line]);
      }

      const promptLabel =
        shellMode === 'cmd'
          ? `${toWinPath(cwd)}>`
          : isReplMode
          ? 'ibp>'
          : `PS ${toWinPath(cwd)}>`;

      setActiveOutput((prev) => [...prev, { type: 'input', text: `${promptLabel} ${line}` }]);

      if (isReplMode) {
        if (line === 'exit' || line === 'quit') {
          setIsReplMode(false);
          setActiveOutput((prev) => [...prev, { type: 'info', text: 'Exited IBP REPL.' }]);
          return;
        }

        try {
          const { errors } = parse(line);
          if (errors.length > 0) {
            setActiveOutput((prev) => [...prev, { type: 'error', text: errors[0].format(line) }]);
          } else {
            const { output, error } = executeIBP(line, {
              onEvent: (ev) => {
                if (ev.type === 'celebrate') {
                  confetti({ particleCount: 60, spread: 50 });
                }
              },
            });
            output.forEach((out) => {
              setActiveOutput((prev) => [...prev, { type: 'output', text: out }]);
            });
            if (error) {
              setActiveOutput((prev) => [...prev, { type: 'error', text: error.format(line) }]);
            }
          }
        } catch (err: any) {
          setActiveOutput((prev) => [...prev, { type: 'error', text: `REPL Error: ${err.message || err}` }]);
        }
        return;
      }

      try {
        if (shellMode === 'cmd') {
          await executeCmdCommand(line);
        } else {
          await executePowerShellCommand(line);
        }
      } catch (err: any) {
        setActiveOutput((prev) => [...prev, { type: 'error', text: `Error: ${err.message || err}` }]);
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

  // Real Windows CMD implementation
  const executeCmdCommand = async (line: string) => {
    if (!line.trim()) return;
    const parts = line.split(' ').filter(Boolean);
    const cmd = (parts[0] || '').toLowerCase();

    // Redirection support (e.g. echo hello > file.txt)
    if (line.includes('>')) {
      const [left, right] = line.split('>');
      const targetFileName = right.trim();
      let textToEcho = left.replace(/^echo\s+/i, '').trim();
      if (textToEcho.startsWith('"') && textToEcho.endsWith('"')) {
        textToEcho = textToEcho.slice(1, -1);
      }
      const fullPath = fromWinPath(targetFileName);
      await defaultVFS.writeFile(fullPath, textToEcho + '\n');
      setActiveOutput((prev) => [...prev, { type: 'success', text: `✔ Wrote to ${targetFileName}` }]);
      return;
    }

    switch (cmd) {
      case 'cls':
      case 'clear':
        setCmdOutput([]);
        break;

      case 'ver':
        setActiveOutput((prev) => [
          ...prev,
          { type: 'output', text: 'Microsoft Windows [Version 10.0.22631.3007]' },
        ]);
        break;

      case 'whoami':
        setActiveOutput((prev) => [...prev, { type: 'output', text: 'DESKTOP-IBP\\guest' }]);
        break;

      case 'hostname':
        setActiveOutput((prev) => [...prev, { type: 'output', text: 'DESKTOP-IBP' }]);
        break;

      case 'date':
      case 'time':
        setActiveOutput((prev) => [
          ...prev,
          { type: 'output', text: `The current ${cmd} is: ${new Date().toLocaleString()}` },
        ]);
        break;

      case 'dir': {
        const items = await defaultVFS.listFolder(cwd);
        const winDir = toWinPath(cwd);
        const now = new Date();
        const dateStr = now.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let lines: string[] = [
          ' Volume in drive C is IBP_OS',
          ' Volume Serial Number is 4F8A-9E2B',
          '',
          ` Directory of ${winDir}`,
          '',
          ` ${dateStr}  ${timeStr}    <DIR>          .`,
          ` ${dateStr}  ${timeStr}    <DIR>          ..`,
        ];

        let totalBytes = 0;
        let fileCount = 0;
        let dirCount = 2;

        items.forEach((item) => {
          if (item.isFolder) {
            dirCount++;
            lines.push(` ${dateStr}  ${timeStr}    <DIR>          ${item.name}`);
          } else {
            fileCount++;
            totalBytes += item.size;
            const sizeFormatted = item.size.toLocaleString().padStart(14, ' ');
            lines.push(` ${dateStr}  ${timeStr}    ${sizeFormatted} ${item.name}`);
          }
        });

        lines.push(`              ${fileCount} File(s)    ${totalBytes.toLocaleString().padStart(12, ' ')} bytes`);
        lines.push(`              ${dirCount} Dir(s)   412,872,192,000 bytes free`);

        setActiveOutput((prev) => [...prev, { type: 'output', text: lines.join('\n') }]);
        break;
      }

      case 'cd': {
        const target = parts[1];
        if (!target || target === '.') {
          setActiveOutput((prev) => [...prev, { type: 'output', text: toWinPath(cwd) }]);
          return;
        }

        if (target === '..') {
          const parent = defaultVFS.getParentPath(cwd);
          if (parent) setCwd(parent);
          return;
        }

        if (target === '\\' || target === '/') {
          setCwd('IBP://USERS/guest');
          return;
        }

        const normalized = fromWinPath(target);
        if (await defaultVFS.exists(normalized)) {
          setCwd(normalized);
        } else {
          setActiveOutput((prev) => [
            ...prev,
            { type: 'error', text: `The system cannot find the path specified: ${target}` },
          ]);
        }
        break;
      }

      case 'type': {
        const file = parts[1];
        if (!file) {
          setActiveOutput((prev) => [...prev, { type: 'error', text: 'The syntax of the command is incorrect.' }]);
          return;
        }
        const fullPath = fromWinPath(file);
        if (await defaultVFS.exists(fullPath)) {
          const content = await defaultVFS.readFile(fullPath);
          setActiveOutput((prev) => [...prev, { type: 'output', text: content }]);
        } else {
          setActiveOutput((prev) => [
            ...prev,
            { type: 'error', text: `The system cannot find the file specified: ${file}` },
          ]);
        }
        break;
      }

      case 'echo': {
        const text = parts.slice(1).join(' ');
        setActiveOutput((prev) => [...prev, { type: 'output', text: text || 'ECHO is on.' }]);
        break;
      }

      case 'del':
      case 'erase': {
        const file = parts[1];
        if (!file) {
          setActiveOutput((prev) => [...prev, { type: 'error', text: 'The syntax of the command is incorrect.' }]);
          return;
        }
        const fullPath = fromWinPath(file);
        if (await defaultVFS.exists(fullPath)) {
          await defaultVFS.deleteFile(fullPath);
          setActiveOutput((prev) => [...prev, { type: 'success', text: `Deleted file: ${file}` }]);
        } else {
          setActiveOutput((prev) => [
            ...prev,
            { type: 'error', text: `Could Not Find ${toWinPath(fullPath)}` },
          ]);
        }
        break;
      }

      case 'mkdir':
      case 'md': {
        const name = parts[1];
        if (!name) {
          setActiveOutput((prev) => [...prev, { type: 'error', text: 'The syntax of the command is incorrect.' }]);
          return;
        }
        const fullPath = fromWinPath(name);
        await defaultVFS.createFolder(fullPath);
        setActiveOutput((prev) => [...prev, { type: 'success', text: `Directory created: ${name}` }]);
        break;
      }

      case 'ping': {
        const host = parts[1] || 'zenzy.shop';
        setActiveOutput((prev) => [
          ...prev,
          {
            type: 'output',
            text: `Pinging ${host} [104.21.72.189] with 32 bytes of data:
Reply from 104.21.72.189: bytes=32 time=22ms TTL=56
Reply from 104.21.72.189: bytes=32 time=24ms TTL=56
Reply from 104.21.72.189: bytes=32 time=21ms TTL=56
Reply from 104.21.72.189: bytes=32 time=25ms TTL=56

Ping statistics for 104.21.72.189:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 21ms, Maximum = 25ms, Average = 23ms`,
          },
        ]);
        break;
      }

      case 'systeminfo': {
        setActiveOutput((prev) => [
          ...prev,
          {
            type: 'output',
            text: `Host Name:                 DESKTOP-IBP
OS Name:                   Microsoft Windows 11 Pro (IBP Resumable OS)
OS Version:                10.0.22631 N/A Build 22631
System Manufacturer:       Acer
System Model:              Aspire Virtual Workstation
System Type:               x64-based PC
Processor(s):              Intel Core i7-13700H @ 2.40 GHz
Total Physical Memory:     16,384 MB
Available Physical Memory: 11,420 MB
Virtual Memory Max:        32,768 MB
Storage Engine:            Dexie.js IndexedDB Virtual Filesystem
Hot Reload Service:        Active (Vite 5 / Port 5173)`,
          },
        ]);
        break;
      }

      case 'ibp': {
        await executePowerShellCommand(line);
        break;
      }

      case 'help': {
        setActiveOutput((prev) => [
          ...prev,
          {
            type: 'info',
            text: `For more information on a specific command, type HELP command-name:
  CD         Displays the name of or changes the current directory.
  CLS        Clears the screen.
  DATE       Displays or sets the date.
  DEL        Deletes one or more files.
  DIR        Displays a list of files and subdirectories in a directory.
  ECHO       Displays messages, or writes output to file (>).
  HOSTNAME   Prints the computer name.
  IBP        Executes IBP scripts or enters interactive REPL.
  MD / MKDIR Creates a directory.
  PING       Sends ICMP echo packets to test network connectivity.
  SYSTEMINFO Displays operating system configuration information.
  TIME       Displays the current time.
  TYPE       Displays the contents of a text file.
  VER        Displays the Windows version.
  WHOAMI     Displays the current logged-in user.`,
          },
        ]);
        break;
      }

      default:
        setActiveOutput((prev) => [
          ...prev,
          {
            type: 'error',
            text: `'${cmd}' is not recognized as an internal or external command,\noperable program or batch file. Type "help" for a list of commands.`,
          },
        ]);
        break;
    }
  };

  // PowerShell / IBP command handler
  const executePowerShellCommand = async (line: string) => {
    const parts = line.split(' ').filter(Boolean);
    let cmd = parts[0] || '';
    if (cmd === 'ibp') {
      cmd = parts[1] || 'help';
      parts.shift();
    }

    switch (cmd.toLowerCase()) {
      case 'help':
      case 'get-help':
        setActiveOutput((prev) => [
          ...prev,
          {
            type: 'info',
            text: `Available IBP PowerShell Commands:
  ibp help              Show this help menu
  ibp version           Show engine & system version
  ibp run <file>        Execute an IBP source file
  ibp repl              Enter interactive REPL session
  ibp list / ls         List files in current folder
  ibp create <name>     Create a new project starter
  ibp system            Show memory and process stats
  ibp tip               Display a helpful language tip
  ibp clear / Clear-Host Clear terminal screen
  cd <path>             Change directory
  pwd                   Print current working directory`,
          },
        ]);
        break;

      case 'version':
        setActiveOutput((prev) => [...prev, { type: 'info', text: 'IBP OS & Engine v0.1.0 (Windows Kernel)' }]);
        break;

      case 'clear':
      case 'clear-host':
        setPsOutput([]);
        break;

      case 'pwd':
        setActiveOutput((prev) => [...prev, { type: 'output', text: cwd }]);
        break;

      case 'tip': {
        const t = IBP_TIPS[Math.floor(Math.random() * IBP_TIPS.length)];
        setActiveOutput((prev) => [...prev, { type: 'success', text: `💡 IBP Tip: ${t}` }]);
        break;
      }

      case 'repl':
        setIsReplMode(true);
        setActiveOutput((prev) => [
          ...prev,
          { type: 'info', text: 'Entering IBP Interactive REPL (v0.1.0). Type "exit" to leave.' },
        ]);
        break;

      case 'list':
      case 'ls': {
        const items = await defaultVFS.listFolder(cwd);
        if (items.length === 0) {
          setActiveOutput((prev) => [...prev, { type: 'info', text: 'Folder is empty.' }]);
        } else {
          const listText = items
            .map((f) => (f.isFolder ? `📁 ${f.name}/` : `📄 ${f.name} (${f.size} B)`))
            .join('\n');
          setActiveOutput((prev) => [...prev, { type: 'output', text: listText }]);
        }
        break;
      }

      case 'cd': {
        const target = parts[1] || 'IBP://USERS/guest/projects';
        const newPath = defaultVFS.normalizePath(target.startsWith('IBP://') ? target : `${cwd}/${target}`);
        if (await defaultVFS.exists(newPath)) {
          setCwd(newPath);
        } else {
          setActiveOutput((prev) => [...prev, { type: 'error', text: `cd: directory not found: ${target}` }]);
        }
        break;
      }

      case 'create': {
        const name = parts[1] || 'my-project.ibp';
        const fullPath = `${cwd}/${name.endsWith('.ibp') ? name : name + '.ibp'}`;
        await defaultVFS.writeFile(fullPath, `# ${name}\nsay "Hello from ${name}!"\n`);
        setActiveOutput((prev) => [...prev, { type: 'success', text: `✔ Created ${fullPath}` }]);
        break;
      }

      case 'run': {
        const file = parts[1];
        if (!file) {
          setActiveOutput((prev) => [...prev, { type: 'error', text: 'Usage: ibp run <file.ibp>' }]);
          return;
        }
        const fullPath = defaultVFS.normalizePath(file.startsWith('IBP://') ? file : `${cwd}/${file}`);
        if (!(await defaultVFS.exists(fullPath))) {
          setActiveOutput((prev) => [...prev, { type: 'error', text: `File not found: ${fullPath}` }]);
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
          setActiveOutput((prev) => [...prev, { type: 'output', text: line }]);
        });

        if (error) {
          setActiveOutput((prev) => [...prev, { type: 'error', text: error.format(content) }]);
        }
        break;
      }

      default:
        if (line.trim().length > 0) {
          setActiveOutput((prev) => [
            ...prev,
            { type: 'error', text: `Unknown command "${cmd}". Run "ibp help" for available commands.` },
          ]);
        }
        break;
    }
  };

  return (
    <div
      className={`h-full flex flex-col font-mono text-xs overflow-hidden select-text ${
        shellMode === 'cmd'
          ? 'bg-[#0C0C0C] text-[#CCCCCC]'
          : isLight
          ? 'bg-[#012456] text-white'
          : 'bg-[#012456] text-slate-100'
      }`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Tab Switcher (PowerShell vs Command Prompt) */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border-b border-white/10 select-none">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShellMode('cmd')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs transition ${
              shellMode === 'cmd'
                ? 'bg-slate-700 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Monitor size={12} className="text-amber-400" />
            <span>Command Prompt (CMD)</span>
          </button>
          <button
            onClick={() => setShellMode('powershell')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs transition ${
              shellMode === 'powershell'
                ? 'bg-blue-600 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <TerminalIcon size={12} className="text-sky-300" />
            <span>PowerShell / IBP</span>
          </button>
        </div>

        <button
          onClick={() => (shellMode === 'cmd' ? setCmdOutput([]) : setPsOutput([]))}
          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
          title="Clear screen"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Terminal Output Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {activeOutput.map((h, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap font-mono ${
              h.type === 'input'
                ? shellMode === 'cmd'
                  ? 'text-white font-semibold'
                  : 'text-sky-300 font-semibold'
                : h.type === 'error'
                ? 'text-rose-400'
                : h.type === 'success'
                ? 'text-emerald-400'
                : h.type === 'info'
                ? shellMode === 'cmd'
                  ? 'text-slate-300'
                  : 'text-cyan-300'
                : shellMode === 'cmd'
                ? 'text-[#CCCCCC]'
                : 'text-slate-200'
            }`}
          >
            {h.text}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Command Input Row */}
      <div className="flex items-center space-x-1 px-3 py-2 bg-black/20 border-t border-white/5 shrink-0">
        <span
          className={`font-semibold select-none ${
            shellMode === 'cmd' ? 'text-white' : 'text-sky-400'
          }`}
        >
          {shellMode === 'cmd'
            ? `${toWinPath(cwd)}>`
            : isReplMode
            ? 'ibp>'
            : `PS ${toWinPath(cwd)}>`}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent outline-none border-none font-mono text-xs text-white"
        />
      </div>
    </div>
  );
};
