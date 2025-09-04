import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getGeminiImageAnalysis } from '../api/geminiAPI';
import { GEMINI_API_KEY } from '@env';

export default function TestResultAnalysis() {
  const [imageBase64, setImageBase64] = useState('');
  const [pickedImage, setPickedImage] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      base64: true,
    });

    if (!result.cancelled) {
      setPickedImage(result.uri);
      setImageBase64(result.base64);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    const answer = await getGeminiImageAnalysis(imageBase64, GEMINI_API_KEY);
    setResult(answer);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Report Analyzer (powered by Gemini)</Text>
      <Button title="Upload Image" onPress={pickImage} />
      {pickedImage && (
        <Image source={{ uri: pickedImage }} style={{ width: 200, height: 200, marginVertical: 12 }} />
      )}
      <Button
        onPress={handleAnalyze}
        title={loading ? 'Analyzing...' : 'Analyze'}
        disabled={loading || !imageBase64}
      />
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
  container: { flex: 1, maxWidth: 600, alignSelf: 'center', padding: 24 },
  title: { fontSize: 20, marginBottom: 12 },
  resultBox: { backgroundColor: '#ffe', borderRadius: 8, marginTop: 24, padding: 16 },
  resultTitle: { color: '#d35400', marginBottom: 12 },
  resultText: { fontSize: 16, lineHeight: 24 },
});
