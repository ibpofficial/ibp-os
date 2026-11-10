import { describe, it, expect } from 'vitest';
import { generateLanguageRulebookMarkdown, generateLanguageRulebookHTML } from '../src/apps/LangCraft/rulebookGenerator';
import { generateIBPCompilerScript, generateVSCodePackageZip } from '../src/apps/LangCraft/compilerGenerator';
import { CustomLanguageSpec, STARTER_TEMPLATES } from '../src/apps/LangCraft/index';

const testSpec: CustomLanguageSpec = {
  name: 'BoloLang',
  author: 'Architect',
  description: 'Zero-comma Hinglish language with karo...bas block syntax and punctuation customization.',
  syntax: {
    blockStyle: 'keywords',
    blockStartKeyword: 'karo',
    blockEndKeyword: 'bas',
    statementTerminator: ';',
    statementTerminatorPolicy: 'optional',
    callDelimiterStyle: 'parentheses',
    listDelimiterStyle: 'square',
    memberAccessSign: '.',
    stringDelimiter: 'both',
    commaPolicy: 'forbidden',
    variableDeclMode: 'keyword',
    assignmentOperator: '=',
    commentStyle: '#',
    equalityOperator: '==',
    inequalityOperator: '!=',
    andOperator: 'aur',
    orOperator: 'ya',
    notOperator: 'mat',
  },
  keywords: {
    say: 'bolo',
    shout: 'chillao',
    whisper: 'dhire',
    ask: 'pucho',
    keep: 'rakho',
    lock: 'pakka',
    when: 'agar',
    orwhen: 'warna_agar',
    otherwise: 'warna',
    unless: 'bina',
    repeat: 'dohrao',
    times: 'baar',
    count: 'gino',
    from: 'se',
    to: 'tak',
    each: 'har',
    in: 'mein',
    while: 'jabtak',
    recipe: 'tareeka',
    give: 'de_do',
    box: 'dibba',
    yes: 'haan',
    no: 'nahi',
    empty: 'khali',
    celebrate: 'jashn',
  },
  customFunctions: [
    {
      id: '1',
      name: 'varg',
      params: 'x',
      body: 'x * x',
      description: 'Calculates the square of a number',
    },
    {
      id: '2',
      name: 'jodo',
      params: 'a, b',
      body: 'a + b',
      description: 'Sums two values',
    },
  ],
  sampleCode: 'bolo "Namaste World"\nrakho ans = varg(5)\nbolo "Square is:" ans',
};

describe('LangCraft Rulebook Generator', () => {
  it('generates comprehensive markdown rulebook with all sections', () => {
    const md = generateLanguageRulebookMarkdown(testSpec);
    expect(md).toContain('# 📖 BoloLang Specification & Language Rulebook');
    expect(md).toContain('**Author:** Architect');
    expect(md).toContain('karo');
    expect(md).toContain('bas');
    expect(md).toContain('varg');
    expect(md).toContain('jodo');
    expect(md).toContain('Formal EBNF Grammar');
  });

  it('generates self-contained print-to-PDF HTML with styling', () => {
    const html = generateLanguageRulebookHTML(testSpec);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('BoloLang - Specification & Language Rulebook');
    expect(html).toContain('size: A4');
    expect(html).toContain('karo');
    expect(html).toContain('bas');
    expect(html).toContain('varg(x)');
    expect(html).toContain('Formal EBNF Grammar');
  });
});

describe('LangCraft Compiler & VS Code Generator', () => {
  it('generates a valid standalone ibpcompiler.js script', () => {
    const script = generateIBPCompilerScript(testSpec);
    expect(script).toContain('#!/usr/bin/env node');
    expect(script).toContain('ibpcompiler - Standalone CLI Compiler & Runtime for BoloLang');
    expect(script).toContain('function compileCustomCode');
    expect(script).toContain('function runIBPCode');
    expect(script).toContain('BoloLang');
  });

  it('generates a complete VS Code Starter Kit ZIP archive', async () => {
    const zipBlob = await generateVSCodePackageZip(testSpec);
    expect(zipBlob).toBeDefined();
    expect(zipBlob.size).toBeGreaterThan(500);
  });
});

describe('EasyCalc Flow & Dynamic Calculation', () => {
  it('includes EasyCalc Flow in STARTER_TEMPLATES', () => {
    expect(STARTER_TEMPLATES.easycalc).toBeDefined();
    expect(STARTER_TEMPLATES.easycalc.name).toBe('EasyCalc Flow');
    expect(STARTER_TEMPLATES.easycalc.syntax.easyFlowMode).toBe(true);
    expect(STARTER_TEMPLATES.easycalc.sampleCode).toContain('inputchoose');
  });
});
