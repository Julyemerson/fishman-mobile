import { http, HttpResponse } from 'msw';

import { useFarmStore } from './farm.store';

import { API, server } from '@/test/server';
import type { IFarm } from '@/types/farm';

const initialState = useFarmStore.getState();

const farm: IFarm = {
  id: 7,
  name: 'Fazenda Teste',
  ownerName: 'Maria',
  street: null,
  city: 'Aracati',
  number: null,
  state: 'CE',
  neighborhood: null,
  zipCode: null,
  latitude: null,
  longitude: null,
  userId: 1,
};

beforeEach(() => {
  useFarmStore.setState(initialState, true);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

it('busca a fazenda e a devolve', async () => {
  server.use(http.get(`${API}/farms/7`, () => HttpResponse.json(farm)));

  const result = await useFarmStore.getState().fetchFarm(7);

  expect(result).toEqual(farm);
  expect(useFarmStore.getState()).toMatchObject({ farm, isLoading: false, error: null });
});

it('marca carregando enquanto busca', async () => {
  server.use(http.get(`${API}/farms/7`, () => HttpResponse.json(farm)));

  const pending = useFarmStore.getState().fetchFarm(7);
  expect(useFarmStore.getState().isLoading).toBe(true);

  await pending;
  expect(useFarmStore.getState().isLoading).toBe(false);
});

it('em erro de rede, usa a mensagem padrão e mantém a fazenda anterior', async () => {
  server.use(http.get(`${API}/farms/7`, () => HttpResponse.error()));

  const result = await useFarmStore.getState().fetchFarm(7);

  expect(result).toEqual(initialState.farm);
  expect(useFarmStore.getState()).toMatchObject({
    isLoading: false,
    error: 'Falha ao carregar fazendas',
  });
});

it('em erro da API, guarda a resposta do servidor', async () => {
  server.use(
    http.get(`${API}/farms/7`, () => HttpResponse.text('Fazenda não encontrada', { status: 404 }))
  );

  await useFarmStore.getState().fetchFarm(7);

  expect(useFarmStore.getState().error).toBe('Fazenda não encontrada');
});
