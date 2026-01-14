import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text, Searchbar, Card, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useSearch } from '../hooks/useSearch';

type SearchPostsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SearchPosts'
>;

type Props = {
  navigation: SearchPostsScreenNavigationProp;
};

const SearchPostsScreen = ({ navigation }: Props) => {
  const [query, setQuery] = useState('');
  const { results, loading, error, search, clear } = useSearch();

  const handleTextChange = (text: string) => {
    setQuery(text);
    search(text, 'posts');
  };

  const handleClear = () => {
    setQuery('');
    clear();
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const renderPost = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handlePostPress(item.id)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.postHeader}>
            <Avatar.Text
              size={40}
              label={item.author?.name ? item.author.name.substring(0, 2).toUpperCase() : 'U'}
            />
            <View style={styles.postMeta}>
              <Text style={styles.authorName}>{item.author?.name || 'Unknown'}</Text>
              <Text style={styles.timestamp}>
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.content} numberOfLines={2}>
            {item.content}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍹 Search Beverages</Text>
      </View>

      <Searchbar
        placeholder="Search beverages..."
        value={query}
        onChangeText={handleTextChange}
        onClearIconPress={handleClear}
        style={styles.searchbar}
        icon={() => <Text style={{ fontSize: 20 }}>🔍</Text>}
        clearIcon={query ? () => <Text style={{ fontSize: 18, color: '#666' }}>×</Text> : undefined}
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
          <Text style={styles.emptyText}>No beverages found for "{query}"</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
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
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postMeta: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontWeight: '600',
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  content: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default SearchPostsScreen;