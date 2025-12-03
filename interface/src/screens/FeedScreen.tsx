import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Text, Searchbar, Chip, Card, Avatar, FAB } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_URL } from '@env';

type FeedScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Feed'
>;

type Props = {
  navigation: FeedScreenNavigationProp;
};

const FeedScreen = ({ navigation }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userName, setUserName] = useState<string>('');
  const [following, setFollowing] = useState(false);
  const [searchType, setSearchType] = useState<'posts' | 'users'>('posts');
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Testowy użytkownik 
  const targetUserId = '331067d2-5cd9-4ca8-b8d3-ec621ea2649e';
  const targetUserName = 'adam';

  const categories = ['All', 'Coffee', 'Tea', 'Wine', 'Beer', 'Juice'];

  const fetchPosts = useCallback(async () => {
    try {
      setLoadingPosts(true);
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const currentUserId = userData ? JSON.parse(userData)?.id : undefined;

      const res = await fetch(`${API_URL}/api/posts?limit=50&sortBy=created_at`, {
        headers,
      });
      if (!res.ok) {
        throw new Error(`Nie udało się pobrać postów: ${res.status}`);
      }
      const data = await res.json();
      const basePosts = Array.isArray(data) ? data : [];
    
      const token2 = await AsyncStorage.getItem('token');
      const headers2: Record<string, string> = {};
      if (token2) headers2.Authorization = `Bearer ${token2}`;
      const withCountsTagsAndLiked = await Promise.all(
        basePosts.map(async (p: any) => {
          try {
            let enriched = p;
            // Reviews count
            if (typeof enriched.reviews_count === 'undefined' || enriched.reviews_count === null) {
              const r = await fetch(`${API_URL}/api/posts/${enriched.id}/reviews/count`, { headers: headers2 });
              if (r.ok) {
                const payload = await r.json().catch(() => null);
                const count = payload && typeof payload.reviews_count !== 'undefined' ? payload.reviews_count : 0;
                enriched = { ...enriched, reviews_count: count };
              }
            }
            // Tags list
            if (!Array.isArray(enriched.tags) || enriched.tags.length === 0) {
              const t = await fetch(`${API_URL}/api/posts/${enriched.id}/tags`, { headers: headers2 });
              if (t.ok) {
                const tagsPayload = await t.json().catch(() => []);
                const tags = Array.isArray(tagsPayload) ? tagsPayload : [];
                enriched = { ...enriched, tags };
              }
            }
            // Liked status by current user
            if (currentUserId) {
              const ls = await fetch(`${API_URL}/api/posts/${enriched.id}/like/status?userId=${encodeURIComponent(currentUserId)}`, { headers: headers2 });
              if (ls.ok) {
                const likedPayload = await ls.json().catch(() => null);
                const likedFlag = likedPayload && typeof likedPayload.liked !== 'undefined' ? !!likedPayload.liked : false;
                enriched = { ...enriched, __liked: likedFlag };
              }
            }
            return enriched;
          } catch {
            return p;
          }
        })
      );
      setPosts(withCountsTagsAndLiked);
    } catch (e) {
      console.error('Fetch posts error:', e);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  // Pobieramy dane zalogowanego użytkownika
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };

    loadUser();
  }, []);

  // Sprawdzamy status obserwacji użytkownika 
  useEffect(() => {
    const checkFollowing = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        console.log('Checking follow status with API_URL:', API_URL);
        const res = await fetch(
          `${API_URL}/api/follow/is-following/${targetUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setFollowing(data.following);
      } catch (error) {
        console.error('Error checking following status:', error);
      }
    };

    checkFollowing();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const toggleFollow = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Błąd', 'Brak tokenu autoryzacyjnego. Zaloguj się ponownie.');
        return;
      }

      const method = following ? 'DELETE' : 'POST';
      console.log('Toggling follow with API_URL:', API_URL);
      const res = await fetch(`${API_URL}/api/follow/${targetUserId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        Alert.alert('Błąd', `Nie udało się ${following ? 'przestać obserwować' : 'obserwować'} użytkownika. ${errorData.message || ''}`);
        return;
      }

      // Jeśli wszystko się powiodło, zmieniamy stan
      setFollowing(!following);

    } catch (error: any) {
      console.error('Error toggling follow:', error);
      Alert.alert('Błąd', `Wystąpił problem z siecią: ${error.message || error}`);
    }
  };

  const togglePostLike = async (postId: string, currentlyLiked: boolean) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      if (!token || !userData) {
        Alert.alert('Błąd', 'Brak tokenu lub użytkownika. Zaloguj się ponownie.');
        return;
      }
      const user = JSON.parse(userData);
      const method = currentlyLiked ? 'DELETE' : 'POST';

      const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: method === 'POST' ? JSON.stringify({ userId: user.id }) : JSON.stringify({ userId: user.id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert('Błąd', err.message || 'Nie udało się zaktualizować polubienia');
        return;
      }

      const payload = await res.json().catch(() => null);

      if (payload && typeof payload.likes_count !== 'undefined') {
        setPosts(prev =>
          prev.map(p => {
            if (p.id !== postId) return p;
            const toNumber = (v: any) =>
              v && typeof v === 'object' && 'low' in v ? v.low : typeof v === 'number' ? v : 0;
            const newLikes = toNumber(payload.likes_count);
            const likedFlag = typeof payload.liked !== 'undefined' ? !!payload.liked : !currentlyLiked;
            return { ...p, likes_count: newLikes, __liked: likedFlag };
          }),
        );
      } else {
        // Fallback: optimistic update, then refresh to sync with backend
        setPosts(prev =>
          prev.map(p => {
            if (p.id !== postId) return p;
            const toNumber = (v: any) =>
              v && typeof v === 'object' && 'low' in v ? v.low : typeof v === 'number' ? v : 0;
            const likes = toNumber(p.likes_count);
            const newLikes = currentlyLiked ? Math.max(0, likes - 1) : likes + 1;
            return { ...p, likes_count: newLikes, __liked: !currentlyLiked };
          }),
        );
        // Soft refresh to sync with backend
        fetchPosts();
      }
    } catch (e: any) {
      console.error('Like toggle error:', e);
      Alert.alert('Błąd', e.message || 'Wystąpił problem z siecią');
    }
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handleSearchFocus = () => {
    console.log('🔍 Search bar focused');
    if (searchType === 'posts') {
      navigation.navigate('SearchPosts');
    } else {
      navigation.navigate('SearchUsers');
    }
  };
  const handleAddPost = () => {
    navigation.navigate('AddPost');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const renderPost = ({ item }: { item: any }) => {
    const firstPhoto = Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0] : null;
    const showFallback = !firstPhoto || imageErrors[item.id];
    const toNumber = (v: any) => (v && typeof v === 'object' && 'low' in v ? v.low : typeof v === 'number' ? v : 0);
    const likesCount = toNumber(item.likes_count);
    const commentsCount = toNumber(item.reviews_count);
    const avgRating = toNumber(item.avg_rating);
    const isLiked = !!item.__liked;

    return (
      <Card style={styles.postCard} onPress={() => handlePostPress(item.id)}>
        {showFallback ? (
          <View style={[styles.postImage, styles.noImageContainer]}>
            <Text style={styles.noImageText}>no image</Text>
          </View>
        ) : (
          <Image
            source={{ uri: firstPhoto }}
            style={styles.postImage}
            resizeMode="cover"
            onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
          />
        )}
        <View style={styles.postContent}>
          <Text style={styles.postTitle}>{item.title}</Text>
          {item.author?.name ? (
            <View style={styles.postAuthorRow}>
              <Avatar.Text
                size={24}
                label={item.author.name.substring(0,2).toUpperCase()}
                style={styles.postAuthorAvatar}
                color="#fff"
              />
              <Text style={styles.postAuthorName}>by {item.author.name}</Text>
            </View>
          ) : null}
          {/* Content excerpt: first 50 characters */}
          {item.content ? (
            <Text style={styles.postExcerpt}>
              {item.content.slice(0, 50)}{item.content.length > 50 ? '…' : ''}
            </Text>
          ) : null}
          {/* Tags as hashtags if available */}
          {Array.isArray(item.tags) && item.tags.length > 0 ? (
            <Text style={styles.postTags}>
              {item.tags
                .map((t: any) => {
                  const name = typeof t === 'string' ? t : t?.name || t?.properties?.name || '';
                  return name ? `#${name}` : '';
                })
                .filter(Boolean)
                .join(' ')}
            </Text>
          ) : null}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <TouchableOpacity onPress={() => togglePostLike(item.id, isLiked)}>
                <Text style={isLiked ? styles.heartIconLiked : styles.heartIcon}>{isLiked ? '♥' : '♡'}</Text>
              </TouchableOpacity>
              <Text style={styles.statText}>{likesCount}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.commentIcon}>💬</Text>
              <Text style={styles.statText}>{commentsCount}</Text>
            </View>
            <View style={[styles.stat, styles.rightStat, styles.ratingPill]}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.ratingText}>{Number.isFinite(avgRating) ? avgRating.toFixed(1) : '0.0'}</Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar.Text size={40} label={userName ? userName.substring(0, 2).toUpperCase() : 'GU'} style={{ backgroundColor: '#ccc' }} />
          <Text style={styles.userName}>{userName || 'Guest'}</Text>
          <Chip style={styles.categoryChip} textStyle={styles.chipText}>
            Cocktail
          </Chip>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={searchType === 'posts' ? 'Search beverages...' : 'Search users...'}
          onChangeText={setSearchQuery}
          value={searchQuery}
          onFocus={handleSearchFocus}
          onSubmitEditing={handleSearchFocus}
          style={styles.searchBar}
          iconColor="#666"
          icon={() => <Text style={{ fontSize: 20 }}>🔍</Text>}
        />
      </View>

      <View style={styles.searchTypeContainer}>
        <TouchableOpacity
          style={[
            styles.searchTypeButton,
            searchType === 'posts' && styles.searchTypeButtonActive,
          ]}
          onPress={() => setSearchType('posts')}
        >
          <Text
            style={[
              styles.searchTypeButtonText,
              searchType === 'posts' && styles.searchTypeButtonTextActive,
            ]}
          >
            🍹 Beverages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.searchTypeButton,
            searchType === 'users' && styles.searchTypeButtonActive,
          ]}
          onPress={() => setSearchType('users')}
        >
          <Text
            style={[
              styles.searchTypeButtonText,
              searchType === 'users' && styles.searchTypeButtonTextActive,
            ]}
          >
            👥 Users
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.selectedChip,
            ]}
            textStyle={[
              styles.categoryChipText,
              selectedCategory === category && styles.selectedChipText,
            ]}
            mode={selectedCategory === category ? 'flat' : 'outlined'}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>

      {loadingPosts ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#666" />
        </View>
      ) : (
        <FlatList
          style={styles.feedContainer}
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Brak postów</Text>
            </View>
          }
        />
      )}
      <FAB
        icon="plus"
        label="Add"
        style={styles.fab}
        onPress={handleAddPost}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userName: { fontSize: 16, color: '#333', fontWeight: '500', flex: 1 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#e8f4f8' },
  searchBar: { elevation: 0, backgroundColor: '#e8f4f8' },
  categoriesContainer: { backgroundColor: '#fff', flexGrow: 0, paddingVertical: 8 },
  categoriesContent: { paddingHorizontal: 16, paddingVertical: 0 },
  categoryChip: { marginRight: 8, backgroundColor: '#fff', height: 30, width: 70, justifyContent: 'center' },
  selectedChip: { backgroundColor: '#000' },
  categoryChipText: { color: '#666', fontSize: 10 },
  selectedChipText: { color: '#fff' },
  chipText: { fontSize: 10, color: '#333' },
  feedContainer: { flex: 1 },
  postCard: { margin: 16, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  postImage: { width: '100%', height: 400, backgroundColor: '#d4f1a8', justifyContent: 'center' },
  noImageContainer: { alignItems: 'center' },
  noImageText: { color: '#666', fontSize: 16, fontStyle: 'italic' },
  postContent: { padding: 8 },
  postTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 8 },
  postAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  postAuthorAvatar: { backgroundColor: '#ccc' },
  postAuthorName: { fontSize: 12, color: '#666' },
  postExcerpt: { fontSize: 14, color: '#555', marginBottom: 6 },
  postTags: { fontSize: 12, color: '#777', marginBottom: 10 },
  statsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 16 },
  rightStat: { marginLeft: 'auto', marginRight: 0 },
  heartIcon: { fontSize: 30, color: '#e74c3c' },
  heartIconLiked: { fontSize: 36, color: '#e74c3c' },
  starIcon: { fontSize: 18, color: '#f1c40f' },
  ratingPill: { backgroundColor: '#fff7df', borderWidth: 1, borderColor: '#ffe4a1', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  ratingText: { fontSize: 13, color: '#8a6d3b', fontWeight: '600' },
  commentIcon: { fontSize: 25 },
  statText: { fontSize: 14, color: '#333' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#666' },
  followButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignSelf: 'flex-start',
  },
  followButtonText: { color: '#fff', fontWeight: '500', fontSize: 14 },
  searchTypeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  searchTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchTypeButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  searchTypeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  searchTypeButtonTextActive: {
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#000',
  },
});

export default FeedScreen;