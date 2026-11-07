import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  File,
  Plus,
  Trash2,
  FolderPlus,
  Download,
  Upload,
  ArrowUp,
  HardDrive,
} from 'lucide-react';
import { useVFSStore } from '../../stores/vfsStore';
import { useDesktopStore } from '../../stores/desktopStore';
import { defaultVFS } from '@ibp/vfs';

export const ExplorerApp: React.FC = () => {
  const { files, createFile, createFolder, deleteNode, renameNode, refreshFiles } = useVFSStore();
  const { openWindow } = useDesktopStore();
  const [currentFolder, setCurrentFolder] = useState('IBP://USERS/guest/projects');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const currentItems = files.filter((f) => f.parentPath === currentFolder);

  const handleOpenItem = (itemPath: string, isFolder: boolean) => {
    if (isFolder) {
      setCurrentFolder(itemPath);
      setSelectedPath(null);
    } else {
      // Open in Studio
      useVFSStore.getState().openFile(itemPath);
      openWindow('studio');
    }
  };

  const handleGoUp = () => {
    if (currentFolder === 'IBP://') return;
    const parent = defaultVFS.getParentPath(currentFolder);
    setCurrentFolder(parent);
    setSelectedPath(null);
  };

  const handleNewFile = async () => {
    const name = prompt('File name:', 'new_script.ibp');
    if (!name) return;
    const path = `${currentFolder}/${name}`;
    await createFile(path, '# New IBP file\nsay "Hello!"\n');
  };

  const handleNewFolder = async () => {
    const name = prompt('Folder name:', 'new_folder');
    if (!name) return;
    const path = `${currentFolder}/${name}`;
    await createFolder(path);
  };

  const handleDelete = async () => {
    if (!selectedPath) return;
    if (confirm(`Delete ${selectedPath}?`)) {
      await deleteNode(selectedPath);
      setSelectedPath(null);
    }
  };

  const handleExportZip = async () => {
    const blob = await defaultVFS.exportZip();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ibp-workspace.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const count = await defaultVFS.importZip(file);
    await refreshFiles();
    alert(`Imported ${count} files successfully!`);
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1120] text-slate-100 font-sans text-xs select-none">
      {/* Explorer Action Toolbar */}
      <div className="flex items-center justify-between p-2 bg-[#111827] border-b border-slate-800">
        <div className="flex items-center space-x-1">
          <button
            onClick={handleGoUp}
            disabled={currentFolder === 'IBP://'}
            className="p-1.5 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300"
            title="Up Folder"
          >
            <ArrowUp size={14} />
          </button>
          <div className="flex items-center space-x-1 px-2 py-1 bg-slate-900 rounded border border-slate-800 text-slate-300 font-mono text-[11px] truncate max-w-sm">
            <HardDrive size={12} className="text-sky-400" />
            <span className="truncate">{currentFolder}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleNewFile}
            className="flex items-center space-x-1 px-2 py-1 bg-sky-600 hover:bg-sky-500 rounded text-white"
            title="Create File"
          >
            <Plus size={13} />
            <span>New File</span>
          </button>
          <button
            onClick={handleNewFolder}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
            title="Create Folder"
          >
            <FolderPlus size={13} />
            <span>Folder</span>
          </button>
          {selectedPath && (
            <button
              onClick={handleDelete}
              className="p-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded"
              title="Delete Selected"
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            onClick={handleExportZip}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
            title="Export ZIP"
          >
            <Download size={14} />
          </button>
          <label className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded cursor-pointer" title="Import ZIP">
            <Upload size={14} />
            <input type="file" accept=".zip" onChange={handleImportZip} className="hidden" />
          </label>
        </div>
      </div>

      {/* Grid of Files and Folders */}
      <div className="flex-1 p-4 overflow-y-auto">
        {currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Folder size={36} className="stroke-[1.5] mb-2 opacity-40" />
            <span>This folder is empty</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {currentItems.map((item) => (
              <div
                key={item.path}
                onClick={() => setSelectedPath(item.path)}
                onDoubleClick={() => handleOpenItem(item.path, item.isFolder)}
                className={`flex flex-col items-center p-2.5 rounded-lg border text-center cursor-pointer transition ${
                  selectedPath === item.path
                    ? 'bg-sky-950/60 border-sky-500 text-sky-200'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                {item.isFolder ? (
                  <Folder size={32} className="text-sky-400 fill-sky-400/20 mb-1.5" />
                ) : item.name.endsWith('.ibp') ? (
                  <FileCode size={32} className="text-emerald-400 mb-1.5" />
                ) : (
                  <File size={32} className="text-slate-400 mb-1.5" />
                )}
                <span className="text-[11px] truncate w-full">{item.name}</span>
                {!item.isFolder && (
                  <span className="text-[9px] text-slate-500">{item.size} B</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

