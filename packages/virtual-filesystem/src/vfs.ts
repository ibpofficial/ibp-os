import Dexie, { Table } from 'dexie';
import JSZip from 'jszip';

export interface VFSNode {
  path: string; // e.g. "IBP://USERS/guest/projects/main.ibp"
  name: string;
  parentPath: string; // e.g. "IBP://USERS/guest/projects"
  content: string;
  isFolder: boolean;
  createdAt: number;
  updatedAt: number;
  size: number;
}

export class VFSDatabase extends Dexie {
  public files!: Table<VFSNode, string>;

  constructor(dbName = 'IBPOS_VFS') {
    super(dbName);
    this.version(1).stores({
      files: 'path, name, parentPath, isFolder, updatedAt',
    });
  }
}

export class VirtualFileSystem {
  private db: VFSDatabase | null = null;
  private memoryNodes = new Map<string, VFSNode>();
  private isIndexedDBAvailable: boolean;

  constructor(dbName = 'IBPOS_VFS') {
    this.isIndexedDBAvailable = typeof indexedDB !== 'undefined';
    if (this.isIndexedDBAvailable) {
      try {
        this.db = new VFSDatabase(dbName);
      } catch {
        this.isIndexedDBAvailable = false;
      }
    }
  }

  public normalizePath(rawPath: string): string {
    let p = rawPath.replace(/\\/g, '/');
    if (!p.startsWith('IBP://') && !p.startsWith('ibp://')) {
      if (p.startsWith('/')) p = 'IBP:/' + p;
      else p = 'IBP://' + p;
    }
    // Normalize casing for protocol
    p = 'IBP://' + p.substring(6);
    // Remove trailing slash unless root
    if (p.endsWith('/') && p !== 'IBP://') {
      p = p.slice(0, -1);
    }
    return p;
  }

  public getParentPath(path: string): string {
    const norm = this.normalizePath(path);
    const lastSlash = norm.lastIndexOf('/');
    if (lastSlash <= 5) return 'IBP://';
    return norm.substring(0, lastSlash);
  }

  public getBasename(path: string): string {
    const norm = this.normalizePath(path);
    const lastSlash = norm.lastIndexOf('/');
    return lastSlash >= 0 ? norm.substring(lastSlash + 1) : norm;
  }

  public async init(seedDefaults = true): Promise<void> {
    const systemDirs = [
      'IBP://SYSTEM',
      'IBP://APPS',
      'IBP://TEMP',
      'IBP://USERS',
      'IBP://USERS/guest',
      'IBP://USERS/guest/projects',
      'IBP://USERS/guest/documents',
      'IBP://USERS/guest/downloads',
    ];

    for (const dir of systemDirs) {
      if (!(await this.exists(dir))) {
        await this.createFolder(dir);
      }
    }

    if (seedDefaults) {
      const welcomeFile = 'IBP://USERS/guest/projects/welcome.ibp';
      if (!(await this.exists(welcomeFile))) {
        await this.writeFile(
          welcomeFile,
          `# Welcome to IBP OS!
# A beginner-friendly, educational operating system and language.

keep name = "Explorer"
say "Hello, {name}! Welcome to IBP Studio."
shout "let's build something fun!"

recipe double(x) => x * 2
keep numbers = [1, 2, 3, 4, 5]
say "Doubled: {numbers |> map(double)}"

celebrate
`
        );
      }

      const calcFile = 'IBP://USERS/guest/projects/calculator.ibp';
      if (!(await this.exists(calcFile))) {
        await this.writeFile(
          calcFile,
          `recipe add(a, b) => a + b
recipe multiply(a, b) => a * b

say "10 + 20 = {add(10, 20)}"
say "6 * 7 = {multiply(6, 7)}"
`
        );
      }

      const pipesFile = 'IBP://USERS/guest/projects/pipes.ibp';
      if (!(await this.exists(pipesFile))) {
        await this.writeFile(
          pipesFile,
          `recipe isEven(n) => n % 2 == 0
recipe double(n) => n * 2

keep scores = [1, 2, 3, 4, 5, 6, 7, 8]
keep totalEvens = scores |> filter(isEven) |> map(double) |> total
say "Total of doubled evens: {totalEvens}"
`
        );
      }
    }
  }

  public async exists(rawPath: string): Promise<boolean> {
    const path = this.normalizePath(rawPath);
    if (this.db) {
      const node = await this.db.files.get(path);
      return !!node;
    }
    return this.memoryNodes.has(path);
  }

  public async readFile(rawPath: string): Promise<string> {
    const path = this.normalizePath(rawPath);
    if (this.db) {
      const node = await this.db.files.get(path);
      if (!node) throw new Error(`File not found: ${path}`);
      if (node.isFolder) throw new Error(`Path is a folder: ${path}`);
      return node.content;
    }
    const mem = this.memoryNodes.get(path);
    if (!mem) throw new Error(`File not found: ${path}`);
    if (mem.isFolder) throw new Error(`Path is a folder: ${path}`);
    return mem.content;
  }

  public async writeFile(rawPath: string, content: string): Promise<void> {
    const path = this.normalizePath(rawPath);
    const parentPath = this.getParentPath(path);
    const name = this.getBasename(path);
    const now = Date.now();

    // Ensure parent folder exists
    if (parentPath !== 'IBP://' && !(await this.exists(parentPath))) {
      await this.createFolder(parentPath);
    }

    const node: VFSNode = {
      path,
      name,
      parentPath,
      content,
      isFolder: false,
      createdAt: now,
      updatedAt: now,
      size: content.length,
    };

    if (this.db) {
      await this.db.files.put(node);
    }
    this.memoryNodes.set(path, node);
  }

