export async function getGeminiAnalysis(symptoms, apiKey) {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  const prompt = `You are a healthcare assistant. Analyze the following symptoms: ${symptoms}. Structure your answer in a good human readable way. Make a basic table showing what deficiencies are there, what excess nutrients are there, and also what kind of symptoms the test reports are pointing towards.`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const resp = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated.';
}
