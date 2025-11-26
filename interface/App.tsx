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

export type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  Feed: undefined;
  PostDetail: { postId: string };
  ForgotPassword: undefined;
  SearchPosts: undefined;
  SearchUsers: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ 
              headerShown: false,
              animationEnabled: true,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Feed" component={FeedScreen} />
            <Stack.Screen 
              name="PostDetail" 
              component={PostDetailScreen}
              options={{ animationEnabled: true }}
            />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen 
              name="SearchPosts" 
              component={SearchPostsScreen}
              options={{ animationEnabled: true }}
            />
            <Stack.Screen 
              name="SearchUsers" 
              component={SearchUsersScreen}
              options={{ animationEnabled: true }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;