# 🪐 IBP OS: Educational Virtual Operating System & Programming Language

```
  ██╗██████╗ ██████╗      ██████╗ ███████╗
  ██║██╔══██╗██╔══██╗    ██╔═══██╗██╔════╝
  ██║██████╔╝██████╔╝    ██║   ██║███████╗
  ██║██╔══██╗██╔═══╝     ██║   ██║╚════██║
  ██║██████╔╝██║         ╚██████╔╝███████║
  ╚═╝╚═════╝ ╚═╝          ╚═════╝ ╚══════╝
  The Human-First Programming Language & Browser OS
```

[![Test Suite](https://img.shields.io/badge/tests-114%20passed-brightgreen.svg?style=flat-square)](https://github.com/metad/ibp-os)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg?style=flat-square)](https://vitejs.dev/)
[![Status](https://img.shields.io/badge/Status-Educational%20Edition-cyan.svg?style=flat-square)](https://github.com/metad/ibp-os)

> **Important Note:** IBP is an **educational, experimental, and human-friendly** language designed for fun, deep learning, and computational delight. It is formally specified, deterministic, and sandboxed.

---

## 📑 Table of Contents

1. [🌟 Highlights](#-highlights)
2. [🇮🇳 Hinglish Syntax Support](#-hinglish-syntax-support)
3. [📐 Mathematics, Physics & Smart Logic](#-mathematics-physics--smart-logic)
4. [🛠️ LangCraft: Design Your Own Programming Language](#️-langcraft-design-your-own-programming-language)
5. [🖥️ The IBP OS Desktop Environment](#️-the-ibp-os-desktop-environment)
6. [📚 Learn IBP Handbook & PDF Export](#-learn-ibp-handbook--pdf-export)
7. [🏗️ Architectural Pipeline](#️-architectural-pipeline)
8. [🚀 Getting Started & Local Setup](#-getting-started--local-setup)
9. [💻 Code Examples](#-code-examples)
10. [📜 Available Scripts & Verification](#-available-scripts--verification)
11. [📄 License](#-license)

---

## 🌟 Highlights

- **Natural English & Friendly Aliases**: Reads like plain English (`keep`, `lock`, `say`, `shout`, `whisper`, `when`, `recipe`, `box`). Also accepts aliases like `let`, `const`, `if`, `print`, and `fn`.
- **Hinglish Coding Mode**: Code naturally in Hindi + English! Commands like `bolo`, `batao`, `rakho`, `pakka`, `agar`, `warna`, `tareeka`, `de_do`, and `jashn` run out of the box!
- **Colons & Flexible Syntax**: Supports both `{ }` blocks and optional Python-style colons (`when age >= 18: { ... }` or single-line `when x > 0: say "yes"`).
- **Physics & Advanced Mathematics**: Built-in kinematics, trigonometry (`sin`, `cos`, `tan`), vector coordinates (`vec2`, `distance`), free fall simulations (`freeFall`), kinetic energy, force, clamping, and constants (`GRAVITY`, `SPEED_OF_LIGHT`, `PI`).
- **LangCraft Studio**: An interactive in-OS application allowing users to **design their own custom programming languages from scratch**, customize grammar and keywords, and execute code in their custom language live!
- **Signature Features**:
  - **Pipeline Flow (`|>`)**: `numbers |> filter(isEven) |> map(double) |> total |> say`
  - **Deterministic Seeded Randomness**: Reproducible games with `seed 42`, `luck(1, 6)`, `coin()`, `pick(list)`, `shuffle(list)`.
  - **Virtual Timers**: `wait 2 seconds` runs on a non-blocking virtual clock.
  - **Delights & Easter Eggs**: `celebrate` (confetti!), `magic8Ball()`, `joke()`, `asciiArt()`, `rollDice()`, `d20()`, `badge()`, and rotating `tip()`s.
  - **Friendly Caret Diagnostics**: Plain-English error messages with "Did you mean?" edit-distance suggestions.
- **Resilient Multi-Level Error Boundaries**: Prevents black screens from ever occurring.

---

## 🇮🇳 Hinglish Syntax Support

IBP is the first educational programming language with native, built-in **Hinglish command aliases**:

| Concept | English IBP | Hinglish IBP | Meaning |
|---|---|---|---|
| **Print / Output** | `say` / `print` | `bolo`, `batao`, `likho` | Prints text to console |
| **Shout** | `shout` | `chillao` | Prints in UPPERCASE |
| **Whisper** | `whisper` | `dhire` | Prints in lowercase |
| **Variables** | `keep` / `let` | `rakho`, `banao` | Declares mutable variable |
| **Constants** | `lock` / `const` | `pakka`, `fix` | Declares immutable constant |
| **Conditionals** | `when` / `if` | `agar` | If condition |
| **Else If** | `orwhen` / `elif` | `warna_agar` | Else if condition |
| **Else** | `otherwise` / `else` | `warna` | Else fallback |
| **Loops** | `repeat N times` | `dohrao N baar` | Repeat loop |
| **While** | `while` | `jabtak` | While loop |
| **Functions** | `recipe` / `fn` | `tareeka`, `vidhi`, `karo` | Declares function |
| **Return** | `give` / `return` | `de_do`, `wapas` | Returns a value |
| **Booleans** | `yes` / `true` | `haan`, `sahi` | True |
| **Booleans** | `no` / `false` | `nahi`, `galat` | False |
| **Null** | `empty` / `null` | `khali` | Empty null state |
| **Celebration** | `celebrate` | `jashn`, `taali` | Triggers confetti! |

### Example Hinglish Program:
```ibp
rakho khiladi = "Aman"
pakka LEVEL_MAX = 50
rakho score = 100

bolo "Namaste {khiladi}! IBP OS mein aapka swagat hai."

agar score >= 100: {
  chillao "Shabash! Aapne pehla padaav paar kar liya!"
} warna: {
  bolo "Aage badhte rahiye!"
}

tareeka jod(a, b) {
  de_do a + b
}

bolo "10 + 20 =", jod(10, 20)
jashn
```

---

## 📐 Mathematics, Physics & Smart Logic

IBP includes an extensive mathematics and physics calculation engine:

### 1. Physics Engine
- `GRAVITY`: Standard Earth gravity constant ($9.80665 \text{ m/s}^2$).
- `SPEED_OF_LIGHT`: $299,792,458 \text{ m/s}$.
- `force(mass, acceleration)`: Calculates $F = m \times a$ in Newtons.
- `kineticEnergy(mass, velocity)`: Calculates $KE = \frac{1}{2} m v^2$ in Joules.
- `potentialEnergy(mass, height, g)`: Calculates $PE = m g h$.
- `freeFall(seconds, g)`: Simulates gravitational free-fall, returning `{ distance, velocity }`.

### 2. Trigonometry & Coordinates
- `sin(rad)`, `cos(rad)`, `tan(rad)`: Trigonometric functions.
- `degToRad(deg)`, `radToDeg(rad)`: Degree/Radian unit conversions.
- `vec2(x, y)`: Generates a 2D coordinate box `{ x, y }`.
- `distance(x1, y1, x2, y2)` or `distance(p1, p2)`: Calculates Euclidean distance.
- `lerp(start, end, t)`: Linear interpolation between two values at ratio `t`.
- `clamp(val, min, max)`: Restricts a value to a numeric boundary.
- `percent(part, total)`: Calculates accurate percentages.

---

## 🛠️ LangCraft: Design Your Own Programming Language

Want to invent your own programming language? Open **LangCraft Studio** inside IBP OS!

```
+--------------------------------------------------------------+
| LangCraft Studio 🛠️                                          |
+--------------------------------------------------------------+
| Starter Templates: [ HinglishLang ] [ EmojiScript ] [ Custom ] |
|                                                              |
| 1. Code Editor & Live Runner:                                |
|    Type code in your custom syntax and run it live!          |
|                                                              |
| 2. Grammar & Keyword Rules:                                  |
|    Map canonical IBP concepts to ANY custom words or emojis:  |
|    - print     -> bolo / 📢 / echo / afficher               |
|    - variable  -> rakho / 📦 / let / var                    |
|    - function  -> tareeka / 📜 / fn / def                    |
|                                                              |
| 3. Specification & Export:                                   |
|    Export your language specification as portable JSON!      |
+--------------------------------------------------------------+
```

---

## 🖥️ The IBP OS Desktop Environment

IBP OS features a complete, windowed virtual desktop powered by React 19, Tailwind CSS, and Monaco Editor:

- **IBP Studio**: Full IDE with tabs, Monaco syntax highlighter, Run, Format, Save, seed picker, virtual clock speed selector, variable inspector, and bottom output dock.
- **LangCraft Studio**: Interactive custom language designer & execution engine.
- **Terminal**: Interactive CLI shell with history (`↑`/`↓`), `ibp help`, `ibp run`, `ibp repl`, `pwd`, `ls`, and `cd`.
- **File Explorer**: Browse, create, delete, and manage files under the `IBP://` virtual filesystem backed by IndexedDB.
- **System Monitor**: Real-time virtual machine diagnostics, memory status, and heap telemetry.
- **Playground**: 20 progressive coding challenges with automated test runners and XP achievements.
- **Desktop Widgets**: Real-time glowing digital clock, calendar, tip-of-the-day card, and system status indicators.
- **4 Wallpaper Themes**: Switch between **Deep Space**, **Cyberpunk Neon**, **Aurora Borealis**, and **Midnight Sunset**.
- **Taskbar & Quick Controls Flyout**: Window pills, theme toggle, sound effects toggle, fullscreen toggle, and real-time clock.

---

## 📚 Learn IBP Handbook & PDF Export

The **Learn IBP** application provides a comprehensive 12-chapter textbook covering every detail of the language:
1. *Welcome to IBP OS & Language*
2. *Variables, Constants & Data Types*
3. *Natural English Conditionals*
4. *Loops & Iteration*
5. *Recipes (Functions & Closures)*
6. *Collections: Lists & Boxes*
7. *Signature Feature: Pipeline Flow (`|>`)*
8. *Seeded Randomness & Virtual Clock*
9. *Standard Built-in Library Reference (35+ functions)*
10. *Fun Elements & Playful Features*
11. *Error Handling & Friendly Diagnostics*
12. *Built-in Checks & Testing*

### 📄 One-Click PDF Export
Click the prominent **"Export / Print Full PDF"** button in the top bar to generate a beautifully styled, printable handbook ready to save as a PDF directly from your browser!

---

## 🏗️ Architectural Pipeline

```
  Source Code (.ibp)
         │
         ▼
  UTF-8 Tokenizer / Lexer
  (Aliases, Hinglish keywords, Emojis, Symbols)
         │
         ▼
  Recursive Descent Parser with Error Recovery
  (Optional Colons, Trailing Commas, AST)
         │
         ▼
  Resumable Generator Interpreter
  (Yields step events, virtual clock ticks, debug logs)
         │
  ┌──────┴───────────────────────────┐
  ▼                                  ▼
Virtual File System (IBP://)    Built-in Standard Library
(Dexie IndexedDB Engine)        (Text, Math, Physics, Delight)
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js 20+
- npm 10+

### Installation
```bash
# Clone the repository
git clone https://github.com/metad/ibp-os.git
cd ibp-os

# Install dependencies across all monorepo workspaces
npm install

# Run the complete test suite
npm run test

# Typecheck all TypeScript packages
npm run typecheck

# Start the web desktop locally
npm run dev
```

Visit **`http://localhost:5173`** to enter IBP OS!

---

## 📜 Available Scripts & Verification

| Command | Description |
|---|---|
| `npm run test` | Runs the full Vitest suite (14 test files, 114+ tests passed) |
| `npm run typecheck` | Validates TypeScript types across all 6 workspaces (0 errors) |
| `npm run build` | Compiles and bundles production web assets into `apps/web/dist` |
| `npm run preview` | Starts a fast production preview server on port 5173 |

---

## 💻 Code Examples

### 1. Variables, Math & Output
```ibp
keep radius = 5
keep area = PI * power(radius, 2)
say "Circle with radius {radius} has area:", round(area)
```

### 2. Pipeline Flow
```ibp
recipe isPositive(n) => n > 0
recipe triple(n) => n * 3

keep data = [-5, 10, -2, 20, 30]
data |> filter(isPositive) |> map(triple) |> total |> say
```

### 3. Physics Simulation
```ibp
keep drop = freeFall(3) # 3 seconds
say "Distance fallen:", drop.distance, "meters"
say "Impact velocity:", drop.velocity, "m/s"
celebrate
```

---

## 📄 License

Distributed under the **MIT License**. Created with computational joy for learners and builders everywhere! 🪐
