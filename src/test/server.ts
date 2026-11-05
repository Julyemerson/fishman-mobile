import { setupServer } from 'msw/node';

/** Mesma URL definida em jest.setup.js; os handlers usam `${API}/rota`. */
export const API = 'http://api.test';

/** Servidor MSW compartilhado. Cada teste registra suas respostas com `server.use(...)`. */
export const server = setupServer();
