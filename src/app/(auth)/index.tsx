import { Stack } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

import { Container } from '@/components/Container';
import Input from '@/components/Input';
import api from '@/services/api';
import { useAuthStore } from '@/store/auth.store';

export default function App() {
  const logo = require('@/assets/logo_pintinho.webp');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuthStore();

  function handleForgotPassword() {
    console.log('Esqueci minha senha');
  }

  async function handleLogin() {
    if (!email || !password) {
      return;
    }

    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, farmId } = response.data;
      login(access_token, farmId);
    } catch (error: any) {
      Alert.alert('Falha no Login: verifique email e senha');
    }
  }

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <Stack.Screen options={{ title: 'Home', headerShown: false }} />
        <Container>
          <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>DR Alimentadores</Text>
                <Image source={logo} style={styles.logo} />
              </View>

              <View style={styles.form}>
                <Input
                  iconName="mail"
                  placeholder="Digite seu email"
                  onChangeText={setEmail}
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  iconName="lock"
                  placeholder="Digite sua senha"
                  isPassword
                  autoCapitalize="none"
                  secureTextEntry
                  onChangeText={setPassword}
                  value={password}
                />
              </View>

              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity activeOpacity={0.7} onPress={handleForgotPassword}>
                  <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleLogin}
                style={styles.loginButton}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Container>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32, // text-4xl
    fontWeight: 'bold',
    color: '#1F2937', // text-gray-800
    marginBottom: 8,
  },
  logo: {
    width: 240, // w-60
    height: 240, // h-60
    resizeMode: 'contain',
  },
  form: {
    width: '100%',
    marginBottom: 16,
  },
  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-start',
    padding: 16,
  },
  forgotPasswordText: {
    color: '#6B7280', // text-gray-500
    fontSize: 14,
  },
  loginButton: {
    height: 48,
    width: '100%',
    backgroundColor: '#2563EB', // bg-blue-600
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
