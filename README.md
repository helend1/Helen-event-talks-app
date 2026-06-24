# BigQuery Release Notes Tracker & Tweet Composer

A sleek, responsive web application built with a **Python Flask** backend and a **Vanilla HTML/CSS/JavaScript** frontend. It fetches the official BigQuery Release Notes Atom Feed, presents it in a premium dark-themed split-pane view, and allows you to select updates to compose and post Tweets directly to X/Twitter.

---

## Features

- **Live RSS Fetching**: Flask endpoint dynamically parses Google Cloud's Atom release note feed.
- **Modern Dark UI**: Features a beautiful charcoal and deep navy layout with hover states, smooth transitions, and skeleton loading shimmers.
- **Search & Filter**: Client-side interactive searching across title names and contents.
- **Tweet Composer & Validator**:
  - Automatically translates selected update points into a pre-formatted tweet draft with hashtags (`#BigQuery`, `#GoogleCloud`).
  - Active character counter showing length limits (`0 / 280`).
  - Interactive status checker disables tweeting if it exceeds 280 characters.
  - Quick-action buttons to Post directly via Twitter Web Intents.
- **Manual Refresh**: Click-to-reload spinner animation to fetch updates instantly.

---

## Setup & Running Locally

### Prerequisites
- Python 3.9+ installed on your system.

### Installation & Run Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/helend1/Helen-event-talks-app.git
   cd Helen-event-talks-app
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install Flask requests feedparser
   ```

4. **Run the server**:
   ```bash
   python app.py
   ```

5. **Visit the app**:
   Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your web browser.

---

## File Structure

```text
├── app.py                  # Flask server and XML feed parsing engine
├── templates/
│   └── index.html          # HTML structure for sidebar list & details pane
├── static/
│   ├── css/
│   │   └── styles.css      # Custom dark styles, glassmorphism, & animations
│   └── js/
│       └── app.js          # Client controller logic (fetching, searching, composing)
├── .gitignore              # Ignored files (virtual envs, macOS metadata, etc.)
└── README.md               # Documentation guide
```
