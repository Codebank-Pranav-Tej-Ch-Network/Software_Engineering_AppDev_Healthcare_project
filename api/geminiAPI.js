// geminiAPI.js

export async function getGeminiAPIAnalysis(imageBase64, apiKey) {
  // Use the correct endpoint for Gemini API
  // Try different model names - gemini-1.0-pro is commonly available
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: "You are a healthcare assistant. Analyze this medical test report or prescription image. Explain the findings and give advice in simple terms. Also, based on the threats, exactly tell what kind of doctor to consult. Keep the response concise and easy to understand.",
          },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageBase64,
            },
          },
        ],
      },
    ],
  };

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("API Error:", resp.status, resp.statusText, errorText);
      
      // Try an alternative model if the first one fails
      if (resp.status === 404) {
        console.log("Trying alternative model...");
        return await tryAlternativeModel(imageBase64, apiKey);
      }
      
      throw new Error(`Network response was not ok: ${resp.status} ${resp.statusText} - ${errorText}`);
    }

    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated.';
  } catch (e) {
    console.error("API call failed:", e);
    return 'Error fetching analysis: ' + e.message;
  }
}

// Try alternative models
async function tryAlternativeModel(imageBase64, apiKey) {
  const alternativeModels = [
    'gemini-pro',
    'gemini-1.0-pro-vision',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
  ];
  
  for (const model of alternativeModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
      
      const body = {
        contents: [
          {
            parts: [
              {
                text: "You are a healthcare assistant. Analyze this medical test report or prescription image. Explain the findings and give advice in simple terms. Also, based on the threats, exactly tell what kind of doctor to consult. Keep the response concise and easy to understand.",
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64,
                },
              },
            ],
          },
        ],
      };
      
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (resp.ok) {
        const data = await resp.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated.';
      }
    } catch (error) {
      console.log(`Model ${model} failed:`, error.message);
      continue;
    }
  }
  
  return "Error: No available model found. Please check your API key and available models.";
}

// List available models (for debugging)
export async function listAvailableModels(apiKey) {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const resp = await fetch(endpoint);
    
    if (resp.ok) {
      const data = await resp.json();
      console.log("Available models:", data.models.map(m => m.name));
      return data.models;
    } else {
      const errorText = await resp.text();
      console.error("Error listing models:", errorText);
      return [];
    }
  } catch (error) {
    console.error("Error listing models:", error);
    return [];
  }
}
