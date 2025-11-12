import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Text, Divider, Avatar } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';

type PostDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PostDetail'
>;

type PostDetailScreenRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;

type Props = {
  navigation: PostDetailScreenNavigationProp;
  route: PostDetailScreenRouteProp;
};

const PostDetailScreen = ({ navigation, route }: Props) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(21);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <Image
          source={require('../assets/gonster.png')}
          style={styles.headerImage}
          resizeMode="cover"
        />

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Gonster</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleLike}>
                <Text style={[styles.icon, liked && styles.likedIcon]}>
                  {liked ? '♥' : '♡'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.icon}>💬</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.heartIcon}>{liked ? '♥' : '♡'}</Text>
              <Text style={styles.statNumber}>{likeCount}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.commentIcon}>💬</Text>
              <Text style={styles.statNumber}>37</Text>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <Text style={styles.stars}>★★★★☆</Text>
          </View>

          <View style={styles.tagsContainer}>
            <Text style={styles.tag}>#beer</Text>
            <Text style={styles.tag}>#energy</Text>
            <Text style={styles.tag}>#relax</Text>
            <Text style={styles.tag}>#morningdrink</Text>
            <View style={styles.bookmarkBadge}>
              <Text style={styles.bookmarkNumber}>2</Text>
              <Text style={styles.bookmarkIcon}>🔖</Text>
            </View>
          </View>

          <Text style={styles.description}>
            Very delicious drink i made today. The taste of monster nitro and
            cold guiness combined taste really awesome! Can get enogh of it -
            perfect mix of both energy and relaxation in the morning!
          </Text>

          <Text style={styles.ingredientsTitle}>Ingredients:</Text>
          <Text style={styles.ingredients}>
            Half a can of a cold monster nitro poured into the same glass slowly
            with half a pint of stone cold guiness. Voila!
          </Text>

          <Divider style={styles.divider} />

          <Text style={styles.commentsTitle}>Comments</Text>

          <View style={styles.commentItem}>
            <Avatar.Icon
              size={40}
              icon="account"
              style={styles.avatar}
              color="#999"
            />
            <View style={styles.commentContent}>
              <Text style={styles.commentAuthor}>John Mcafee</Text>
              <Text style={styles.commentText}>Splendid.</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.heartIcon}>♡</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentItem}>
            <Avatar.Icon
              size={40}
              icon="account"
              style={styles.avatar}
              color="#999"
            />
            <View style={styles.commentContent}>
              <Text style={styles.commentAuthor}>Terry Davis</Text>
              <Text style={styles.commentText}>Divine intellect!</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.heartIcon}>♡</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#d4f1a8',
  },
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  icon: {
    fontSize: 24,
    color: '#666',
  },
  likedIcon: {
    color: '#e74c3c',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heartIcon: {
    fontSize: 20,
    color: '#e74c3c',
  },
  commentIcon: {
    fontSize: 18,
  },
  statNumber: {
    fontSize: 14,
    color: '#333',
  },
  ratingContainer: {
    marginBottom: 12,
  },
  stars: {
    fontSize: 18,
    color: '#000',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  tag: {
    color: '#666',
    fontSize: 14,
  },
  bookmarkBadge: {
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
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 16,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  ingredients: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 24,
  },
  divider: {
    marginVertical: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  avatar: {
    backgroundColor: '#f0f0f0',
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 12,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#666',
  },
});

export default PostDetailScreen;