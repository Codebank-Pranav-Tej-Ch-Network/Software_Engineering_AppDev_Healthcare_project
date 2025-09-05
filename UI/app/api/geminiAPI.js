export async function getGeminiImageAnalysis(imageBase64, apiKey) {
  // Use the correct endpoint for multimodal Gemini 1.5 Pro 002
  const endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-002:generateContent';

  const body = {
    contents: [
      {
        parts: [
          {
            text: "You are a healthcare assistant. Analyze this medical test report or prescription image. Explain the findings and give advice in simple terms.",
          },
          {
            inline_data: {
              mime_type: "image/jpeg", // Or "image/png" if your image is PNG
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
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("API Error:", resp.status, resp.statusText, errorText);
      throw new Error(`Network response was not ok: ${resp.status} ${resp.statusText} - ${errorText}`);
    }
    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated.';
  } catch (e) {
    return 'Error fetching analysis: ' + e.message;
  }
}