  public async appendFile(rawPath: string, content: string): Promise<void> {
    const path = this.normalizePath(rawPath);
    if (await this.exists(path)) {
      const existing = await this.readFile(path);
      await this.writeFile(path, existing + content);
    } else {
      await this.writeFile(path, content);
    }
  }

  public async createFolder(rawPath: string): Promise<void> {
    const path = this.normalizePath(rawPath);
    const parentPath = this.getParentPath(path);
    const name = this.getBasename(path);
    const now = Date.now();

    const node: VFSNode = {
      path,
      name,
      parentPath,
      content: '',
      isFolder: true,
      createdAt: now,
      updatedAt: now,
      size: 0,
    };

    if (this.db) {
      await this.db.files.put(node);
    }
    this.memoryNodes.set(path, node);
  }

  public async listFolder(rawPath: string): Promise<VFSNode[]> {
    const path = this.normalizePath(rawPath);
    if (this.db) {
      return await this.db.files.where('parentPath').equals(path).toArray();
    }
    const results: VFSNode[] = [];
    for (const node of this.memoryNodes.values()) {
      if (node.parentPath === path) {
        results.push(node);
      }
    }
    return results;
  }

  public async getAllFiles(): Promise<VFSNode[]> {
    if (this.db) {
      return await this.db.files.toArray();
    }
    return Array.from(this.memoryNodes.values());
  }

  public async deleteFile(rawPath: string): Promise<void> {
    const path = this.normalizePath(rawPath);
    if (this.db) {
      // If folder, delete all recursive descendants
      const all = await this.db.files.toArray();
      const toDelete = all.filter((f) => f.path === path || f.path.startsWith(path + '/')).map((f) => f.path);
      await this.db.files.bulkDelete(toDelete);
    }
    const toDeleteMem: string[] = [];
    for (const k of this.memoryNodes.keys()) {
      if (k === path || k.startsWith(path + '/')) {
        toDeleteMem.push(k);
      }
    }
    for (const k of toDeleteMem) {
      this.memoryNodes.delete(k);
    }
  }

  public async rename(oldRawPath: string, newRawPath: string): Promise<void> {
    const oldPath = this.normalizePath(oldRawPath);
    const newPath = this.normalizePath(newRawPath);

    if (this.db) {
      const all = await this.db.files.toArray();
      for (const item of all) {
        if (item.path === oldPath || item.path.startsWith(oldPath + '/')) {
          const suffix = item.path.substring(oldPath.length);
          const targetPath = newPath + suffix;
          const targetParent = this.getParentPath(targetPath);
          const targetName = this.getBasename(targetPath);
          await this.db.files.delete(item.path);
          await this.db.files.put({
            ...item,
            path: targetPath,
            name: targetName,
            parentPath: targetParent,
            updatedAt: Date.now(),
          });
        }
      }
    }

    const itemsMem = Array.from(this.memoryNodes.values());
    for (const item of itemsMem) {
      if (item.path === oldPath || item.path.startsWith(oldPath + '/')) {
        const suffix = item.path.substring(oldPath.length);
        const targetPath = newPath + suffix;
        const targetParent = this.getParentPath(targetPath);
        const targetName = this.getBasename(targetPath);
        this.memoryNodes.delete(item.path);
        this.memoryNodes.set(targetPath, {
          ...item,
          path: targetPath,
          name: targetName,
          parentPath: targetParent,
          updatedAt: Date.now(),
        });
      }
    }
  }

  public async exportZip(): Promise<Blob> {
    const zip = new JSZip();
    const files = await this.getAllFiles();

    for (const file of files) {
      if (!file.isFolder) {
        // Strip IBP:// for zip relative paths
        const relPath = file.path.replace(/^IBP:\/\//, '');
        zip.file(relPath, file.content);
      }
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  public async importZip(zipData: ArrayBuffer | Blob): Promise<number> {
    const zip = await JSZip.loadAsync(zipData);
    let count = 0;

    for (const [relPath, zipEntry] of Object.entries(zip.files)) {
      if (!zipEntry.dir) {
        const content = await zipEntry.async('string');
        const vfsPath = `IBP://${relPath}`;
        await this.writeFile(vfsPath, content);
        count++;
      }
    }

    return count;
  }

  public getSyncAdapter() {
    return {
      readFile: (p: string) => {
        const norm = this.normalizePath(p);
        const mem = this.memoryNodes.get(norm);
        if (!mem) throw new Error(`File not found: ${norm}`);
        return mem.content;
      },
      writeFile: (p: string, content: string) => {
        const norm = this.normalizePath(p);
        this.writeFile(norm, content);
      },
      appendFile: (p: string, content: string) => {
        const norm = this.normalizePath(p);
        this.appendFile(norm, content);
      },
      exists: (p: string) => {
        const norm = this.normalizePath(p);
        return this.memoryNodes.has(norm);
      },
      listFolder: (p: string) => {
        const norm = this.normalizePath(p);
        const results: string[] = [];
        for (const node of this.memoryNodes.values()) {
          if (node.parentPath === norm) results.push(node.name);
        }
        return results;
      },
      deleteFile: (p: string) => {
        const norm = this.normalizePath(p);
        this.deleteFile(norm);
      },
    };
  }
}

export const defaultVFS = new VirtualFileSystem();
