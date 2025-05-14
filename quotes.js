import { auth, onAuthStateChanged, database, ref, get } from './firebase.js';

const QUOTE_CACHE_KEY = 'cachedQuote';
const QUOTE_CACHE_TIME_KEY = 'cachedQuoteTime';
const QUOTE_CACHE_DURATION = 24 * 60 * 60 * 1000;

async function fetchRandomQuoteFromDB() {
    const quotesRef = ref(database, 'quotes');
    const snapshot = await get(quotesRef);
    if (!snapshot.exists()) return null;
    const quotesObj = snapshot.val();
    const keys = Object.keys(quotesObj);
    if (keys.length === 0) return null;
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return quotesObj[randomKey];
}

function setQuoteInDOM(quoteObj) {
    const quoteDiv = document.getElementById('quote');
    if (!quoteDiv) return;
    if (!quoteObj) {
        quoteDiv.textContent = 'No quote available.';
        return;
    }
    quoteDiv.innerHTML = `${quoteObj.text}<div class="quote-author">- ${quoteObj.author}</div>`;
}

async function showQuote() {
    const cachedQuote = localStorage.getItem(QUOTE_CACHE_KEY);
    const cachedTime = localStorage.getItem(QUOTE_CACHE_TIME_KEY);
    const now = Date.now();
    if (cachedQuote && cachedTime && now - parseInt(cachedTime, 10) < QUOTE_CACHE_DURATION) {
        setQuoteInDOM(JSON.parse(cachedQuote));
        return;
    }
    const quoteObj = await fetchRandomQuoteFromDB();
    if (quoteObj) {
        localStorage.setItem(QUOTE_CACHE_KEY, JSON.stringify(quoteObj));
        localStorage.setItem(QUOTE_CACHE_TIME_KEY, now.toString());
    }
    setQuoteInDOM(quoteObj);
}

function showSignInMessage() {
    const quoteDiv = document.getElementById('quote');
    if (quoteDiv) quoteDiv.textContent = 'Sign in to see your quote.';
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        showQuote();
    } else {
        showSignInMessage();
    }
});
