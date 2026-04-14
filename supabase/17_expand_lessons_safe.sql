-- =======================================================
-- Migration 17 (SAFE): Expand Lessons to 8+ per Module
-- Non-destructive: uses ON CONFLICT DO NOTHING throughout.
-- Existing modules, lessons, and student progress are
-- preserved. Only missing rows are inserted.
-- =======================================================

-- Upsert course (update metadata only, don't touch data)
INSERT INTO public.courses (id, title, description, icon, difficulty, total_lessons, estimated_hours) VALUES
('python-basics', 'Python Fundamentals', 'Master Python from absolute scratch. Starts easy, but the training wheels come off as you progress!', '🐍', 'Beginner', 42, 22)
ON CONFLICT (id) DO UPDATE
  SET total_lessons = 42, estimated_hours = 22;

-- ===================== MODULES =====================
-- Replaces m1-m5 IDs with the canonical m-py-* IDs used since migration 06.
-- ON CONFLICT = skip if already exists.
INSERT INTO public.modules (id, course_id, title, description, "order") VALUES
('m-py-1', 'python-basics', '1. The Absolute Basics',     'Start running code immediately. Learn how to output text and do basic math.', 1),
('m-py-2', 'python-basics', '2. Variables & Data Types',  'Store data in memory, work with strings, numbers, and booleans.', 2),
('m-py-3', 'python-basics', '3. Control Flow',            'Make decisions and repeat actions with if/elif/else and loops.', 3),
('m-py-4', 'python-basics', '4. Functions',               'Organize your logic into reusable, testable blocks of code.', 4),
('m-py-5', 'python-basics', '5. Collections & Advanced',  'Master lists, dicts, sets, comprehensions, and OOP. Minimal hand-holding.', 5)
ON CONFLICT (id) DO NOTHING;


-- =======================================================
-- MODULE 1: The Absolute Basics  (8 lessons)
-- Max hints — high hand-holding
-- =======================================================
INSERT INTO public.lessons (id, module_id, title, "order", language, xp_reward, content, code_example, exercise_prompt, exercise_starter_code, exercise_solution) VALUES

('l-py-1-1', 'm-py-1', 'Hello, World!', 1, 'python', 30,
'# Your First Python Program

Welcome to Python! The `print()` function displays whatever is inside the parentheses on the screen.

When printing **text** (called a *String*), you must wrap it in quotation marks.',
'print("Hello, computer!")',
'Print the exact phrase: **Hello, World!**',
'# Type your code below:
',
'print("Hello, World!")'),

('l-py-1-2', 'm-py-1', 'Printing Numbers', 2, 'python', 30,
'# Printing Numbers

Numbers do **not** need quotation marks. Python can handle integers (whole numbers) and floats (decimals) directly.',
'print(42)
print(3.14)',
'Print the number `100` on one line, then print `3.14` on the next line.',
'# Print 100
# Print 3.14
',
'print(100)
print(3.14)'),

('l-py-1-3', 'm-py-1', 'Python as a Calculator', 3, 'python', 30,
'# Basic Arithmetic

Python can do math! Use these operators:
- `+` Addition
- `-` Subtraction
- `*` Multiplication
- `/` Division
- `**` Exponentiation (power)',
'print(5 + 3)   # 8
print(10 - 4)  # 6
print(3 * 7)   # 21
print(20 / 4)  # 5.0
print(2 ** 8)  # 256',
'Print the result of **17 multiplied by 4**, and on the next line print **2 to the power of 10**.',
'# 17 * 4

# 2 ** 10
',
'print(17 * 4)
print(2 ** 10)'),

('l-py-1-4', 'm-py-1', 'String Basics', 4, 'python', 40,
'# Strings: Text Data

Strings are any sequence of characters wrapped in quotes. You can use single or double quotes.

You can also **concatenate** (join) strings with `+`.',
'print("Hello" + " " + "World")',
'Using **only string concatenation with `+`**, print: `I love Python`',
'# Use + to join strings
print(  )
',
'print("I " + "love " + "Python")'),

('l-py-1-5', 'm-py-1', 'Comments in Code', 5, 'python', 30,
'# Comments

Comments are notes in your code that Python ignores when running. They start with `#`.

Good comments explain *why* code exists, not just *what* it does.',
'# This prints a greeting
print("Hello!")  # inline comment',
'Write a program that prints `Learning Python!`. Add a comment on the line above it explaining what the print statement does.',
'# Your comment here
',
'# This prints a welcome message
print("Learning Python!")'),

('l-py-1-6', 'm-py-1', 'The input() Function', 6, 'python', 50,
'# Getting Input from the User

The `input()` function pauses the program and waits for the user to type something. Whatever they type is returned as a **string**.

You can display a prompt by passing a string to `input()`.',
'name = input("What is your name? ")
print("Hello, " + name)',
'Write a program that asks for the user''s favourite colour and prints: `Your favourite colour is: [colour]`. Use an f-string.',
'colour = input("What is your favourite colour? ")
# Print using an f-string
',
'colour = input("What is your favourite colour? ")
print(f"Your favourite colour is: {colour}")'),

('l-py-1-7', 'm-py-1', 'Integer Division & Modulo', 7, 'python', 50,
'# Floor Division and Modulo

- `//` Floor division — divides and rounds **down** to a whole number.
- `%` Modulo — gives the **remainder** after division.

These are very useful in real programs.',
'print(17 // 5)  # 3
print(17 % 5)   # 2',
'Print the result of `29 % 2`. If the result is 0 the number is even, otherwise it is odd.',
'# Use modulo on 29
print(29 % 2)
',
'print(29 % 2)'),

('l-py-1-8', 'm-py-1', 'Mixing Types & Type Conversion', 8, 'python', 60,
'# Type Conversion

Python will not automatically mix strings and numbers. You must convert with:
- `int()` — to integer
- `float()` — to decimal
- `str()` — to string',
'age_str = input("Enter your age: ")
age = int(age_str)
print("In 10 years you will be: " + str(age + 10))',
'Write a program that asks for a number, converts it to a float, multiplies it by 2.5, and prints the result.',
'num = input("Enter a number: ")
# Convert to float and multiply
',
'num = float(input("Enter a number: "))
print(num * 2.5)')

ON CONFLICT (id) DO NOTHING;


-- =======================================================
-- MODULE 2: Variables & Data Types  (9 lessons)
-- Moderate hints
-- =======================================================
INSERT INTO public.lessons (id, module_id, title, "order", language, xp_reward, content, code_example, exercise_prompt, exercise_starter_code, exercise_solution) VALUES

('l-py-2-1', 'm-py-2', 'Creating Variables', 1, 'python', 50,
'# Variables

Variables are named containers for data. Python creates a variable the moment you assign a value to it with `=`.

Variable names should be descriptive and use `snake_case`.',
'player_name = "Zara"
player_score = 0
is_active = True',
'Create variables: `city` set to `"Cape Town"`, `population` set to `4618000`, and `is_capital` set to `False`. Print all three.',
'# Create variables here

# Print them
',
'city = "Cape Town"
population = 4618000
is_capital = False
print(city)
print(population)
print(is_capital)'),

('l-py-2-2', 'm-py-2', 'Variable Reassignment', 2, 'python', 50,
'# Updating Variables

Variables can be reassigned at any time. You can also use **augmented assignment** operators: `+=`, `-=`, `*=`, `/=`.',
'score = 10
score += 3   # same as score = score + 3
print(score) # 13',
'Start with `lives = 3`. Subtract 1 using `-=`, then multiply the result by 2 using `*=`. Print the final value.',
'lives = 3
# Your code here
',
'lives = 3
lives -= 1
lives *= 2
print(lives)'),

('l-py-2-3', 'm-py-2', 'Strings In Depth', 3, 'python', 60,
'# Working with Strings

Useful string methods:
- `.upper()` / `.lower()` — change case
- `.strip()` — remove surrounding whitespace
- `.replace(old, new)` — swap text
- `len()` — count characters',
'message = "  Hello World  "
print(message.strip())
print(message.upper())
print(len("Python"))   # 6',
'Given `sentence = "  the quick brown fox  "`, strip whitespace, convert to title case (`.title()`), then print the length of the stripped result. Each on a separate line.',
'sentence = "  the quick brown fox  "
# strip, title, len
',
'sentence = "  the quick brown fox  "
stripped = sentence.strip()
print(stripped.title())
print(len(stripped))'),

('l-py-2-4', 'm-py-2', 'f-Strings', 4, 'python', 60,
'# Formatted Strings (f-strings)

f-strings embed variables directly inside a string. Prefix with `f` and wrap variable names in `{}`.',
'name = "Alice"
score = 95
print(f"{name} scored {score}/100")
print(f"Double score: {score * 2}")',
'Create `item = "coffee"` and `price = 4.50`. Use an f-string to print: `A cup of coffee costs $4.50`',
'item = "coffee"
price = 4.50
# Your f-string
',
'item = "coffee"
price = 4.50
print(f"A cup of {item} costs ${price}")'),

('l-py-2-5', 'm-py-2', 'Integers & Floats', 5, 'python', 60,
'# Number Types

- **int** — whole numbers: `5`, `-3`, `1000`
- **float** — decimals: `3.14`, `-0.5`

Use `round(value, decimal_places)` to limit precision.',
'x = 7 / 2         # 3.5 (float)
y = 7 // 2        # 3 (int)
print(round(3.14159, 2))  # 3.14',
'Calculate the average of `82`, `91`, and `74`. Print the result rounded to **1 decimal place**.',
'# Calculate average and round
',
'average = (82 + 91 + 74) / 3
print(round(average, 1))'),

('l-py-2-6', 'm-py-2', 'Booleans & Comparisons', 6, 'python', 70,
'# Booleans

Booleans are `True` or `False`. They arise from comparisons:

| Operator | Meaning |
|----------|---------|
| `==` | Equal to |
| `!=` | Not equal |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal |
| `<=` | Less than or equal |',
'print(10 > 5)    # True
print(10 == 10)  # True
print(7 != 3)    # True',
'Given `speed = 120` and `limit = 100`, create `is_speeding` that is `True` when speed exceeds the limit. Print it.',
'speed = 120
limit = 100
is_speeding =
print(is_speeding)
',
'speed = 120
limit = 100
is_speeding = speed > limit
print(is_speeding)'),

('l-py-2-7', 'm-py-2', 'Logical Operators', 7, 'python', 70,
'# and, or, not

Combine boolean expressions:
- `and` — both must be True
- `or` — at least one must be True
- `not` — flips the boolean',
'age = 20
has_id = True
can_enter = age >= 18 and has_id
print(can_enter)  # True',
'Given `temperature = 28` and `is_raining = False`, print `True` if it is above 20 **and** not raining.',
'temperature = 28
is_raining = False
# evaluate and print
',
'temperature = 28
is_raining = False
print(temperature > 20 and not is_raining)'),

('l-py-2-8', 'm-py-2', 'String Indexing & Slicing', 8, 'python', 80,
'# Accessing Parts of a String

Access individual characters by **index** (starting at 0). Use **slicing** `[start:end]` to grab a substring (end is exclusive).',
'word = "Python"
print(word[0])    # P
print(word[-1])   # n
print(word[0:3])  # Pyt
print(word[2:])   # thon',
'Given `text = "programming"`, print:
1. The first character
2. The last character
3. Characters from index 3 to 6 (inclusive)',
'text = "programming"
# 1.
# 2.
# 3.
',
'text = "programming"
print(text[0])
print(text[-1])
print(text[3:7])'),

('l-py-2-9', 'm-py-2', 'None and Type Checking', 9, 'python', 80,
'# None and type()

`None` represents the absence of a value. The `type()` function tells you what data type a variable holds.',
'x = None
print(x)           # None
print(type(x))     # <class ''NoneType''>
print(type(42))    # <class ''int''>
print(type(3.14))  # <class ''float''>',
'Create one `int`, one `float`, one `str`, and one `bool` variable. Print the `type()` of each on a separate line.',
'# Your variables and type() calls
',
'a = 5
b = 3.14
c = "hello"
d = True
print(type(a))
print(type(b))
print(type(c))
print(type(d))')

ON CONFLICT (id) DO NOTHING;


-- =======================================================
-- MODULE 3: Control Flow  (8 lessons)
-- Reduced hints
-- =======================================================
INSERT INTO public.lessons (id, module_id, title, "order", language, xp_reward, content, code_example, exercise_prompt, exercise_starter_code, exercise_solution) VALUES

('l-py-3-1', 'm-py-3', 'if Statements', 1, 'python', 70,
'# Making Decisions with if

An `if` statement runs a block of code only when its condition is `True`. Indentation marks what belongs inside the block.',
'age = 18
if age >= 18:
    print("You can vote")',
'Write an if statement: if `temperature` is above 35, print `"Heat warning!"`. Set temperature to 40.',
'temperature = 40
# Write your if statement
',
'temperature = 40
if temperature > 35:
    print("Heat warning!")'),

('l-py-3-2', 'm-py-3', 'if / else', 2, 'python', 70,
'# if / else

The `else` block runs when the `if` condition is `False`.',
'password = "secret123"
if password == "secret123":
    print("Access granted")
else:
    print("Access denied")',
'Given `balance = 50` and `amount = 75`, print `"Sufficient funds"` if balance >= amount, else `"Insufficient funds"`.',
'balance = 50
amount = 75
',
'balance = 50
amount = 75
if balance >= amount:
    print("Sufficient funds")
else:
    print("Insufficient funds")'),

('l-py-3-3', 'm-py-3', 'elif Chains', 3, 'python', 80,
'# elif — Multiple Conditions

Use `elif` for multiple mutually exclusive conditions. Python checks them in order and stops at the first `True`.',
'score = 72
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 70:
    print("C")
else:
    print("F")',
'Given `bmi = 22.4`, print the BMI category:
- Below 18.5: `"Underweight"`
- 18.5–24.9: `"Normal"`
- 25–29.9: `"Overweight"`
- 30+: `"Obese"`',
'bmi = 22.4
',
'bmi = 22.4
if bmi < 18.5:
    print("Underweight")
elif bmi < 25:
    print("Normal")
elif bmi < 30:
    print("Overweight")
else:
    print("Obese")'),

('l-py-3-4', 'm-py-3', 'while Loops', 4, 'python', 85,
'# while Loops

A `while` loop keeps running as long as its condition is `True`. Always ensure the condition eventually becomes `False`!',
'countdown = 5
while countdown > 0:
    print(countdown)
    countdown -= 1
print("Blast off!")',
'Write a while loop starting at `n = 1` that prints every power of 2 up to and including 256. Multiply n by 2 each iteration.',
'n = 1
',
'n = 1
while n <= 256:
    n *= 2
    print(n)'),

('l-py-3-5', 'm-py-3', 'for Loops with range()', 5, 'python', 85,
'# for Loops & range()

`range(start, stop, step)` generates a sequence. `for` loops iterate over sequences automatically.',
'for i in range(1, 6):
    print(i)   # prints 1 2 3 4 5',
'Use a for loop with `range()` to print every **even** number from 2 to 20 (inclusive).',
'# for loop here
',
'for i in range(2, 21, 2):
    print(i)'),

('l-py-3-6', 'm-py-3', 'Nested Conditionals', 6, 'python', 90,
'# Nested if Statements

You can nest `if` statements inside other `if` blocks. Each level needs additional indentation.',
'age = 20
has_license = True
if age >= 16:
    if has_license:
        print("You can drive")
    else:
        print("You need a license")
else:
    print("Too young to drive")',
'Given `is_member = True` and `account_balance = 200`:
- Member + balance > 100: print `"Premium Access"`
- Member + balance <= 100: print `"Top up required"`
- Not a member: print `"Join to access"`

Use nested ifs, not `and`.',
'is_member = True
account_balance = 200
',
'is_member = True
account_balance = 200
if is_member:
    if account_balance > 100:
        print("Premium Access")
    else:
        print("Top up required")
else:
    print("Join to access")'),

('l-py-3-7', 'm-py-3', 'break and continue', 7, 'python', 100,
'# Controlling Loop Flow

- `break` — exits the loop immediately
- `continue` — skips to the next iteration',
'for i in range(10):
    if i == 5:
        break
    print(i)

for i in range(10):
    if i % 2 == 0:
        continue
    print(i)',
'Loop over `range(1, 20)`. Skip multiples of 3 with `continue`. Stop at 15 with `break`. Print everything else.',
'# No starter code — figure it out!
',
'for i in range(1, 20):
    if i == 15:
        break
    if i % 3 == 0:
        continue
    print(i)'),

('l-py-3-8', 'm-py-3', 'FizzBuzz Challenge', 8, 'python', 120,
'# FizzBuzz — A Classic Problem

FizzBuzz rules:
- Multiples of 3 → `"Fizz"`
- Multiples of 5 → `"Buzz"`
- Multiples of both → `"FizzBuzz"`
- Anything else → the number',
'# No example — this is the real challenge',
'Write a FizzBuzz program for numbers 1 through 30.',
'# Implement FizzBuzz for 1 to 30
',
'for i in range(1, 31):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)')

ON CONFLICT (id) DO NOTHING;


-- =======================================================
-- MODULE 4: Functions  (9 lessons)
-- Few hints — figure out yourself
-- =======================================================
INSERT INTO public.lessons (id, module_id, title, "order", language, xp_reward, content, code_example, exercise_prompt, exercise_starter_code, exercise_solution) VALUES

('l-py-4-1', 'm-py-4', 'Defining Functions', 1, 'python', 90,
'# Defining a Function

Use the `def` keyword. Call it by writing its name and parentheses.',
'def say_hello():
    print("Hello!")

say_hello()',
'Define a function called `greet` that prints `"Welcome to Python!"`. Call it.',
'def greet():
    # body here

# Call it
',
'def greet():
    print("Welcome to Python!")

greet()'),

('l-py-4-2', 'm-py-4', 'Parameters & Arguments', 2, 'python', 90,
'# Parameters

Functions accept inputs (parameters) that change their behaviour.',
'def greet(name):
    print(f"Hello, {name}!")

greet("Zara")
greet("Luca")',
'Write a function `power(base, exponent)` that prints `base` raised to `exponent`. Call it with 3 and 4.',
'def power(base, exponent):
    pass

power(3, 4)
',
'def power(base, exponent):
    print(base ** exponent)

power(3, 4)'),

('l-py-4-3', 'm-py-4', 'Return Values', 3, 'python', 100,
'# Returning Data

Functions are most powerful when they *return* a value for use elsewhere.',
'def add(a, b):
    return a + b

result = add(3, 7)
print(result)',
'Write `circle_area(radius)` that returns π × r². Use `3.14159`. Print the area for radius 5, rounded to 2 decimal places.',
'# Write your function
',
'def circle_area(radius):
    return 3.14159 * radius ** 2

print(round(circle_area(5), 2))'),

('l-py-4-4', 'm-py-4', 'Default Parameters', 4, 'python', 100,
'# Default Argument Values

Parameters can have defaults. If the caller omits that argument, the default is used.',
'def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Alice")            # Hello, Alice!
greet("Bob", "Good day") # Good day, Bob!',
'Write `discount(price, percent=10)` that returns the discounted price. Test with price 200 (default) and price 500 at 25%. Print both.',
'def discount(price, percent=10):
    pass
',
'def discount(price, percent=10):
    return price * (1 - percent / 100)

print(discount(200))
print(discount(500, 25))'),

('l-py-4-5', 'm-py-4', 'Multiple Return Values', 5, 'python', 110,
'# Returning Multiple Values

Python functions can return multiple values as a tuple.',
'def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([3, 1, 9, 5])
print(low, high)',
'Write `stats(numbers)` that returns the **minimum**, **maximum**, and **average**. Print all three for `[12, 45, 7, 23, 56, 89, 3]`.',
'def stats(numbers):
    pass
',
'def stats(numbers):
    return min(numbers), max(numbers), sum(numbers) / len(numbers)

lo, hi, avg = stats([12, 45, 7, 23, 56, 89, 3])
print(lo)
print(hi)
print(round(avg, 2))'),

('l-py-4-6', 'm-py-4', 'Scope: Local vs Global', 6, 'python', 110,
'# Variable Scope

Variables inside a function are *local* — they don''t exist outside.
Top-level variables are *global*. Use the `global` keyword to modify them inside a function.',
'count = 0

def increment():
    global count
    count += 1

increment()
increment()
print(count)  # 2',
'Write `safe_divide(a, b)` that returns a/b, or `None` if b is 0. Test with (10, 2) and (5, 0). Print both.',
'def safe_divide(a, b):
    pass
',
'def safe_divide(a, b):
    if b == 0:
        return None
    return a / b

print(safe_divide(10, 2))
print(safe_divide(5, 0))'),

('l-py-4-7', 'm-py-4', 'Recursive Functions', 7, 'python', 130,
'# Recursion

A recursive function calls itself. It needs:
1. A **base case** — stops the recursion
2. A **recursive case** — moves toward the base case',
'def countdown(n):
    if n <= 0:
        print("Go!")
        return
    print(n)
    countdown(n - 1)

countdown(5)',
'Write a recursive function `factorial(n)` that returns n! (n × (n−1) × … × 1). factorial(0) = 1. Print `factorial(6)`.',
'def factorial(n):
    pass
',
'def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

print(factorial(6))'),

('l-py-4-8', 'm-py-4', 'Lambda Functions', 8, 'python', 120,
'# Lambda (Anonymous) Functions

`lambda` creates a compact, one-line function. Often used with `sorted()`, `filter()`, or `map()`.',
'double = lambda x: x * 2
print(double(5))  # 10

nums = [3, 1, 4, 1, 5]
nums.sort(key=lambda x: -x)
print(nums)',
'Use `sorted()` with a `lambda` to sort `words = ["banana", "apple", "kiwi", "cherry"]` by word length (shortest first). Print the result.',
'words = ["banana", "apple", "kiwi", "cherry"]
',
'words = ["banana", "apple", "kiwi", "cherry"]
print(sorted(words, key=lambda w: len(w)))'),

('l-py-4-9', 'm-py-4', 'Docstrings & Best Practices', 9, 'python', 100,
'# Documenting Functions

A **docstring** is a string literal as the first line of a function body — it explains what the function does.',
'def celsius_to_fahrenheit(c):
    """Convert Celsius to Fahrenheit."""
    return c * 9 / 5 + 32

help(celsius_to_fahrenheit)',
'Write `is_palindrome(text)` that returns `True` if the string reads the same forwards and backwards (case-insensitive). Add a docstring. Test with `"Racecar"` and `"hello"`.',
'def is_palindrome(text):
    """Your docstring here."""
    pass
',
'def is_palindrome(text):
    """Return True if text is the same forwards and backwards, case-insensitively."""
    t = text.lower()
    return t == t[::-1]

print(is_palindrome("Racecar"))
print(is_palindrome("hello"))')

ON CONFLICT (id) DO NOTHING;


-- =======================================================
-- MODULE 5: Collections & Advanced  (8 lessons)
-- Minimal hints — figure it out
-- =======================================================
INSERT INTO public.lessons (id, module_id, title, "order", language, xp_reward, content, code_example, exercise_prompt, exercise_starter_code, exercise_solution) VALUES

('l-py-5-1', 'm-py-5', 'Lists Deep Dive', 1, 'python', 120,
'# Lists in Depth

Useful list methods:
- `.append(x)` — add to end
- `.insert(i, x)` — insert at index
- `.remove(x)` — remove first match
- `.pop(i)` — remove by index
- `.sort()` / `sorted()` — sort data',
'scores = [45, 90, 78, 62, 90]
scores.append(84)
scores.sort()
print(scores)',
'Given `data = [3, 7, 2, 9, 4, 1, 8, 5, 6]`:
1. Sort descending
2. Remove `4`
3. Insert `10` at position 0
4. Print the final list',
'data = [3, 7, 2, 9, 4, 1, 8, 5, 6]
',
'data = [3, 7, 2, 9, 4, 1, 8, 5, 6]
data.sort(reverse=True)
data.remove(4)
data.insert(0, 10)
print(data)'),

('l-py-5-2', 'm-py-5', 'Dictionaries', 2, 'python', 120,
'# Dictionaries

Dicts store **key-value pairs**. Methods: `.keys()`, `.values()`, `.items()`, `.get(key, default)`, `.update()`',
'student = {"name": "Ali", "grade": 85}
print(student["name"])
student["grade"] = 90
for key, value in student.items():
    print(f"{key}: {value}")',
'Create a dict `inventory` with 4 items and stock counts. Loop and print items with stock **below 10**. Then add a new item using `.update()`.',
'inventory = {
    # Fill in
}
',
'inventory = {"apples": 5, "bananas": 20, "milk": 3, "bread": 15}
for item, stock in inventory.items():
    if stock < 10:
        print(f"{item}: {stock}")
inventory.update({"eggs": 12})
print(inventory)'),

('l-py-5-3', 'm-py-5', 'Tuples & Sets', 3, 'python', 120,
'# Tuples and Sets

**Tuples** `()` — ordered, immutable.
**Sets** `{}` — unordered, no duplicates.

Sets support set operations: `&` (intersection), `|` (union), `-` (difference).',
'colors = {"red", "blue", "green", "red"}
print(colors)  # 3 unique items

a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(a & b)   # {3, 4}
print(a | b)',
'Given:
```
python_devs = {"Alice", "Bob", "Charlie", "Diana"}
js_devs = {"Bob", "Eve", "Diana", "Frank"}
```
Print:
1. Devs who know BOTH languages
2. All unique devs combined
3. Devs who know Python but NOT JS',
'python_devs = {"Alice", "Bob", "Charlie", "Diana"}
js_devs = {"Bob", "Eve", "Diana", "Frank"}
',
'python_devs = {"Alice", "Bob", "Charlie", "Diana"}
js_devs = {"Bob", "Eve", "Diana", "Frank"}
print(python_devs & js_devs)
print(python_devs | js_devs)
print(python_devs - js_devs)'),

('l-py-5-4', 'm-py-5', 'List Comprehensions', 4, 'python', 130,
'# List Comprehensions

`[expression for item in iterable if condition]` — a concise way to build lists.',
'squares = [x**2 for x in range(1, 11)]
evens   = [x for x in range(20) if x % 2 == 0]',
'Using a **single list comprehension**, produce all numbers from 1–50 that are divisible by 3 but NOT by 6. Print the list.',
'result =
print(result)
',
'result = [x for x in range(1, 51) if x % 3 == 0 and x % 6 != 0]
print(result)'),

('l-py-5-5', 'm-py-5', 'Dictionary Comprehensions', 5, 'python', 130,
'# Dictionary Comprehensions

`{key_expr: value_expr for item in iterable}` — build dicts concisely.',
'squares = {x: x**2 for x in range(1, 6)}
print(squares)',
'Given `words = ["hello", "world", "python", "is", "great"]`, use a dict comprehension to map each word to its length. Print the result.',
'words = ["hello", "world", "python", "is", "great"]
',
'words = ["hello", "world", "python", "is", "great"]
word_lengths = {w: len(w) for w in words}
print(word_lengths)'),

('l-py-5-6', 'm-py-5', 'Classes & Objects', 6, 'python', 160,
'# Object-Oriented Programming

Classes are blueprints for objects. `__init__` is the constructor. `self` refers to the current instance.',
'class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed

    def speak(self):
        return f"{self.name} says Woof!"

rex = Dog("Rex", "Labrador")
print(rex.speak())',
'Create a `BankAccount` class:
- Constructor: `owner`, optional `balance=0`
- `deposit(amount)` — adds to balance
- `withdraw(amount)` — refuses if insufficient
- `__str__` — returns `"[owner]: $[balance]"`

Test deposits and withdrawals.',
'class BankAccount:
    pass
',
'class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            print("Insufficient funds")
        else:
            self.balance -= amount

    def __str__(self):
        return f"{self.owner}: ${self.balance}"

acc = BankAccount("Zara")
acc.deposit(500)
acc.withdraw(200)
print(acc)'),

('l-py-5-7', 'm-py-5', 'Inheritance', 7, 'python', 180,
'# Inheritance

A child class inherits from a parent, reusing its methods while adding or overriding behaviour.',
'class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"

c = Cat("Whiskers")
print(c.speak())',
'Create a `Shape` base class with `area()` returning 0. Create `Rectangle(width, height)` and `Circle(radius)` subclasses, each overriding `area()`. Print areas for a 4×6 rectangle and a circle with radius 7 (use 3.14159).',
'class Shape:
    pass
',
'class Shape:
    def area(self):
        return 0

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    def area(self):
        return self.width * self.height

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    def area(self):
        return round(3.14159 * self.radius ** 2, 2)

print(Rectangle(4, 6).area())
print(Circle(7).area())'),

('l-py-5-8', 'm-py-5', 'Final Challenge: Data Pipeline', 8, 'python', 250,
'# Final Challenge

Use everything you know: functions, loops, dicts, comprehensions, and conditionals. No hints. No starter code.',
'# You are on your own.',
'You are given:
```python
students = [
    {"name": "Alice", "grades": [88, 92, 75, 63]},
    {"name": "Bob",   "grades": [55, 49, 62, 70]},
    {"name": "Cara",  "grades": [91, 95, 89, 97]},
    {"name": "Dave",  "grades": [40, 35, 58, 42]},
]
```
Write a function `report(students)` that prints each student''s name, average grade (1 decimal), and pass/fail (pass if average >= 60). Call it.',
'',
'students = [
    {"name": "Alice", "grades": [88, 92, 75, 63]},
    {"name": "Bob",   "grades": [55, 49, 62, 70]},
    {"name": "Cara",  "grades": [91, 95, 89, 97]},
    {"name": "Dave",  "grades": [40, 35, 58, 42]},
]

def report(students):
    for s in students:
        avg = sum(s["grades"]) / len(s["grades"])
        status = "Pass" if avg >= 60 else "Fail"
        print(f"{s[''name'']}: {round(avg, 1)} — {status}")

report(students)')

ON CONFLICT (id) DO NOTHING;

-- Refresh the course lesson count
UPDATE public.courses SET total_lessons = (
    SELECT COUNT(*) FROM public.lessons l
    JOIN public.modules m ON l.module_id = m.id
    WHERE m.course_id = 'python-basics'
), estimated_hours = 22 WHERE id = 'python-basics';
