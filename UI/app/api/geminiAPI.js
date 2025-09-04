export async function getGeminiImageAnalysis(imageBase64, apiKey) {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

  const body = {
    contents: [
      {
        parts: [
          {
            text: "You are a healthcare assistant. Analyze this medical test report or prescription image. Explain the findings and give advice in simple terms.",
          },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageBase64,
            }
          }
        ]
      }
    ]
  };

  try {
    const resp = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error('Network response was not ok');
    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated.';
  } catch (e) {
    return 'Error fetching analysis: ' + e.message;
  }
}
