import os
from dotenv import load_dotenv
from services.ai_service import generate_professional_text

load_dotenv()

try:
    result = generate_professional_text("hello boss I need leave tomorrow", "Boss", "Rewrite")
    print("Result:", result)
except Exception as e:
    print("Error:", e)
