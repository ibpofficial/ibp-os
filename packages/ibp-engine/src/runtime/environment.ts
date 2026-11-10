import { IBPValue } from '../types/values';
import { SourceSpan } from '../types/tokens';
import { IBPError, findClosest } from '../diagnostics/error';
import { IBP_KEYWORDS } from '@ibp/language';

export interface Binding {
  value: IBPValue;
  isConstant: boolean;
  span?: SourceSpan;
}

export class Environment {
  public readonly parent: Environment | null;
  private readonly bindings = new Map<string, Binding>();
  public readonly level: number;

  constructor(parent: Environment | null = null) {
    this.parent = parent;
    this.level = parent ? parent.level + 1 : 0;
  }

  public declareVar(name: string, value: IBPValue, span?: SourceSpan): void {
    const existing = this.bindings.get(name);
    if (existing && existing.isConstant) {
      throw new IBPError({
        kind: 'TypeError',
        message: `Cannot re-declare locked constant "${name}" as a variable.`,
        span,
        hint: `Use a different name or unlock "${name}".`,
      });
    }
    this.bindings.set(name, { value, isConstant: false, span });
  }

  public declareConst(name: string, value: IBPValue, span?: SourceSpan): void {
    if (this.bindings.has(name)) {
      throw new IBPError({
        kind: 'TypeError',
        message: `Cannot re-declare "${name}" as a locked constant.`,
        span,
        hint: `Constants cannot be re-declared in the same scope.`,
      });
    }
    this.bindings.set(name, { value, isConstant: true, span });
  }

  public assign(name: string, value: IBPValue, span?: SourceSpan): void {
    let curr: Environment | null = this;
    while (curr) {
      const binding = curr.bindings.get(name);
      if (binding) {
        if (binding.isConstant) {
          throw new IBPError({
            kind: 'TypeError',
            message: `Cannot reassign locked constant "${name}": can't change a locked value.`,
            span,
            hint: `Define "${name}" with "keep" instead of "lock" if it needs to change.`,
          });
        }
        binding.value = value;
        return;
      }
      curr = curr.parent;
    }

    const inScopeNames = this.getAllVariableNames();
    const suggestion = findClosest(name, inScopeNames);

    throw new IBPError({
      kind: 'NameError',
      message: `I don't know anything called "${name}".`,
      span,
      suggestion,
      hint: `define it first with  keep ${name} = ...`,
    });
  }

  public assignOrDeclare(name: string, value: IBPValue, span?: SourceSpan): void {
    let curr: Environment | null = this;
    while (curr) {
      const binding = curr.bindings.get(name);
      if (binding) {
        if (binding.isConstant) {
          throw new IBPError({
            kind: 'TypeError',
            message: `Cannot reassign locked constant "${name}": can't change a locked value.`,
            span,
            hint: `Define "${name}" with "keep" instead of "lock" if it needs to change.`,
          });
        }
        binding.value = value;
        return;
      }
      curr = curr.parent;
    }

    // Not found in any enclosing scope: DECLARE in the current scope
    this.declareVar(name, value, span);
  }

  public get(name: string, span?: SourceSpan): IBPValue {
    let curr: Environment | null = this;
    while (curr) {
      const binding = curr.bindings.get(name);
      if (binding) {
        return binding.value;
      }
      curr = curr.parent;
    }

    const inScopeNames = this.getAllVariableNames();
    const suggestion = findClosest(name, inScopeNames);

    throw new IBPError({
      kind: 'NameError',
      message: `I don't know anything called "${name}".`,
      span,
      suggestion,
      hint: `define it first with  keep ${name} = ...`,
    });
  }

  public has(name: string): boolean {
    if (this.bindings.has(name)) return true;
    return this.parent ? this.parent.has(name) : false;
  }

  public getAllVariableNames(): string[] {
    const names = new Set<string>();
    let curr: Environment | null = this;
    while (curr) {
      for (const k of curr.bindings.keys()) {
        names.add(k);
      }
      curr = curr.parent;
    }
    return Array.from(names);
  }

  public cloneBindings(): Map<string, Binding> {
    const clone = new Map<string, Binding>();
    for (const [k, v] of this.bindings.entries()) {
      clone.set(k, { ...v });
    }
    return clone;
  }

  public restoreBindings(snapshot: Map<string, Binding>): void {
    this.bindings.clear();
    for (const [k, v] of snapshot.entries()) {
      this.bindings.set(k, { ...v });
    }
  }

  public inspect(): Record<string, { kind: string; isConstant: boolean; value: IBPValue }> {
    const result: Record<string, { kind: string; isConstant: boolean; value: IBPValue }> = {};
    for (const [k, v] of this.bindings.entries()) {
      result[k] = {
        kind: v.value.kind,
        isConstant: v.isConstant,
        value: v.value,
      };
    }
    return result;
  }
}

