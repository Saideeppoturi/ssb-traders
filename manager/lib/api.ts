const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
export const API_URL = (rawApiUrl.startsWith('http://') || rawApiUrl.startsWith('https://'))
    ? rawApiUrl
    : `https://${rawApiUrl}`;

console.log("Manager using API_URL:", API_URL);
