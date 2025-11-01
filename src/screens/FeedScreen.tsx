import React from 'react';
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

type FeedScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Feed'
>;

type Props = {
  navigation: FeedScreenNavigationProp;
};

const FeedScreen = ({ navigation }: Props) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const categories = ['All', 'Coffee', 'Tea', 'Wine', 'Beer', 'Juice'];

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar.Icon size={40} icon="account-circle" color="#666" />
          <Text style={styles.userName}>John Pork</Text>
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
              <Text style={styles.postTitle}>Gonster</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.stars}>★★★★☆</Text>
              </View>
              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Text style={styles.heartIcon}>♡</Text>
                  <Text style={styles.statText}>21</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.commentIcon}>💬</Text>
                  <Text style={styles.statText}>37</Text>
                </View>
                <View style={styles.bookmarkContainer}>
                  <Text style={styles.bookmarkNumber}>2</Text>
                  <Text style={styles.bookmarkIcon}>🔖</Text>
                </View>
              </View>
              <Text style={styles.actionButton}>Let's go ›</Text>
            </View>
          </Card>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e8f4f8',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#fff',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#fff',
  },
  selectedChip: {
    backgroundColor: '#000',
  },
  categoryChipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedChipText: {
    color: '#fff',
  },
  chipText: {
    fontSize: 12,
    color: '#333',
  },
  feedContainer: {
    flex: 1,
  },
  postCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#d4f1a8',
  },
  postContent: {
    padding: 16,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 12,
  },
  stars: {
    fontSize: 18,
    color: '#000',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 16,
  },
  heartIcon: {
    fontSize: 20,
    color: '#e74c3c',
  },
  commentIcon: {
    fontSize: 18,
  },
  statText: {
    fontSize: 14,
    color: '#333',
  },
  bookmarkContainer: {
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
  actionButton: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default FeedScreen;