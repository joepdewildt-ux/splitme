exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { imageBase64, mediaType } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 }
            },
            {
              type: 'text',
              text: `Analyseer deze bon/rekening. Geef ALLEEN een JSON object terug, geen uitleg, geen markdown backticks. Formaat:
{"items":[{"naam":"itemnaam","prijs":0.00,"aantal":1}],"subtotaal":0.00,"totaal_betaald":0.00}
- items: elk los item met naam, prijs per stuk, en aantal
- subtotaal: bedrag van de gerechten/producten zelf
- totaal_betaald: werkelijk betaald bedrag inclusief fooi. Als niet apart vermeld, zet gelijk aan subtotaal
- Prijzen als getal zonder euroteken
- Alleen het JSON object, niks anders`
            }
          ]
        }]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
