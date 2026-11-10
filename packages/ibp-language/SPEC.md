# IBP Language Specification (v0.1.0)

## 1. Overview and Philosophy
**IBP** is an educational, human-centric, deterministic programming language designed for learners and creators.
- **Easy**: Reads like plain English; clear keywords (`keep`, `lock`, `say`, `recipe`, `give`).
- **Unique**: Distinctive concepts (`box`, `recipe`, `when/orwhen/otherwise`, `attempt/rescue`, `celebrate`, `remember/recall`, pipes `|>`).
- **Fun**: Friendly error messages with "did you mean" hints, seeded deterministic randomness, built-in checks, and virtual clock.
- **Rigorous**: Formally specified, fully testable, sandboxed, and deterministic.

---

## 2. Lexical Structure

### 2.1 Character Encoding & Unicode
IBP source files are UTF-8 encoded. Identifiers support Unicode characters, including letters and emoji.

### 2.2 Comments
Comments begin with `#` and extend to the end of the line:
```ibp
# This is a full-line comment
keep x = 10 # This is an inline comment
```

### 2.3 Whitespace & Newlines
- Indentation is not syntactically significant.
- Newlines terminate statements, except when the statement is continuation-safe (e.g. following binary operators, open parentheses `(`, open brackets `[`, or open braces `{`).
- Semicolons are not required and discouraged, but may optionally separate multiple statements on a single line.

### 2.4 Keywords
`keep`, `lock`, `say`, `shout`, `whisper`, `ask`, `into`,
`when`, `orwhen`, `otherwise`, `unless`,
`repeat`, `times`, `count`, `from`, `to`, `step`, `each`, `in`, `while`, `forever`, `skip`, `stop`,
`recipe`, `give`,
`box`, `add`, `remove`,
`attempt`, `rescue`, `always`, `raise`,
`expect`, `wait`, `seconds`, `second`, `remember`, `recall`, `celebrate`, `todo`, `seed`,
`is`, `isnt`, `above`, `below`, `and`, `or`, `not`,
`yes`, `no`, `true`, `false`, `empty`

### 2.5 Identifiers & Literals
- **Identifiers**: Begin with a letter or Unicode letter (`a-z`, `A-Z`, `_`, or non-ASCII letter/emoji) followed by letters, digits, or `_`. Case-sensitive.
- **Numbers**: Decimal integers (`42`), negative numbers (`-10`), or floating-point values (`3.14159`).
- **Strings**: Enclosed in double quotes `"..."`. Supports escape sequences (`\"`, `\n`, `\t`, `\\`) and string interpolation `{expression}`.
- **Booleans**: `yes` / `true` (evaluates to true) and `no` / `false` (evaluates to false).
- **Empty / Null**: Represented by keyword `empty`.

---

## 3. Types and Values

1. **Number**: 64-bit IEEE floating-point numbers.
2. **Text** (String): Immutable UTF-16/Unicode sequence.
3. **Boolean**: `yes` or `no`.
4. **Empty**: Singleton `empty` representing null/none.
5. **List**: Dynamic array of heterogeneous values, e.g. `[1, 2, "three"]`.
6. **Box**: Key-value dictionary / record where keys are strings.
7. **Range**: Immutable sequence of numbers created via `start..end`.
8. **Recipe**: First-class function closure.

---

## 4. Grammar and Syntax

### 4.1 Variables and Constants
```ibp
keep score = 100       # Mutable variable declaration
lock MAX_LIVES = 3     # Immutable constant declaration (reassigning throws Error)
score = score + 10     # Reassignment
```

### 4.2 Output and Input
```ibp
say "Hello, {name}!"       # Prints with newline
shout "alert"              # Prints text transformed to UPPERCASE
whisper "secret"           # Prints text transformed to lowercase
ask "Name?" into name      # Reads string input; automatically declares `name` if not already declared
ask text "City?" into city # Explicit text form; auto-declares `city` if not already declared
ask number "Age?" into age # Reads numerical input (re-asks automatically if invalid, up to 5 attempts)
# If target variable exists in any enclosing scope, it is updated.
# If target variable is a locked constant, a TypeError is raised ("can't change a locked value").
# Hinglish aliases: poocho [number | text] "..." into/mein target
```

### 4.3 Conditionals
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

