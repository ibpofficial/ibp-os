import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import {
  executeIBP,
  formatIBP,
  IBP_TIPS,
  parse,
  IBPSession,
  Interpreter,
  IBPError,
  valueToString,
} from '@ibp/engine';

export const VERSION = '0.1.0';

export async function runCLI(args: string[]): Promise<void> {
  const command = args[0] || 'help';

  switch (command.toLowerCase()) {
    case 'help':
    case '--help':
    case '-h': {
      printHelp();
      process.exit(0);
      break;
    }

    case 'version':
    case '--version':
    case '-v': {
      console.log(`IBP Language & CLI v${VERSION}`);
      process.exit(0);
      break;
    }

    case 'tip': {
      const tip = IBP_TIPS[Math.floor(Math.random() * IBP_TIPS.length)];
      console.log(`\x1b[36m💡 IBP Tip:\x1b[0m ${tip}`);
      process.exit(0);
      break;
    }

    case 'check': {
      const file = args[1];
      if (!file) {
        console.error('Usage: ibp check <file.ibp>');
        process.exit(1);
      }
      const fullPath = path.resolve(process.cwd(), file);
      if (!fs.existsSync(fullPath)) {
        console.error(`Error: File not found: ${file}`);
        process.exit(1);
      }
      const source = fs.readFileSync(fullPath, 'utf-8');
      const { errors } = parse(source);
      if (errors.length > 0) {
        console.error(errors[0].format(source));
        process.exit(2); // Exit code 2 on syntax error
      }
      console.log(`\x1b[32m✔ Syntax OK: ${file}\x1b[0m`);
      process.exit(0);
      break;
    }

    case 'fmt': {
      const file = args[1];
      if (!file) {
        console.error('Usage: ibp fmt <file.ibp>');
        process.exit(1);
      }
      const fullPath = path.resolve(process.cwd(), file);
      if (!fs.existsSync(fullPath)) {
        console.error(`Error: File not found: ${file}`);
        process.exit(1);
      }
      const source = fs.readFileSync(fullPath, 'utf-8');
      try {
        const formatted = formatIBP(source);
        fs.writeFileSync(fullPath, formatted, 'utf-8');
        console.log(`\x1b[32m✔ Formatted: ${file}\x1b[0m`);
        process.exit(0);
      } catch (err: any) {
        console.error(`Error formatting ${file}: ${err.message || err}`);
        process.exit(1);
      }
      break;
    }

    case 'test': {
      const file = args[1];
      if (!file) {
        console.error('Usage: ibp test <file.ibp>');
        process.exit(1);
      }
      const fullPath = path.resolve(process.cwd(), file);
      if (!fs.existsSync(fullPath)) {
        console.error(`Error: File not found: ${file}`);
        process.exit(1);
      }
      const source = fs.readFileSync(fullPath, 'utf-8');
      const { errors } = parse(source);
      if (errors.length > 0) {
        console.error(errors[0].format(source));
        process.exit(2); // Syntax error exit code 2
      }

      const checks: { label?: string; passed: boolean; message?: string }[] = [];
      const { error } = executeIBP(source, {
        sourceCode: source,
        onEvent: (ev) => {
          if (ev.type === 'check-passed') {
            checks.push({ label: ev.label, passed: true });
          }
          if (ev.type === 'check-failed') {
            checks.push({ label: ev.label, passed: false, message: ev.message });
          }
        },
      });

      if (error) {
        console.error(error.format(source));
        process.exit(1); // Runtime error exit code 1
      }

      let failed = 0;
      checks.forEach((c, idx) => {
        const name = c.label || `Check #${idx + 1}`;
        if (c.passed) {
          console.log(`\x1b[32m✔ ${name}: PASSED\x1b[0m`);
        } else {
          failed++;
          console.log(`\x1b[31m✖ ${name}: FAILED - ${c.message}\x1b[0m`);
        }
      });

      if (failed > 0) {
        console.error(`\n\x1b[31m${failed} check(s) failed.\x1b[0m`);
        process.exit(3); // Exit code 3 on failed expect checks
      } else {
        console.log(`\n\x1b[32mAll ${checks.length} check(s) passed.\x1b[0m`);
        process.exit(0);
      }
      break;
    }

    case 'run': {
      const file = args[1];
      let source = '';
      let sourcePath = '';

      if (file) {
        sourcePath = path.resolve(process.cwd(), file);
        if (!fs.existsSync(sourcePath)) {
          console.error(`Error: File not found: ${file}`);
          process.exit(1);
        }
        source = fs.readFileSync(sourcePath, 'utf-8');
      } else if (!process.stdin.isTTY) {
        // Read from stdin if piped
        source = await readAllStdin();
      } else {
        console.error('Usage: ibp run <file.ibp>');
        process.exit(1);
      }

      const { program, errors } = parse(source);
      if (errors.length > 0) {
        console.error(errors[0].format(source));
        process.exit(2); // Syntax error exit code 2
      }

      await runInteractiveEngine(program, source);
      process.exit(0);
      break;
    }

    case 'repl': {
      await startRepl();
      break;
    }

    case 'list': {
      const currentDir = process.cwd();
      const files = fs.readdirSync(currentDir).filter((f) => f.toLowerCase().endsWith('.ibp'));
      console.log(`\x1b[34m📁 IBP files in ${currentDir}:\x1b[0m`);
      if (files.length === 0) {
        console.log('  No .ibp files found in current directory.');
      } else {
        files.forEach((f) => console.log(`  - ${f}`));
      }
      process.exit(0);
      break;
    }

    case 'system': {
      console.log('\x1b[36m💻 IBP OS System Information:\x1b[0m');
      console.log(`  Engine: @ibp/engine v${VERSION}`);
      console.log(`  Node.js: ${process.version}`);
      console.log(`  Platform: ${process.platform} (${process.arch})`);
      process.exit(0);
      break;
    }

    case 'memory': {
      const mem = process.memoryUsage();
      console.log('\x1b[36m🧠 IBP CLI Process Memory:\x1b[0m');
      console.log(`  Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Heap Total: ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  RSS: ${(mem.rss / 1024 / 1024).toFixed(2)} MB`);
      process.exit(0);
      break;
    }

    case 'clear': {
      console.clear();
      process.exit(0);
      break;
    }

    default: {
      console.error(`Unknown command: "${command}". Run "ibp help" for available commands.`);
      process.exit(1);
    }
  }
}

