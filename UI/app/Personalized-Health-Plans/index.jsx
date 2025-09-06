import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';

import { getGeminiAPIAnalysis } from '../../api/geminiAPI'; // Adjust the path as necessary

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AILabReportInsightsScreen = () => {
  const [images, setImages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const GEMINI_API_KEY = 'AIzaSyDlpf-VNc5ldJ5YSbU1QhRmcUedbbRwWFo'; // Replace with your actual API key
  const PROJECT_ID = 'geminiapiproject-471207'; // Replace with your actual project ID

  // Native base64 image converter for React Native/Expo
  const convertImageToBase64 = async (imageUri) => {
    try {
      const base64data = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
      return base64data;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  const pickImages = async (shouldAppend = false) => {
    let permissionResult = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'You need to allow access to your photos to upload reports.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      if (shouldAppend) {
        setImages((currentImages) => [...currentImages, ...result.assets]);
      } else {
        setImages(result.assets);
        setAnalysisResults([]);
        setShowResults(false);
      }
    }
  };

  const handleReset = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setImages([]);
    setAnalysisResults([]);
    setShowResults(false);
  };

  const handleSummarize = async () => {
    if (images.length === 0) {
      Alert.alert('No Images', 'Please select lab report images first.');
      return;
    }
    if (!GEMINI_API_KEY || !PROJECT_ID) {
      Alert.alert('API Key Missing', 'Please add your Gemini API key to use this feature.');
      return;
    }
    setIsAnalyzing(true);
    const results = [];
    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        try {
          const base64Image = await convertImageToBase64(image.uri);
          const analysisResponse = await getGeminiAPIAnalysis(base64Image, GEMINI_API_KEY);
          // Parse API response to extract markdown text if needed
          // If analysisResponse is an object, try analysisResponse.candidates?.[0]?.content?.parts?.[0]?.text
          let markdownText = analysisResponse;
          if (
            analysisResponse &&
            typeof analysisResponse === 'object' &&
            analysisResponse.candidates &&
            analysisResponse.candidates[0]?.content?.parts?.[0]?.text
          ) {
            markdownText = analysisResponse.candidates[0].content.parts[0].text;
          }
          results.push({
            imageUri: image.uri,
            analysis: markdownText,
            imageIndex: i + 1,
          });
        } catch (error) {
          console.error(`Error analyzing image ${i + 1}:`, error);
          results.push({
            imageUri: image.uri,
            analysis: `Error analyzing image ${i + 1}: ${error.message}`,
            imageIndex: i + 1,
            isError: true,
          });
        }
      }
      setAnalysisResults(results);
      setShowResults(true);
    } catch (error) {
      Alert.alert('Analysis Error', 'An error occurred while analyzing your images. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderUploadPrompt = () => (
    <View style={styles.uploadBox}>
      <Text style={styles.uploadBoxTitle}>Upload Your Report</Text>
      <Text style={styles.uploadBoxText}>Select one or more images to get started</Text>
      <TouchableOpacity onPress={() => pickImages(false)}>
        <LinearGradient colors={['#4f46e5', '#312e81']} style={styles.gradientButton} start={[0, 0]} end={[1, 1]}>
          <Ionicons name="image" size={24} color="white" />
          <Text style={styles.gradientButtonText}>Select Image(s)</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderImagePreview = () => (
    <View style={styles.previewContainer}>
      <Text style={styles.previewTitle}>Selected Reports ({images.length})</Text>
      <View style={styles.imageList}>
        {images.map((image, index) => (
          <View key={index} style={styles.thumbnailContainer}>
            <Image source={{ uri: image.uri }} style={styles.thumbnail} />
          </View>
        ))}
      </View>
    </View>
  );

  const renderAnalysisResults = () => (
    <Modal visible={showResults} animationType="slide" transparent={false} onRequestClose={() => setShowResults(false)}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Analysis Results</Text>
          <TouchableOpacity onPress={() => setShowResults(false)} style={styles.closeButton}>
            <Ionicons name="close" size={30} color="#312e81" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.resultsScrollView}>
          {analysisResults.map((result, index) => (
            <View key={index} style={styles.resultCard}>
              <Text style={styles.resultTitle}>Analysis {result.imageIndex}</Text>
              {result.isError ? (
                <Text style={styles.errorText}>{result.analysis}</Text>
              ) : (
                <Markdown style={markdownStyles}>{result.analysis}</Markdown>
              )}
            </View>
          ))}
        </ScrollView>
        <View style={styles.modalFooter}>
          <TouchableOpacity
            onPress={() => {
              setShowResults(false);
              handleReset();
            }}
            style={styles.newAnalysisButton}
          >
            <LinearGradient colors={['#4f46e5', '#312e81']} style={styles.gradientButton} start={[0, 0]} end={[1, 1]}>
              <Ionicons name="refresh" size={24} color="white" />
              <Text style={styles.gradientButtonText}>New Analysis</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Lab Report Insights</Text>
          <Text style={styles.subtitle}>Get a simplified summary and explanation of your lab results.</Text>
        </View>
        {images.length === 0 ? renderUploadPrompt() : renderImagePreview()}
        {images.length > 0 && (
          <>
            <TouchableOpacity onPress={() => pickImages(true)} style={styles.addMoreButton}>
              <Ionicons name="add-circle" size={24} color="#4338ca" />
              <Text style={styles.addMoreButtonText}>Add More Images</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReset} style={styles.addMoreButton}>
              <Text style={[styles.addMoreButtonText, { color: '#dc2626' }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSummarize} style={styles.addMoreButton} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <ActivityIndicator size="small" color="#4338ca" />
              ) : (
                <Text style={styles.addMoreButtonText}>Summarize</Text>
              )}
            </TouchableOpacity>
          </>
        )}
        {isAnalyzing && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#312e81" />
              <Text style={styles.loadingText}>Analyzing your reports...</Text>
              <Text style={styles.loadingSubtext}>This may take a few moments</Text>
            </View>
          </View>
        )}
        {renderAnalysisResults()}
      </View>
    </SafeAreaView>
  );
};

const markdownStyles = {
  body: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 24,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  u: {
    textDecorationLine: 'underline',
  },
  heading1: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bullet_list: {
    marginLeft: 20,
  },
  ordered_list: {
    marginLeft: 20,
  },
  list_item: {
    marginBottom: 5,
  },
  code_block: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
  },
  link: {
    color: '#3b82f6',
  },
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#312e81',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  uploadBox: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  uploadBoxTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#312e81',
    marginTop: 16,
  },
  uploadBoxText: {
    color: '#64748B',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  gradientButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingTop: 20,
    shadowColor: '#e0e7ff',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#312e81',
    marginLeft: 10,
    marginBottom: 10,
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  thumbnailContainer: {
    width: '33.33%',
    padding: 5,
  },
  thumbnail: {
    width: '100%',
    height: 110,
    borderRadius: 12,
  },
  addMoreButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#e0e7ff',
    borderWidth: 1.5,
    borderColor: '#c7d2fe',
    marginBottom: 20,
  },
  addMoreButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4338ca',
    marginLeft: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#312e81',
    marginTop: 15,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#312e81',
  },
  closeButton: {
    padding: 5,
  },
  resultsScrollView: {
    flex: 1,
    padding: 20,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#312e81',
    marginBottom: 10,
  },
  errorText: {
    color: '#dc2626',
    fontStyle: 'italic',
  },
  modalFooter: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  newAnalysisButton: {
    width: '100%',
  },
});

export default AILabReportInsightsScreen;