### 4.4 Loops
```ibp
# Repeat N times
repeat 3 times {
    say "Hip hip hooray!"
}

# Counting loop
count i from 1 to 5 {
    say i # prints 1, 2, 3, 4, 5 (inclusive)
}
count i from 10 to 0 step 2 {
    say i
}

# Iteration
each item in [1, 2, 3] {
    say item
}
each char in "hello" {
    say char
}
each key in box { a: 1, b: 2 } {
    say key
}

# While & Forever
while score > 0 {
    score = score - 1
}

forever {
    when done { stop }
    skip
}
```

### 4.5 Recipes (Functions)
```ibp
recipe add(a, b = 0) {
    give a + b
}

# Inline recipe
recipe double(x) => x * 2

# Closures
recipe makeCounter(start) {
    keep current = start
    recipe step() {
        current = current + 1
        give current
    }
    give step
}
```

### 4.6 Collections (Lists & Boxes)
```ibp
# Lists
keep fruits = ["apple", "banana"]
say fruits[0]
say fruits.length
add "cherry" to fruits
remove "apple" from fruits

# Boxes (Objects)
box player {
    name: "Alex",
    health: 100
}
say player.name
player.health = 90

# Inline box literal
keep config = box { debug: yes, port: 8080 }

# Safe navigation
say player?.inventory?.sword
```

### 4.7 Pipe Flow (`|>`)
Pipelines pass the left-hand expression as the first argument to the right-hand recipe:
```ibp
numbers |> filter(even) |> map(double) |> total |> say
```

### 4.8 Error Handling
```ibp
attempt {
    keep res = 10 / 0
} rescue err {
    say "Caught problem: {err.message}"
} always {
    say "Cleanup"
}

raise "Invalid state!"
```

### 4.9 Checks (`expect`)
Used in unit tests and challenges:
```ibp
expect 1 + 1 is 2
expect "recipe works": add(2, 3) is 5
```
Checks emit `check-passed` or `check-failed` events without aborting execution.

### 4.10 Signature Built-ins & Features
1. **Seeded Randomness**:
   - `luck(min, max)` returns random integer between min and max (inclusive).
   - `coin()` returns `"heads"` or `"tails"`.
   - `pick(list)` returns random element from list.
   - `shuffle(list)` returns new shuffled copy of list.
   - `seed <number>` statement sets deterministic PRNG seed.
2. **Virtual Clock**:
   - `wait <n> seconds` (or `wait <n> second`).
3. **Persistent Project Store**:
   - `remember "key" = value`
   - `recall("key", defaultValue)`
4. **Statements**:
   - `celebrate`: emits celebration/confetti event.
   - `todo "description"`: static analysis todo marker.
   - `tip()`: returns a friendly language tip.
5. **Ranges as Values**:
   - `1..10`, supporting `.length`, indexing, and iteration.

---

## 5. Built-in Standard Library

### 5.1 Text
`length(t)`, `upper(t)`, `lower(t)`, `trim(t)`, `split(t, delim)`, `join(list, delim)`, `replace(t, old, new)`, `contains(t, sub)`, `starts(t, sub)`, `ends(t, sub)`, `repeatText(t, count)`, `reverse(t)`

### 5.2 Math
`abs(n)`, `round(n)`, `floor(n)`, `ceil(n)`, `min(a, b)`, `max(a, b)`, `sqrt(n)`, `power(base, exp)`

### 5.3 Lists
`map(list, fn)`, `filter(list, fn)`, `reduce(list, fn, initial)`, `sort(list)`, `first(list)`, `last(list)`, `total(list)`, `average(list)`, `unique(list)`, `count(list, item)`

### 5.4 Boxes
`keys(box)`, `values(box)`, `has(box, key)`

### 5.5 Types & Conversion
`kind(x)`: returns `"number"`, `"text"`, `"yes/no"`, `"empty"`, `"list"`, `"box"`, `"range"`, or `"recipe"`.
`number(x)`, `text(x)`

### 5.6 Time (Virtual/Real)
`today()`, `now()`

### 5.7 Files (Sandboxed VFS)
`readFile(path)`, `writeFile(path, content)`, `appendFile(path, content)`, `exists(path)`, `listFolder(path)`, `deleteFile(path)`

