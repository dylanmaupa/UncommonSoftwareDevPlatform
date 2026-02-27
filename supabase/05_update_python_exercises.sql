UPDATE public.lessons SET
exercise_prompt = 'Write a function called `analyze_text` that takes a long string of text and returns a dictionary. The dictionary should contain the total word count, the number of unique words, and the most frequent word. Ignore case and punctuation.',
exercise_starter_code = 'def analyze_text(text):
    # Your code here
    pass

sample_text = "The quick brown fox jumps over the lazy dog. The dog barks, and the fox runs away."
print(analyze_text(sample_text))
',
exercise_solution = 'def analyze_text(text):
    import string
    # Remove punctuation and convert to lowercase
    text = text.translate(str.maketrans("", "", string.punctuation)).lower()
    words = text.split()
    
    if not words:
        return {"total_words": 0, "unique_words": 0, "most_frequent": None}
        
    # Count frequencies
    frequencies = {}
    for word in words:
        frequencies[word] = frequencies.get(word, 0) + 1
        
    # Find most frequent
    most_frequent = max(frequencies, key=frequencies.get)
    
    return {
        "total_words": len(words),
        "unique_words": len(frequencies),
        "most_frequent": most_frequent
    }

sample_text = "The quick brown fox jumps over the lazy dog. The dog barks, and the fox runs away."
print(analyze_text(sample_text))'
WHERE id = 'l-py-3-1';


UPDATE public.lessons SET
exercise_prompt = 'Write a function called `filter_and_sort_users` that takes a list of dictionaries (each representing a user with "name", "age", and "active" status). The function should return a list of names of only the *active* users who are *18 or older*, sorted alphabetically by name.',
exercise_starter_code = 'def filter_and_sort_users(users):
    # Your code here
    pass

users_data = [
    {"name": "Zack", "age": 25, "active": True},
    {"name": "Alice", "age": 17, "active": True},
    {"name": "Bob", "age": 30, "active": False},
    {"name": "Charlie", "age": 19, "active": True}
]
print(filter_and_sort_users(users_data))
',
exercise_solution = 'def filter_and_sort_users(users):
    # Filter active and adult users
    filtered_users = [user for user in users if user["active"] and user["age"] >= 18]
    
    # Extract names
    names = [user["name"] for user in filtered_users]
    
    # Sort alphabetically
    names.sort()
    return names

users_data = [
    {"name": "Zack", "age": 25, "active": True},
    {"name": "Alice", "age": 17, "active": True},
    {"name": "Bob", "age": 30, "active": False},
    {"name": "Charlie", "age": 19, "active": True}
]
print(filter_and_sort_users(users_data))'
WHERE id = 'l-py-3-2';


UPDATE public.lessons SET
exercise_prompt = 'You are given two lists of student IDs: `math_class` and `science_class`. Use Sets to find: 1) Students taking BOTH classes. 2) Students taking ONLY Math. Print the length of both resulting sets in format "Both: X, Math Only: Y".',
exercise_starter_code = 'math_class = [101, 102, 105, 108, 110, 115, 102] # Notice duplicates
science_class = [102, 103, 105, 112, 115, 120]

# Your code here
',
exercise_solution = 'math_class = [101, 102, 105, 108, 110, 115, 102]
science_class = [102, 103, 105, 112, 115, 120]

math_set = set(math_class)
science_set = set(science_class)

both = math_set.intersection(science_set)
math_only = math_set.difference(science_set)

print(f"Both: {len(both)}, Math Only: {len(math_only)}")'
WHERE id = 'l-py-4-1';


UPDATE public.lessons SET
exercise_prompt = 'Use a list comprehension to flatten a matrix (a list of lists) into a single list, but ONLY include the numbers that are prime. Assume a helper function `is_prime(n)` is already defined for you.',
exercise_starter_code = 'def is_prime(n):
    if n < 2: return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0: return False
    return True

matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# Write your list comprehension below
# prime_numbers = 

# print(prime_numbers)',
exercise_solution = 'def is_prime(n):
    if n < 2: return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0: return False
    return True

matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

prime_numbers = [num for row in matrix for num in row if is_prime(num)]
print(prime_numbers)'
WHERE id = 'l-py-4-2';


UPDATE public.lessons SET
exercise_prompt = 'Create a `BankAccount` class with an `__init__` method that accepts an initial `balance` (default 0). Add methods `deposit(amount)` and `withdraw(amount)`. Withdrawals should print "Insufficient funds" and not deduct anything if the amount exceeds the balance. Finally, simulate a sequence: deposit 100, withdraw 50, withdraw 80, and print the final balance.',
exercise_starter_code = '# Define your class here


# Simulate the sequence:
# account = BankAccount()
# ...',
exercise_solution = 'class BankAccount:
    def __init__(self, balance=0):
        self.balance = balance
        
    def deposit(self, amount):
        if amount > 0:
            self.balance += amount
            
    def withdraw(self, amount):
        if amount > self.balance:
            print("Insufficient funds")
        else:
            self.balance -= amount

account = BankAccount()
account.deposit(100)
account.withdraw(50)
account.withdraw(80) 
print(f"Final balance: {account.balance}")'
WHERE id = 'l-py-5-1';
