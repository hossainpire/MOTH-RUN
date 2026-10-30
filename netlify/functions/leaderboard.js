import { getStore } from '@netlify/blobs'; 

export const handler = async (event) => {
const headers = {
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Headers': 'Content-Type',
'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
'Content-Type': 'application/json'
}; 

if (event.httpMethod === 'OPTIONS') {
return { statusCode: 200, headers, body: '' };
} 

const store = getStore('game-data'); 

let leaderboard = [];
try {
const rawData = await store.get('leaderboard', { type: 'json' });
if (rawData) leaderboard = rawData;
} catch (err) {
console.error("Store fetching error:", err);
} 

// ১. লিডারবোর্ড দেখার রিকোয়েস্ট (GET)
if (event.httpMethod === 'GET') {
return {
statusCode: 200,
headers,
body: JSON.stringify(leaderboard)
};
} 

// ২. নতুন স্কোর জমা দেওয়ার রিকোয়েস্ট (POST)
if (event.httpMethod === 'POST') {
try {
const { name, score } = JSON.parse(event.body); 

if (!name || score === undefined) {
return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid data' }) };
}

leaderboard.push({ name, score: Number(score), date: new Date().toISOString() });

// স্কোর অনুযায়ী বড় থেকে ছোট ক্রমানুসারে সাজানো (Sorting)
leaderboard.sort((a, b) => b.score - a.score);

// শুধুমাত্র শীর্ষ ১০ জনকে রাখা
leaderboard = leaderboard.slice(0, 10);

// নতুন লিস্টটি আবার Netlify Blobs-এ সেভ করা
await store.setJSON('leaderboard', leaderboard);

return {
statusCode: 200,
headers,
body: JSON.stringify({ message: 'Score updated!', leaderboard })
};
} catch (error) {
return {
statusCode: 500,
headers,
body: JSON.stringify({ error: 'Failed to process score' })
};
}

} 

return { statusCode: 405, headers, body: 'Method Not Allowed' };
};
