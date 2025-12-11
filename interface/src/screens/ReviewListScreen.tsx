import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, Pressable, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

type ReviewItem = {
	id: string;
	rating?: number;
	content?: string | null;
	created_at?: any; // Neo4j datetime or ISO string
	post?: { id: string; title?: string } | null;
};

type ReviewListScreenProps = {
	route: { params: { userId: string } };
	navigation: { navigate: (screen: string, params?: any) => void; goBack: () => void };
};

const ReviewListScreen: React.FC<ReviewListScreenProps> = ({ route, navigation }) => {
	const { userId } = route.params;
	const [items, setItems] = useState<ReviewItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		try {
			setError(null);
			setLoading(true);
			const token = await AsyncStorage.getItem('token');
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (token) headers.Authorization = `Bearer ${token}`;
			const res = await fetch(`${API_URL}/api/reviews/user/${userId}`, { headers });
			if (!res.ok) throw new Error('Failed to load reviews');
			const data = await res.json();
			const normalized: ReviewItem[] = (Array.isArray(data) ? data : []).map((r: any) => ({
				id: r.id,
				rating: r.rating ?? 0,
				content: r.content ?? null,
				// Backend may return Neo4j datetime or typo 'created_ad'; normalize
				created_at: r.created_at ?? r.createdAd ?? r.created_ad ?? null,
				post: r.post ? { id: r.post.id, title: r.post.title } : (r.post_id ? { id: r.post_id, title: r.post_title } : null),
			}));
			setItems(normalized);
		} catch (e: any) {
			setError(e?.message || 'Failed to load reviews');
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
			// Neo4j DateTime object: { year, month, day, hour, minute, second }
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

	const renderItem = ({ item }: { item: ReviewItem }) => {
		const postTitle = item.post?.title || 'Post';
		const created = formatDate(item.created_at);
		return (
			<Card style={styles.card}>
				<Pressable onPress={() => item.post?.id && navigation.navigate('PostDetail', { postId: item.post.id })}>
					<View style={styles.row}>
						<Text style={styles.rating}>⭐ {Number(item.rating ?? 0).toFixed(1)}</Text>
						<Text style={styles.title} numberOfLines={1}>{postTitle}</Text>
					</View>
					{item.content ? (
						<Text style={styles.content} numberOfLines={3}>{item.content}</Text>
					) : null}
					{created ? (
						<Text style={styles.meta}>reviewed {created}</Text>
					) : null}
				</Pressable>
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
				<Text style={styles.topBarTitle}>Reviews</Text>
				<View style={{ width: 24 }} />
			</View>
			<FlatList
				data={items}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
				ListEmptyComponent={<View style={styles.center}><Text style={{ color: '#666' }}>No reviews</Text></View>}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	card: { marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', padding: 12 },
	row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
	rating: { fontSize: 14, color: '#8a6d3b' },
	title: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
	content: { fontSize: 14, color: '#555', marginBottom: 6 },
	meta: { fontSize: 11, color: '#999' },
	topBar: { height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
	backArrow: { fontSize: 22, color: '#333', paddingRight: 8 },
	topBarTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#333' },
});

export default ReviewListScreen;
