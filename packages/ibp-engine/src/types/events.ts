import { SourceSpan } from './tokens';
import { IBPValue } from './values';
import { IBPError } from '../diagnostics/error';

export type EngineEvent =
  | { type: 'line-entered'; span: SourceSpan; line: number; column: number }
  | { type: 'variable-changed'; name: string; oldValue?: IBPValue; newValue: IBPValue; scopeLevel: number }
  | { type: 'call-pushed'; recipeName: string; args: IBPValue[]; depth: number }
  | { type: 'call-popped'; recipeName: string; returnValue: IBPValue; depth: number }
  | { type: 'output'; text: string; mode: 'say' | 'shout' | 'whisper' }
  | { type: 'error'; error: IBPError }
  | { type: 'check-passed'; label?: string; actual: IBPValue }
  | { type: 'check-failed'; label?: string; actual: IBPValue; expected?: IBPValue; message: string }
  | { type: 'celebrate'; timestamp: number }
  | { type: 'todo'; text: string; span: SourceSpan }
  | { type: 'waiting'; durationSeconds: number }
  | { type: 'draw'; command: string; args: Record<string, any> }
  | { type: 'completed'; totalInstructions: number; durationMs: number };

export type EventHandler = (event: EngineEvent) => void;

