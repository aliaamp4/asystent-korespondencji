// netlify/functions/gemini-proxy.js
exports.handler = async function (event, context) {
  const apiKey = process.env.GEMINI_API_KEY;
  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Klucz API nie został skonfigurowany na serwerze.' }) };
  }
  try {
    const response = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body,
    });
    const data = await response.json();
    return { statusCode: response.status, body: JSON.stringify(data) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Wystąpił błąd po stronie serwera.' }) };
  }
};