function printHelp(): void {
  console.log(`
\x1b[36mIBP OS - CLI v${VERSION}\x1b[0m
An educational, beginner-friendly programming language.

\x1b[33mUsage:\x1b[0m
  ibp <command> [options]

\x1b[33mCommands:\x1b[0m
  ibp run <file.ibp>    Execute an IBP source file (interactive & piped input)
  ibp repl              Launch persistent interactive IBP REPL session
  ibp check <file.ibp>  Parse only and report syntax errors
  ibp test <file.ibp>   Run expect checks with pass/fail summary
  ibp fmt <file.ibp>    Format source file in place
  ibp list              List .ibp files in the current folder
  ibp tip               Display a helpful language tip
  ibp version           Print the current IBP CLI and engine version
  ibp system            Display system and engine architecture stats
  ibp memory            Display process memory usage
  ibp clear             Clear terminal screen
  ibp help              Show this help reference
`);
}

function readAllStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
  });
}

async function runInteractiveEngine(program: any, source: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const promptUser = (promptText: string): Promise<string> => {
    return new Promise((resolve) => {
      const p = promptText ? (promptText.endsWith(' ') ? promptText : promptText + ' ') : '> ';
      rl.question(p, (answer) => {
        resolve(answer);
      });
    });
  };

  const interpreter = new Interpreter({
    sourceCode: source,
    onEvent: (ev) => {
      if (ev.type === 'output') {
        // Output already formatted
        console.log(ev.text);
      } else if (ev.type === 'celebrate') {
        console.log('\x1b[33m🎉 [CELEBRATE] Confetti burst!\x1b[0m');
      }
    },
  });

  const gen = interpreter.runProgram(program);
  let nextArg: unknown = undefined;

  try {
    while (true) {
      const res = gen.next(nextArg);
      nextArg = undefined;
      if (res.done) break;

      const ev = res.value;
      if (ev && typeof ev === 'object' && ev.type === 'awaiting-input') {
        const answer = await promptUser(ev.prompt);
        nextArg = answer;
      }
    }
  } catch (err: any) {
    rl.close();
    if (err instanceof IBPError) {
      console.error('\n' + err.format(source));
    } else {
      console.error('\n' + String(err.message || err));
    }
    process.exit(1); // Runtime error exit code 1
  } finally {
    rl.close();
  }
}

