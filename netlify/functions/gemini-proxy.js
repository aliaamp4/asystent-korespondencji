// netlify/functions/gemini-proxy.js
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  // Nagłówki CORS, aby zezwolić na żądania z dowolnej domeny
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Obsługa żądań OPTIONS (pre-flight) dla CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // Pobierz klucz API z bezpiecznych zmiennych środowiskowych Netlify
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Klucz GEMINI_API_KEY nie jest ustawiony na Netlify.');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Błąd konfiguracji serwera: brak klucza API.' }),
    };
  }

  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(googleApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: event.body, // Przekaż ciało zapytania od klienta
    });

    const data = await response.json();

    // Sprawdzenie, czy Google nie zwróciło błędu
    if (!response.ok) {
        console.error('Błąd od API Google:', data);
        return {
            statusCode: response.status,
            headers,
            body: JSON.stringify({ error: data.error?.message || 'Nieznany błąd od API Google.' }),
        };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Błąd wewnętrzny funkcji proxy:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Wystąpił krytyczny błąd po stronie serwera.' }),
    };
  }
};