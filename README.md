# DR Pescados — Fishman Mobile

Aplicativo móvel para gestão de **alimentadores automáticos de ração** em pisciculturas. O produtor faz login, vê os viveiros da sua fazenda, os alimentadores de cada viveiro e pode ligar/desligar um alimentador e ajustar a quantidade de ração distribuída ao longo do dia.

Feito com **Expo + React Native + TypeScript**, roda em Android, iOS e (experimentalmente) web.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Configuração](#configuração)
- [Executando o projeto](#executando-o-projeto)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Arquitetura](#arquitetura)
- [Integração com a API](#integração-com-a-api)
- [Build e publicação (EAS)](#build-e-publicação-eas)
- [Padrões de código](#padrões-de-código)
- [Solução de problemas](#solução-de-problemas)

---

## Funcionalidades

| Tela | Rota | Descrição |
| --- | --- | --- |
| Login | `/(auth)` | Autenticação por email e senha. O token JWT e a fazenda do usuário ficam salvos no aparelho, mantendo a sessão entre aberturas do app. |
| Viveiros | `/(authenticated)/ponds` | Lista os viveiros da fazenda. Botão de **suporte via WhatsApp** e botão de logout no cabeçalho. |
| Alimentadores | `/(authenticated)/feeders` | Lista os alimentadores do viveiro selecionado, com status (ativo/inativo), conexão (online/offline), quantidade de ração e horários. |
| Detalhe do alimentador | `/(authenticated)/feederDetail` | Liga/desliga o alimentador (com confirmação ao desativar); edita a ração diária (kg), os horários inicial e final e o intervalo entre doses, mostrando quantas doses serão feitas; mostra a conexão do equipamento, um aviso se ele não estiver calibrado e as alimentações de hoje com o status de cada dose. |

## Stack

| Categoria | Tecnologia |
| --- | --- |
| Framework | [Expo SDK 54](https://docs.expo.dev/) · React Native 0.81 · React 19 |
| Linguagem | TypeScript 5.9 (modo `strict`) |
| Navegação | [expo-router 6](https://docs.expo.dev/router/introduction/) (rotas baseadas em arquivos, stack) |
| Estado | [Zustand](https://github.com/pmndrs/zustand) + `persist` com AsyncStorage |
| HTTP | [Axios](https://axios-http.com/) com interceptor de autenticação |
| Estilo | `StyleSheet` nativo do React Native |
| Ícones | `@expo/vector-icons` |
| Build | [EAS Build](https://docs.expo.dev/build/introduction/) |
| Qualidade | ESLint (`eslint-config-universe`) + Prettier |
| Gerenciador de pacotes | pnpm 10 |

## Pré-requisitos

- **Node.js** 20 LTS ou superior
- **pnpm** 10 — `corepack enable` habilita a versão definida em `package.json`
- Para rodar em dispositivo/emulador (os scripts usam *development build*, não Expo Go):
  - **Android:** Android Studio com SDK e um emulador, ou um aparelho com depuração USB
  - **iOS (somente macOS):** Xcode e CocoaPods
- **API do Fishman** rodando e acessível a partir do aparelho

## Configuração

1. Clone e instale as dependências:

   ```bash
   git clone git@github.com:Julyemerson/fishman-mobile.git
   cd fishman-mobile
   pnpm install
   ```

   > O `.npmrc` define `node-linker=hoisted`, necessário para o Metro/React Native resolverem os módulos com pnpm. Não remova.

2. Crie o arquivo de ambiente a partir do exemplo:

   ```bash
   cp .env.example .env
   ```

3. Preencha as variáveis:

   | Variável | Obrigatória | Descrição |
   | --- | --- | --- |
   | `EXPO_PUBLIC_API_BASE_URL` | Sim | URL base da API (ex.: `http://192.168.0.10:3000`). Sem ela o app lança erro ao iniciar. |
   | `EXPO_PUBLIC_SUPPORT_PHONE_NUMBER` | Não | WhatsApp do suporte, só dígitos com DDI e DDD (ex.: `5511999999999`). |

   > Variáveis com prefixo `EXPO_PUBLIC_` são embutidas no bundle do app e **ficam visíveis para qualquer pessoa** que inspecione o APK/IPA. Nunca coloque segredos nelas.

   > Em aparelho físico, `localhost` aponta para o próprio celular. Use o IP da sua máquina na rede local ou o script `android-local` (veja abaixo).

## Executando o projeto

```bash
# Android (gera as pastas nativas, compila e instala no emulador/aparelho)
pnpm android

# iOS (somente macOS)
pnpm ios

# Apenas o servidor de desenvolvimento (para um development build já instalado)
pnpm start
```

As pastas `android/` e `ios/` **não são versionadas** — o projeto usa [Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/): elas são geradas a partir do `app.json` sempre que necessário. Qualquer configuração nativa deve ser feita no `app.json` ou via config plugins, nunca editando essas pastas à mão.

## Scripts disponíveis

| Script | Descrição |
| --- | --- |
| `pnpm start` | Inicia o Metro bundler. |
| `pnpm android` | Compila e roda no Android (`expo run:android`). |
| `pnpm android-local` | Roda no Android usando `localhost` (útil com `adb reverse` para acessar a API local). |
| `pnpm ios` | Compila e roda no iOS (`expo run:ios`). |
| `pnpm web` | Roda a versão web. |
| `pnpm lint` | Verifica ESLint e formatação do Prettier. |
| `pnpm format` | Corrige automaticamente ESLint e Prettier. |

Checagem de tipos (não há script dedicado):

```bash
npx tsc --noEmit
```

## Estrutura de pastas

```
src/
├── app/                          # Rotas (expo-router: cada arquivo é uma tela)
│   ├── _layout.tsx               # Layout raiz: aguarda reidratação do store e escolhe o grupo de rotas
│   ├── index.tsx                 # Redireciona para login ou viveiros conforme a sessão
│   ├── (auth)/                   # Rotas públicas
│   │   ├── _layout.tsx
│   │   └── index.tsx             # Tela de login
│   └── (authenticated)/          # Rotas protegidas
│       ├── _layout.tsx           # Guarda de autenticação, cabeçalho e carga da fazenda
│       ├── ponds.tsx             # Viveiros
│       ├── feeders.tsx           # Alimentadores do viveiro
│       └── feederDetail.tsx      # Detalhe/edição do alimentador
├── components/                   # Componentes reutilizáveis (Button, Input, Feeder, Pond, LedIndicator,
│                                 #   ConnectionStatus, FeedingLogList…)
├── services/
│   └── api.ts                    # Instância do Axios + interceptor do token
├── store/                        # Stores Zustand
│   ├── auth.store.ts             # Sessão (token, usuário, farmId) — persistido
│   ├── farm.store.ts             # Dados da fazenda
│   └── feeder.store.ts           # Alimentadores do viveiro atual
├── types/                        # Interfaces das entidades (IFarm, IFeeder, IPond) e constantes
├── utils/
│   ├── feedTime.ts               # Horários de alimentação (API ⇄ seletor ⇄ HH:mm) e validação das doses
│   └── relativeTime.ts           # "há 5 min" e hora local de instantes reais
└── assets/                       # Ícones, splash e logo
```

O alias `@/` aponta para `src/` (configurado em `tsconfig.json`), ex.: `import api from '@/services/api'`.

## Arquitetura

### Fluxo de navegação

```
Abrir app ──► _layout (aguarda reidratação do AsyncStorage)
                 │
                 ├─ sem token ──► (auth)/index ── login OK ──┐
                 │                                           │
                 └─ com token ──► (authenticated)/ponds ◄────┘
                                        │
                                        ▼
                                  feeders?pondId=…
                                        │
                                        ▼
                                feederDetail?feederId=…
```

### Autenticação e sessão

- O login (`POST /auth/login`) retorna `access_token` e `farmId`, guardados em `useAuthStore`.
- O store usa o middleware `persist` do Zustand com **AsyncStorage**; são persistidos `token`, `user` e `farmId`. Ao reidratar, `isAuthenticated` é recalculado a partir do token.
- O layout raiz exibe a splash até a reidratação terminar, evitando que a tela de login "pisque" para usuários já logados.
- O interceptor em `src/services/api.ts` adiciona `Authorization: Bearer <token>` a todas as requisições.
- O token expira em **7 dias**. Quando a API responde 401/403, o interceptor de resposta encerra a sessão e o usuário volta ao login.
- O logout (ícone no cabeçalho de Viveiros) limpa toda a sessão.

### Estado

| Store | Responsabilidade | Persistido |
| --- | --- | --- |
| `useAuthStore` | Token, usuário, fazenda do usuário, `login`/`logout` | Sim |
| `useFarmStore` | Dados da fazenda (nome usado nos cabeçalhos) | Não |
| `useFeederStore` | Lista de alimentadores do viveiro atual, loading e erro | Não |

A tela de viveiros mantém seus dados em estado local do componente.

## Integração com a API

Todas as rotas (exceto login) exigem o header `Authorization: Bearer <token>`. Timeout padrão: 10 s.

| Método | Endpoint | Uso | Corpo / Resposta |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Login | Envia `{ email, password }` → recebe `{ access_token, farmId }` |
| `GET` | `/farms/:farmId` | Dados da fazenda | `IFarm` |
| `GET` | `/ponds/farm/:farmId` | Viveiros da fazenda | `IPond[]` |
| `GET` | `/feeders/pond/:pondId` | Alimentadores do viveiro | `IFeeder[]` |
| `GET` | `/feeders/logs/:feederId` | Alimentações de hoje (dia no fuso da fazenda) | `IFeedingLog[]`, mais recentes primeiro |
| `PATCH` | `/feeders/:feederId` | Atualiza alimentador | Envia `{ isActive, initialDistributedWeight, feedInterval, startFeedTime, stopFeedTime }` (campos vazios são omitidos) |

### Modelos

Definidos em `src/types/` e espelhando o `prisma/schema.prisma` do backend. Campos opcionais no banco chegam como `null`.

```ts
interface IFarm {
  id: number;
  name: string;
  ownerName: string;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  userId: number;
}

interface IPond {
  id: number;
  name: string;
  farmId: number;
}

interface IFeeder {
  id: string;
  name: string;
  isActive: boolean;
  description: string | null;
  isOnline: boolean;                       // conectividade do ESP32 (MQTT LWT)
  lastSeenAt: string | null;               // última vez que ficou online/offline
  url: string | null;
  port: number | null;
  pondId: number;
  engineModelId: number | null;
  startFeedTime: string | null;            // coluna TIME, ver nota abaixo
  stopFeedTime: string | null;
  feedInterval: number | null;             // minutos entre doses
  initialDistributedWeight: number | null; // meta diária em kg
  kilogramsPerSecond: number | null;       // calibração; sem ela o backend não alimenta
  createdAt: string;
  updatedAt: string;
}

interface IFeedingLog {
  id: string;
  feederId: string;
  doseKg: number;
  durationSeconds: number;
  message: string | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CONFIRMED' | 'CANCELLED';
  triggeredAt: string;
  executedAt: string | null;
}
```

> **Horários de alimentação:** a API guarda `startFeedTime`/`stopFeedTime` em colunas `TIME` do Postgres (sem fuso) e as devolve como data ISO em 1970-01-01 UTC — `"1970-01-01T08:00:00.000Z"` significa **08:00 no horário da fazenda**. Leia e escreva sempre os campos UTC (veja `src/utils/feedTime.ts`); usar o horário local do aparelho desloca o valor em 3 horas.

> **Validação das doses:** o cron do backend divide a janela (final − inicial) pelo `feedInterval` para obter o número de doses e recusa configurações em que o intervalo é maior que a janela ou em que uma dose demoraria mais que o intervalo para sair. `validateFeedSchedule` (em `feedTime.ts`) replica essas regras para avisar o usuário antes de salvar — se mudar a regra no backend, mude lá também.

## Build e publicação (EAS)

Identificadores do app:

| Plataforma | Identificador |
| --- | --- |
| Android (`package`) | `com.drpescados.app` |
| iOS (`bundleIdentifier`) | `com.drpescados.app` |

> Depois de publicado na Play Store/App Store, o identificador **não pode ser alterado** — mudar cria um app novo na loja.

Perfis definidos em `eas.json`:

| Perfil | Uso | Distribuição |
| --- | --- | --- |
| `development` | Development build com dev client, para desenvolvimento | Interna |
| `preview` | Build de testes para homologação | Interna (APK / ad hoc) |
| `production` | Build para as lojas; incrementa a versão automaticamente | Lojas |

```bash
npm install -g eas-cli
eas login

eas build --profile preview --platform android
eas build --profile production --platform all
eas submit --profile production --platform android
```

As variáveis `EXPO_PUBLIC_*` precisam estar disponíveis no momento do build. O `.env` não é enviado para o EAS (está no `.gitignore`), então cadastre-as como [variáveis de ambiente do EAS](https://docs.expo.dev/eas/environment-variables/) ou no `env` de cada perfil do `eas.json`.

O número de versão do app é gerenciado remotamente pelo EAS (`appVersionSource: remote`).

## Padrões de código

- **TypeScript estrito** — evite `any` em código novo.
- **ESLint** com `eslint-config-universe/native` e **Prettier** (`prettier.config.js`). Rode `pnpm lint` antes de abrir PR.
- Imports ordenados: bibliotecas externas primeiro, depois imports com `@/`, separados por linha em branco (o ESLint aponta).
- Um componente por pasta em `src/components/<Nome>/index.tsx`.
- Chamadas de API sempre com `try/catch` e feedback ao usuário (`Alert` ou mensagem na tela).
- Textos da interface em português.

## Solução de problemas

| Problema | Solução |
| --- | --- |
| `API_BASE_URL is not defined` ao abrir o app | Crie o `.env` com `EXPO_PUBLIC_API_BASE_URL` e reinicie o Metro com `pnpm start --clear`. |
| App não conecta à API no celular | Use o IP da máquina em vez de `localhost`, confirme que celular e computador estão na mesma rede, ou use `adb reverse tcp:3000 tcp:3000` + `pnpm android-local`. |
| Alteração no `.env` não surte efeito | Variáveis são lidas no bundle: reinicie com `pnpm start --clear`. |
| Erros de módulo não encontrado com pnpm | Confirme que o `.npmrc` contém `node-linker=hoisted`, apague `node_modules` e rode `pnpm install`. |
| Alteração no `app.json` não aparece no app | Configurações nativas exigem recompilar: rode `pnpm android` / `pnpm ios` novamente. |
| WhatsApp do suporte não abre | Verifique `EXPO_PUBLIC_SUPPORT_PHONE_NUMBER` e se o WhatsApp está instalado no aparelho. |
