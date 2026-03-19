-- WIPE existing python basics course (cascades to modules, lessons, and progress)
DELETE FROM public.courses WHERE id = 'python-basics';

-- 1. RE-INSERT COURSE
INSERT INTO public.courses (id, title, description, icon, difficulty, total_lessons, estimated_hours) VALUES
('python-basics', 'Python Fundamentals', 'Master Python from absolute scratch. Starts easy, but the training wheels come off as you progress!', '🐍', 'Beginner', 14, 10);

-- 2. INSERT MODULES
INSERT INTO public.modules (id, course_id, title, description, "order") VALUES
('m-py-1', 'python-basics', '1. The Absolute Basics', 'Start running code immediately. Learn how to output text and do basic math.', 1),
('m-py-2', 'python-basics', '2. Variables & Logic', 'Store data in memory and make decisions based on conditions.', 2),
('m-py-3', 'python-basics', '3. Collections & Loops', 'Work with multiple pieces of data at once and repeat actions automatically.', 3),
('m-py-4', 'python-basics', '4. Functions', 'Organize your logic into reusable blocks of code.', 4),
('m-py-5', 'python-basics', '5. Advanced Concepts', 'Tackle complex data structures and Object-Oriented Programming. Minimal holding hands.', 5);

-- 3. INSERT LESSONS
INSERT INTO public.lessons (id, module_id, title, "order", language, xp_reward, content, code_example, exercise_prompt, exercise_starter_code, exercise_solution) VALUES

-- MODULE 1: Absolute Basics (High hand-holding)
('l-py-1-1', 'm-py-1', 'Hello, World!', 1, 'python', 50, 
'# Your First Python Program

Welcome to Python! The best way to learn programming is to write code immediately. 
The `print()` function tells the computer to display whatever is inside the parentheses onto the screen.

When printing text (called a **String**), you must wrap the text in quotation marks.', 
'print("Hello, computer!")', 
'Write a program that prints the exact phrase "Hello, World!" to the console.', 
'# Type your code on the line below:
', 
'print("Hello, World!")'),

('l-py-1-2', 'm-py-1', 'Basic Math', 2, 'python', 50, 
'# Python as a Calculator

You can do math directly inside print statements. Notice that when working with numbers, you **do not** use quotation marks. If you surround a number in quotes, Python treats it like text rather than a mathematical number.

- Addition: `+`
- Subtraction: `-`
- Multiplication: `*`
- Division: `/`', 
'print(5 + 3)
print(10 - 2)
print(4 * 4)', 
'Write a program that calculates and prints the result of 15 multiplied by 4.', 
'# Print the result of 15 * 4
', 
'print(15 * 4)'),

