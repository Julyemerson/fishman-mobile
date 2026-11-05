/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // O app usa o relógio local (próxima ração) e UTC (colunas TIME da API). Fixar o fuso
  // da fazenda faz os testes darem o mesmo resultado na máquina de qualquer um e no CI.
  globalSetup: '<rootDir>/jest.global-setup.js',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup-after-env.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
};
