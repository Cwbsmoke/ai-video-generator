import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const BACKEND_URL = 'http://10.0.2.2:8001'; // Change to your backend URL

export default function App() {
  const [activeTab, setActiveTab] = useState('text');
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [duration, setDuration] = useState('5');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoStyles] = useState([
    'realistic', 'anime', 'cartoon', 'surreal',
    'talking-image', 'character-animation', 'movement-overlay', 'talking-face'
  ]);

  useEffect(() => {
    fetchVideos();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus.status !== 'granted' || libraryStatus.status !== 'granted') {
      Alert.alert('Permission Required', 'Camera and photo library access is required');
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/videos`);
      setVideos(response.data.videos || []);
    } catch (error) {
      console.log('Error fetching videos');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const generateTextToVideo = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/generate-text-to-video`, {
        prompt,
        style: selectedStyle,
        duration: parseInt(duration),
      });

      Alert.alert('Success', 'Video generation started!');
      setPrompt('');
      fetchVideos();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to generate video');
    } finally {
      setLoading(false);
    }
  };

  const generateImageToVideo = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    setLoading(true);
    try {
      const fileData = new FormData();
      fileData.append('file', {
        uri: selectedImage,
        name: 'image.jpg',
        type: 'image/jpeg',
      });
      fileData.append('style', selectedStyle);
      fileData.append('duration', parseInt(duration));

      const response = await axios.post(
        `${BACKEND_URL}/api/generate-image-to-video`,
        fileData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      Alert.alert('Success', 'Video generation started!');
      setSelectedImage(null);
      fetchVideos();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to generate video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎬 AI Video Generator</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'text' && styles.activeTab]}
            onPress={() => setActiveTab('text')}
          >
            <Text style={styles.tabText}>Text to Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'image' && styles.activeTab]}
            onPress={() => setActiveTab('image')}
          >
            <Text style={styles.tabText}>Image to Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
            onPress={() => setActiveTab('gallery')}
          >
            <Text style={styles.tabText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Text to Video Tab */}
        {activeTab === 'text' && (
          <View style={styles.tabContent}>
            <TextInput
              style={styles.input}
              placeholder="Enter your video prompt..."
              placeholderTextColor="#666"
              value={prompt}
              onChangeText={setPrompt}
              multiline
            />

            <Text style={styles.label}>Style:</Text>
            <ScrollView horizontal style={styles.styleScroll}>
              {videoStyles.map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[styles.styleButton, selectedStyle === style && styles.selectedStyle]}
                  onPress={() => setSelectedStyle(style)}
                >
                  <Text style={styles.styleButtonText}>{style}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Duration (seconds):</Text>
            <View style={styles.durationContainer}>
              {['5', '7', '10'].map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[styles.durationButton, duration === dur && styles.selectedDuration]}
                  onPress={() => setDuration(dur)}
                >
                  <Text style={styles.durationText}>{dur}s</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.generateButton, loading && styles.disabledButton]}
              onPress={generateTextToVideo}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.generateButtonText}>Generate Video</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Image to Video Tab */}
        {activeTab === 'image' && (
          <View style={styles.tabContent}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.selectedImagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>No image selected</Text>
              </View>
            )}

            <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
              <Text style={styles.pickImageButtonText}>📸 Pick Image</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Style:</Text>
            <ScrollView horizontal style={styles.styleScroll}>
              {videoStyles.map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[styles.styleButton, selectedStyle === style && styles.selectedStyle]}
                  onPress={() => setSelectedStyle(style)}
                >
                  <Text style={styles.styleButtonText}>{style}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Duration (seconds):</Text>
            <View style={styles.durationContainer}>
              {['5', '7', '10'].map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[styles.durationButton, duration === dur && styles.selectedDuration]}
                  onPress={() => setDuration(dur)}
                >
                  <Text style={styles.durationText}>{dur}s</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.generateButton, loading && styles.disabledButton]}
              onPress={generateImageToVideo}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.generateButtonText}>Generate Video</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <View style={styles.tabContent}>
            {videos.length === 0 ? (
              <Text style={styles.emptyText}>No videos yet. Generate one to get started!</Text>
            ) : (
              videos.map((video, index) => (
                <View key={index} style={styles.videoCard}>
                  <Text style={styles.videoTitle}>{video.prompt || 'Video'}</Text>
                  <Text style={styles.videoInfo}>Style: {video.style}</Text>
                  <Text style={styles.videoInfo}>Duration: {video.duration}s</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4f46e5',
  },
  tabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    padding: 20,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    color: '#fff',
    padding: 15,
    minHeight: 100,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 15,
  },
  styleScroll: {
    marginBottom: 20,
  },
  styleButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  selectedStyle: {
    borderColor: '#4f46e5',
    backgroundColor: '#4f46e5',
  },
  styleButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  durationContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  durationButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedDuration: {
    borderColor: '#4f46e5',
    backgroundColor: '#4f46e5',
  },
  durationText: {
    color: '#fff',
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  imagePlaceholder: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 60,
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  selectedImagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 20,
  },
  pickImageButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  pickImageButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '600',
  },
  videoCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  videoInfo: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 30,
  },
});
