#Рівень 1:  
#4. Напишіть функцію, яка приймає три параметри (a, b, c) і виводить на екран найменше з них.
def find_minimum(a, b, c):
    return min(a, b, c)

#Рівень 2:  
#4. Напишіть функцію, яка приймає рядок та повертає його обернений варіант. Наприклад, "hello" повинно повернути "olleh".
def revers_str(s):
    return "".join(reversed(s))
#or
def revers_str2(s):
    return s[::-1] 

#Рівень 3:  
#2. Створіть функцію, яка приймає список чисел та повертає новий список, який містить лише парні числа.
def get_even_number(nums):
    return [n for n in nums if n % 2 == 0]


#Рівень 4:  
#3. Створіть клас "Книготека" з можливістю додавання та видалення книг, а також виведення списку усіх книг.

class Library():
    def __init__(self):
        self.books = []
    
    def add_book(self, title, author, year):
        new_book = {"title": title, "author": author, "year": year}
        self.books.append(new_book)
        print(f"\n Book '{title}' is added")
        return

    def remove_book(self, title):
        for book in self.books:
            if book['title'].lower() == title.lower():
                self.books.remove(book)
                print(f"\n Book '{title}' is removed")
                return
        print(f"\n Book '{title}' not found")

    def show_all(self):
        if not self.books:
            print("\nLibrary is empty.")
        else:
            for i, book in enumerate(self.books, 1):
                print(f"{i}. \"{book['title']}\" - {book['author']} - {book['year']}")
            
    def find_by_author(self, author):
        print(f"\nBooks by {author}:")
        found = [b['title'] for b in self.books if b['author'].lower() == author.lower()]
        if found:
            for t in found: print(f"- {t}")
        else:
            print("Nothing found.")
    

def main():
    my_lib = Library()
    
    while True:
        print("\n" + "="*20)
        print("__MAIN MENU__")
        print("1. Find minimum (Level 1)")
        print("2. Reverse string (Level 2)")
        print("3. Get even numbers (Level 3)")
        print("4. Library (Level 4)")
        print("5. Exit")
        
        choice = input("\nChoose point: ")

        if choice == "1":
            try:
                a = float(input("Enter a: "))
                b = float(input("Enter b: "))
                c = float(input("Enter c: "))
                print(f"Result (minimum): {find_minimum(a, b, c)}")
            except ValueError:
                print("Error: Please enter valid numbers.")

        elif choice == "2":
            s = input("Enter string: ")
            print(f"Result (reversed): {revers_str(s)}")

        elif choice == "3":
            raw_input = input("Enter integers separated by space: ")
            try:
                nums = [int(x) for x in raw_input.split()]
                print(f"Result (even numbers): {get_even_number(nums)}")
            except ValueError:
                print("Error: Please enter integers only.")

        elif choice == "4":
            while True:
                print("\n--- Library Menu ---")
                print("1. Add book")
                print("2. Delete book by title")
                print("3. Show all books")
                print("4. Find by author")
                print("5. Back to main menu")
                
                lib_choice = input("\nChoose point: ")
                
                if lib_choice == "1":
                    t = input("Title of the book: ")
                    a_name = input("Author: ")
                    y = input("Year: ")
                    my_lib.add_book(t, a_name, y)
                elif lib_choice == "2":
                    t = input("Which book to delete? (title): ")
                    my_lib.remove_book(t)
                elif lib_choice == "3":
                    my_lib.show_all()
                elif lib_choice == "4":
                    a_name = input("Enter author's name: ")
                    my_lib.find_by_author(a_name)
                elif lib_choice == "5":
                    break
                else:
                    print("Wrong choice. Try again.")

        elif choice == "5":
            print("Good bye!")
            break
        else:
            print("Wrong choice. Try again.")

if __name__ == "__main__":
    main()