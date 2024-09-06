from flask import Flask, render_template, request, jsonify
import requests
from bs4 import BeautifulSoup
import trafilatura

app = Flask(__name__)

def analyze_seo(url, keyword):
    try:
        # Fetch the webpage content
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract main text content using trafilatura
        downloaded = trafilatura.fetch_url(url)
        main_content = trafilatura.extract(downloaded)

        # Analyze SEO factors
        title = soup.title.string if soup.title else "No title found"
        meta_description = soup.find('meta', attrs={'name': 'description'})
        meta_description = meta_description['content'] if meta_description else "No meta description found"
        h1_tags = [h1.text for h1 in soup.find_all('h1')]
        keyword_count = main_content.lower().count(keyword.lower())
        
        return {
            "title": title,
            "meta_description": meta_description,
            "h1_tags": h1_tags,
            "keyword_count": keyword_count
        }
    except requests.RequestException as e:
        return {"error": f"Failed to fetch URL: {str(e)}"}
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    url = data.get('url')
    keyword = data.get('keyword')
    
    if not url or not keyword:
        return jsonify({"error": "URL and keyword are required"}), 400
    
    results = analyze_seo(url, keyword)
    return jsonify(results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
