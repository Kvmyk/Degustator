import React, { useMemo, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Text, TextInput, Button, HelperText, Snackbar, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

import { launchImageLibrary, Asset } from 'react-native-image-picker';

type AddPostNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddPost'>;

type Props = {
  navigation: AddPostNavigationProp;
};

const AddPostsScreen = ({ navigation }: Props) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [tags, setTags] = useState('');
  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);
  const [recipe, setRecipe] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isTitleInvalid = useMemo(() => title.trim().length < 3, [title]);
  const isContentInvalid = useMemo(() => content.trim().length < 10, [content]);
  const isIngredientsInvalid = useMemo(() => {
    const list = ingredients
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);
    return list.length === 0;
  }, [ingredients]);
  const isFormInvalid = isTitleInvalid || isContentInvalid || isIngredientsInvalid;

  const categories = [
    'Coffee',
    'Tea',
    'Wine',
    'Beer',
    'Juice',
    'Mocktails',
    'Alcoholic Cocktails',
    'Other',
  ];
  const isCategoryInvalid = useMemo(() => !categories.includes(category), [category]);

  const parsedTags = useMemo(
    () =>
      tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
    [tags]
  );

  const parsedIngredients = useMemo(
    () =>
      ingredients
        .split(',')
        .map(i => i.trim())
        .filter(Boolean),
    [ingredients]
  );

  const handlePickImages = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });

    if (result.errorMessage) {
      Alert.alert('Error', result.errorMessage);
    } else if (result.assets) {
      setSelectedImages(result.assets);
    }
  };



  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (token: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const image of selectedImages) {
      if (!image.uri) continue;

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || `photo_${Date.now()}.jpg`,
      } as any);

      const res = await fetch(`${API_URL}/api/uploads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Failed to upload image`);
      }

      const data = await res.json();
      if (data.url) {
        uploadedUrls.push(data.url);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (isFormInvalid) return;

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userRaw = await AsyncStorage.getItem('user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      const userId = user?.id;

      if (!token || !userId) {
        throw new Error('You must be logged in to add a post');
      }

      // Upload images first
      let uploadedPhotoUrls: string[] = [];
      if (selectedImages.length > 0) {
        try {
          uploadedPhotoUrls = await uploadImages(token);
        } catch (uploadError) {
          throw new Error('Failed to upload one or more images');
        }
      }

      const res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          recipe: recipe.trim() || parsedIngredients.join(', ') || 'Recipe not provided',
          photos: uploadedPhotoUrls,
          userId,
          category: category || 'Other',
          // tagIds and ingredientIds are optional and require UUIDs; skipping here
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Request failed with ${res.status}`);
      }

      const createdPost = await res.json();
      const postId: string = createdPost?.id;
      if (!postId) throw new Error('Post created but id missing');

      // Deduplicate inputs to avoid duplicate node creation attempts
      const uniqueTags = Array.from(new Set(parsedTags));
      const uniqueIngredients = Array.from(new Set(parsedIngredients));

      // Create tags and link to post
      for (const tagName of uniqueTags) {
        const tagRes = await fetch(`${API_URL}/api/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: tagName }),
        });
        if (!tagRes.ok) {
          const body = await tagRes.text();
          throw new Error(body || `Failed to create tag: ${tagName}`);
        }
        const tag = await tagRes.json();
        const linkTagRes = await fetch(`${API_URL}/api/posts/${postId}/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tagId: tag.id }),
        });
        if (!linkTagRes.ok) {
          const body = await linkTagRes.text();
          throw new Error(body || `Failed to link tag: ${tagName}`);
        }
      }

      // Create ingredients and link to post
      for (const ingName of uniqueIngredients) {
        const ingRes = await fetch(`${API_URL}/api/ingredients`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: ingName }),
        });
        if (!ingRes.ok) {
          const body = await ingRes.text();
          throw new Error(body || `Failed to create ingredient: ${ingName}`);
        }
        const ingredient = await ingRes.json();
        const linkIngRes = await fetch(`${API_URL}/api/posts/${postId}/ingredients`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ingredientId: ingredient.id }),
        });
        if (!linkIngRes.ok) {
          const body = await linkIngRes.text();
          throw new Error(body || `Failed to link ingredient: ${ingName}`);
        }
      }

      setSuccess('Post added successfully');
      setTitle('');
      setContent('');
      setTags('');
      setIngredients('');
      setSelectedImages([]);
      setRecipe('');
      setCategory('');

      // Optionally navigate back or to feed
      navigation.goBack();
    } catch (e: any) {
      setError(e?.message || 'Failed to add post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>➕ Add New Post</Text>
        </View>

        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionLabel}>Category</Text>
                <View style={styles.categoryRow}>
                  {categories.map(c => (
                    <Button
                      key={c}
                      mode={category === c ? 'contained' : 'outlined'}
                      style={styles.categoryChip}
                      onPress={() => setCategory(c)}
                      disabled={submitting}
                    >
                      {c}
                    </Button>
                  ))}
                </View>
                <HelperText type="error" visible={isCategoryInvalid}>
                  Please select a category
                </HelperText>
                <TextInput
                  label="Title"
                  value={title}
                  onChangeText={setTitle}
                  mode="outlined"
                  style={styles.input}
                  disabled={submitting}
                />
                <HelperText type="error" visible={isTitleInvalid}>
                  Title must be at least 3 characters
                </HelperText>

                <TextInput
                  label="Content"
                  value={content}
                  onChangeText={setContent}
                  mode="outlined"
                  style={styles.input}
                  multiline
                  numberOfLines={6}
                  disabled={submitting}
                />
                <HelperText type="error" visible={isContentInvalid}>
                  Content must be at least 10 characters
                </HelperText>

                <TextInput
                  label="Ingredients (comma separated)"
                  value={ingredients}
                  onChangeText={setIngredients}
                  mode="outlined"
                  style={styles.input}
                  placeholder="e.g. vodka, lime, sugar"
                  disabled={submitting}
                />
                <HelperText type="error" visible={isIngredientsInvalid}>
                  Provide at least one ingredient
                </HelperText>
                {parsedIngredients.length > 0 && (
                  <Text style={styles.tagsPreview}>Ingredients: {parsedIngredients.join(' • ')}</Text>
                )}

                <TextInput
                  label="Tags (comma separated)"
                  value={tags}
                  onChangeText={setTags}
                  mode="outlined"
                  style={styles.input}
                  placeholder="e.g. pasta, dinner, quick"
                  disabled={submitting}
                />

                {parsedTags.length > 0 && (
                  <Text style={styles.tagsPreview}>Tags: {parsedTags.join(' • ')}</Text>
                )}

                <TextInput
                  label="Recipe"
                  value={recipe}
                  onChangeText={setRecipe}
                  mode="outlined"
                  style={styles.input}
                  multiline
                  numberOfLines={5}
                  placeholder="Describe preparation steps..."
                  disabled={submitting}
                />



                <Text style={styles.sectionLabel}>Photos</Text>
                <View style={styles.photosContainer}>
                  {selectedImages.map((img, index) => (
                    <View key={index} style={styles.photoWrapper}>
                      <Image source={{ uri: img.uri }} style={styles.photoPreview} />
                      <TouchableOpacity
                        style={styles.removePhoto}
                        onPress={() => removeImage(index)}
                        disabled={submitting}
                      >
                        <Text style={styles.removePhotoText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {selectedImages.length === 0 && (
                    <Button
                      mode="outlined"
                      onPress={handlePickImages}
                      disabled={submitting}
                      style={styles.addPhotoButton}
                    >
                      Pick Image
                    </Button>
                  )}
                </View>

                <View style={styles.actions}>
                  <Button mode="text" onPress={() => navigation.goBack()} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={submitting}
                    disabled={isFormInvalid || isCategoryInvalid || submitting}
                  >
                    Add Post
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        </View>

        <Snackbar visible={!!error} onDismiss={() => setError(null)} duration={4000}>
          ❌ {error}
        </Snackbar>
        <Snackbar visible={!!success} onDismiss={() => setSuccess(null)} duration={2000}>
          ✅ {success}
        </Snackbar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  flex: { flex: 1 },
  header: { padding: 16, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  content: { padding: 12, flex: 1 },
  scrollContent: { paddingBottom: 24 },
  card: { flex: 1 },
  input: { marginTop: 12 },
  actions: { marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  tagsPreview: { marginTop: 8, color: '#666' },
  sectionLabel: { marginTop: 12, fontWeight: '600' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  categoryChip: { marginRight: 8, marginBottom: 8 },
  photosContainer: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoWrapper: { position: 'relative' },
  photoPreview: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee' },
  removePhoto: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  addPhotoButton: { justifyContent: 'center' },
});

export default AddPostsScreen;