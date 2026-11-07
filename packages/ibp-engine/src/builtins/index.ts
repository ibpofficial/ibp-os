import { Environment } from '../runtime/environment';
import {
  IBPValue,
  makeNumber,
  makeText,
  makeBoolean,
  makeEmpty,
  makeList,
  makeBox,
  makeNativeRecipe,
  valueToString,
  valuesEqual,
} from '../types/values';
import { ExecutionContext } from '../types/limits';
import { IBPError } from '../diagnostics/error';
import { IBP_TIPS } from './tips';

export function registerBuiltins(env: Environment): void {
  // --- Text Builtins ---
  env.declareConst('length', makeNativeRecipe('length', (args) => {
    if (args.length < 1) throw new IBPError({ kind: 'TypeError', message: 'length requires 1 argument' });
    const arg = args[0];
    if (arg.kind === 'text') return makeNumber(arg.value.length);
    if (arg.kind === 'list') return makeNumber(arg.elements.length);
    if (arg.kind === 'box') return makeNumber(arg.fields.size);
    if (arg.kind === 'range') return makeNumber(Math.max(0, Math.floor((arg.end - arg.start) / arg.step) + 1));
    throw new IBPError({ kind: 'TypeError', message: `Cannot get length of kind "${arg.kind}".` });
  }));

  env.declareConst('upper', makeNativeRecipe('upper', (args) => {
    const val = args[0] ? valueToString(args[0]) : '';
    return makeText(val.toUpperCase());
  }));

  env.declareConst('lower', makeNativeRecipe('lower', (args) => {
    const val = args[0] ? valueToString(args[0]) : '';
    return makeText(val.toLowerCase());
  }));

  env.declareConst('trim', makeNativeRecipe('trim', (args) => {
    const val = args[0] ? valueToString(args[0]) : '';
    return makeText(val.trim());
  }));

  env.declareConst('split', makeNativeRecipe('split', (args) => {
    const text = args[0] ? valueToString(args[0]) : '';
    const delim = args[1] ? valueToString(args[1]) : '';
    const parts = text.split(delim).map(makeText);
    return makeList(parts);
  }));

  env.declareConst('join', makeNativeRecipe('join', (args) => {
    const list = args[0];
    if (!list || list.kind !== 'list') throw new IBPError({ kind: 'TypeError', message: 'join expects a list as first argument' });
    const delim = args[1] ? valueToString(args[1]) : '';
    const result = list.elements.map(valueToString).join(delim);
    return makeText(result);
  }));

  env.declareConst('replace', makeNativeRecipe('replace', (args) => {
    const text = args[0] ? valueToString(args[0]) : '';
    const search = args[1] ? valueToString(args[1]) : '';
    const repl = args[2] ? valueToString(args[2]) : '';
    return makeText(text.replaceAll ? text.replaceAll(search, repl) : text.split(search).join(repl));
  }));

  env.declareConst('contains', makeNativeRecipe('contains', (args) => {
    const target = args[0];
    if (!target) return makeBoolean(false);
    if (target.kind === 'text') {
      const search = args[1] ? valueToString(args[1]) : '';
      return makeBoolean(target.value.includes(search));
    }
    if (target.kind === 'list') {
      const search = args[1] || makeEmpty();
      return makeBoolean(target.elements.some((el) => valuesEqual(el, search)));
    }
    return makeBoolean(false);
  }));

  env.declareConst('starts', makeNativeRecipe('starts', (args) => {
    const text = args[0] ? valueToString(args[0]) : '';
    const prefix = args[1] ? valueToString(args[1]) : '';
    return makeBoolean(text.startsWith(prefix));
  }));

  env.declareConst('ends', makeNativeRecipe('ends', (args) => {
    const text = args[0] ? valueToString(args[0]) : '';
    const suffix = args[1] ? valueToString(args[1]) : '';
    return makeBoolean(text.endsWith(suffix));
  }));

  env.declareConst('repeatText', makeNativeRecipe('repeatText', (args) => {
    const text = args[0] ? valueToString(args[0]) : '';
    const count = args[1]?.kind === 'number' ? Math.max(0, Math.floor(args[1].value)) : 0;
    return makeText(text.repeat(count));
  }));

  env.declareConst('reverse', makeNativeRecipe('reverse', (args) => {
    const target = args[0];
    if (!target) return makeEmpty();
    if (target.kind === 'text') {
      return makeText(Array.from(target.value).reverse().join(''));
    }
    if (target.kind === 'list') {
      return makeList([...target.elements].reverse());
    }
    throw new IBPError({ kind: 'TypeError', message: 'reverse expects text or a list' });
  }));

  // --- Math Builtins ---
  env.declareConst('abs', makeNativeRecipe('abs', (args) => {
    const n = args[0]?.kind === 'number' ? args[0].value : 0;
    return makeNumber(Math.abs(n));
  }));

  env.declareConst('round', makeNativeRecipe('round', (args) => {
    const n = args[0]?.kind === 'number' ? args[0].value : 0;
    return makeNumber(Math.round(n));
  }));

  env.declareConst('floor', makeNativeRecipe('floor', (args) => {
    const n = args[0]?.kind === 'number' ? args[0].value : 0;
    return makeNumber(Math.floor(n));
  }));

  env.declareConst('ceil', makeNativeRecipe('ceil', (args) => {
    const n = args[0]?.kind === 'number' ? args[0].value : 0;
    return makeNumber(Math.ceil(n));
  }));

  env.declareConst('min', makeNativeRecipe('min', (args) => {
    if (args.length === 0) return makeNumber(0);
    const nums = args.filter((a) => a.kind === 'number').map((a) => (a as any).value);
    return makeNumber(Math.min(...nums));
  }));

  env.declareConst('max', makeNativeRecipe('max', (args) => {
    if (args.length === 0) return makeNumber(0);
    const nums = args.filter((a) => a.kind === 'number').map((a) => (a as any).value);
    return makeNumber(Math.max(...nums));
  }));

  env.declareConst('sqrt', makeNativeRecipe('sqrt', (args) => {
    const n = args[0]?.kind === 'number' ? args[0].value : 0;
    if (n < 0) throw new IBPError({ kind: 'MathError', message: 'Cannot compute square root of negative number' });
    return makeNumber(Math.sqrt(n));
  }));

  env.declareConst('power', makeNativeRecipe('power', (args) => {
    const base = args[0]?.kind === 'number' ? args[0].value : 0;
    const exp = args[1]?.kind === 'number' ? args[1].value : 1;
    return makeNumber(Math.pow(base, exp));
  }));

  // --- Seeded Randomness ---
  env.declareConst('luck', makeNativeRecipe('luck', (args, ctx) => {
    const min = args[0]?.kind === 'number' ? args[0].value : 1;
    const max = args[1]?.kind === 'number' ? args[1].value : 100;
    return makeNumber(ctx.prng.luck(min, max));
  }));

  env.declareConst('coin', makeNativeRecipe('coin', (_args, ctx) => {
    return makeText(ctx.prng.coin());
  }));

  env.declareConst('pick', makeNativeRecipe('pick', (args, ctx) => {
    const list = args[0];
    if (!list || list.kind !== 'list' || list.elements.length === 0) return makeEmpty();
    const chosen = ctx.prng.pick(list.elements);
    return chosen || makeEmpty();
  }));

  env.declareConst('shuffle', makeNativeRecipe('shuffle', (args, ctx) => {
    const list = args[0];
    if (!list || list.kind !== 'list') throw new IBPError({ kind: 'TypeError', message: 'shuffle expects a list' });
    return makeList(ctx.prng.shuffle(list.elements));
  }));

  // --- List Builtins ---
  env.declareConst('first', makeNativeRecipe('first', (args) => {
    const target = args[0];
    if (target?.kind === 'list') return target.elements[0] || makeEmpty();
    if (target?.kind === 'text') return makeText(target.value[0] || '');
    return makeEmpty();
  }));

  env.declareConst('last', makeNativeRecipe('last', (args) => {
    const target = args[0];
    if (target?.kind === 'list') return target.elements[target.elements.length - 1] || makeEmpty();
    if (target?.kind === 'text') return makeText(target.value[target.value.length - 1] || '');
    return makeEmpty();
  }));

  env.declareConst('total', makeNativeRecipe('total', (args) => {
    const target = args[0];
    if (!target || target.kind !== 'list') throw new IBPError({ kind: 'TypeError', message: 'total expects a list of numbers' });
    let sum = 0;
    for (const el of target.elements) {
      if (el.kind === 'number') sum += el.value;
    }
    return makeNumber(sum);
  }));

  env.declareConst('average', makeNativeRecipe('average', (args) => {
    const target = args[0];
    if (!target || target.kind !== 'list' || target.elements.length === 0) return makeNumber(0);
    let sum = 0;
    let count = 0;
    for (const el of target.elements) {
      if (el.kind === 'number') {
        sum += el.value;
        count++;
      }
    }
    return makeNumber(count === 0 ? 0 : sum / count);
  }));

  env.declareConst('unique', makeNativeRecipe('unique', (args) => {
    const target = args[0];
    if (!target || target.kind !== 'list') throw new IBPError({ kind: 'TypeError', message: 'unique expects a list' });
    const result: IBPValue[] = [];
    for (const item of target.elements) {
      if (!result.some((existing) => valuesEqual(existing, item))) {
        result.push(item);
      }
    }
    return makeList(result);
  }));

  env.declareConst('count', makeNativeRecipe('count', (args) => {
    const target = args[0];
    const match = args[1];
    if (!target || target.kind !== 'list') throw new IBPError({ kind: 'TypeError', message: 'count expects a list' });
    if (!match) return makeNumber(target.elements.length);
    let tally = 0;
    for (const el of target.elements) {
      if (valuesEqual(el, match)) tally++;
    }
    return makeNumber(tally);
  }));

  // Note: Higher order functions like map, filter, reduce, sort can also be used with native or user recipes.
  // We will wire call invocations inside the interpreter or native dispatcher.

  // --- Box Builtins ---
  env.declareConst('keys', makeNativeRecipe('keys', (args) => {
    const target = args[0];
    if (!target || target.kind !== 'box') throw new IBPError({ kind: 'TypeError', message: 'keys expects a box' });
    const keys = Array.from(target.fields.keys()).map(makeText);
    return makeList(keys);
  }));

  env.declareConst('values', makeNativeRecipe('values', (args) => {
    const target = args[0];
    if (!target || target.kind !== 'box') throw new IBPError({ kind: 'TypeError', message: 'values expects a box' });
    const values = Array.from(target.fields.values());
    return makeList(values);
  }));

  env.declareConst('has', makeNativeRecipe('has', (args) => {
    const target = args[0];
    const key = args[1] ? valueToString(args[1]) : '';
    if (!target || target.kind !== 'box') return makeBoolean(false);
    return makeBoolean(target.fields.has(key));
  }));

  // --- Types & Conversion ---
  env.declareConst('kind', makeNativeRecipe('kind', (args) => {
    const val = args[0];
    if (!val) return makeText('empty');
    return makeText(val.kind);
  }));

  env.declareConst('number', makeNativeRecipe('number', (args) => {
    const val = args[0];
    if (!val) return makeNumber(0);
    if (val.kind === 'number') return val;
    if (val.kind === 'text') {
      const parsed = parseFloat(val.value);
      if (isNaN(parsed)) throw new IBPError({ kind: 'TypeError', message: `Cannot convert "${val.value}" to a number.` });
      return makeNumber(parsed);
    }
    if (val.kind === 'yes/no') return makeNumber(val.value ? 1 : 0);
    throw new IBPError({ kind: 'TypeError', message: `Cannot convert ${val.kind} to number` });
  }));

  env.declareConst('text', makeNativeRecipe('text', (args) => {
    const val = args[0];
    return makeText(val ? valueToString(val) : '');
  }));

  // --- Time Builtins ---
  env.declareConst('today', makeNativeRecipe('today', (_args, ctx) => {
    return makeText(ctx.clock.today());
  }));

  env.declareConst('now', makeNativeRecipe('now', (_args, ctx) => {
    return makeNumber(ctx.clock.now());
  }));

  // --- Persistent Storage (recall) ---
  env.declareConst('recall', makeNativeRecipe('recall', (args, ctx) => {
    const key = args[0] ? valueToString(args[0]) : '';
    const defVal = args[1] || makeEmpty();
    const stored = ctx.storage.getItem(key);
    if (stored === null) return defVal;
    try {
      const parsed = JSON.parse(stored);
      if (typeof parsed === 'number') return makeNumber(parsed);
      if (typeof parsed === 'string') return makeText(parsed);
      if (typeof parsed === 'boolean') return makeBoolean(parsed);
      return makeText(stored);
    } catch {
      return makeText(stored);
    }
  }));

  // --- Filesystem Builtins ---
  env.declareConst('readFile', makeNativeRecipe('readFile', (args, ctx) => {
    if (!ctx.fs) throw new IBPError({ kind: 'FileError', message: 'No filesystem mounted.' });
    const path = args[0] ? valueToString(args[0]) : '';
    return makeText(ctx.fs.readFile(path));
  }));

  env.declareConst('writeFile', makeNativeRecipe('writeFile', (args, ctx) => {
    if (!ctx.fs) throw new IBPError({ kind: 'FileError', message: 'No filesystem mounted.' });
    const path = args[0] ? valueToString(args[0]) : '';
    const content = args[1] ? valueToString(args[1]) : '';
    ctx.fs.writeFile(path, content);
    return makeEmpty();
  }));

  env.declareConst('appendFile', makeNativeRecipe('appendFile', (args, ctx) => {
    if (!ctx.fs) throw new IBPError({ kind: 'FileError', message: 'No filesystem mounted.' });
    const path = args[0] ? valueToString(args[0]) : '';
    const content = args[1] ? valueToString(args[1]) : '';
    ctx.fs.appendFile(path, content);
    return makeEmpty();
  }));

  env.declareConst('exists', makeNativeRecipe('exists', (args, ctx) => {
    if (!ctx.fs) return makeBoolean(false);
    const path = args[0] ? valueToString(args[0]) : '';
    return makeBoolean(ctx.fs.exists(path));
  }));

  env.declareConst('listFolder', makeNativeRecipe('listFolder', (args, ctx) => {
    if (!ctx.fs) return makeList([]);
    const path = args[0] ? valueToString(args[0]) : '';
    const items = ctx.fs.listFolder(path).map(makeText);
    return makeList(items);
  }));

  env.declareConst('deleteFile', makeNativeRecipe('deleteFile', (args, ctx) => {
    if (!ctx.fs) throw new IBPError({ kind: 'FileError', message: 'No filesystem mounted.' });
    const path = args[0] ? valueToString(args[0]) : '';
    ctx.fs.deleteFile(path);
    return makeEmpty();
  }));

  // --- Delight Builtin ---
  env.declareConst('tip', makeNativeRecipe('tip', (_args, ctx) => {
    const tipIndex = ctx.prng.luck(0, IBP_TIPS.length - 1);
    return makeText(IBP_TIPS[tipIndex] || IBP_TIPS[0]);
  }));

  // --- Fun & Educational Easter Eggs ---
  const MAGIC_ANSWERS = [
    'It is certain! ✨',
    'Without a doubt. 🚀',
    'You may rely on it. 🔮',
    'Yes, definitely! 🌟',
    'Ask again later... ⏳',
    'Better not tell you now! 🤫',
    'Cannot predict now. 🌀',
    'Concentrate and ask again. 🧘',
    'Don\'t count on it. 🛑',
    'My reply is no. ❌',
    'My sources say no. 📉',
    'Outlook not so good. ⛈️',
    'Very doubtful. 🤔',
    'Signs point to yes! 🪐',
  ];

  env.declareConst('magic8Ball', makeNativeRecipe('magic8Ball', (_args, ctx) => {
    const idx = ctx.prng.luck(0, MAGIC_ANSWERS.length - 1);
    return makeText(MAGIC_ANSWERS[idx]);
  }));

  env.declareConst('rollDice', makeNativeRecipe('rollDice', (args, ctx) => {
    const sides = args[0] && args[0].kind === 'number' ? Math.max(2, Math.floor(args[0].value)) : 6;
    return makeNumber(ctx.prng.luck(1, sides));
  }));

  env.declareConst('d20', makeNativeRecipe('d20', (_args, ctx) => {
    const roll = ctx.prng.luck(1, 20);
    if (roll === 20) return makeText('🎲 20! CRITICAL SUCCESS! 🌟');
    if (roll === 1) return makeText('🎲 1... Critical failure! 💥');
    return makeText(`🎲 Rolled ${roll}`);
  }));

  const JOKES = [
    'Why do programmers prefer dark mode? Because light attracts bugs! 🐛',
    'There are only 10 kinds of people: those who understand binary, and those who don\'t.',
    'Why did the IBP programmer cross the road? To "give" to the other side! 🛣️',
    'A SQL query walks into a bar, walks up to two tables and asks: "Can I join you?" 🍻',
    'Why do recipe functions love coffee? Because they run in Java-free environments! ☕',
    'Hardware is what you can kick; software is what you can only curse at.',
    'There\'s no place like 127.0.0.1 🏡',
  ];

  env.declareConst('joke', makeNativeRecipe('joke', (_args, ctx) => {
    const idx = ctx.prng.luck(0, JOKES.length - 1);
    return makeText(JOKES[idx]);
  }));

  const ASCII_ART: Record<string, string> = {
    rocket: `
   /\\
  /  \\
 | IBP |
 |     |
/|  *  |\\
/_/   \\_\\
  /   \\
`,
    cat: `
 /\\_/\\  
( o.o ) 
 > ^ <  Meow from IBP!
`,
    dog: `
 / \\__
(    @\\___
 /         O
/   (_____/
/_____/   U
`,
    planet: `
    .----.
   /  🪐  \\
  |  IBP   |
   \\  OS  /
    '----'
`,
    heart: `
 <3 <3 <3
(  Love  )
 \\ IBP  /
  \\    /
   \\  /
    \\/
`,
    star: `
   ★
 ★ ★ ★
   ★
`,
  };

  env.declareConst('asciiArt', makeNativeRecipe('asciiArt', (args) => {
    const name = args[0] ? valueToString(args[0]).toLowerCase() : 'rocket';
    return makeText(ASCII_ART[name] || ASCII_ART.rocket);
  }));

  env.declareConst('confetti', makeNativeRecipe('confetti', (_args) => {
    return makeText('🎉 Confetti launched!');
  }));

  env.declareConst('badge', makeNativeRecipe('badge', (args) => {
    const label = args[0] ? valueToString(args[0]) : 'IBP';
    const icon = args[1] ? valueToString(args[1]) : '🪐';
    return makeText(`[ ${icon} ${label} ]`);
  }));
}

