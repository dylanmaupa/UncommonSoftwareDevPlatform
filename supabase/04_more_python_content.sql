INSERT INTO public.modules (id, course_id, title, description, "order") VALUES
('m-py-3', 'python-basics', 'Functions and Modules', 'Write reusable code and organize your projects', 3),
('m-py-4', 'python-basics', 'Data Structures Deep Dive', 'Master sets, tuples, and advanced list operations', 4),
('m-py-5', 'python-basics', 'Object-Oriented Programming', 'Learn classes, objects, inheritance, and polymorphism in Python', 5);

INSERT INTO public.lessons (id, module_id, title, "order", language, xp_reward, content, code_example, exercise_prompt, exercise_starter_code, exercise_solution) VALUES

-- Functions and Modules
('l-py-3-1', 'm-py-3', 'Introduction to Functions', 1, 'python', 75, '# Introduction to Functions

Functions are blocks of reusable code that perform a specific task. They help break our program into smaller and modular chunks.

## Defining a Function
You define a function using the `def` keyword, followed by the function name and parentheses `()`.

## Calling a Function
To use a function, you "call" it by writing its name followed by parentheses.

## Parameters and Arguments
Information can be passed into functions as arguments. Parameters are the variables listed inside the parentheses in the function definition.
', 'def greet(name):
    """This function greets the person passed in as a parameter"""
    print(f"Hello, {name}! Good morning!")

# Calling the function
greet("Alice")
greet("Bob")', 'Write a function called `calculate_area` that takes length and width as parameters and prints the area of a rectangle.', '# Define your function here


# Call your function with length 5 and width 10', 'def calculate_area(length, width):
    area = length * width
    print(f"The area is {area}")

calculate_area(5, 10)'),

('l-py-3-2', 'm-py-3', 'Return Values', 2, 'python', 75, '# Return Values

Functions can send data back to the caller using the `return` statement. This is crucial when you want to use the result of a function in other parts of your code.

When a function hits a `return` statement, it immediately exits. If no `return` statement is present, the function returns `None` by default.
', 'def add_numbers(a, b):
    return a + b

result = add_numbers(10, 5)
print(f"The sum is: {result}")

def is_even(number):
    return number % 2 == 0

print(f"Is 4 even? {is_even(4)}")', 'Write a function called `get_maximum` that takes two numbers as arguments and returns the larger number. Do not use the built-in `max()` function.', '# Define your function


# Test it
# max_val = get_maximum(15, 20)
# print(max_val)', 'def get_maximum(a, b):
    if a > b:
        return a
    else:
        return b

max_val = get_maximum(15, 20)
print(max_val)'),


-- Data Structures Deep Dive
('l-py-4-1', 'm-py-4', 'Tuples and Sets', 1, 'python', 100, '# Tuples and Sets

Beyond lists and dictionaries, Python offers Tuples and Sets.

## Tuples
Tuples are ordered collections just like lists, but they are **immutable** (cannot be changed after creation). They use parentheses `()`.

## Sets
Sets are unordered collections of unique elements. They are great for mathematical set operations like unions and intersections, or for quickly removing duplicates from a list. They use curly braces `{}`.
', '# Tuple
coordinates = (10.0, 20.5)
# coordinates[0] = 15.0  # This would cause an error!
print(f"X: {coordinates[0]}, Y: {coordinates[1]}")

# Set
fruits = {"apple", "banana", "cherry", "apple"}
print(fruits) # Notice "apple" only appears once!

fruits.add("orange")
print("banana" in fruits) # Fast membership testing', 'Create a tuple containing coordinates (x=5, y=10) and a set containing three unique colors. Try adding a duplicate color to the set.', '# Create your tuple
point = 

# Create your set
colors = 

# Add a duplicate color
', 'point = (5, 10)

colors = {"red", "blue", "green"}

colors.add("red")
print(colors)'),

('l-py-4-2', 'm-py-4', 'List Comprehensions', 2, 'python', 100, '# List Comprehensions

List comprehensions provide a concise way to create lists. Common applications are to make new lists where each element is the result of some operations applied to each member of another sequence or iterable.

They are generally faster and more readable than standard `for` loops for simple operations.
', '# the traditional way
squares = []
for x in range(10):
    squares.append(x**2)
    
# using list comprehension
squares_comp = [x**2 for x in range(10)]
print(squares_comp)

# with a condition
even_squares = [x**2 for x in range(10) if x % 2 == 0]
print(even_squares)', 'Use a list comprehension to create a list of the cubes (x**3) of all odd numbers between 1 and 10.', '# Use list comprehension below
# odd_cubes = 
', 'odd_cubes = [x**3 for x in range(1, 11) if x % 2 != 0]
print(odd_cubes)'),


-- Object-Oriented Programming
('l-py-5-1', 'm-py-5', 'Classes and Objects', 1, 'python', 150, '# Classes and Objects

Python is an object-oriented programming language. Almost everything in Python is an object, with its properties and methods.
A Class is like an object constructor, or a "blueprint" for creating objects.

## The __init__() Function
All classes have a built-in function called `__init__()`, which is always executed when the class is being initiated. We use it to assign values to object properties. The `self` parameter is a reference to the current instance of the class.', 'class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age
        
    def bark(self):
        print(f"{self.name} says Woof!")

# Create an object (instance) of the Dog class
my_dog = Dog("Buddy", 3)

# Access properties
print(f"My dog is named {my_dog.name} and is {my_dog.age} years old.")

# Call methods
my_dog.bark()', 'Create a `Car` class with properties `make`, `model`, and `year`. Add a method called `display_info` that prints "This is a [year] [make] [model]". Create an instance and call the method.', '# Define your class here


# Create instance and call method', 'class Car:
    def __init__(self, make, model, year):
        self.make = make
        self.model = model
        self.year = year
        
    def display_info(self):
        print(f"This is a {self.year} {self.make} {self.model}")

my_car = Car("Toyota", "Corolla", 2020)
my_car.display_info()');
