import { Redirect, Slot } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function ProtectedLayout() {
  const session = false;
  return !session ? <Redirect href="/" /> : <Slot />;
}

const styles = StyleSheet.create({});
