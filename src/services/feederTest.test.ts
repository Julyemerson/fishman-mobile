import { http, HttpResponse } from 'msw';

import { FeederTestState, runFeederTest } from './feederTest';

import { API, server } from '@/test/server';

const fast = { pollMs: 5, durationSeconds: 0, ackGraceMs: 200 };

function collect() {
  const updates: FeederTestState[] = [];
  return { updates, onUpdate: (s: FeederTestState) => updates.push(s) };
}

it('envia, acompanha e termina confirmado quando o equipamento dá o ACK', async () => {
  let body: unknown;
  let polls = 0;
  server.use(
    http.post(`${API}/feeders/f1/test`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ logId: 'log-1', durationSeconds: 3, doseKg: 0.3 });
    }),
    http.get(`${API}/feeders/f1/test/log-1`, () => {
      polls++;
      return HttpResponse.json({ id: 'log-1', status: polls < 3 ? 'SUCCESS' : 'CONFIRMED' });
    })
  );
  const { updates, onUpdate } = collect();

  const result = await runFeederTest('f1', { onUpdate, pollMs: 5 });

  expect(body).toEqual({ durationSeconds: 3 });
  expect(updates.map((u) => u.phase)).toEqual(['sending', 'waiting-ack', 'confirmed']);
  expect(result).toMatchObject({ phase: 'confirmed', logId: 'log-1' });
  expect(result.elapsedMs).toEqual(expect.any(Number));
});

it('mostra a mensagem do servidor quando recusa (ex.: equipamento offline)', async () => {
  server.use(
    http.post(`${API}/feeders/f1/test`, () =>
      HttpResponse.json(
        { message: 'Alimentador X está offline. Verifique a conexão do equipamento.' },
        { status: 409 }
      )
    )
  );
  const { updates, onUpdate } = collect();

  const result = await runFeederTest('f1', { onUpdate, ...fast });

  expect(result).toEqual({
    phase: 'failed',
    error: 'Alimentador X está offline. Verifique a conexão do equipamento.',
  });
  expect(updates.map((u) => u.phase)).toEqual(['sending', 'failed']);
});

it('junta as mensagens de validação (400)', async () => {
  server.use(
    http.post(`${API}/feeders/f1/test`, () =>
      HttpResponse.json({ message: ['a', 'b'] }, { status: 400 })
    )
  );

  const result = await runFeederTest('f1', { onUpdate: () => {}, ...fast });

  expect(result).toMatchObject({ phase: 'failed', error: 'a b' });
});

it('termina em timeout se o equipamento nunca confirma', async () => {
  server.use(
    http.post(`${API}/feeders/f1/test`, () => HttpResponse.json({ logId: 'log-1' })),
    http.get(`${API}/feeders/f1/test/log-1`, () =>
      HttpResponse.json({ id: 'log-1', status: 'SUCCESS' })
    )
  );

  const result = await runFeederTest('f1', { onUpdate: () => {}, ...fast });

  expect(result).toEqual({ phase: 'timeout', logId: 'log-1' });
});

it('falha se o servidor não conseguiu publicar (FAILED)', async () => {
  server.use(
    http.post(`${API}/feeders/f1/test`, () => HttpResponse.json({ logId: 'log-1' })),
    http.get(`${API}/feeders/f1/test/log-1`, () =>
      HttpResponse.json({ id: 'log-1', status: 'FAILED', message: 'Erro MQTT: down' })
    )
  );

  const result = await runFeederTest('f1', { onUpdate: () => {}, ...fast });

  expect(result).toEqual({ phase: 'failed', logId: 'log-1', error: 'Erro MQTT: down' });
});

it('para de acompanhar e não avisa mais depois de cancelado', async () => {
  let cancelled = false;
  server.use(
    http.post(`${API}/feeders/f1/test`, () => HttpResponse.json({ logId: 'log-1' })),
    http.get(`${API}/feeders/f1/test/log-1`, () => {
      cancelled = true; // saiu da tela durante o teste
      return HttpResponse.json({ id: 'log-1', status: 'CONFIRMED' });
    })
  );
  const { updates, onUpdate } = collect();

  await runFeederTest('f1', { onUpdate, isCancelled: () => cancelled, ...fast });

  expect(updates.map((u) => u.phase)).toEqual(['sending', 'waiting-ack']);
});
