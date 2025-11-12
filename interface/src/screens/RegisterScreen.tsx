import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

const RegisterScreen = ({ navigation }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
  if (!name || !email || !password || !confirmPassword) {
    Alert.alert('Błąd', 'Wypełnij wszystkie pola');
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert('Błąd', 'Hasła nie są takie same');
    return;
  }

  try {
    const res = await fetch('http://192.168.0.102:3001/api/auth/register', // ⚠️ Podmień na IP swojego komputera
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      Alert.alert('Rejestracja nieudana', data.message || 'Spróbuj ponownie');
      return;
    }

    Alert.alert('Sukces', 'Konto zostało utworzone! Możesz się zalogować.');
    navigation.replace('Login');
  } catch (error) {
    console.error('Register error:', error);
    Alert.alert('Błąd', 'Nie udało się połączyć z serwerem');
  }
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Beverage Community</Text>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              mode="outlined"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              outlineColor="#e0e0e0"
              activeOutlineColor="#666"
            />

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

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              mode="outlined"
              placeholder="••••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
              outlineColor="#e0e0e0"
              activeOutlineColor="#666"
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.registerButton}
              contentStyle={styles.registerButtonContent}
              buttonColor="#4a4a4a"
            >
              Create Account
            </Button>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                textColor="#666"
              >
                Sign in
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... existing styles ...
  registerButton: {
    borderRadius: 8,
    marginTop: 16,
  },
  registerButtonContent: {
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: '#333',
  },
});

export default RegisterScreen;