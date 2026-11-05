import { http, HttpResponse } from 'msw';

import { useFeederStore } from './feeder.store';

import { API, server } from '@/test/server';
import type { IFeeder, IFeedingLog } from '@/types/feeder';

const initialState = useFeederStore.getState();
const load = (...args: Parameters<typeof initialState.loadFarm>) =>
  useFeederStore.getState().loadFarm(...args);

function makeFeeder(id: string, pondId: number): IFeeder {
  return {
    id,
    name: `Alimentador ${id}`,
    isActive: true,
    description: null,
    isOnline: true,
    lastSeenAt: null,
    url: null,
    port: null,
    pondId,
    engineModelId: null,
    startFeedTime: null,
    stopFeedTime: null,
    feedInterval: null,
    initialDistributedWeight: null,
    kilogramsPerSecond: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function makeLog(feederId: string): IFeedingLog {
  return {
    id: `log-${feederId}`,
    feederId,
    doseKg: 2,
    durationSeconds: 40,
    message: null,
    status: 'SUCCESS',
    triggeredAt: '2026-11-04T12:00:00.000Z',
    executedAt: null,
  };
}

const ponds = [
  { id: 1, name: 'Viveiro 1', farmId: 7 },
  { id: 2, name: 'Viveiro 2', farmId: 7 },
];
const feedersByPond: Record<string, IFeeder[]> = {
  '1': [makeFeeder('a', 1), makeFeeder('b', 1)],
  '2': [makeFeeder('c', 2)],
};

/** Fazenda 7 com 2 viveiros e 3 alimentadores; cada um com uma dose hoje. */
const farmHandlers = [
  http.get(`${API}/ponds/farm/7`, () => HttpResponse.json(ponds)),
  http.get(`${API}/feeders/pond/:pondId`, ({ params }) =>
    HttpResponse.json(feedersByPond[params.pondId as string] ?? [])
  ),
  http.get(`${API}/feeders/logs/:feederId`, ({ params }) =>
    HttpResponse.json([makeLog(params.feederId as string)])
  ),
];

beforeEach(() => {
  useFeederStore.setState(initialState, true);
  server.use(...farmHandlers);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('loadFarm', () => {
  it('sem fazenda, mostra o erro sem chamar a API', async () => {
    const requests = jest.fn();
    server.events.on('request:start', requests);

    await load(null);

    expect(requests).not.toHaveBeenCalled();
    expect(useFeederStore.getState()).toMatchObject({ error: 'no-farm', isLoading: false });
    server.events.removeAllListeners();
  });

  it('carrega viveiros, alimentadores e doses de hoje', async () => {
    await load(7);

    const state = useFeederStore.getState();
    expect(state.ponds).toEqual([
      { pond: ponds[0], feeders: feedersByPond['1'] },
      { pond: ponds[1], feeders: feedersByPond['2'] },
    ]);
    expect(state.feeders.map((f) => f.id)).toEqual(['a', 'b', 'c']);
    expect(state.logsByFeeder).toEqual({
      a: [makeLog('a')],
      b: [makeLog('b')],
      c: [makeLog('c')],
    });
    expect(state.error).toBeNull();
    expect(state.lastUpdated).toEqual(expect.any(Number));
  });

  it('mostra o esqueleto só na primeira carga', async () => {
    const first = load(7);
    expect(useFeederStore.getState().isLoading).toBe(true);
    await first;
    expect(useFeederStore.getState().isLoading).toBe(false);

    const second = load(7);
    expect(useFeederStore.getState().isLoading).toBe(false);
    await second;
  });

  it('marca atualizando durante o puxar para atualizar', async () => {
    const pending = load(7, { pull: true });
    expect(useFeederStore.getState().isRefreshing).toBe(true);

    await pending;
    expect(useFeederStore.getState().isRefreshing).toBe(false);
  });

  it('falha nas doses de um alimentador não derruba a tela', async () => {
    server.use(http.get(`${API}/feeders/logs/b`, () => new HttpResponse(null, { status: 500 })));

    await load(7);

    const state = useFeederStore.getState();
    expect(state.error).toBeNull();
    expect(state.feeders).toHaveLength(3);
    expect(Object.keys(state.logsByFeeder).sort()).toEqual(['a', 'c']);
  });

  it('trata respostas que não são lista como vazias', async () => {
    server.use(
      http.get(`${API}/feeders/pond/2`, () => HttpResponse.json({})),
      http.get(`${API}/feeders/logs/a`, () => HttpResponse.json(null))
    );

    await load(7);

    const state = useFeederStore.getState();
    expect(state.ponds[1].feeders).toEqual([]);
    expect(state.logsByFeeder.a).toEqual([]);
  });

  it('sem internet, mostra o erro de conexão', async () => {
    server.use(http.get(`${API}/ponds/farm/7`, () => HttpResponse.error()));

    await load(7);

    expect(useFeederStore.getState()).toMatchObject({ error: 'offline', isLoading: false });
  });

  it('erro da API, mostra o erro de servidor', async () => {
    server.use(http.get(`${API}/ponds/farm/7`, () => new HttpResponse(null, { status: 500 })));

    await load(7);

    expect(useFeederStore.getState()).toMatchObject({ error: 'server', isLoading: false });
  });

  it('atualização automática que falha mantém os dados na tela, sem erro', async () => {
    await load(7);
    const before = useFeederStore.getState();
    server.use(http.get(`${API}/ponds/farm/7`, () => HttpResponse.error()));

    await load(7, { silent: true });

    const after = useFeederStore.getState();
    expect(after.error).toBeNull();
    expect(after.ponds).toBe(before.ponds);
    expect(after.lastUpdated).toBe(before.lastUpdated);
  });

  it('atualização automática que falha sem dados na tela mostra o erro', async () => {
    server.use(http.get(`${API}/ponds/farm/7`, () => HttpResponse.error()));

    await load(7, { silent: true });

    expect(useFeederStore.getState().error).toBe('offline');
  });

  it('nova tentativa manual limpa o erro anterior', async () => {
    useFeederStore.setState({ error: 'offline' });

    const pending = load(7);
    expect(useFeederStore.getState().error).toBeNull();
    await pending;
  });

  it('chamadas simultâneas fazem uma carga só', async () => {
    const pondRequests = jest.fn();
    server.use(
      http.get(`${API}/ponds/farm/7`, () => {
        pondRequests();
        return HttpResponse.json(ponds);
      })
    );

    await Promise.all([load(7), load(7, { silent: true }), load(7, { pull: true })]);

    expect(pondRequests).toHaveBeenCalledTimes(1);

    // Terminada a carga, a próxima volta a buscar.
    await load(7);
    expect(pondRequests).toHaveBeenCalledTimes(2);
  });
});

describe('patchFeeder', () => {
  it('atualiza o alimentador na lista e no viveiro', async () => {
    await load(7);

    useFeederStore.getState().patchFeeder('b', { isActive: false, feedInterval: 30 });

    const state = useFeederStore.getState();
    expect(state.feeders.find((f) => f.id === 'b')).toMatchObject({
      isActive: false,
      feedInterval: 30,
    });
    expect(state.ponds[0].feeders[1]).toMatchObject({ isActive: false, feedInterval: 30 });
    expect(state.feeders.find((f) => f.id === 'a')).toEqual(feedersByPond['1'][0]);
  });
});
