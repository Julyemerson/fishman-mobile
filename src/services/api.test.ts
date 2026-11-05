import { http, HttpResponse } from 'msw';

import api from './api';

import { useAuthStore } from '@/store/auth.store';
import { API, server } from '@/test/server';

beforeEach(() => {
  useAuthStore.getState().logout();
});

describe('token de acesso', () => {
  it('envia o token no cabeçalho Authorization', async () => {
    server.use(
      http.get(`${API}/eco`, ({ request }) =>
        HttpResponse.json({ authorization: request.headers.get('authorization') })
      )
    );
    useAuthStore.getState().login('abc123', 1);

    const { data } = await api.get('/eco');

    expect(data).toEqual({ authorization: 'Bearer abc123' });
  });

  it('não envia o cabeçalho sem sessão', async () => {
    server.use(
      http.get(`${API}/eco`, ({ request }) =>
        HttpResponse.json({ authorization: request.headers.get('authorization') })
      )
    );

    const { data } = await api.get('/eco');

    expect(data).toEqual({ authorization: null });
  });
});

describe('sessão vencida', () => {
  beforeEach(() => {
    useAuthStore.getState().login('vencido', 1);
  });

  it.each([401, 403])('encerra a sessão quando a API responde %i', async (status) => {
    server.use(http.get(`${API}/ponds/farm/1`, () => new HttpResponse(null, { status })));

    await expect(api.get('/ponds/farm/1')).rejects.toMatchObject({ response: { status } });

    expect(useAuthStore.getState()).toMatchObject({ token: null, isAuthenticated: false });
  });

  it('não encerra a sessão em outros erros', async () => {
    server.use(http.get(`${API}/ponds/farm/1`, () => new HttpResponse(null, { status: 500 })));

    await expect(api.get('/ponds/farm/1')).rejects.toMatchObject({ response: { status: 500 } });

    expect(useAuthStore.getState().token).toBe('vencido');
  });

  it('não encerra a sessão em erro de rede', async () => {
    server.use(http.get(`${API}/ponds/farm/1`, () => HttpResponse.error()));

    await expect(api.get('/ponds/farm/1')).rejects.toThrow();

    expect(useAuthStore.getState().token).toBe('vencido');
  });

  it('ignora 401 das rotas de login (senha errada não é sessão vencida)', async () => {
    server.use(http.post(`${API}/auth/login`, () => new HttpResponse(null, { status: 401 })));

    await expect(api.post('/auth/login', {})).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(useAuthStore.getState().token).toBe('vencido');
  });
});

describe('configuração', () => {
  it('recusa iniciar sem a URL da API', () => {
    const original = process.env.EXPO_PUBLIC_API_BASE_URL;
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    try {
      jest.isolateModules(() => {
        expect(() => require('./api')).toThrow('API_BASE_URL is not defined');
      });
    } finally {
      process.env.EXPO_PUBLIC_API_BASE_URL = original;
    }
  });
});
