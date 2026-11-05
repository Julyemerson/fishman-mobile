import { http, HttpResponse } from 'msw';

import { loadCurrentUser } from './user';

import { selectIsAdmin, useAuthStore } from '@/store/auth.store';
import { API, server } from '@/test/server';

beforeEach(() => {
  useAuthStore.getState().logout();
});

it('guarda o usuário com o papel e libera as telas de admin', async () => {
  useAuthStore.getState().login('tok', 7);
  server.use(
    http.get(`${API}/auth/me`, () =>
      HttpResponse.json({ id: 1, name: 'Dev', email: 'dev@x.com', role: 'ADMIN' })
    )
  );

  await loadCurrentUser();

  expect(useAuthStore.getState().user).toEqual({
    id: 1,
    name: 'Dev',
    email: 'dev@x.com',
    role: 'ADMIN',
  });
  expect(selectIsAdmin(useAuthStore.getState())).toBe(true);
});

it('usuário comum não vê as telas de admin', async () => {
  useAuthStore.getState().login('tok', 7);
  server.use(
    http.get(`${API}/auth/me`, () =>
      HttpResponse.json({ id: 2, name: 'Maria', email: 'm@x.com', role: 'USER' })
    )
  );

  await loadCurrentUser();

  expect(selectIsAdmin(useAuthStore.getState())).toBe(false);
});

it('se a busca falhar, segue sem papel (sem telas de admin) e sem erro', async () => {
  useAuthStore.getState().login('tok', 7);
  server.use(http.get(`${API}/auth/me`, () => HttpResponse.error()));

  await expect(loadCurrentUser()).resolves.toBeUndefined();

  expect(useAuthStore.getState().user).toBeNull();
  expect(selectIsAdmin(useAuthStore.getState())).toBe(false);
});
