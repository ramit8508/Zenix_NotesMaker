import requests
import json

print("🧪 Testing NotesMaker Services...\n")

# Test 1: AI Health Check
print("1️⃣ Testing AI Service Health...")
try:
    response = requests.get("http://localhost:5001/health", timeout=5)
    if response.status_code == 200:
        print("   ✅ AI Service is healthy")
        print(f"   Response: {response.json()}")
    else:
        print(f"   ❌ AI Service returned status {response.status_code}")
except Exception as e:
    print(f"   ❌ AI Service error: {e}")

print()

# Test 2: AI Summarization
print("2️⃣ Testing AI Text Summarization...")
try:
    test_text = """
    Artificial Intelligence is transforming the way we work and live. 
    Machine learning algorithms can now process vast amounts of data quickly. 
    Natural language processing enables computers to understand human language. 
    Deep learning models have achieved remarkable results in image recognition. 
    AI is being used in healthcare, finance, education, and many other fields. 
    However, there are also concerns about privacy and job displacement. 
    The future of AI depends on how we develop and deploy these technologies.
    """
    
    payload = {
        "action": "summarize",
        "type": "text",
        "content": test_text
    }
    
    response = requests.post("http://localhost:5001/analyze", json=payload, timeout=10)
    if response.status_code == 200:
        result = response.json()
        print("   ✅ AI Summarization working")
        print(f"   Summary: {result.get('result', 'No result')[:150]}...")
    else:
        print(f"   ❌ Summarization failed with status {response.status_code}")
except Exception as e:
    print(f"   ❌ Summarization error: {e}")

print()

# Test 3: AI Rewrite
print("3️⃣ Testing AI Text Rewriting...")
try:
    payload = {
        "action": "rewrite",
        "type": "text",
        "content": "The cat was sitting on the mat. The weather was very nice today."
    }
    
    response = requests.post("http://localhost:5001/analyze", json=payload, timeout=10)
    if response.status_code == 200:
        result = response.json()
        print("   ✅ AI Rewrite working")
        print(f"   Result: {result.get('result', 'No result')}")
    else:
        print(f"   ❌ Rewrite failed with status {response.status_code}")
except Exception as e:
    print(f"   ❌ Rewrite error: {e}")

print()

# Test 4: AI Explain
print("4️⃣ Testing AI Explain...")
try:
    payload = {
        "action": "explain",
        "type": "text",
        "content": "Quantum computing uses quantum bits or qubits. These can exist in multiple states simultaneously through superposition."
    }
    
    response = requests.post("http://localhost:5001/analyze", json=payload, timeout=10)
    if response.status_code == 200:
        result = response.json()
        print("   ✅ AI Explain working")
        print(f"   Explanation: {result.get('result', 'No result')[:200]}...")
    else:
        print(f"   ❌ Explain failed with status {response.status_code}")
except Exception as e:
    print(f"   ❌ Explain error: {e}")

print()

# Test 5: Backend Health
print("5️⃣ Testing Backend Service Health...")
try:
    response = requests.get("http://localhost:5000/health", timeout=5)
    if response.status_code == 200:
        print("   ✅ Backend Service is healthy")
        print(f"   Response: {response.json()}")
    else:
        print(f"   ❌ Backend returned status {response.status_code}")
except Exception as e:
    print(f"   ❌ Backend error: {e}")

print()

# Test 6: Backend API - Get all tasks
print("6️⃣ Testing Backend API - Get Tasks...")
try:
    response = requests.get("http://localhost:5000/api/tasks", timeout=5)
    if response.status_code == 200:
        tasks = response.json()
        print(f"   ✅ Backend API working - Found {len(tasks)} tasks")
    else:
        print(f"   ❌ API returned status {response.status_code}")
except Exception as e:
    print(f"   ❌ API error: {e}")

print()

# Test 7: Frontend availability
print("7️⃣ Testing Frontend Server...")
try:
    # Frontend is on 5174 as shown in terminal
    response = requests.get("http://localhost:5174", timeout=5)
    if response.status_code == 200:
        print("   ✅ Frontend server is running")
    else:
        print(f"   ⚠️ Frontend returned status {response.status_code}")
except Exception as e:
    print(f"   ❌ Frontend error: {e}")

print()
print("=" * 60)
print("🎉 Test Summary:")
print("   Backend:  http://localhost:5000")
print("   AI:       http://localhost:5001")
print("   Frontend: http://localhost:5174")
print("=" * 60)
