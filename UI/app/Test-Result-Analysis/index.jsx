import React, { useState } from 'react';
import { getGeminiAnalysis } from './geminiApi';

export default function SymptomAnalyzer({ apiKey }) {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const answer = await getGeminiAnalysis(symptoms, apiKey);
    setResult(answer);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 24 }}>
      <h2>Symptom Analyzer (powered by Gemini)</h2>
      <textarea
        value={symptoms}
        onChange={e => setSymptoms(e.target.value)}
        rows={4}
        placeholder="Enter symptoms..."
        style={{ width: '100%', marginBottom: 12 }}
      />
      <button onClick={handleAnalyze} disabled={loading || !symptoms}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      {result && (
        <div
          style={{
            background: '#f5f7fa',
            borderRadius: 8,
            marginTop: 24,
            padding: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{ color: '#0066cc', marginBottom: 12 }}>Gemini's Response:</h3>
          <p style={{ fontSize: 16, lineHeight: 1.6 }}>{result}</p>
        </div>
      )}
    </div>
  );
}
