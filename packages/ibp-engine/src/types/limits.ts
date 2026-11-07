import { PRNG } from '../runtime/prng';
import { VirtualClock } from '../runtime/clock';
import { IBPValue } from './values';

export interface ExecutionLimits {
  maxInstructions: number;
  maxRecursionDepth: number;
  maxLoopIterations: number;
  maxOutputLength: number;
  timeoutMs: number;
}

export const DEFAULT_LIMITS: ExecutionLimits = {
  maxInstructions: 500_000,
  maxRecursionDepth: 250,
  maxLoopIterations: 100_000,
  maxOutputLength: 500_000,
  timeoutMs: 5_000,
};

export interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export interface FilesystemAdapter {
  readFile: (path: string) => string;
  writeFile: (path: string, content: string) => void;
  appendFile: (path: string, content: string) => void;
  exists: (path: string) => boolean;
  listFolder: (path: string) => string[];
  deleteFile: (path: string) => void;
}

export interface ExecutionContext {
  limits: ExecutionLimits;
  instructionsCount: number;
  currentCallDepth: number;
  outputLength: number;
  startTime: number;
  prng: PRNG;
  clock: VirtualClock;
  storage: StorageAdapter;
  fs?: FilesystemAdapter;
  inputProvider?: (prompt: string, isNumber: boolean) => string | Promise<string>;
  onCheck?: (label: string, passed: boolean, expected?: IBPValue, actual?: IBPValue) => void;
}

