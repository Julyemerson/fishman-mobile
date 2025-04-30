import { Redirect, Slot, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function ProtectedLayout() {
  const session = true;
  return !session ? <Redirect href="/" /> : <Stack screenOptions={{ headerShown: true }} />;
}

const styles = StyleSheet.create({});
