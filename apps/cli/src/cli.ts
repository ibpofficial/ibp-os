import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { executeIBP, IBP_TIPS, Interpreter, parse } from '@ibp/engine';

export const VERSION = '0.1.0';

export async function runCLI(args: string[]): Promise<void> {
  const command = args[0] || 'help';

  switch (command.toLowerCase()) {
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;

    case 'version':
    case '--version':
    case '-v':
      console.log(`IBP Language & CLI v${VERSION}`);
      break;

    case 'tip': {
      const tip = IBP_TIPS[Math.floor(Math.random() * IBP_TIPS.length)];
      console.log(`\x1b[36m💡 IBP Tip:\x1b[0m ${tip}`);
      break;
    }

    case 'run': {
      const file = args[1];
      if (!file) {
        console.error('Usage: ibp run <file.ibp>');
        process.exit(1);
      }
      const fullPath = path.resolve(process.cwd(), file);
      if (!fs.existsSync(fullPath)) {
        console.error(`Error: File not found: ${file}`);
        process.exit(1);
      }
      const source = fs.readFileSync(fullPath, 'utf-8');
      const { output, error } = executeIBP(source, {
        sourceCode: source,
        onEvent: (ev) => {
          if (ev.type === 'celebrate') {
            console.log('\x1b[33m🎉 [CELEBRATE] Confetti burst!\x1b[0m');
          }
        },
      });

      for (const line of output) {
        console.log(line);
      }

      if (error) {
        console.error('\n' + error.format(source));
        process.exit(1);
      }
      break;
    }

    case 'repl':
      startRepl();
      break;

    case 'list': {
      const currentDir = process.cwd();
      const files = fs.readdirSync(currentDir).filter((f) => f.toLowerCase().endsWith('.ibp'));
      console.log(`\x1b[34m📁 IBP files in ${currentDir}:\x1b[0m`);
      if (files.length === 0) {
        console.log('  No .ibp files found in current directory.');
      } else {
        files.forEach((f) => console.log(`  - ${f}`));
      }
      break;
    }

    case 'create': {
      const projName = args[1] || 'my-ibp-project';
      const projDir = path.resolve(process.cwd(), projName);
      if (!fs.existsSync(projDir)) {
        fs.mkdirSync(projDir, { recursive: true });
      }
      const mainPath = path.join(projDir, 'main.ibp');
      if (!fs.existsSync(mainPath)) {
        fs.writeFileSync(
          mainPath,
          `# ${projName} created with IBP CLI
keep name = "Explorer"
say "Hello from {name}!"
shout "enjoy coding in ibp"
celebrate
`
        );
      }
      console.log(`\x1b[32m✔ Project "${projName}" created with main.ibp!\x1b[0m`);
      console.log(`Run: cd ${projName} && ibp run main.ibp`);
      break;
    }

    case 'system': {
      console.log('\x1b[36m💻 IBP OS System Information:\x1b[0m');
      console.log(`  Engine: @ibp/engine v${VERSION}`);
      console.log(`  Node.js: ${process.version}`);
      console.log(`  Platform: ${process.platform} (${process.arch})`);
      break;
    }

    case 'memory': {
      const mem = process.memoryUsage();
      console.log('\x1b[36m🧠 IBP CLI Process Memory:\x1b[0m');
      console.log(`  Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Heap Total: ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  RSS: ${(mem.rss / 1024 / 1024).toFixed(2)} MB`);
      break;
    }

    case 'clear':
      console.clear();
      break;

    default:
      console.error(`Unknown command: "${command}". Run "ibp help" for available commands.`);
      process.exit(1);
  }
}

function printHelp(): void {
  console.log(`
\x1b[36mIBP OS - CLI v${VERSION}\x1b[0m
An educational, beginner-friendly programming language.

\x1b[33mUsage:\x1b[0m
  ibp <command> [options]

\x1b[33mCommands:\x1b[0m
  ibp help              Show this help reference
  ibp version           Print the current IBP CLI and engine version
  ibp run <file.ibp>    Execute an IBP source file
  ibp repl              Launch interactive IBP REPL session
  ibp list              List .ibp files in the current folder
  ibp create <project>  Scaffold a new IBP starter project
  ibp system            Display system and engine architecture stats
  ibp memory            Display process memory usage
  ibp tip               Display a helpful language tip
  ibp clear             Clear terminal screen
`);
}

function startRepl(): void {
  console.log(`\x1b[36mIBP Interactive REPL (v${VERSION})\x1b[0m`);
  console.log('Type IBP code and press Enter. Type "exit" or press Ctrl+C to quit.\n');

  const interpreter = new Interpreter({
    onEvent: (ev) => {
      if (ev.type === 'output') {
        console.log(ev.text);
      } else if (ev.type === 'celebrate') {
        console.log('\x1b[33m🎉 [CELEBRATE] Confetti burst!\x1b[0m');
      }
    },
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\x1b[34mibp>\x1b[0m ',
  });

  rl.prompt();

  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (trimmed === 'exit' || trimmed === 'quit') {
      rl.close();
      return;
    }

    if (trimmed.length > 0) {
      try {
        const { program, errors } = parse(trimmed);
        if (errors.length > 0) {
          console.error('\x1b[31m' + errors[0].format(trimmed) + '\x1b[0m');
        } else {
          interpreter.run(program);
        }
      } catch (err: any) {
        console.error('\x1b[31m' + (err.format ? err.format(trimmed) : String(err)) + '\x1b[0m');
      }
    }
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\nGoodbye from IBP!');
    process.exit(0);
  });
}
