# Getting Started with IBP

Welcome to IBP! In 2 minutes, you will write and run your first IBP program.

## 1. What is IBP?

IBP is a beginner-friendly programming language designed for learning and experimentation:
- It reads like plain English.
- It gives helpful, friendly error messages when things go wrong.
- It includes fun built-in tools like pipes `|>`, seeded randomness, a virtual clock, and celebration confetti.

## 2. Your First Program

Open IBP Studio (or create a file called `main.ibp`) and type:

```ibp
keep name = "Explorer"
say "Hello, {name}!"
shout "welcome to ibp os"
whisper "enjoy the ride"
```

### Explanation
- `keep` declares a variable that can change.
- `say` prints a line of text.
- `{name}` inside quotes inserts the variable's value (string interpolation).
- `shout` prints text in all UPPERCASE.
- `whisper` prints text in all lowercase.

Click **Run** (or press `Ctrl + Enter`). You will see:
```
Hello, Explorer!
WELCOME TO IBP OS
enjoy the ride
```

## 3. Working with Recipes (Functions)

Functions in IBP are called **recipes**:

```ibp
recipe add(a, b = 0) {
  give a + b
}

recipe double(x) => x * 2

keep result = add(10, 20)
say "Sum is {result}"
say "Double of 15 is {double(15)}"
```

- Declare recipes with `recipe name(parameters) { ... }`.
- Return values with `give`.
- For single-line recipes, use the arrow syntax: `recipe double(x) => x * 2`.

## 4. Loops

Count from 1 to 5:
```ibp
count i from 1 to 5 {
  say "Number {i}"
}
```

Repeat an action 3 times:
```ibp
repeat 3 times {
  say "Hip hip hooray!"
}
```

Iterate over a list:
```ibp
keep colors = ["cyan", "blue", "navy"]
each color in colors {
  say color
}
```

## 5. The Pipe Operator (`|>`)

Transform data step by step with the pipe operator:

```ibp
recipe double(x) => x * 2
recipe isEven(x) => x % 2 == 0

keep numbers = [1, 2, 3, 4, 5, 6]
numbers |> filter(isEven) |> map(double) |> total |> say
```

Each stage passes its result to the next recipe!

