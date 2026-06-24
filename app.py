import os
import feedparser
import requests
from flask import Flask, jsonify, render_template

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/releases")
def get_releases():
    try:
        # Fetch the feed using requests to ensure we can set custom headers/timeouts if needed
        response = requests.get(FEED_URL, timeout=10)
        response.raise_for_status()
        
        # Parse feed with feedparser
        feed = feedparser.parse(response.content)
        
        releases = []
        for entry in feed.entries:
            # Feedparser standardizes Atom and RSS feeds
            # Extract content: try content first (usually a list of dicts), then summary
            content_html = ""
            if hasattr(entry, "content") and entry.content:
                content_html = entry.content[0].value
            elif hasattr(entry, "summary"):
                content_html = entry.summary
                
            releases.append({
                "id": entry.get("id", entry.get("link", "")),
                "title": entry.get("title", "BigQuery Update"),
                "link": entry.get("link", ""),
                "published": entry.get("published", entry.get("updated", "")),
                "content": content_html
            })
            
        return jsonify({
            "status": "success",
            "feed_title": feed.feed.get("title", "BigQuery Release Notes"),
            "releases": releases
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
