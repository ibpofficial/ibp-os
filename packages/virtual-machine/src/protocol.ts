import { ExecutionLimits, ExecutionStatus, EngineEvent } from '@ibp/engine';

export interface InputRequest {
  id: string;
  prompt: string;
  kind: 'text' | 'number';
}

export type MainToWorkerMessage =
  | { type: 'run'; code: string; seed?: number; limits?: Partial<ExecutionLimits> }
  | { type: 'input-reply'; id: string; value: string }
  | { type: 'stop' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'step' }
  | { type: 'eval'; line: string }
  | { type: 'reset-session' };

export type WorkerToMainMessage =
  | { type: 'output'; text: string; mode: 'say' | 'shout' | 'whisper' }
  | { type: 'awaiting-input'; id: string; prompt: string; kind: 'text' | 'number' }
  | { type: 'event'; event: EngineEvent }
  | { type: 'status'; status: ExecutionStatus }
  | { type: 'error'; error: any }
  | { type: 'done'; durationMs: number; value?: any };

