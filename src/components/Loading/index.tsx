import { Stack } from 'expo-router';
import { ActivityIndicatorBase, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
export default function Loading() {
  const { isLoading } = useAuth();

  return isLoading ? (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicatorBase size="large" color="#0000ff" />
      <Text style={{ fontSize: 20, marginTop: 10 }}>Carregando...</Text>
    </View>
  ) : (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

const styles = StyleSheet.create({});
