from flask import Flask, render_template, request, jsonify
import requests
from bs4 import BeautifulSoup
import trafilatura
import re
from textstat import flesch_reading_ease

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
        
        # Calculate keyword density
        total_words = len(main_content.split())
        keyword_density = (keyword_count / total_words) * 100 if total_words > 0 else 0

        # Calculate readability score
        readability_score = flesch_reading_ease(main_content)

        # Analyze internal and external links
        internal_links = len([a for a in soup.find_all('a', href=True) if a['href'].startswith('/')])
        external_links = len([a for a in soup.find_all('a', href=True) if a['href'].startswith('http') and not a['href'].startswith(url)])

        # Check for keyword in URL
        keyword_in_url = keyword.lower() in url.lower()

        # Check for keyword in headings (h1, h2, h3)
        headings = soup.find_all(['h1', 'h2', 'h3'])
        keyword_in_headings = sum(1 for h in headings if keyword.lower() in h.text.lower())

        results = {
            "title": title,
            "meta_description": meta_description,
            "h1_tags": h1_tags,
            "keyword_count": keyword_count,
            "keyword_density": round(keyword_density, 2),
            "readability_score": round(readability_score, 2),
            "internal_links": internal_links,
            "external_links": external_links,
            "keyword_in_url": keyword_in_url,
            "keyword_in_headings": keyword_in_headings
        }

        # Debug print
        print("Debug - SEO Analysis Results:", results)

        return results
    except requests.RequestException as e:
        error_msg = f"Failed to fetch URL: {str(e)}"
        print("Debug - Error:", error_msg)
        return {"error": error_msg}
    except Exception as e:
        error_msg = f"An error occurred: {str(e)}"
        print("Debug - Error:", error_msg)
        return {"error": error_msg}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    url = data.get('url')
    keyword = data.get('keyword')
    
    if not url or not keyword:
        error_msg = "URL and keyword are required"
        print("Debug - Error:", error_msg)
        return jsonify({"error": error_msg}), 400
    
    results = analyze_seo(url, keyword)
    print("Debug - Sending results to frontend:", results)
    return jsonify(results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
