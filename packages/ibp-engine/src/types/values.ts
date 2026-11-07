import { BlockStmt, Expression, RecipeParam } from './ast';
import { Environment } from '../runtime/environment';
import { ExecutionContext } from './limits';

export type IBPKind =
  | 'number'
  | 'text'
  | 'yes/no'
  | 'empty'
  | 'list'
  | 'box'
  | 'range'
  | 'recipe';

export interface IBPNumber {
  kind: 'number';
  value: number;
}

export interface IBPText {
  kind: 'text';
  value: string;
}

export interface IBPBoolean {
  kind: 'yes/no';
  value: boolean;
}

export interface IBPEmpty {
  kind: 'empty';
  value: null;
}

export interface IBPList {
  kind: 'list';
  elements: IBPValue[];
}

export interface IBPBox {
  kind: 'box';
  fields: Map<string, IBPValue>;
}

export interface IBPRange {
  kind: 'range';
  start: number;
  end: number;
  step: number;
}

export interface UserRecipe {
  kind: 'recipe';
  name: string;
  isNative: false;
  params: RecipeParam[];
  body: BlockStmt | Expression;
  isArrow: boolean;
  closure: Environment;
}

export interface NativeRecipe {
  kind: 'recipe';
  name: string;
  isNative: true;
  fn: (args: IBPValue[], context: ExecutionContext) => IBPValue;
}

export type IBPRecipe = UserRecipe | NativeRecipe;

export type IBPValue =
  | IBPNumber
  | IBPText
  | IBPBoolean
  | IBPEmpty
  | IBPList
  | IBPBox
  | IBPRange
  | IBPRecipe;

// Value Constructors
export const makeNumber = (n: number): IBPNumber => ({ kind: 'number', value: n });
export const makeText = (s: string): IBPText => ({ kind: 'text', value: s });
export const makeBoolean = (b: boolean): IBPBoolean => ({ kind: 'yes/no', value: b });
export const makeEmpty = (): IBPEmpty => ({ kind: 'empty', value: null });
export const makeList = (elements: IBPValue[] = []): IBPList => ({ kind: 'list', elements });
export const makeBox = (fields: Record<string, IBPValue> | Map<string, IBPValue> = {}): IBPBox => {
  if (fields instanceof Map) {
    return { kind: 'box', fields: new Map(fields) };
  }
  const map = new Map<string, IBPValue>();
  for (const [k, v] of Object.entries(fields)) {
    map.set(k, v);
  }
  return { kind: 'box', fields: map };
};
export const makeRange = (start: number, end: number, step = 1): IBPRange => ({
  kind: 'range',
  start,
  end,
  step: step === 0 ? 1 : step,
});

export const makeNativeRecipe = (
  name: string,
  fn: (args: IBPValue[], context: ExecutionContext) => IBPValue
): NativeRecipe => ({
  kind: 'recipe',
  name,
  isNative: true,
  fn,
});

// String representation
export function valueToString(val: IBPValue): string {
  switch (val.kind) {
    case 'number':
      return Number.isFinite(val.value) ? String(val.value) : val.value > 0 ? 'Infinity' : '-Infinity';
    case 'text':
      return val.value;
    case 'yes/no':
      return val.value ? 'yes' : 'no';
    case 'empty':
      return 'empty';
    case 'list':
      return `[${val.elements.map(valueToInspectString).join(', ')}]`;
    case 'box': {
      const pairs: string[] = [];
      for (const [k, v] of val.fields.entries()) {
        pairs.push(`${k}: ${valueToInspectString(v)}`);
      }
      return `box { ${pairs.join(', ')} }`;
    }
    case 'range':
      return `${val.start}..${val.end}`;
    case 'recipe':
      return `<recipe ${val.name}>`;
  }
}

export function valueToInspectString(val: IBPValue): string {
  if (val.kind === 'text') {
    return `"${val.value.replace(/"/g, '\\"')}"`;
  }
  return valueToString(val);
}

// Equality comparison
export function valuesEqual(a: IBPValue, b: IBPValue): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case 'number':
      return (b as IBPNumber).value === a.value;
    case 'text':
      return (b as IBPText).value === a.value;
    case 'yes/no':
      return (b as IBPBoolean).value === a.value;
    case 'empty':
      return true;
    case 'range': {
      const br = b as IBPRange;
      return a.start === br.start && a.end === br.end && a.step === br.step;
    }
    case 'list': {
      const bl = b as IBPList;
      if (a.elements.length !== bl.elements.length) return false;
      for (let i = 0; i < a.elements.length; i++) {
        if (!valuesEqual(a.elements[i], bl.elements[i])) return false;
      }
      return true;
    }
    case 'box': {
      const bb = b as IBPBox;
      if (a.fields.size !== bb.fields.size) return false;
      for (const [k, v] of a.fields.entries()) {
        const otherVal = bb.fields.get(k);
        if (!otherVal || !valuesEqual(v, otherVal)) return false;
      }
      return true;
    }
    case 'recipe':
      return a === b;
  }
}