('l-py-1-3', 'm-py-1', 'Variables', 3, 'python', 50, 
'# Saving Data into Variables

Variables are like labeled boxes where you can store data to use later. 
You assign data to a variable using the `=` sign.

The variable name goes on the left, and the data goes on the right.', 
'age = 25
name = "Alice"

print(name)
print(age)', 
'Create a variable called `score` and assign it the number 100. Then use the print function to output the value of `score`.', 
'# Create your variable:


# Print the variable:
', 
'score = 100
print(score)'),


-- MODULE 2: Variables & Logic (Medium hand-holding)
('l-py-2-1', 'm-py-2', 'String Concatenation', 1, 'python', 60, 
'# Combining Strings

You can combine (concatenate) text strings together using the `+` operator.
You can also insert variables into strings easily using an `f-string`. Just put an `f` before the first quote, and wrap the variable names in curly braces `{}`.', 
'first_name = "Jane"
last_name = "Doe"

# Using plus:
print("Full name: " + first_name + " " + last_name)

# Using an f-string (cleaner!):
print(f"Full name: {first_name} {last_name}")', 
'Create variables `color` set to "blue" and `item` set to "sky". Use an f-string to print the exact phrase: "The sky is blue".', 
'color = "blue"
item = "sky"

# Write your print statement below:
', 
'color = "blue"
item = "sky"
print(f"The {item} is {color}")'),

('l-py-2-2', 'm-py-2', 'Booleans & Comparisons', 2, 'python', 60, 
'# True or False?

A **Boolean** is a data type that can only be `True` or `False`. 
We often get booleans by comparing things:
- `>` (Greater than)
- `<` (Less than)
- `==` (Equal to) Notice it is TWO equals signs! One is for variables.
- `!=` (Not equal to)', 
'print(10 > 5)  # True
print(10 == 5) # False', 
'Create a variable called `is_winning` that evaluates to `True` if a variable `my_score` is greater than `enemy_score`. Print `is_winning`.', 
'my_score = 150
enemy_score = 100

# Write your comparison here
', 
'my_score = 150
enemy_score = 100
is_winning = my_score > enemy_score
print(is_winning)'),

('l-py-2-3', 'm-py-2', 'If / Else Statements', 3, 'python', 75, 
'# Making Decisions

Code runs from top to bottom. But what if we only want code to run *sometimes*?

We use `if` statements. If the condition is True, the indented code block runs. If it is False, it skips it or falls back to `else`.
**Note:** Indentation (spaces) is strictly required in Python to show what belongs inside the block!', 
'weather = "raining"

if weather == "raining":
    print("Take an umbrella!")
else:
    print("Wear sunglasses!")', 
'Write an if/else statement that prints "Adult" if the variable `age` is 18 or higher. Otherwise, print "Minor".', 
'age = 16

# Write your if/else statement below:
', 
'age = 16
if age >= 18:
    print("Adult")
else:
    print("Minor")'),


-- MODULE 3: Collections (Less hand-holding)
('l-py-3-1', 'm-py-3', 'Lists', 1, 'python', 80, 
'# Grouping Data into Lists

Variables hold one value. Lists can hold many!
Lists are created using square brackets `[]`. 
You can grab a specific item from a list using its **Index**, which starts counting at 0.', 
'fruits = ["apple", "banana", "cherry"]

print(fruits[0]) # prints apple
print(fruits[1]) # prints banana

fruits.append("orange") # adds to the end', 
'Create a list containing the names of three cities. Then, write code that replaces the SECOND city in the list with "Tokyo", then print the entire list.', 
'# Less hints! Create your list, modify it, then print it.
', 
'cities = ["London", "Paris", "New York"]
cities[1] = "Tokyo"
print(cities)'),

('l-py-3-2', 'm-py-3', 'For Loops', 2, 'python', 90, 
'# Repeating Actions

If you have a list of items and want to do something to each of them without writing the same code 10 times, use a `for` loop!

It iterates over a sequence, and assigns the current item to a temporary variable inside the loop block.', 
'names = ["Alice", "Bob", "Charlie"]

for name in names:
    print(f"Welcome to the platform, {name}!")', 
'Given a list of prices, write a for loop that adds 5 to each price and prints the new price.', 
'prices = [10, 20, 30]

# Write your loop here
', 
'prices = [10, 20, 30]
for price in prices:
    print(price + 5)'),


-- MODULE 4: Functions (Low hand-holding)
('l-py-4-1', 'm-py-4', 'Creating Functions', 1, 'python', 100, 
'# Writing Reusable Blocks

Functions allow you to write complex logic once and use it thousands of times.
Define them with `def`, give them a name, define arguments, and always remember to `return` a final value so the rest of your program can use the result!', 
'def add_bonus(score, bonus_points):
    total = score + bonus_points
    return total

# Calling the function
final_score = add_bonus(100, 50)
print(final_score)', 
'Write a function called `celsius_to_fahrenheit` that takes a temperature in Celsius and returns the Fahrenheit equivalent. 
(Formula: F = C * 9/5 + 32). Calculate and print the result of 20 Celsius.', 
'# Write your function here


print(celsius_to_fahrenheit(20))
', 
'def celsius_to_fahrenheit(c):
    return c * (9/5) + 32

print(celsius_to_fahrenheit(20))'),


-- MODULE 5: Advanced (Virtually no hand-holding)
('l-py-5-1', 'm-py-5', 'Data Filtering Challenge', 1, 'python', 150, 
'# Real-world Data Filtration

In the real world, you are often given dirty or complex arrays of data that need to be filtered and aggregated. You now know variables, booleans, loops, statements, and lists. Proceed to the challenge.', 
'# No examples this time. You know what to do.', 
'Write a function called `get_passing_grades` that takes a list of integers. It must return a NEW list containing only the grades that are strictly greater than 50. Then print the new list.', 
'grades = [45, 80, 50, 92, 33, 71]

# Write your function and call it
', 
'def get_passing_grades(scores):
    passing = []
    for s in scores:
        if s > 50:
            passing.append(s)
    return passing

grades = [45, 80, 50, 92, 33, 71]
print(get_passing_grades(grades))'),

('l-py-5-2', 'm-py-5', 'Classes & Objects', 2, 'python', 200, 
'# Data Models

Classes let you define your own data types to represent things like Users, Animals, or Game Characters. They hold both State (variables inside the class) and Behavior (functions inside the class).', 
'class Player:
    def __init__(self, username):
        self.username = username
        self.level = 1

    def level_up(self):
        self.level += 1
        print(f"{self.username} is now level {self.level}!")

hero = Player("Simba")
hero.level_up()', 
'Create a `Product` class initialized with `name`, `price`, and `stock_count`. Add a method called `buy(quantity)`. If quantity exceeds stock_count, print "Out of stock". Otherwise, reduce stock_count and print the remaining stock.
Create an instance for "Laptop" costing 1000 with 5 in stock. Buy 2, then try to buy 4.', 
'# Write your class and simulation
', 
'class Product:
    def __init__(self, name, price, stock_count):
        self.name = name
        self.price = price
        self.stock_count = stock_count
        
    def buy(self, quantity):
        if quantity > self.stock_count:
            print("Out of stock")
        else:
            self.stock_count -= quantity
            print(f"Remaining stock: {self.stock_count}")

laptop = Product("Laptop", 1000, 5)
laptop.buy(2)
laptop.buy(4)');
