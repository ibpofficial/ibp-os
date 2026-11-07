# Contributing to IBP OS

Thank you for your interest in contributing to **IBP OS**!

## How to Get Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/IBP-os.git
   cd IBP-os
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development environment**:
   ```bash
   npm run dev
   ```

4. **Run tests**:
   ```bash
   npm run test
   ```

5. **Typecheck & Lint**:
   ```bash
   npm run typecheck
   npm run lint
   ```

## Development Guidelines

- **Zero React/DOM in Engine**: `@ibp/engine` must remain 100% pure TypeScript.
- **Strict Determinism**: Seeded randomness and virtual clocks must stay repeatable.
- **Friendly Errors**: Every diagnostic must point to line, column, provide caret underline, and suggest a fix.
- **Tests First**: Add unit and integration tests for every new statement, expression, or builtin.

