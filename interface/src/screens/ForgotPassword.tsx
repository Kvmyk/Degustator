import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ForgotPassword'
>;

type Props = {
  navigation: ForgotPasswordScreenNavigationProp;
};

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }
    // Here you would typically call your password reset service
    alert('Password reset instructions have been sent to your email');
    navigation.navigate('Login');
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
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email to receive reset instructions
          </Text>

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

            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={styles.resetButton}
              contentStyle={styles.resetButtonContent}
              buttonColor="#4a4a4a"
            >
              Send Reset Instructions
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              textColor="#666"
            >
              Back to Login
            </Button>
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
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  resetButton: {
    borderRadius: 8,
    marginTop: 16,
  },
  resetButtonContent: {
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 16,
  },
});

export default ForgotPasswordScreen;