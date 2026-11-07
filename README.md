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
4. [🛠️ LangCraft Studio: Full-Stack Custom Language Workbench](#️-langcraft-studio-full-stack-custom-language-workbench)
5. [🖥️ The IBP OS Desktop & Custom Wallpapers](#️-the-ibp-os-desktop--custom-wallpapers)
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
- **LangCraft Studio (Full-Stack Language Engine)**: An interactive in-OS workbench allowing anyone to **design their own complete programming language from scratch**—deciding block structure (braces, Pythonic indentation, or keyword pairs like `karo...bas`), zero-comma syntax, assignment operators, and defining custom standard library functions!
- **Custom Desktop Wallpapers & Scratchpad**: Upload your own local wallpapers, paste image URLs, pick from 7 gradient themes, adjust blur/brightness, and jot notes on the desktop scratchpad.
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

## 🛠️ LangCraft Studio: Full-Stack Custom Language Workbench

Want to invent your own programming language? Open **LangCraft Studio** inside IBP OS!

```
+--------------------------------------------------------------------------+
| LangCraft Studio: Full-Stack Language Engine 🛠️                          |
+--------------------------------------------------------------------------+
| Blueprints: [ Hinglish Logic ] [ PySimple ] [ Natural English ] [ Emoji ] |
|                                                                          |
| 1. Logic & Grammar Rules:                                                |
|    - Block Delimiters: Braces { }, Indentation (Pythonic), or Word Pairs |
|      (e.g., karo...bas, begin...end, do...end)                           |
|    - Comma Policy: Zero Commas (pure space-separated), Optional, Strict  |
|    - Variable Declaration: Keyword-based or Auto-assign (x = 10)         |
|    - Assignment Operator: =, :=, <-, equals                              |
|    - Logic Operators: and/&&/aur, or/||/ya, not/!/mat                    |
|                                                                          |
| 2. Standard Library Logic Builder:                                       |
|    - Define custom formulas & built-in functions:                        |
|      jodo(a, b) => a + b                                                 |
|      varg(x) => x * x                                                    |
|      kineticEnergy(m, v) => 0.5 * m * v * v                              |
|                                                                          |
| 3. Vocabulary Remapping:                                                 |
|    - Remap ANY keyword to words, emojis, or symbols                      |
|                                                                          |
| 4. IDE & Live Runner:                                                    |
|    - Compile custom code -> intermediate IBP IR -> live output           |
|    - Live execution diagnostics and confetti celebration                 |
|                                                                          |
| 5. Export & VFS Persistence:                                             |
|    - Save directly to IBP://USERS/guest/languages/<name>.json            |
|    - Download portable specification as .json                            |
+--------------------------------------------------------------------------+
```

---

## 🖥️ The IBP OS Desktop & Custom Wallpapers

IBP OS features a complete, windowed virtual desktop powered by React 19, Tailwind CSS, and Monaco Editor:

- **Custom Wallpaper Engine**:
  - **7 Preset Themes**: Deep Space, Cyberpunk Neon, Aurora Borealis, Midnight Sunset, Emerald Matrix, Cosmic Violet, and Minimal Obsidian.
  - **Custom Image URL**: Paste any direct JPEG/PNG image URL with instant preview.
  - **Local Image Upload**: Pick any image from your computer; it is compressed and stored in `localStorage` client-side.
  - **Brightness & Blur Sliders**: Fine-tune contrast and atmospheric depth.
- **Desktop Scratchpad / Sticky Notes**:
  - Jot thoughts, scratchpad code, and to-do lists directly on the desktop.
  - Auto-saved to `localStorage` and available across refreshes.
- **IBP Studio**: Full IDE with tabs, Monaco syntax highlighter, Run, Format, Save, seed picker, virtual clock speed selector, variable inspector, and bottom output dock.
- **LangCraft Studio**: Full-stack language designer, custom grammar builder, and live sandbox.
- **Terminal**: Interactive CLI shell with history (`↑`/`↓`), `ibp help`, `ibp run`, `ibp repl`, `pwd`, `ls`, and `cd`.
- **File Explorer**: Browse, create, delete, and manage files under the `IBP://` virtual filesystem backed by IndexedDB.
- **System Monitor**: Real-time virtual machine diagnostics, memory status, and heap telemetry.
- **Playground**: 20 progressive coding challenges with automated test runners and XP achievements.
- **Taskbar & Quick Controls Flyout**: Window pills, theme toggle, sound effects toggle, fullscreen toggle, and real-time clock.

---

## 📚 Learn IBP Handbook & PDF Export

The **Learn IBP** application provides a comprehensive 12-chapter textbook covering every detail of the language:
1. Welcome to IBP
2. Variables & Lock Constants
3. Input, Output & Friendly Strings
4. Conditions, When & Unless
5. Loops & Iterations
6. Recipes (Functions) & Closures
7. Collections: Lists & Boxes
8. Pipe Operator `|>` & Transformations
9. Mathematics, Physics & Randomness
10. Error Handling & Safety Limits
11. Hinglish Coding Reference
12. LangCraft: Building Your Own Language

Click **"Export / Print Full PDF"** in the handbook toolbar to generate an offline, printable PDF handbook with zero dependencies!

---

## 🏗️ Architectural Pipeline

```
  Source Code (.ibp / custom language)
                 │
                 ▼
      [ LangCraft Transpiler ] (if custom language)
                 │
                 ▼
         [ Lexer (Tokens) ]  (Unicode, Emojis, Hinglish & English keywords)
                 │
                 ▼
         [ Parser (AST) ]    (Expressions, colons, statements, blocks)
                 │
                 ▼
      [ Tree-Walk Interpreter ]  (Scoped environments, recursion guard)
                 │
        ┌────────┴────────┐
        ▼                 ▼
 [ Output Logs ]   [ Virtual Clock / Events ]
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation
```bash
git clone https://github.com/metad/ibp-os.git
cd ibp-os
npm install
```

### Running the Monorepo
```bash
# Start development server
npm run dev

# Run full test suite (114 tests)
npm run test

# Run TypeScript typechecks across all packages
npm run typecheck

# Build all packages for production
npm run build
```

---

## 📜 Available Scripts & Verification

| Command | Action |
|---|---|
| `npm run test` | Runs Vitest across all 14 test suites (**114/114 passing**) |
| `npm run typecheck` | Validates TypeScript across all 6 packages (**0 errors**) |
| `npm run build` | Produces production builds for `@ibp/engine`, `@ibp/language`, `@ibp/vfs`, `@ibp/vm`, and `@ibp/web` |
| `npm run preview` | Starts local production preview server at `http://localhost:5173/` |

---

## 📄 License

MIT License. Designed and engineered as an educational computing platform.
