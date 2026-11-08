import type { Monaco } from '@monaco-editor/react';
import {
  IBP_LANGUAGE_ID,
  monarchLanguageDefinition,
  IBP_KEYWORDS,
  IBP_BUILTINS,
} from '@ibp/language';
import { parse } from '@ibp/engine';

let isConfigured = false;

export function configureMonaco(monaco: Monaco): void {
  if (isConfigured) return;
  isConfigured = true;

  // 1. Register IBP Language
  monaco.languages.register({ id: IBP_LANGUAGE_ID });
  monaco.languages.setMonarchTokensProvider(
    IBP_LANGUAGE_ID,
    monarchLanguageDefinition as any
  );

  // 2. Define custom dark theme
  monaco.editor.defineTheme('ibp-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '38BDF8', fontStyle: 'bold' },
      { token: 'predefined', foreground: 'A78BFA' },
      { token: 'string', foreground: '34D399' },
      { token: 'number', foreground: 'FBBF24' },
      { token: 'number.float', foreground: 'FBBF24' },
      { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
      { token: 'operator', foreground: '60A5FA' },
      { token: 'delimiter', foreground: '94A3B8' },
      { token: 'identifier', foreground: 'F8FAFC' },
    ],
    colors: {
      'editor.background': '#0B1120',
      'editor.foreground': '#F8FAFC',
      'editorLineNumber.foreground': '#475569',
      'editorLineNumber.activeForeground': '#38BDF8',
      'editor.selectionBackground': '#1E293B',
      'editor.inactiveSelectionBackground': '#0F172A',
      'editorCursor.foreground': '#38BDF8',
      'editorGutter.background': '#0B1120',
      'editorOverviewRuler.border': '#0B1120',
    },
  });

  // 2b. Define custom light theme
  monaco.editor.defineTheme('ibp-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '0284C7', fontStyle: 'bold' },
      { token: 'predefined', foreground: '7C3AED' },
      { token: 'string', foreground: '059669' },
      { token: 'number', foreground: 'D97706' },
      { token: 'number.float', foreground: 'D97706' },
      { token: 'comment', foreground: '94A3B8', fontStyle: 'italic' },
      { token: 'operator', foreground: '2563EB' },
      { token: 'delimiter', foreground: '64748B' },
      { token: 'identifier', foreground: '0F172A' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#0F172A',
      'editorLineNumber.foreground': '#94A3B8',
      'editorLineNumber.activeForeground': '#0284C7',
      'editor.selectionBackground': '#E0F2FE',
      'editor.inactiveSelectionBackground': '#F1F5F9',
      'editorCursor.foreground': '#0284C7',
      'editorGutter.background': '#F8FAFC',
      'editorOverviewRuler.border': '#E2E8F0',
    },
  });

  // 3. Autocomplete / Completion Provider
  monaco.languages.registerCompletionItemProvider(IBP_LANGUAGE_ID, {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const keywordSuggestions = IBP_KEYWORDS.map((kw) => ({
        label: kw,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: kw,
        detail: `IBP Keyword`,
        range,
      }));

      const builtinSuggestions = IBP_BUILTINS.map((fn) => ({
        label: fn,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: fn,
        detail: `IBP Builtin Function`,
        range,
      }));

      const snippetSuggestions = [
        {
          label: 'when',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['when ${1:condition} {', '  ${2}', '}'].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'When / conditional block',
          range,
        },
        {
          label: 'recipe',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['recipe ${1:name}(${2:params}) {', '  give ${3}', '}'].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Recipe (Function) declaration',
          range,
        },
        {
          label: 'count',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['count ${1:i} from ${2:1} to ${3:10} {', '  ${4}', '}'].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Counting loop',
          range,
        },
        {
          label: 'each',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['each ${1:item} in ${2:collection} {', '  ${3}', '}'].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Iteration loop',
          range,
        },
        {
          label: 'box',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ['box ${1:name} {', '  ${2:key}: ${3:value}', '}'].join('\n'),
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Box (Record/Object) declaration',
          range,
        },
      ];

      return {
        suggestions: [...keywordSuggestions, ...builtinSuggestions, ...snippetSuggestions],
      };
    },
  });

  // 4. Hover Documentation Provider
  monaco.languages.registerHoverProvider(IBP_LANGUAGE_ID, {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const w = word.word.toLowerCase();
      if (w === 'keep') {
        return {
          contents: [
            { value: '**keep** (variable declaration)' },
            { value: 'Declares a mutable variable that can be changed later.\n\n`keep score = 100`' },
          ],
        };
      }
      if (w === 'lock') {
        return {
          contents: [
            { value: '**lock** (constant declaration)' },
            { value: 'Declares an immutable constant. Reassigning causes an error.\n\n`lock PI = 3.14159`' },
          ],
        };
      }
      if (w === 'recipe') {
        return {
          contents: [
            { value: '**recipe** (function declaration)' },
            { value: 'Defines a callable recipe in IBP.\n\n`recipe add(a, b) => a + b`' },
          ],
        };
      }
      if (w === 'box') {
        return {
          contents: [
            { value: '**box** (object/record)' },
            { value: 'Defines a key-value record container.\n\n`box user { name: "Aria", score: 50 }`' },
          ],
        };
      }
      if (w === 'luck') {
        return {
          contents: [
            { value: '**luck(min, max)**' },
            { value: 'Returns a deterministic, seeded pseudo-random integer in `[min, max]`.' },
          ],
        };
      }
      if (w === 'coin') {
        return {
          contents: [
            { value: '**coin()**' },
            { value: 'Returns `"heads"` or `"tails"` using the seeded PRNG.' },
          ],
        };
      }

      return null;
    },
  });
}

export function updateEditorMarkers(monaco: Monaco, model: any, code: string): void {
  try {
    const { errors } = parse(code);
    const markers = errors.map((err) => {
      const line = err.span ? err.span.start.line : 1;
      const col = err.span ? err.span.start.column : 1;
      const endLine = err.span ? err.span.end.line : line;
      const endCol = err.span ? Math.max(col + 1, err.span.end.column) : col + 4;

      let msg = `${err.kind}: ${err.message}`;
      if (err.suggestion) msg += ` (Did you mean "${err.suggestion}"?)`;
      if (err.hint) msg += ` - Try this: ${err.hint}`;

      return {
        severity: monaco.MarkerSeverity.Error,
        message: msg,
        startLineNumber: line,
        startColumn: col,
        endLineNumber: endLine,
        endColumn: endCol,
      };
    });

    monaco.editor.setModelMarkers(model, 'ibp-parser', markers);
  } catch (e) {
    // Graceful recovery: clear markers on unexpected exception
    monaco.editor.setModelMarkers(model, 'ibp-parser', []);
  }
}

