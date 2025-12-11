import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Pressable, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

type Author = { id: string; name: string } | null;
type LikedPostItem = {
	id: string;
	title?: string;
	firstPhoto?: string | null;
	author?: Author;
	liked_at?: any; // Neo4j datetime or ISO string
};

type LikesListScreenProps = {
	route: { params: { userId: string } };
	navigation: { navigate: (screen: string, params?: any) => void; goBack: () => void };
};

const LikesListScreen: React.FC<LikesListScreenProps> = ({ route, navigation }) => {
	const { userId } = route.params;
	const [items, setItems] = useState<LikedPostItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		try {
			setError(null);
			setLoading(true);
			const token = await AsyncStorage.getItem('token');
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (token) headers.Authorization = `Bearer ${token}`;
			const res = await fetch(`${API_URL}/api/users/${userId}/liked-posts`, { headers });
			if (!res.ok) throw new Error('Failed to load liked posts');
			const data = await res.json();
			// Support both minimal and full payloads; normalize to minimal card view
			const normalized: LikedPostItem[] = (Array.isArray(data) ? data : []).map((p: any) => ({
				id: p.id,
				title: p.title ?? '',
				firstPhoto: p.firstPhoto ?? p.cover_url ?? null,
				author: p.author ?? (p.author_id && p.author_name ? { id: p.author_id, name: p.author_name } : null),
				// Relation property may be Neo4j DateTime; also guard for possible field variants
				liked_at: p.liked_at ?? p.likedAt ?? p.rel_created_at ?? null,
			}));
			setItems(normalized);
		} catch (e: any) {
			setError(e?.message || 'Failed to load liked posts');
		} finally {
			setLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		load();
	}, [load]);

	// Convert Neo4j datetime object or ISO string to localized string
	const formatDate = (dt: any): string | null => {
		try {
			if (!dt) return null;
			if (typeof dt === 'string') return new Date(dt).toLocaleString();
			if (typeof dt === 'object' && 'year' in dt) {
				const y = dt.year?.low ?? dt.year ?? 0;
				const m = (dt.month?.low ?? dt.month ?? 1) - 1;
				const d = dt.day?.low ?? dt.day ?? 1;
				const hh = dt.hour?.low ?? dt.hour ?? 0;
				const mm = dt.minute?.low ?? dt.minute ?? 0;
				const ss = dt.second?.low ?? dt.second ?? 0;
				return new Date(Date.UTC(y, m, d, hh, mm, ss)).toLocaleString();
			}
			return null;
		} catch { return null; }
	};

	const renderItem = ({ item }: { item: LikedPostItem }) => {
		const firstPhoto = item.firstPhoto;
		return (
			<Card style={styles.card}>
				<Pressable onPress={() => navigation.navigate('PostDetail', { postId: item.id })}>
					{firstPhoto ? (
						<Image source={{ uri: firstPhoto }} style={styles.image} />
					) : (
						<View style={[styles.image, styles.noImage]}>
							<Text style={styles.noImageText}>no image</Text>
						</View>
					)}
				</Pressable>
				<View style={styles.content}>
					<Text style={styles.title}>{item.title || 'Post'}</Text>
					{item.author?.name ? (
						<View style={styles.authorRow}>
							<Avatar.Text
								size={24}
								label={item.author.name.substring(0, 2).toUpperCase()}
								style={{ backgroundColor: '#ccc' }}
								color="#fff"
							/>
							<Text style={styles.author}>by {item.author.name}</Text>
						</View>
					) : null}
					{item.liked_at ? (
						<Text style={styles.meta}>liked {formatDate(item.liked_at)}</Text>
					) : null}
				</View>
			</Card>
		);
	};

	if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
	if (error) return <View style={styles.center}><Text style={{ color: '#d32f2f' }}>{error}</Text></View>;

	return (
			<View style={{ flex: 1 }}>
				<View style={styles.topBar}>
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<Text style={styles.backArrow}>←</Text>
					</TouchableOpacity>
					<Text style={styles.topBarTitle}>Liked Posts</Text>
					<View style={{ width: 24 }} />
				</View>
				<FlatList
					data={items}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
					ListEmptyComponent={<View style={styles.center}><Text style={{ color: '#666' }}>No liked posts</Text></View>}
				/>
			</View>
	);
};

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	card: { marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
	image: { width: '100%', height: 200, backgroundColor: '#eee' },
	noImage: { alignItems: 'center', justifyContent: 'center' },
	noImageText: { color: '#666' },
	content: { padding: 12 },
	title: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 6 },
	authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	author: { fontSize: 12, color: '#666' },
	meta: { fontSize: 11, color: '#999', marginTop: 4 },
	topBar: { height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
	backArrow: { fontSize: 22, color: '#333', paddingRight: 8 },
	topBarTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#333' },
});

export default LikesListScreen;
