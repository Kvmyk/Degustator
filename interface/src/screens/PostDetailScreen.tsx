import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, Divider, Avatar, TextInput } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

type PostDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PostDetail'
>;

type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

type Props = {
  navigation: PostDetailScreenNavigationProp;
  route: PostDetailScreenRouteProp;
};

const PostDetailScreen = ({ navigation, route }: Props) => {
  const { postId } = route.params;
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [following, setFollowing] = useState<boolean>(false);

  const toNumber = (v: any) =>
    v && typeof v === 'object' && 'low' in v ? v.low : typeof v === 'number' ? v : 0;

  const avgRating = useMemo(() => toNumber(post?.avg_rating ?? 0), [post]);
  // Reviews are fetched from dedicated endpoint to include authors

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/posts/${postId}`, { headers });
      if (!res.ok) throw new Error(`Failed to load post: ${res.status}`);
      const data = await res.json();
      setPost(data);
      setLikeCount(toNumber(data.likes_count));
      // fetch reviews with authors
      try {
        const rv = await fetch(`${API_URL}/api/reviews/post/${postId}`, { headers });
        if (rv.ok) {
          const rvData = await rv.json().catch(() => []);
          const list = Array.isArray(rvData) ? rvData : [];
          const normalized = list.map((item: any) => ({
            ...item,
            rating: toNumber(item?.rating),
          }));
          setReviews(normalized);
        } else {
          setReviews([]);
        }
      } catch {
        setReviews([]);
      }

      // hydrate liked status for current user if known
      try {
        const uid = userData ? JSON.parse(userData)?.id : undefined;
        setCurrentUserId(uid);
        if (uid) {
          const ls = await fetch(
            `${API_URL}/api/posts/${postId}/like/status?userId=${encodeURIComponent(uid)}`,
            { headers }
          );
          if (ls.ok) {
            const payload = await ls.json().catch(() => null);
            setLiked(!!(payload && payload.liked));
          }
        }

        // 🔹 Follow status
        if (uid && data?.author?.id && data.author.id !== uid) {
          const followRes = await fetch(
            `${API_URL}/api/follow/is-following/${encodeURIComponent(data.author.id)}`,
            { headers }
          );
          if (followRes.ok) {
            const followData = await followRes.json().catch(() => null);
            setFollowing(!!followData);
          }
        }
      } catch {}
    } catch (e: any) {
      console.error(e);
      Alert.alert('Błąd', e.message || 'Nie udało się wczytać posta');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      if (!token || !userData) {
        Alert.alert('Błąd', 'Brak tokenu lub użytkownika. Zaloguj się ponownie.');
        return;
      }
      const user = JSON.parse(userData);
      const method = liked ? 'DELETE' : 'POST';

      const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert('Błąd', err.message || 'Nie udało się zaktualizować polubienia');
        return;
      }

      setLiked(!liked);
      setLikeCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
    } catch (e: any) {
      console.error('Like toggle error:', e);
      Alert.alert('Błąd', e.message || 'Wystąpił problem z siecią');
    }
  };

  const toggleFollow = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token || !post?.author?.id) return;

      const method = following ? 'DELETE' : 'POST';

      const res = await fetch(`${API_URL}/api/follow/${post.author.id}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        console.log('Failed to toggle follow');
        return;
      }

      // 🔹 OPTIMISTIC UI UPDATE
      setFollowing(!following);
    } catch (err) {
      console.log('Toggle Follow Error:', err);
    }
  };


  const submitReview = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      if (!token || !userData) {
        Alert.alert('Błąd', 'Brak tokenu lub użytkownika. Zaloguj się ponownie.');
        return;
      }
      const user = JSON.parse(userData);
      const content = newComment.trim();
      const rating = Math.max(0, Math.min(5, Number(newRating)));
      if (!content) {
        Alert.alert('Uwaga', 'Wpisz treść recenzji.');
        return;
      }

      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id, postId, content, rating }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert('Błąd', err.message || 'Nie udało się dodać recenzji');
        return;
      }

      await fetchPost();
      setNewComment('');
      setNewRating(0);
    } catch (e: any) {
      console.error('Add review error:', e);
      Alert.alert('Błąd', e.message || 'Wystąpił problem z siecią');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#666" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {post && Array.isArray(post.photos) && post.photos.length > 0 ? (
            <Image source={{ uri: post.photos[0] }} style={styles.headerImage} resizeMode="cover" />
          ) : (
            <Image
              source={require('../assets/gonster.png')}
              style={styles.headerImage}
              resizeMode="cover"
            />
          )}

          <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{post?.title || 'Post'}</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={handleLike}>
                  <Text style={[styles.icon, liked && styles.likedIcon]}>
                    {liked ? '♥' : '♡'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.icon}>💬</Text>
              </View>
            </View>
            {post?.author?.name ? (
              <View style={styles.authorRow}>
                <Avatar.Text
                  size={32}
                  label={(post.author.name || 'GU').substring(0, 2).toUpperCase()}
                  style={styles.authorAvatar}
                  color="#fff"
                />
                <Text style={styles.authorName}>by {post.author.name}</Text>

                {/* 🔹 Follow button */}
                {post.author.id !== currentUserId && (
                  <TouchableOpacity
                    onPress={toggleFollow}
                    style={[
                      styles.followButton,
                      following ? styles.following : styles.notFollowing
                    ]}
                  >
                    <Text
                      style={[
                        styles.followButtonText,
                        following ? styles.followingText : styles.notFollowingText
                      ]}
                    >
                      {following ? 'Obserwujesz' : 'Obserwuj'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={liked ? styles.heartIconLiked : styles.heartIcon}>{liked ? '♥' : '♡'}</Text>
                <Text style={styles.statNumber}>{likeCount}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.commentIcon}>💬</Text>
                <Text style={styles.statNumber}>{Array.isArray(reviews) ? reviews.length : 0}</Text>
              </View>
              <View style={[styles.stat, styles.rightStat, styles.ratingPill]}>
                <Text style={styles.starIcon}>⭐</Text>
                <Text style={styles.ratingText}>{Number.isFinite(avgRating) ? avgRating.toFixed(1) : '0.0'}</Text>
              </View>
            </View>

            {/* Rating stars removed in favor of numeric badge like Feed */}

            <View style={styles.tagsContainer}>
              {Array.isArray(post?.tags)
                ? post!.tags
                    .map((t: any) => t?.name || t?.properties?.name || '')
                    .filter(Boolean)
                    .slice(0, 10)
                    .map((name: string) => (
                      <Text style={styles.tag} key={`tag-${name}`}>#{name}</Text>
                    ))
                : null}
              <View style={styles.bookmarkBadge}>
                <Text style={styles.bookmarkNumber}>{toNumber(post?.likes_count || 0)}</Text>
              </View>
            </View>

            <Text style={styles.description}>{post?.content || ''}</Text>

            <Text style={styles.ingredientsTitle}>Ingredients:</Text>
            <Text style={styles.ingredients}>
              {Array.isArray(post?.ingredients)
                ? post!.ingredients
                    .map((i: any) => i?.name || i?.properties?.name || '')
                    .filter(Boolean)
                    .join(', ')
                : ''}
            </Text>

            <Text style={styles.ingredientsTitle}>Sposób przygotowania:</Text>
            <Text style={styles.ingredients}>{post?.recipe || ''}</Text>

            <Divider style={styles.divider} />

            <Text style={styles.commentsTitle}>Reviews</Text>

            {Array.isArray(reviews) && reviews.length > 0 ? (
              reviews.map((r: any, idx: number) => (
                <View style={styles.commentItem} key={`rev-${idx}`}>
                  <Avatar.Text
                    size={40}
                    label={(r?.author?.name || 'GU').substring(0, 2).toUpperCase()}
                    style={styles.avatar}
                    color="#fff"
                  />
                  <View style={styles.commentContent}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.commentAuthor}>{r?.author?.name || 'Guest'}</Text>
                      <View style={[styles.stat, styles.ratingPill]}>
                        <Text style={styles.starIcon}>⭐</Text>
                        <Text style={styles.ratingText}>{typeof r?.rating === 'number' ? r.rating.toFixed(1) : String(r?.rating ?? '0')}</Text>
                      </View>
                    </View>
                    <Text style={styles.commentText}>{r?.content || ''}</Text>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.heartIcon}>♡</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={{ color: '#666' }}>No comments yet</Text>
            )}

            {/* Add new review (only if user hasn't reviewed yet and is not the author) */}
            {(() => {
              // Block form if current user is the author or already reviewed
              const isAuthor = !!(post?.author?.id && currentUserId && post.author.id === currentUserId);
              const reviewed = Array.isArray(reviews) && currentUserId
                ? reviews.some((r) => !!r?.author?.id && r.author.id === currentUserId)
                : false;
              if (isAuthor || reviewed) return null;
              return (
                <View style={styles.addCommentBox}>
                  <Text style={styles.addCommentLabel}>Your rating (0-5): {newRating}</Text>
                  <View style={styles.ratingButtonsRow}>
                    {[0,1,2,3,4,5].map((n) => (
                      <TouchableOpacity key={`rate-${n}`} onPress={() => setNewRating(n)}>
                        <Text style={[styles.rateButton, newRating === n && styles.rateButtonActive]}>{n}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.commentInputRow}>
                    <Text style={styles.commentInputLabel}>Review:</Text>
                    <TextInput
                      mode="outlined"
                      value={newComment}
                      onChangeText={setNewComment}
                      placeholder="Write a review..."
                      multiline
                      numberOfLines={3}
                      style={styles.commentInputTextInput}
                    />
                  </View>
                  <View style={styles.addActionsRow}>
                    <TouchableOpacity onPress={() => setNewComment('')}>
                      <Text style={styles.clearButton}>Clear</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={submitReview}>
                      <Text style={styles.sendButton}>Add Review</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })()}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#d4f1a8',
  },
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  authorAvatar: {
    backgroundColor: '#cfcfcf',
  },
  authorName: {
    fontSize: 14,
    color: '#666',
  },
  icon: {
    fontSize: 24,
    color: '#666',
  },
  likedIcon: {
    color: '#e74c3c',
    fontSize: 30,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  rightStat: { marginLeft: 'auto' },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heartIcon: {
    fontSize: 20,
    color: '#e74c3c',
  },
  heartIconLiked: {
    fontSize: 26,
    color: '#e74c3c',
  },
  commentIcon: {
    fontSize: 18,
  },
  ratingPill: {
    backgroundColor: '#fff7df',
    borderWidth: 1,
    borderColor: '#ffe4a1',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  starIcon: { fontSize: 18, color: '#f1c40f' },
  ratingText: { fontSize: 13, color: '#8a6d3b', fontWeight: '600' },
  statNumber: {
    fontSize: 14,
    color: '#333',
  },
  ratingContainer: {
    marginBottom: 12,
  },
  stars: {
    fontSize: 18,
    color: '#000',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  tag: {
    color: '#666',
    fontSize: 14,
  },
  bookmarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  bookmarkNumber: {
    fontSize: 14,
    color: '#333',
  },
  bookmarkIcon: {
    fontSize: 18,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 16,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  ingredients: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 24,
  },
  divider: {
    marginVertical: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  avatar: {
    backgroundColor: '#f0f0f0',
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 12,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#666',
  },
  addCommentBox: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  addCommentLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  ratingButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  rateButton: {
    fontSize: 14,
    color: '#555',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  rateButtonActive: {
    color: '#8a6d3b',
    borderColor: '#ffe4a1',
    backgroundColor: '#fff7df',
  },
  commentInputRow: {
    gap: 6,
    marginBottom: 12,
  },
  commentInputLabel: {
    fontSize: 14,
    color: '#666',
  },
  commentInputTextInput: {
    backgroundColor: '#fff',
  },
  addActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    fontSize: 14,
    color: '#e74c3c',
  },
  sendButton: {
    fontSize: 14,
    color: '#1f7a1f',
    fontWeight: '600',
  },
  followButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 'auto' },
  following: { backgroundColor: '#DDD' },
  notFollowing: { backgroundColor: '#FF4444' },
  followButtonText: { fontWeight: '600' },
  followingText: { color: '#333' },
  notFollowingText: { color: '#FFF' },
});

export default PostDetailScreen;