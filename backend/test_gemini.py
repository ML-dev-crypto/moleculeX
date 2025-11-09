"""
Test Gemini API connectivity and response
"""
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

def test_gemini():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY not found")
        return
    
    print(f"✅ API Key found: {api_key[:10]}...")
    
    try:
        client = genai.Client(api_key=api_key)
        
        # Test 1: Simple text generation
        print("\n🧪 Test 1: Simple text generation")
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents="Say 'Hello, World!' in one sentence"
        )
        print(f"✅ Response: {response.text}")
        
        # Test 2: JSON generation
        print("\n🧪 Test 2: JSON array generation")
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents="Return ONLY a JSON array of 3 numbers from 0-2, like [1, 0, 2]. No explanation, just the array."
        )
        print(f"✅ Response: {response.text}")
        
        # Test 3: Ranking task (like our use case)
        print("\n🧪 Test 3: Ranking task")
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents="""Given these items:
0. Apple
1. Banana
2. Cherry

Rank them alphabetically. Return ONLY a JSON array of indices like [0, 1, 2]. No markdown, no explanation."""
        )
        print(f"✅ Response: {response.text}")
        
        print("\n✅ All tests passed! Gemini API is working correctly.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_gemini()
