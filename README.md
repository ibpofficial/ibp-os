# IBP OS 🪐

> **A playful, educational, browser-based operating system and programming language environment.**

[![CI](https://github.com/YOUR_USERNAME/IBP-os/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/IBP-os/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **Important Note:** IBP is an **educational, experimental, and beginner-friendly** language designed for fun, learning, and computational delight. It is not intended for mission-critical production systems.

---

## 🌟 Highlights

- **Natural Syntax**: Code that reads like plain English (`keep`, `lock`, `say`, `shout`, `whisper`, `when`, `recipe`, `box`).
- **Signature Features**:
  - **Pipe Flow**: `numbers |> filter(isEven) |> map(double) |> total |> say`
  - **Seeded Randomness**: Reproducible games with `seed 42`, `luck(1, 6)`, `coin()`, `pick(list)`.
  - **Virtual Clock**: `wait 2 seconds` without blocking UI or tests.
  - **Persistent Memory**: Per-project storage with `remember "highScore" = 100` and `recall("highScore", 0)`.
  - **Delightful Micro-interactions**: `celebrate` (confetti!), `todo` lists, and 25+ language `tip()`s.
  - **Friendly Errors**: Caret lines, plain-English explanations, and "Did you mean?" suggestions via edit distance.
- **Full Virtual Desktop**: Windowed workspace with IBP Studio, Terminal, File Explorer, System Monitor, IBP Handbook, Settings, and an interactive 20+ Challenge Playground with XP & achievements.
- **Sandboxed Virtual File System**: Persistent IndexedDB storage under `IBP://`.

---

## 🏗️ Architecture

```
                                +-------------------------+
                                |      IBP Source Code    |
                                +-------------------------+
                                             |
                                             v
                                +-------------------------+
                                |      Lexer (UTF-8)      |
                                +-------------------------+
                                             |
                                             v
                                +-------------------------+
                                | Parser (Error Recovery) |
                                +-------------------------+
                                             |
                                             v
                                +-------------------------+
                                |        AST Tree         |
                                +-------------------------+
                                             |
                                             v
                                +-------------------------+
                                |  Resumable Interpreter  |
                                |  (Generator Step Loop)  |
                                +-------------------------+
                                 /          |           \
                                v           v            v
                      +------------+ +-------------+ +-------------+
                      | Built-ins  | | Execution   | | Event Stream|
                      | & Memory   | | Limits      | | (Debugger)  |
                      +------------+ +-------------+ +-------------+
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/IBP-os.git
cd IBP-os

# Install workspace dependencies
npm install

# Start the web desktop locally
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Launch the web desktop in development mode |
| `npm run build` | Compile and bundle all packages and apps |
| `npm run test` | Run the complete Vitest test suite |
| `npm run typecheck` | Run TypeScript compiler type checking across all workspaces |
| `npm run lint` | Run code quality checks |

---

## 💻 Code Examples

### 1. Variables & Output
```ibp
keep name = "Ishant"
lock MAX_POINTS = 100
say "Welcome, {name}!"
shout "level up!"
```

### 2. Recipes & Pipes
```ibp
recipe double(x) => x * 2
recipe isEven(x) => x % 2 == 0

keep scores = [10, 15, 20, 25, 30]
scores |> filter(isEven) |> map(double) |> total |> say
```

### 3. Error Handling
```ibp
attempt {
  keep res = 10 / 0
} rescue problem {
  say "Caught problem: {problem.message}"
} always {
  say "Finished safety check"
}
```

---

## 🗺️ Roadmap & Milestones

- [x] **Phase 1: Language Foundation**: Formal grammar, lexer, parser with error recovery, generator interpreter, signature features, and engine test suite.
- [ ] **Phase 2: IBP Studio**: Monaco editor integration, syntax highlighting, autocompletion, web worker execution, and real-time squiggles.
- [ ] **Phase 3: Virtual Computer**: Window manager, taskbar, boot sequence, IndexedDB virtual file system, Terminal, and File Explorer.
- [ ] **Phase 4: Advanced Experience**: Time-travel Memory Visualizer, 20+ Challenge Playground, interactive Handbook, and onboarding tour.
- [ ] **Phase 5: Public Release**: Clean-clone verification, GitHub Actions CI, and v0.1.0 release.

---

## 🤝 Contributing

Contributions are warmly welcomed! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

