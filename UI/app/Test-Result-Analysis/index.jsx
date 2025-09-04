import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { getGeminiAnalysis } from '../api/geminiAPI';
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
    <View style={styles.container}>
      <Text style={styles.title}>Test Report Analyzer (powered by Gemini)</Text>
      <TextInput
        value={report}
        onChangeText={setReport}
        multiline
        numberOfLines={8}
        placeholder="Paste your medical test report or prescription here..."
        style={styles.input}
      />
      <Button onPress={handleAnalyze} title={loading ? 'Analyzing...' : 'Analyze'} disabled={loading || !report} />
      {loading && <ActivityIndicator />}
      {result !== '' && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Gemini's Interpretation:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex = 1, maxWidth: 600, alignSelf: 'center', padding: 24 },
  title: { fontSize: 20, marginBottom: 12 },
  input: { width: '100%', marginBottom: 12, backgroundColor: '#fff', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#ddd' },
  resultBox: { backgroundColor: '#ffe', borderRadius: 8, marginTop: 24, padding: 16 },
  resultTitle: { color: '#d35400', marginBottom: 12 },
  resultText: { fontSize: 16, lineHeight: 24 },
});

