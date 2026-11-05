import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuthStore } from './auth.store';

const user = { farmId: '7', name: 'Maria', email: 'maria@fazenda.com' };

beforeEach(async () => {
  useAuthStore.getState().logout();
  await AsyncStorage.clear();
});

it('login guarda token e fazenda e autentica', () => {
  useAuthStore.getState().login('abc', 7);

  expect(useAuthStore.getState()).toMatchObject({
    token: 'abc',
    farmId: 7,
    isAuthenticated: true,
  });
});

it('logout apaga tudo', () => {
  const { login, setUser, logout } = useAuthStore.getState();
  login('abc', 7);
  setUser(user);

  logout();

  expect(useAuthStore.getState()).toMatchObject({
    token: null,
    user: null,
    farmId: null,
    isAuthenticated: false,
  });
});

it('setToken autentica só com token', () => {
  useAuthStore.getState().setToken('abc');
  expect(useAuthStore.getState().isAuthenticated).toBe(true);

  useAuthStore.getState().setToken(null);
  expect(useAuthStore.getState().isAuthenticated).toBe(false);
});

describe('persistência', () => {
  it('salva token, usuário e fazenda, mas não o isAuthenticated', async () => {
    const { login, setUser } = useAuthStore.getState();
    login('abc', 7);
    setUser(user);

    // O persist grava de forma assíncrona.
    await new Promise((resolve) => setTimeout(resolve, 0));
    const saved = JSON.parse((await AsyncStorage.getItem('auth-storage')) ?? 'null');

    expect(saved.state).toEqual({ token: 'abc', user, farmId: 7 });
  });

  it.each([
    ['abc', true],
    [null, false],
  ])('ao abrir o app com token %p, isAuthenticated = %p', async (token, expected) => {
    await AsyncStorage.setItem(
      'auth-storage',
      JSON.stringify({ state: { token, user: null, farmId: 7 }, version: 0 })
    );

    await useAuthStore.persist.rehydrate();

    expect(useAuthStore.getState()).toMatchObject({ token, farmId: 7, isAuthenticated: expected });
  });
});
