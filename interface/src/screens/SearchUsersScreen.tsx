import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text, Searchbar, Card, Avatar, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useSearch } from '../hooks/useSearch';

type SearchUsersScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SearchUsers'
>;

type Props = {
  navigation: SearchUsersScreenNavigationProp;
};

const SearchUsersScreen = ({ navigation }: Props) => {
  const [query, setQuery] = useState('');
  const { results, loading, error, search, clear } = useSearch();
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const handleTextChange = (text: string) => {
    setQuery(text);
    search(text, 'users');
  };

  const handleClear = () => {
    setQuery('');
    clear();
  };

  const handleFollow = (userId: string) => {
    setFollowingMap(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const renderUser = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.userContent}>
          <Avatar.Image
            size={50}
            source={{ uri: item.photo_url || 'https://via.placeholder.com/50' }}
          />

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <View style={styles.stats}>
              <Text style={styles.stat}>👥 {item.followerCount}</Text>
              <Text style={styles.stat}>✓ {item.followingCount}</Text>
            </View>
          </View>

          <Button
            mode={followingMap[item.id] ? 'outlined' : 'contained'}
            onPress={() => handleFollow(item.id)}
            compact
          >
            {followingMap[item.id] ? 'Following' : 'Follow'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 Search Users</Text>
      </View>

      <Searchbar
        placeholder="Search users..."
        value={query}
        onChangeText={handleTextChange}
        onClearIconPress={handleClear}
        style={styles.searchbar}
        icon={() => <Text style={{ fontSize: 20 }}>🔍</Text>}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      )}

      {!loading && results.length === 0 && query.length >= 2 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No users found for "{query}"</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
        scrollEnabled={results.length > 0}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchbar: {
    margin: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#ffebee',
    marginHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#d32f2f',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  card: {
    marginVertical: 8,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  stat: {
    fontSize: 11,
    color: '#666',
  },
});

export default SearchUsersScreen;