import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { API_URL } from '@env';

 type NotificationsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Notifications'
>;

 type NotificationsScreenRouteProp = RouteProp<RootStackParamList, 'Notifications'>;

 type Props = {
  navigation: NotificationsScreenNavigationProp & { goBack: () => void };
  route: NotificationsScreenRouteProp;
 };

 type NotificationItem = {
  id: string;
  type: string;
  message: string;
  created_at?: any;
  post?: {
    id: string;
    title?: string;
    author?: {
      id: string;
      name?: string;
    } | null;
  } | null;
 };

 const formatDate = (dt: any): string => {
  if (!dt) return '';

  if (typeof dt === 'string') {
    const d = new Date(dt);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString();
    }
    return dt;
  }

  const getVal = (v: any) => (v && typeof v === 'object' && 'low' in v ? v.low : v);

  if (
    typeof dt === 'object' &&
    (dt.year !== undefined || dt.month !== undefined || dt.day !== undefined)
  ) {
    const year = getVal(dt.year) ?? 1970;
    const month = getVal(dt.month) ?? 1;
    const day = getVal(dt.day) ?? 1;
    const hour = getVal(dt.hour) ?? 0;
    const minute = getVal(dt.minute) ?? 0;
    const second = getVal(dt.second) ?? 0;

    const d = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    return d.toLocaleString();
  }

  try {
    const d = new Date(dt);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString();
    }
  } catch {}

  return '';
 };

 const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        setNotifications([]);
        return;
      }
      const user = JSON.parse(userData);
      if (!user?.id) {
        setNotifications([]);
        return;
      }

      const res = await fetch(`${API_URL}/api/notifications/user/${encodeURIComponent(user.id)}`);
      if (!res.ok) {
        console.error('Failed to load notifications', res.status);
        return;
      }
      const data = await res.json();
      const list: NotificationItem[] = Array.isArray(data) ? data : [];
      setNotifications(list);
    } catch (e) {
      console.error('Notifications load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (item: NotificationItem) => {
    try {
      await fetch(`${API_URL}/api/notifications/${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete notification:', e);
    }

    setNotifications(prev => prev.filter(n => n.id !== item.id));

    if (item.post?.id) {
      navigation.navigate('PostDetail', { postId: item.post.id });
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <Card style={styles.card} onPress={() => handleNotificationPress(item)}>
      <Card.Content>
        <Text style={styles.message}>{item.message}</Text>
        {item.post?.title ? (
          <Text style={styles.postTitle}>Post: {item.post.title}</Text>
        ) : null}
        {item.post?.author?.name ? (
          <Text style={styles.author}>by {item.post.author.name}</Text>
        ) : null}
        {item.created_at ? (
          <Text style={styles.timestamp}>{formatDate(item.created_at)}</Text>
        ) : null}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#666" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            notifications.length === 0 ? styles.emptyContent : undefined
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
 };

 const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  topBar: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backArrow: { fontSize: 22, color: '#333', paddingRight: 12 },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  card: { margin: 12, backgroundColor: '#fff', borderRadius: 10 },
  message: { fontSize: 14, color: '#333', marginBottom: 4 },
  postTitle: { fontSize: 13, color: '#555', marginBottom: 2 },
  author: { fontSize: 12, color: '#777', marginBottom: 4 },
  timestamp: { fontSize: 11, color: '#999' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { paddingTop: 40, alignItems: 'center' },
  emptyText: { color: '#888' },
  emptyContent: { flexGrow: 1, justifyContent: 'center' },
 });

 export default NotificationsScreen;
