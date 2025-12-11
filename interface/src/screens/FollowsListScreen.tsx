import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar, SegmentedButtons } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

type Props = NativeStackScreenProps<RootStackParamList, 'FollowsList'>;

const FollowsListScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId, type } = route.params;
  const [viewType, setViewType] = useState<'followers' | 'following'>(type);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const endpoint = viewType === 'followers' ? 'followers' : 'following';
      const res = await fetch(`${API_URL}/api/users/${userId}/${endpoint}`, { headers });
      if (!res.ok) throw new Error('Failed to load list');
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setItems(list);
    } catch (e: any) {
      setError(e?.message || 'Failed to load list');
    } finally {
      setLoading(false);
    }
  }, [userId, viewType]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('UserProfile', { userId: item?.id })}>
      <Card.Content>
        <View style={styles.row}>
          {item?.photo_url ? (
            <Avatar.Image size={48} source={{ uri: item.photo_url }} style={{ backgroundColor: '#ccc' }} />
          ) : (
            <Avatar.Text size={48} label={(item?.name || 'GU').substring(0,2).toUpperCase()} style={{ backgroundColor: '#ccc' }} color="#fff" />
          )}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.name}>{item?.name || 'User'}</Text>
            {item?.email ? <Text style={styles.email}>{item.email}</Text> : null}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={viewType}
        onValueChange={(v) => setViewType(v as 'followers' | 'following')}
        buttons={[
          { value: 'followers', label: 'Followers' },
          { value: 'following', label: 'Following' },
        ]}
        style={{ marginHorizontal: 16, marginTop: 12 }}
      />
      {error ? (
        <View style={styles.center}><Text style={{ color: '#d32f2f' }}>{error}</Text></View>
      ) : loading ? (
        <View style={styles.center}><ActivityIndicator size="large" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item?.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          ListEmptyComponent={<View style={styles.center}><Text style={{ color: '#666' }}>No users</Text></View>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  email: { fontSize: 12, color: '#666', marginTop: 2 },
});

export default FollowsListScreen;
