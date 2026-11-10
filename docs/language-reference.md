# IBP Language Reference

This reference covers the complete vocabulary, syntax, and built-in library of the IBP language.

---

## 1. Variables & Constants

| Keyword | Purpose | Example |
|---|---|---|
| `keep` | Declare a mutable variable | `keep score = 0` |
| `lock` | Declare an immutable constant | `lock MAX_LIVES = 3` |
| `=` | Reassignment | `score = score + 10` |

---

## 1.1 Input & Output

| Command | Purpose | Example |
|---|---|---|
| `say` | Print text with newline | `say "Hello, world!"` |
| `shout` | Print text in UPPERCASE | `shout "Warning!"` |
| `whisper` | Print text in lowercase | `whisper "Quietly..."` |
| `ask ... into x` | Prompt user for text input; auto-declares `x` if undeclared | `ask "What is your name?" into name` |
| `ask text ... into x` | Explicit text input prompt | `ask text "Enter city:" into city` |
| `ask number ... into x` | Prompt user for number; validates and re-asks if invalid | `ask number "Enter age:" into age` |

---

## 2. Types & Literals

- **Numbers**: `42`, `-10`, `3.14159`
- **Text**: `"Hello {name}"` (supports `{expression}` string interpolation and escape sequences `\n`, `\t`, `\"`)
- **Booleans**: `yes` / `true`, `no` / `false`
- **Empty**: `empty` (represents null/none)
- **Lists**: `[1, 2, 3]`
- **Boxes**: `box { name: "Aria", level: 1 }` or `box Player { name: "Aria" }`
- **Ranges**: `1..10`
- **Recipes**: `recipe double(x) => x * 2`

---

## 3. Conditionals

```ibp
when score >= 100 {
  say "Champion!"
} orwhen score >= 50 {
  say "Good job!"
} otherwise {
  say "Try again!"
}

unless active {
  say "Paused"
}
```

---

## 4. Loops

- **Repeat**: `repeat 5 times { ... }`
- **Count**: `count i from 1 to 10 step 2 { ... }`
- **Each**: `each item in list { ... }`
- **While**: `while condition { ... }`
- **Forever**: `forever { ... }`
- **Loop controls**: `stop` (break), `skip` (continue)

---

## 5. Collections (Lists & Boxes)

```ibp
# List operations
keep items = [10, 20]
add 30 to items
remove 10 from items
say items[0]
say items.length

# Box operations
box config {
  theme: "dark",
  volume: 80
}
say config.theme
config.volume = 90

# Safe navigation (?.)
say user?.address?.city
```

---

## 6. Error Handling

```ibp
attempt {
  keep x = 10 / 0
} rescue problem {
  say "Caught: {problem.message}"
} always {
  say "Cleanup complete"
}

raise "Custom error message"
```

---

## 7. Checks (Testing)

```ibp
expect 1 + 1 is 2
expect "add recipe": add(2, 3) is 5
```

---

## 8. Built-in Library

### Text
- `length(text)`
- `upper(text)`
- `lower(text)`
- `trim(text)`
- `split(text, delimiter)`
- `join(list, delimiter)`
- `replace(text, search, replacement)`
- `contains(text, sub)`
- `starts(text, prefix)`
- `ends(text, suffix)`
- `repeatText(text, count)`
- `reverse(text)`

### Math
- `abs(number)`
- `round(number)`
- `floor(number)`
- `ceil(number)`
- `min(a, b, ...)`
- `max(a, b, ...)`
- `sqrt(number)`
- `power(base, exponent)`

### Randomness (Deterministic)
- `luck(min, max)`: random integer between min and max inclusive.
- `coin()`: returns `"heads"` or `"tails"`.
- `pick(list)`: random element from a list.
- `shuffle(list)`: new shuffled copy of a list.
- `seed <number>`: sets deterministic seed.

### Lists
- `map(list, recipe)`
- `filter(list, recipe)`
- `reduce(list, recipe, initial)`
- `sort(list, [recipe])`
- `first(list)`
- `last(list)`
- `total(list)`
- `average(list)`
- `unique(list)`
- `count(list, [match])`

### Boxes
- `keys(box)`
- `values(box)`
- `has(box, key)`

### Delight & Environment
- `celebrate`: triggers confetti celebration.
- `todo "note"`: records a todo item.
- `tip()`: returns a rotating language tip.
- `wait <n> seconds`: simulates virtual delay.
- `remember <key> = <val>` / `recall(<key>, <default>)`: persistent project store.

