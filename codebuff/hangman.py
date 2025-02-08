import random
import os

class HangmanGame:
    def __init__(self):
        self.words = [
            'JAVASCRIPT', 'PYTHON', 'PROGRAMMING', 'COMPUTER', 'DEVELOPER', 'CODING',
            'ALGORITHM', 'DATABASE', 'NETWORK', 'SECURITY', 'INTERFACE', 'BROWSER',
            'KEYBOARD', 'MONITOR', 'SOFTWARE', 'HARDWARE', 'INTERNET', 'WEBSITE',
            'FUNCTION', 'VARIABLE', 'LIBRARY', 'FRAMEWORK', 'TESTING', 'DEBUG',
            'SERVER', 'CLIENT', 'CLOUD', 'STORAGE', 'MEMORY', 'PROCESSOR',
            'KEYBOARD', 'MOUSE', 'SCREEN', 'LAPTOP', 'DESKTOP', 'TABLET',
            'MOBILE', 'WIRELESS', 'ROUTER', 'SWITCH', 'FIREWALL', 'PROTOCOL',
            'BINARY', 'DECIMAL', 'INTEGER', 'BOOLEAN', 'STRING', 'ARRAY'
        ]
        self.word = ''
        self.guessed_letters = set()
        self.lives = 6
        self.game_over = False

    def clear_screen(self):
        os.system('cls' if os.name == 'nt' else 'clear')

    def draw_hangman(self):
        stages = [
            """
               --------
               |      |
               |      
               |    
               |      
               |     
            """,
            """
               --------
               |      |
               |      O
               |    
               |      
               |     
            """,
            """
               --------
               |      |
               |      O
               |      |
               |      
               |     
            """,
            """
               --------
               |      |
               |      O
               |     /|
               |      
               |     
            """,
            """
               --------
               |      |
               |      O
               |     /|\\
               |      
               |     
            """,
            """
               --------
               |      |
               |      O
               |     /|\\
               |     /
               |     
            """,
            """
               --------
               |      |
               |      O
               |     /|\\
               |     / \\
               |     
            """
        ]
        return stages[6 - self.lives]

    def display_game_state(self):
        self.clear_screen()
        print(self.draw_hangman())
        print("\nWord:", ' '.join(letter if letter in self.guessed_letters else '_' for letter in self.word))
        print("\nGuessed letters:", ' '.join(sorted(self.guessed_letters)))
        print(f"Lives remaining: {self.lives}")

    def make_guess(self, letter):
        if letter in self.guessed_letters:
            return False

        self.guessed_letters.add(letter)
        
        if letter not in self.word:
            self.lives -= 1
            if self.lives == 0:
                self.game_over = True
                return False
        
        # Check for win
        if all(letter in self.guessed_letters for letter in self.word):
            self.game_over = True
        
        return True

    def new_game(self):
        self.word = random.choice(self.words)
        self.guessed_letters.clear()
        self.lives = 6
        self.game_over = False

    def play(self):
        self.new_game()
        
        while not self.game_over:
            self.display_game_state()
            
            guess = input("\nEnter a letter: ").upper()
            if len(guess) != 1 or not guess.isalpha():
                print("Please enter a single letter!")
                continue
            
            if not self.make_guess(guess):
                if guess in self.guessed_letters:
                    print("You already guessed that letter!")
                
            if self.game_over:
                self.display_game_state()
                if self.lives == 0:
                    print(f"\nGame Over! The word was {self.word}")
                else:
                    print("\nCongratulations! You won!")
                
                play_again = input("\nWould you like to play again? (y/n): ").lower()
                if play_again == 'y':
                    self.new_game()
                    continue
                else:
                    break

if __name__ == "__main__":
    game = HangmanGame()
    game.play()
