import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Banner, BigButton, SpeakButton, TextField } from '@/components/ui';
import api from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { colors, spacing } from '@/theme';
import { haptics } from '@/utils/haptics';
import { openWhatsAppSupport } from '@/utils/support';

const logo = require('@/assets/logo_pintinho.webp');
const LAST_EMAIL_KEY = 'dr-pescados:last-email';

const HELP_SPEECH =
  'Para entrar, digite seu email e sua senha e toque em Entrar. ' +
  'Se esqueceu a senha ou precisa de ajuda, toque nos botões de baixo para falar com o suporte pelo WhatsApp.';

/** Mensagem curta e o que fazer, para cada tipo de falha. */
function loginErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) return 'Sem internet. Verifique o sinal do celular e tente de novo.';
    if (error.response.status === 401 || error.response.status === 400) {
      return 'Email ou senha errados. Confira e tente de novo.';
    }
  }
  return 'Algo deu errado. Tente de novo em alguns minutos.';
}

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState({ email: false, password: false });
  const [isLoading, setIsLoading] = useState(false);

  // Quem já entrou uma vez não precisa digitar o email de novo.
  useEffect(() => {
    AsyncStorage.getItem(LAST_EMAIL_KEY)
      .then((saved) => {
        if (saved) setEmail((current) => current || saved);
      })
      .catch(() => {});
  }, []);

  async function handleLogin() {
    const trimmedEmail = email.trim();
    const missing = { email: !trimmedEmail, password: !password };
    setInvalidFields(missing);

    if (missing.email || missing.password) {
      haptics.warning();
      setError(
        missing.email && missing.password
          ? 'Digite seu email e sua senha.'
          : missing.email
            ? 'Digite seu email.'
            : 'Digite sua senha.'
      );
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: trimmedEmail, password });
      AsyncStorage.setItem(LAST_EMAIL_KEY, trimmedEmail).catch(() => {});
      haptics.success();
      login(data.access_token, data.farmId ?? null);
    } catch (err) {
      haptics.error();
      setInvalidFields({ email: false, password: true });
      setError(loginErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.speak}>
            <SpeakButton text={HELP_SPEECH} />
          </View>

          <View style={styles.brand}>
            <Image
              source={logo}
              style={styles.logo}
              accessibilityRole="image"
              accessibilityLabel="Logo DR Pescados"
            />
            <AppText variant="question" align="center" accessibilityRole="header">
              DR Pescados
            </AppText>
            <AppText variant="bodyRegular" color={colors.textSecondary} align="center">
              Entre para ver seus alimentadores
            </AppText>
          </View>

          <View style={styles.form}>
            <TextField
              label="Email"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (invalidFields.email) setInvalidFields({ ...invalidFields, email: false });
              }}
              invalid={invalidFields.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              submitBehavior="submit"
            />
            <TextField
              ref={passwordRef}
              label="Senha"
              password
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (invalidFields.password) setInvalidFields({ ...invalidFields, password: false });
              }}
              invalid={invalidFields.password}
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />

            {error && <Banner variant="error" title={error} />}

            <BigButton
              title="Entrar"
              icon="arrow-right"
              iconPosition="right"
              large
              loading={isLoading}
              onPress={handleLogin}
            />
          </View>

          <View style={styles.help}>
            <BigButton
              title="Esqueci minha senha"
              variant="ghost"
              icon="lock-question"
              onPress={() =>
                openWhatsAppSupport(
                  `Olá, esqueci a senha do aplicativo DR Pescados.${email.trim() ? ` Meu email é ${email.trim()}.` : ''} Podem me ajudar?`
                )
              }
            />
            <BigButton
              title="Pedir ajuda no WhatsApp"
              variant="ghost"
              icon="whatsapp"
              onPress={() => openWhatsAppSupport()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing.xl,
  },
  speak: {
    alignItems: 'flex-end',
  },
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 180,
    height: 168,
    resizeMode: 'contain',
  },
  form: {
    gap: spacing.lg,
  },
  help: {
    marginTop: 'auto',
    gap: spacing.xs,
  },
});
