export interface FileEntry {
  path: string;
  name: string;
  content: string;
  isFolder: boolean;
  updatedAt: number;
}

export interface IVFS {
  readFile(path: string): Promise<string> | string;
  writeFile(path: string, content: string): Promise<void> | void;
  appendFile(path: string, content: string): Promise<void> | void;
  exists(path: string): Promise<boolean> | boolean;
  listFolder(path: string): Promise<string[]> | string[];
  deleteFile(path: string): Promise<void> | void;
}

