import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Image, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Pressable } from 'react-native';
import { Text, Card, Avatar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

const UserProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params;

  const [user, setUser] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileFollowing, setProfileFollowing] = useState<boolean>(false); // NEW: profile follow state

  const toNumber = (v: any) => (v && typeof v === 'object' && 'low' in v ? v.low : typeof v === 'number' ? v : 0);

  useEffect(() => {
    (async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const u = JSON.parse(userData);
          setCurrentUserId(u?.id ?? null);
        }
      } catch {}
    })();
  }, []);

  const fetchUser = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/api/users/${userId}`, { headers });
    if (!res.ok) throw new Error('Failed to load user');
    const baseUser = await res.json();

    // Fetch followers and following to compute counts using backend users API
    let followerCount = 0;
    let followingCount = 0;
    let likedCount = 0;
    let reviewsCount = 0;
    try {
      const rf = await fetch(`${API_URL}/api/users/${userId}/followers`, { headers });
      if (rf.ok) {
        const followers = await rf.json().catch(() => []);
        followerCount = Array.isArray(followers) ? followers.length : 0;
      }
    } catch {}
    try {
      const rg = await fetch(`${API_URL}/api/users/${userId}/following`, { headers });
      if (rg.ok) {
        const following = await rg.json().catch(() => []);
        followingCount = Array.isArray(following) ? following.length : 0;
      }
    } catch {}
    try {
      const rl = await fetch(`${API_URL}/api/users/${userId}/liked-posts`, { headers });
      if (rl.ok) {
        const likedPosts = await rl.json().catch(() => []);
        likedCount = Array.isArray(likedPosts) ? likedPosts.length : 0;
      }
    } catch {}
    try {
      const rr = await fetch(`${API_URL}/api/reviews/user/${userId}`, { headers });
      if (rr.ok) {
        const reviews = await rr.json().catch(() => []);
        reviewsCount = Array.isArray(reviews) ? reviews.length : 0;
      }
    } catch {}

    return { ...baseUser, followerCount, followingCount, likedCount, reviewsCount };
  }, [userId]);

  const fetchProfileFollowing = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token || !currentUserId || currentUserId === userId) {
        setProfileFollowing(false);
        return false;
      }
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${API_URL}/api/follow/is-following/${encodeURIComponent(userId)}`, { headers });
      if (!res.ok) {
        setProfileFollowing(false);
        return false;
      }
      const data = await res.json().catch(() => null);
      const flag = !!data;
      setProfileFollowing(flag);
      return flag;
    } catch {
      setProfileFollowing(false);
      return false;
    }
  }, [userId, currentUserId]);

  const fetchUserPosts = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/api/users/${userId}/posts?limit=20&sortBy=created_at`, { headers });
    if (!res.ok) throw new Error('Failed to load posts');
    const basePosts = await res.json();

    const token2 = await AsyncStorage.getItem('token');
    const headers2: Record<string, string> = {};
    if (token2) headers2.Authorization = `Bearer ${token2}`;

    const enriched = await Promise.all(
      (Array.isArray(basePosts) ? basePosts : []).map(async (p: any) => {
        try {
          let ep = p;
          // likes count (ensure present)
          if (typeof ep.likes_count === 'undefined' || ep.likes_count === null) {
            const lp = await fetch(`${API_URL}/api/posts/${ep.id}`, { headers: headers2 });
            if (lp.ok) {
              const postPayload = await lp.json().catch(() => null);
              const likesCount = postPayload && typeof postPayload.likes_count !== 'undefined' ? postPayload.likes_count : 0;
              ep = { ...ep, likes_count: likesCount };
            }
          }
          if (typeof ep.reviews_count === 'undefined' || ep.reviews_count === null) {
            const r = await fetch(`${API_URL}/api/posts/${ep.id}/reviews/count`, { headers: headers2 });
            if (r.ok) {
              const payload = await r.json().catch(() => null);
              const count = payload && typeof payload.reviews_count !== 'undefined' ? payload.reviews_count : 0;
              ep = { ...ep, reviews_count: count };
            }
          }
          if (!Array.isArray(ep.tags) || ep.tags.length === 0) {
            const t = await fetch(`${API_URL}/api/posts/${ep.id}/tags`, { headers: headers2 });
            if (t.ok) {
              const tagsPayload = await t.json().catch(() => []);
              const tags = Array.isArray(tagsPayload) ? tagsPayload : [];
              ep = { ...ep, tags };
            }
          }
          if (currentUserId) {
            const ls = await fetch(`${API_URL}/api/posts/${ep.id}/like/status?userId=${encodeURIComponent(currentUserId)}`, { headers: headers2 });
            if (ls.ok) {
              const likedPayload = await ls.json().catch(() => null);
              const likedFlag = likedPayload && typeof likedPayload.liked !== 'undefined' ? !!likedPayload.liked : false;
              ep = { ...ep, __liked: likedFlag };
            }
          }
          if (currentUserId && ep.author?.id && ep.author.id !== currentUserId) {
            const followRes = await fetch(`${API_URL}/api/follow/is-following/${encodeURIComponent(ep.author.id)}`, { headers: headers2 });
            if (followRes.ok) {
              const followData = await followRes.json().catch(() => null);
              const followingFlag = !!followData;
              ep = { ...ep, __following: followingFlag };
            }
          }
          return ep;
        } catch {
          return p;
        }
      })
    );

    return [...enriched].sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime()).slice(0, 20);
  }, [userId, currentUserId]);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [u, p] = await Promise.all([fetchUser(), fetchUserPosts()]);
      setUser(u);
      setPosts(p);
      await fetchProfileFollowing(); // NEW: update header follow state
    } catch (e: any) {
      setError(e?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [fetchUser, fetchUserPosts, fetchProfileFollowing]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh when screen regains focus (e.g., after editing profile)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (active) {
          await load();
        }
      })();
      return () => { active = false; };
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const togglePostLike = async (postId: string, currentlyLiked: boolean) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      if (!token || !userData) return;
      const user = JSON.parse(userData);
      const method = currentlyLiked ? 'DELETE' : 'POST';
      const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) return;
      if (payload && typeof payload.likes_count !== 'undefined') {
        setPosts(prev => prev.map((p: any) => {
          if (p.id !== postId) return p;
          const newLikes = toNumber(payload.likes_count);
          const likedFlag = typeof payload.liked !== 'undefined' ? !!payload.liked : !currentlyLiked;
          return { ...p, likes_count: newLikes, __liked: likedFlag };
        }));
      } else {
        setPosts(prev => prev.map((p: any) => {
          if (p.id !== postId) return p;
          const likes = toNumber(p.likes_count);
          const newLikes = currentlyLiked ? Math.max(0, likes - 1) : likes + 1;
          return { ...p, likes_count: newLikes, __liked: !currentlyLiked };
        }));
      }
    } catch {}
  };

  const toggleFollow = async (targetUserId: string, currentlyFollowing: boolean) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const method = currentlyFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`${API_URL}/api/follow/${targetUserId}`, { method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      if (!res.ok) return;
      // Optimistic: update post author following flags
      setPosts(prev => prev.map(p => (p?.author?.id !== targetUserId ? p : { ...p, __following: !currentlyFollowing })));
      // Also update header follow state if toggling this profile's user
      if (targetUserId === userId) {
        setProfileFollowing(!currentlyFollowing);
      }
    } catch {}
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const renderPost = ({ item }: { item: any }) => {
    const firstPhoto = Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0] : null;
    const showFallback = !firstPhoto || imageErrors[item.id];
    const likesCount = toNumber(item.likes_count);
    const commentsCount = toNumber(item.reviews_count);
    const avgRating = toNumber(item.avg_rating);
    const isLiked = !!item.__liked;

    return (
      <Card style={styles.postCard}>
        {showFallback ? (
          <Pressable onPress={() => handlePostPress(item.id)}>
            <View style={[styles.postImage, styles.noImageContainer]}>
              <Text style={styles.noImageText}>no image</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable onPress={() => handlePostPress(item.id)}>
            <Image
              source={{ uri: firstPhoto }}
              style={styles.postImage}
              resizeMode="cover"
              onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
            />
          </Pressable>
        )}
        <View style={styles.postContent}>
          <Pressable onPress={() => handlePostPress(item.id)}>
            <Text style={styles.postTitle}>{item.title}</Text>
          </Pressable>
          {item.author?.name ? (
            <View style={styles.postAuthorRow}>
              <Avatar.Text size={24} label={item.author.name.substring(0,2).toUpperCase()} style={styles.postAuthorAvatar} color="#fff" />
              <Text style={styles.postAuthorName}>by {item.author.name}</Text>
              {item.author?.id !== currentUserId && (
                <TouchableOpacity
                  onPress={() => toggleFollow(item.author.id, !!item.__following)}
                  style={[styles.followButton, item.__following ? styles.following : styles.notFollowing]}
                >
                  <Text style={[styles.followButtonText, item.__following ? styles.followingText : styles.notFollowingText]}>
                    {item.__following ? 'Obserwujesz' : 'Obserwuj'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
          {item.content ? (
            <Text style={styles.postExcerpt}>
              {item.content.slice(0, 50)}{item.content.length > 50 ? '…' : ''}
            </Text>
          ) : null}
          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <Text style={styles.postTags}>
              {item.tags.map((t: any) => (typeof t === 'string' ? `#${t}` : t?.name ? `#${t.name}` : '')).filter(Boolean).join(' ')}
            </Text>
          )}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <TouchableOpacity onPress={() => togglePostLike(item.id, isLiked)}>
                <Text style={isLiked ? styles.heartIconLiked : styles.heartIcon}>{isLiked ? '♥' : '♡'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('LikesList', { userId })}>
                <Text style={styles.statText}>{likesCount}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.stat}>
              <TouchableOpacity onPress={() => navigation.navigate('ReviewList', { userId })}>
                <Text style={styles.commentIcon}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('ReviewList', { userId })}>
                <Text style={styles.statText}>{commentsCount}</Text>
              </TouchableOpacity>
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

  if (loading) {
    return (
      <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#666" /></View>
    );
  }

  if (error) {
    return (
      <View style={styles.loaderContainer}><Text style={{ color: '#d32f2f' }}>{error}</Text></View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderPost}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={{ paddingBottom: 100 }}
      ListHeaderComponent={
        <View>
          <View style={styles.profileHeader}>
            {user?.photo_url ? (
              <Avatar.Image
                size={72}
                source={{ uri: user.photo_url }}
                style={{ backgroundColor: '#ccc' }}
              />
            ) : (
              <Avatar.Text
                size={72}
                label={(user?.name || 'GU').substring(0,2).toUpperCase()}
                style={{ backgroundColor: '#ccc' }}
                color="#fff"
              />
            )}
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '700' }}>{user?.name || 'User'}</Text>
              {user?.email ? <Text style={{ color: '#666', marginTop: 2 }}>{user.email}</Text> : null}
            </View>
            {currentUserId && userId !== currentUserId ? (
              <TouchableOpacity
                onPress={() => toggleFollow(userId, profileFollowing)}
                style={[styles.followButton, profileFollowing ? styles.following : styles.notFollowing]}
              >
                <Text style={[styles.followButtonText, profileFollowing ? styles.followingText : styles.notFollowingText]}>
                  {profileFollowing ? 'Obserwujesz' : 'Obserwuj'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate('EditUserProfile')}
                style={[styles.followButton, styles.following]}
              >
                <Text style={[styles.followButtonText, styles.followingText]}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.bioContainer}>
            <Text style={styles.bioLabel}>Bio</Text>
            <Text style={styles.bioText}>
              {user?.bio && String(user.bio).trim().length > 0 ? String(user.bio) : 'No bio'}
            </Text>
          </View>
          <View style={styles.connectionsRow}>
            <TouchableOpacity
              style={styles.connectionPill}
              onPress={() => navigation.navigate('FollowsList', { userId, type: 'followers' })}
            >
              <Text style={styles.connectionLabel}>Followers</Text>
              <Text style={styles.connectionCount}>{toNumber(user?.followerCount ?? 0)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.connectionPill}
              onPress={() => navigation.navigate('FollowsList', { userId, type: 'following' })}
            >
              <Text style={styles.connectionLabel}>Following</Text>
              <Text style={styles.connectionCount}>{toNumber(user?.followingCount ?? 0)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.connectionPill}
              onPress={() => navigation.navigate('LikesList', { userId })}
            >
              <Text style={styles.connectionLabel}>Liked</Text>
              <Text style={styles.connectionCount}>{toNumber(user?.likedCount ?? 0)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.connectionPill}
              onPress={() => navigation.navigate('ReviewList', { userId })}
            >
              <Text style={styles.connectionLabel}>Reviews</Text>
              <Text style={styles.connectionCount}>{toNumber(user?.reviewsCount ?? 0)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      }
      ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>No posts yet.</Text></View>}
    />
  );
};

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  bioContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  bioLabel: { fontSize: 12, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  bioText: { fontSize: 14, color: '#333', minHeight: 20 },
  connectionsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff' },
  connectionPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#f5f5f5' },
  connectionLabel: { fontSize: 12, color: '#666' },
  connectionCount: { fontSize: 14, color: '#333', fontWeight: '700' },
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
  emptyContainer: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#666' },
  followButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 'auto' },
  following: { backgroundColor: '#DDD' },
  notFollowing: { backgroundColor: '#FF4444' },
  followButtonText: { fontWeight: '600' },
  followingText: { color: '#333' },
  notFollowingText: { color: '#FFF' },
});

export default UserProfileScreen;