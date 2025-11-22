import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Text, Searchbar, Chip, Card, Avatar } from 'react-native-paper';
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

  // Testowy użytkownik 
  const targetUserId = '43adea08-cfbf-4366-a2e0-c294a1a7902f'; 
  const targetUserName = 'Kamil';

  const categories = ['All', 'Coffee', 'Tea', 'Wine', 'Beer', 'Juice'];

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

  const toggleFollow = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Błąd', 'Brak tokenu autoryzacyjnego. Zaloguj się ponownie.');
      return;
    }

    const method = following ? 'DELETE' : 'POST';
    const res = await fetch(`${API_URL}/api/follow/${targetUserId}`, 
      {
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

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar.Icon size={40} icon="account-circle" color="#666" />
          <Text style={styles.userName}>{userName || 'Guest'}</Text>
          <Chip style={styles.categoryChip} textStyle={styles.chipText}>
            Cocktail
          </Chip>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search beverages..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#666"
        />
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

      <ScrollView style={styles.feedContainer}>
        {/* Testowy post użytkownika Adam */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handlePostPress('1')}
        >
          <Card style={styles.postCard}>
            <Image
              source={require('../assets/gonster.png')}
              style={styles.postImage}
              resizeMode="cover"
            />
            <View style={styles.postContent}>
              <Text style={styles.postTitle}>Post by {targetUserName}</Text>
              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Text style={styles.heartIcon}>♡</Text>
                  <Text style={styles.statText}>21</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.commentIcon}>💬</Text>
                  <Text style={styles.statText}>37</Text>
                </View>
              </View>

              {/* Przycisk obserwacji */}
              <TouchableOpacity
                onPress={toggleFollow}
                style={styles.followButton}
              >
                <Text style={styles.followButtonText}>
                  {following ? 'Obserwujesz' : 'Obserwuj'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </TouchableOpacity>
      </ScrollView>
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
  categoriesContainer: { backgroundColor: '#fff' },
  categoriesContent: { paddingHorizontal: 16, paddingVertical: 0 },
  categoryChip: { marginRight: 8, backgroundColor: '#fff', height: 30, width: 70, justifyContent: 'auto' },
  selectedChip: { backgroundColor: '#000' },
  categoryChipText: { color: '#666', fontSize: 10 },
  selectedChipText: { color: '#fff' },
  chipText: { fontSize: 10, color: '#333' },
  feedContainer: { flex: 1 },
  postCard: { margin: 16, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  postImage: { width: '100%', height: 400, backgroundColor: '#d4f1a8', justifyContent: 'center' },
  postContent: { padding: 8 },
  postTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 8 },
  statsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 16 },
  heartIcon: { fontSize: 30, color: '#e74c3c' },
  commentIcon: { fontSize: 25 },
  statText: { fontSize: 14, color: '#333' },
  followButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignSelf: 'flex-start',
  },
  followButtonText: { color: '#fff', fontWeight: '500', fontSize: 14 },
});

export default FeedScreen;
