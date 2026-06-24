let releases = [];
let selectedRelease = null;
let searchQuery = "";

// DOM Elements
const refreshBtn = document.getElementById("refresh-btn");
const refreshIcon = document.getElementById("refresh-icon");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search");
const statusBar = document.getElementById("status-bar");
const releasesList = document.getElementById("releases-list");

const emptyState = document.getElementById("empty-state");
const detailView = document.getElementById("detail-view");
const detailDate = document.getElementById("detail-date");
const detailTitle = document.getElementById("detail-title");
const detailLink = document.getElementById("detail-link");
const detailBody = document.getElementById("detail-body");

const tweetTextarea = document.getElementById("tweet-textarea");
const charCounter = document.getElementById("char-counter");
const suggestTweetBtn = document.getElementById("suggest-tweet-btn");
const tweetBtn = document.getElementById("tweet-btn");

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
    fetchReleases();

    // Event Listeners
    refreshBtn.addEventListener("click", () => fetchReleases());
    
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase();
        clearSearchBtn.style.display = searchQuery ? "block" : "none";
        renderReleases();
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchQuery = "";
        clearSearchBtn.style.display = "none";
        renderReleases();
    });

    tweetTextarea.addEventListener("input", updateCharCount);
    
    tweetBtn.addEventListener("click", publishTweet);
    
    suggestTweetBtn.addEventListener("click", generateSuggestedTweet);
});

// Fetch Release Notes from Flask Endpoint
async function fetchReleases() {
    refreshIcon.classList.add("spin");
    statusBar.textContent = "Fetching latest BigQuery release notes...";
    
    try {
        const response = await fetch("/api/releases");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.status === "success") {
            releases = data.releases;
            statusBar.textContent = `Last updated: ${new Date().toLocaleTimeString()} - Total: ${releases.length} notes`;
            renderReleases();
            
            // Auto select first release if none is selected
            if (releases.length > 0 && !selectedRelease) {
                selectRelease(releases[0]);
            }
        } else {
            statusBar.textContent = `Error: ${data.message}`;
        }
    } catch (error) {
        console.error("Failed fetching release notes:", error);
        statusBar.textContent = "Error fetching release notes. Please try again.";
    } finally {
        refreshIcon.classList.remove("spin");
    }
}

// Render filtered list of releases
function renderReleases() {
    const filtered = releases.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(searchQuery);
        const contentMatch = item.content.toLowerCase().includes(searchQuery);
        return titleMatch || contentMatch;
    });

    if (filtered.length === 0) {
        releasesList.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: var(--text-muted);">
                <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                No matching updates found.
            </div>
        `;
        return;
    }

    releasesList.innerHTML = filtered.map(item => {
        const isActive = selectedRelease && selectedRelease.id === item.id;
        const cleanSnippet = stripHtml(item.content).substring(0, 120) + "...";
        const formattedDate = formatDate(item.published);
        
        return `
            <div class="release-item ${isActive ? 'active' : ''}" data-id="${item.id}">
                <div class="release-meta">
                    <span class="release-date">${formattedDate}</span>
                </div>
                <h3>${escapeHtml(item.title)}</h3>
                <div class="release-snippet">${escapeHtml(cleanSnippet)}</div>
            </div>
        `;
    }).join("");

    // Attach click events
    document.querySelectorAll(".release-item").forEach(card => {
        card.addEventListener("click", () => {
            const releaseId = card.getAttribute("data-id");
            const release = releases.find(r => r.id === releaseId);
            if (release) selectRelease(release);
        });
    });
}

// Select a release and view it
function selectRelease(release) {
    selectedRelease = release;
    
    // UI toggle
    emptyState.style.display = "none";
    detailView.style.display = "flex";
    
    // Highlight list card
    document.querySelectorAll(".release-item").forEach(card => {
        if (card.getAttribute("data-id") === release.id) {
            card.classList.add("active");
        } else {
            card.classList.remove("active");
        }
    });

    // Populate detail view
    detailDate.textContent = formatDate(release.published);
    detailTitle.textContent = release.title;
    detailLink.href = release.link || "#";
    
    // If empty content, provide default
    detailBody.innerHTML = release.content || "<p>No detailed content available for this release note.</p>";
    
    // Generate default tweet text
    generateSuggestedTweet();
}

// Generate standard Tweet content from release
function generateSuggestedTweet() {
    if (!selectedRelease) return;
    
    const title = selectedRelease.title;
    const link = selectedRelease.link;
    
    // Strip HTML to get clean text and extract first sentence
    const plainText = stripHtml(selectedRelease.content);
    let summary = plainText.split(/[.!?]/)[0] || ""; // First sentence
    
    if (summary.length > 120) {
        summary = summary.substring(0, 117) + "...";
    }
    
    // Template tweet
    let tweetText = `BigQuery Update: ${title}\n\n"${summary}"\n\nRead more: ${link} #BigQuery #GoogleCloud`;
    
    // If it exceeds 280 characters, try a shorter template
    if (tweetText.length > 280) {
        tweetText = `BigQuery Update: ${title}\n\nRead more: ${link} #BigQuery #GoogleCloud`;
    }
    
    // If still too long, trim title
    if (tweetText.length > 280) {
        const excess = tweetText.length - 280;
        const trimmedTitle = title.substring(0, title.length - excess - 4) + "...";
        tweetText = `BigQuery Update: ${trimmedTitle}\n\nRead more: ${link} #BigQuery`;
    }

    tweetTextarea.value = tweetText;
    updateCharCount();
}

// Update Character Counter UI
function updateCharCount() {
    const length = tweetTextarea.value.length;
    charCounter.textContent = `${length} / 280`;
    
    if (length > 280) {
        charCounter.classList.add("warning");
        tweetBtn.disabled = true;
        tweetBtn.style.opacity = "0.5";
        tweetBtn.style.cursor = "not-allowed";
    } else {
        charCounter.classList.remove("warning");
        tweetBtn.disabled = false;
        tweetBtn.style.opacity = "1";
        tweetBtn.style.cursor = "pointer";
    }
}

// Action: Web Intent Tweet
function publishTweet() {
    if (!tweetTextarea.value.trim()) return;
    
    const text = encodeURIComponent(tweetTextarea.value);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${text}`;
    
    window.open(tweetUrl, "_blank");
}

// Helper: Strip HTML tags
function stripHtml(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
}

// Helper: Format Atom date strings
function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    } catch (e) {
        return dateStr;
    }
}

// Helper: Escape HTML strings for safety
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
