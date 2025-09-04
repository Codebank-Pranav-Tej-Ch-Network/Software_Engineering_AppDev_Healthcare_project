import React, { useState } from 'react';
import { getGeminiAnalysis } from '../app/api/geminiAPI'; // Adjust path if needed
import { GEMINI_API_KEY } from '@env';

export default function TestResultAnalysis() {
  const [report, setReport] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const answer = await getGeminiAnalysis(report, GEMINI_API_KEY);
    setResult(answer);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 24 }}>
      <h2>Test Report Analyzer (powered by Gemini)</h2>
      <textarea
        value={report}
        onChange={e => setReport(e.target.value)}
        rows={8}
        placeholder="Paste your medical test report or prescription here..."
        style={{ width: '100%', marginBottom: 12 }}
      />
      <button onClick={handleAnalyze} disabled={loading || !report}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      {result && (
        <div
          style={{
            background: '#ffe',
            borderRadius: 8,
            marginTop: 24,
            padding: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
          }}
        >
          <h3 style={{ color: '#d35400', marginBottom: 12 }}>Gemini's Interpretation:</h3>
          <p style={{ fontSize: 16, lineHeight: 1.6 }}>{result}</p>
        </div>
      )}
    </div>
  );
}

