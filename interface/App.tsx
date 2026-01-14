import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import FeedScreen from './src/screens/FeedScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import ForgotPasswordScreen from './src/screens/ForgotPassword';
import SearchPostsScreen from './src/screens/SearchPostsScreen';
import SearchUsersScreen from './src/screens/SearchUsersScreen';
import AddPostsScreen from './src/screens/AddPostsScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import EditUserProfileScreen from './src/screens/EditUserProfile';
import FollowsListScreen from './src/screens/FollowsListScreen';
import LikesListScreen from './src/screens/LikesListScreen';
import ReviewListScreen from './src/screens/ReviewListScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

// Ensure RootStackParamList includes correct params for screens that use route.params
export type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  Feed: undefined;
  PostDetail: { postId: string };
  ForgotPassword: undefined;
  SearchPosts: undefined;
  SearchUsers: undefined;
  AddPost: undefined;
  UserProfile: { userId: string };
  EditUserProfile?: undefined;
  FollowsList: { userId: string; type: 'followers' | 'following' };
  LikesList: { userId: string };
  ReviewList: { userId: string };
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['degustator://', 'https://degustator.app'],
  config: {
    screens: {
      PostDetail: 'post/:postId',
      UserProfile: 'user/:userId',
      Feed: 'feed',
      Login: 'login',
    },
  },
};

function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer linking={linking}>
          <StatusBar barStyle="dark-content" />
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ 
              headerShown: false,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Feed" component={FeedScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="SearchPosts" component={SearchPostsScreen} />
            <Stack.Screen name="SearchUsers" component={SearchUsersScreen} />
            <Stack.Screen name="AddPost" component={AddPostsScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown: true, title: 'Profile' }} />
            <Stack.Screen name="EditUserProfile" component={EditUserProfileScreen} options={{ headerShown: true, title: 'Edit Profile' }} />
            <Stack.Screen name="FollowsList" component={FollowsListScreen} options={{ headerShown: true, title: 'Connections' }} />
            <Stack.Screen name="LikesList" component={LikesListScreen} />
            <Stack.Screen name="ReviewList" component={ReviewListScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;