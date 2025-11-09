"""
Quick test script to verify PatentsView API is working
"""
import httpx
import json

async def test_patentsview_legacy():
    """Test PatentsView Legacy API (v0)"""
    print("Testing PatentsView Legacy API...")
    
    BASE_URL = "https://api.patentsview.org/patents/query"
    
    query_params = {
        "q": {
            "_text_any": {"patent_abstract": "pharmaceutical"}
        },
        "f": [
            "patent_number",
            "patent_title",
            "patent_date",
            "assignee_organization"
        ],
        "o": {
            "per_page": 5,
            "page": 1
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                BASE_URL,
                json=query_params,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                patents = data.get("patents", [])
                print(f"Found {len(patents)} patents")
                
                if patents:
                    print("\nFirst patent:")
                    print(json.dumps(patents[0], indent=2))
                    return True
            else:
                print(f"Error response: {response.text[:500]}")
                return False
                
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_patentsview_new():
    """Test new PatentsView Search API (v1)"""
    print("\n\nTesting PatentsView Search API v1...")
    
    BASE_URL = "https://search.patentsview.org/api/v1/patent/"
    
    query_params = {
        "q": {
            "_text_any": {"patent_title": "pharmaceutical"}
        },
        "f": [
            "patent_number",
            "patent_title"
        ],
        "o": {
            "per_page": 5
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                BASE_URL,
                json=query_params,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                patents = data.get("patents", [])
                print(f"Found {len(patents)} patents")
                
                if patents:
                    print("\nFirst patent:")
                    print(json.dumps(patents[0], indent=2))
                    return True
            else:
                print(f"Error response: {response.text[:500]}")
                return False
                
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    import asyncio
    
    print("="*60)
    print("PATENTSVIEW API TEST")
    print("="*60)
    
    # Test both APIs
    asyncio.run(test_patentsview_legacy())
    asyncio.run(test_patentsview_new())
    
    print("\n" + "="*60)
    print("Test complete!")
