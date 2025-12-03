import React, { useMemo, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Text, TextInput, Button, HelperText, Snackbar, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

type AddPostNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddPost'>;

type Props = {
  navigation: AddPostNavigationProp;
};

const AddPostsScreen = ({ navigation }: Props) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [tags, setTags] = useState('');
  const [photos, setPhotos] = useState('');
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

      const photosArray = photos
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);

      const res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          // Backend requires recipe: send ingredients list as a fallback
          recipe: parsedIngredients.join(', ')
            || 'Ingredients provided',
          photos: photosArray,
          userId,
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
      setPhotos('');

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
          <Card style={styles.card}>
            <Card.Content>
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
                label="Photo URLs (comma separated)"
                value={photos}
                onChangeText={setPhotos}
                mode="outlined"
                style={styles.input}
                placeholder="https://..., https://..."
                disabled={submitting}
              />

              <View style={styles.actions}>
                <Button mode="text" onPress={() => navigation.goBack()} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={isFormInvalid || submitting}
                >
                  Add Post
                </Button>
              </View>
            </Card.Content>
          </Card>
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
  card: { flex: 1 },
  input: { marginTop: 12 },
  actions: { marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  tagsPreview: { marginTop: 8, color: '#666' },
});

export default AddPostsScreen;