function startRepl(): Promise<void> {
  return new Promise((resolve) => {
    console.log(`\x1b[36mIBP Interactive REPL (v${VERSION})\x1b[0m`);
    console.log('Type code or expressions. Commands: .help, .vars, .reset, .load <file>, .exit\n');

    const session = new IBPSession({
      printBareExpressions: true,
      onEvent: (ev) => {
        if (ev.type === 'celebrate') {
          console.log('\x1b[33m🎉 [CELEBRATE] Confetti burst!\x1b[0m');
        }
      },
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '\x1b[34mibp>\x1b[0m ',
    });

    let buffer = '';
    rl.prompt();

    rl.on('line', (line) => {
      const trimmed = line.trim();

      if (trimmed === '.exit' || (!buffer && (trimmed === 'exit' || trimmed === 'quit'))) {
        rl.close();
        return;
      }

      if (trimmed === '.help') {
        console.log(`REPL Commands:
  .vars          List active variables & types
  .reset         Reset session state
  .load <file>   Execute an external file into this session
  .exit          Exit REPL`);
        rl.prompt();
        return;
      }

      if (trimmed === '.reset') {
        session.reset();
        buffer = '';
        console.log('\x1b[32m✔ Session reset. All variables and recipes cleared.\x1b[0m');
        rl.setPrompt('\x1b[34mibp>\x1b[0m ');
        rl.prompt();
        return;
      }

      if (trimmed === '.vars') {
        const vars = session.getVariables();
        const entries = Object.entries(vars);
        if (entries.length === 0) {
          console.log('No active variables in session.');
        } else {
          entries.forEach(([name, info]) => {
            console.log(`  ${name}: ${info.kind} = ${valueToString(info.value)}`);
          });
        }
        rl.prompt();
        return;
      }

      if (trimmed.startsWith('.load ')) {
        const target = trimmed.slice(6).trim();
        const full = path.resolve(process.cwd(), target);
        if (fs.existsSync(full)) {
          const fileContent = fs.readFileSync(full, 'utf-8');
          const res = session.eval(fileContent);
          res.output.forEach((o) => console.log(o));
          if (res.error) {
            console.error('\x1b[31m' + res.error.format(fileContent) + '\x1b[0m');
          } else {
            console.log(`\x1b[32m✔ Loaded ${target} into session.\x1b[0m`);
          }
        } else {
          console.error(`\x1b[31mFile not found: ${target}\x1b[0m`);
        }
        rl.prompt();
        return;
      }

      const fullCode = buffer ? `${buffer}\n${line}` : line;

      if (!session.isComplete(fullCode)) {
        buffer = fullCode;
        rl.setPrompt('\x1b[33m...>\x1b[0m ');
        rl.prompt();
        return;
      }

      buffer = '';
      rl.setPrompt('\x1b[34mibp>\x1b[0m ');

      if (fullCode.trim().length > 0) {
        const res = session.eval(fullCode);
        res.output.forEach((o) => console.log(o));
        if (res.error) {
          console.error('\x1b[31m' + res.error.format(fullCode) + '\x1b[0m');
        }
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log('\nGoodbye from IBP!');
      resolve();
      process.exit(0);
    });
  });
}
