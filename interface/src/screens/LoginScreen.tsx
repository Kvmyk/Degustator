import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Text, Checkbox } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  // Remove unused state
  // const [resetPassword, setResetPassword] = useState('');

  const handleSignIn = async () => {
  if (!email || !password) {
    Alert.alert('Błąd', 'Wpisz adres e-mail i hasło');
    return;
  }

  try {
    const res = await fetch('http://192.168.1.101:3001/api/auth/login', // ⚠️ Podmień na IP swojego komputera
    {
          method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      Alert.alert('Logowanie nieudane', data.message || 'Spróbuj ponownie');
      return;
    }

    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));

    navigation.replace('Feed'); // lepsze niż navigate (usuwa ekran logowania z historii)
  } catch (error) {
    console.error('Login error:', error);
    Alert.alert('Błąd', 'Nie udało się połączyć z serwerem');
  }
};

  const handleSignUp = () => {
    navigation.navigate('Register'); // Fix navigation to Register screen
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword'); // Fix navigation to ForgotPassword screen
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.photo}
                resizeMode="contain"
                width={150}
                height={150}
              
              />
            </View>
          </View>

          <Text style={styles.title}>Degustator</Text>
          <Text style={styles.subtitle}>Discover & Share Beverages</Text>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              mode="outlined"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              outlineColor="#e0e0e0"
              activeOutlineColor="#666"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              mode="outlined"
              placeholder="••••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              outlineColor="#e0e0e0"
              activeOutlineColor="#666"
            />

            <View style={styles.checkboxContainer}>
              <Checkbox.Android
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(!rememberMe)}
                color="#666"
              />
                 <Text style={styles.checkboxLabel}>Remember me</Text>
              <Button
                mode="text"
                onPress={handleForgotPassword}
                textColor="#999"
                style={styles.forgotPasswordButton}
              >
                Forgot Password?
              </Button>
            </View>

            <Button
              mode="contained"
              onPress={handleSignIn}
              style={styles.signInButton}
              contentStyle={styles.signInButtonContent}
              buttonColor="#4a4a4a"
            >
              Sign in
            </Button>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account?</Text>
              <Button
                mode="contained"
                onPress={handleSignUp}
                style={styles.signUpButton}
                contentStyle={styles.signUpButtonContent}
                buttonColor="#808080"
                compact
              >
                Sign up
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#6b6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    tintColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '400',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  formContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#999',
  },
  forgotPasswordButton: {
    marginLeft: 'auto',
  },
  signInButton: {
    borderRadius: 8,
    marginBottom: 24,
  },
  signInButtonContent: {
    paddingVertical: 8,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  signUpText: {
    fontSize: 14,
    color: '#333',
  },
  signUpButton: {
    borderRadius: 16,
  },
  signUpButtonContent: {
    paddingHorizontal: 8,
  },
});

export default LoginScreen;