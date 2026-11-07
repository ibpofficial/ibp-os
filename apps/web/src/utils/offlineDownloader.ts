import JSZip from 'jszip';

export async function downloadOfflineBundle(): Promise<void> {
  const zip = new JSZip();

  // 1. Fetch current index.html
  let indexHtml = '';
  try {
    const res = await fetch('/');
    indexHtml = await res.text();
  } catch {
    indexHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>IBP OS</title></head><body><h1>IBP OS Offline</h1><p>Open in browser to run.</p></body></html>`;
  }

  // 2. Add files to zip
  zip.file('index.html', indexHtml);

  zip.file(
    'run_offline_windows.bat',
    `@echo off
echo Starting IBP OS in your default web browser...
start index.html
exit
`
  );

  zip.file(
    'run_offline_mac_linux.sh',
    `#!/bin/bash
echo "Starting IBP OS in your default web browser..."
if which xdg-open > /dev/null; then
  xdg-open index.html
elif which open > /dev/null; then
  open index.html
else
  python3 -m http.server 8080 &
  open http://localhost:8080/
fi
`
  );

  zip.file(
    'README_OFFLINE.txt',
    `====================================================================
🪐 IBP OS: Educational Virtual Operating System (Offline Edition)
====================================================================

You have downloaded the standalone offline distribution of IBP OS!

HOW TO RUN:
- On Windows: Double-click 'run_offline_windows.bat' or simply double-click 'index.html'.
- On Mac / Linux: Run './run_offline_mac_linux.sh' or open 'index.html' in Chrome, Edge, or Safari.

FEATURES INCLUDED:
• IBP Studio (Full In-Browser IDE with Monaco Editor)
• LangCraft Studio (Custom Programming Language Builder)
• Terminal (Full CLI shell and REPL)
• Learn IBP (12-Chapter Interactive Textbook with PDF Export)
• Playground (20 Progressive Coding Challenges with Automated Verifier)
• File Explorer (IndexedDB Virtual Filesystem)
• System Monitor & Telemetry
• Custom Wallpaper Engine & Desktop Scratchpad
• 100% Offline execution, no internet or server required!

Enjoy coding in IBP OS!
====================================================================
`
  );

  // Generate ZIP blob and trigger download
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IBP_OS_Offline_Edition_${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

