import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { FeederCard } from '@/components/FeederCard';
import {
  AppHeader,
  AppText,
  Card,
  EmptyState,
  MoreMenu,
  MoreMenuItem,
  ProgressRing,
  Screen,
  Skeleton,
  SpeakButton,
} from '@/components/ui';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useAuthStore } from '@/store/auth.store';
import { useFarmStore } from '@/store/farm.store';
import { useFeederStore } from '@/store/feeder.store';
import { colors, spacing } from '@/theme';
import { getFeederToday } from '@/utils/feeding';
import { formatKg } from '@/utils/format';
import { buildFarmSpeech } from '@/utils/speech';
import { openWhatsAppSupport } from '@/utils/support';

export default function Inicio() {
  const router = useRouter();
  const { farmId, logout } = useAuthStore();
  const farm = useFarmStore((s) => s.farm);
  const { ponds, feeders, logsByFeeder, isLoading, isRefreshing, error, lastUpdated, loadFarm } =
    useFeederStore();

  const load = useCallback(
    (options?: { silent?: boolean; pull?: boolean }) => loadFarm(farmId, options),
    [loadFarm, farmId]
  );

  // Ao abrir (ou voltar para) a tela: carga normal na primeira vez, silenciosa depois.
  useFocusEffect(
    useCallback(() => {
      load({ silent: useFeederStore.getState().lastUpdated !== null });
    }, [load])
  );
  useAutoRefresh(() => load({ silent: true }));

  const summary = useMemo(() => {
    let deliveredKg = 0;
    let goalKg = 0;
    for (const feeder of feeders) {
      if (!feeder.isActive) continue;
      const today = getFeederToday(feeder, logsByFeeder[feeder.id]);
      deliveredKg += today.deliveredKg ?? 0;
      goalKg += today.goalKg ?? 0;
    }
    const on = feeders.filter((f) => f.isActive).length;
    return { deliveredKg, goalKg, on, total: feeders.length };
  }, [feeders, logsByFeeder]);

  const speech = () =>
    buildFarmSpeech({
      farmName: farm.name,
      feeders,
      deliveredKg: summary.deliveredKg,
      goalKg: summary.goalKg,
    });

  function handleLogout() {
    Alert.alert(
      'Sair do aplicativo?',
      'Você vai precisar do email e da senha para entrar de novo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    );
  }

  // Ações secundárias no "⋮": ajuda fica a um toque, mas sem chamar atenção.
  const menuItems: MoreMenuItem[] = [
    { label: 'Ajuda no WhatsApp', icon: 'whatsapp', onPress: () => openWhatsAppSupport() },
    ...(__DEV__
      ? [
          {
            label: 'Ver componentes',
            icon: 'palette-outline' as const,
            onPress: () => router.push('/componentes'),
          },
        ]
      : []),
    { label: 'Sair da conta', icon: 'logout', onPress: handleLogout, destructive: true },
  ];

  const header = (
    <AppHeader
      title={farm.name || 'DR Pescados'}
      showLogo
      right={
        <View style={styles.headerRight}>
          {feeders.length > 0 && <SpeakButton text={speech} />}
          <MoreMenu items={menuItems} />
        </View>
      }
    />
  );

  // Erro sem nada para mostrar: tela inteira explicando o que fazer.
  if (error && lastUpdated === null) {
    return (
      <Screen header={header} scroll={false}>
        {error === 'no-farm' ? (
          <EmptyState
            icon="home-alert-outline"
            title="Nenhuma fazenda"
            message="Sua conta ainda não tem uma fazenda cadastrada. Fale com o suporte."
            action={{
              label: 'Pedir ajuda',
              icon: 'whatsapp',
              onPress: () => openWhatsAppSupport(),
            }}
          />
        ) : error === 'offline' ? (
          <EmptyState
            icon="wifi-off"
            title="Sem internet"
            message="Os alimentadores continuam funcionando normalmente. Quando o sinal voltar, toque no botão abaixo."
            action={{ label: 'Tentar de novo', icon: 'refresh', onPress: () => load() }}
          />
        ) : (
          <EmptyState
            icon="cloud-alert"
            title="Algo deu errado"
            message="Não conseguimos buscar seus alimentadores agora. Tente de novo em alguns minutos."
            action={{ label: 'Tentar de novo', icon: 'refresh', onPress: () => load() }}
          />
        )}
      </Screen>
    );
  }

  return (
    <Screen header={header} refreshing={isRefreshing} onRefresh={() => load({ pull: true })}>
      {error === 'offline' && (
        <View style={styles.offlineBar} accessibilityRole="alert">
          <AppText variant="body" color={colors.onPrimary}>
            Sem internet. Mostrando os últimos dados.
          </AppText>
        </View>
      )}

      {isLoading ? (
        <LoadingSkeleton />
      ) : feeders.length === 0 ? (
        <View style={styles.emptyBox}>
          <EmptyState
            icon="shrimp"
            title="Nenhum alimentador"
            message="Ainda não há alimentadores cadastrados na sua fazenda. Fale com o suporte."
          />
        </View>
      ) : (
        <>
          <Card style={styles.summary}>
            <ProgressRing
              size={72}
              strokeWidth={9}
              progress={summary.goalKg ? summary.deliveredKg / summary.goalKg : 0}
              accessibilityLabel={`Hoje: ${formatKg(summary.deliveredKg)} de ${formatKg(summary.goalKg)} quilos`}
            />
            <View style={styles.flex}>
              <AppText variant="overline" color={colors.textMuted}>
                HOJE NA FAZENDA
              </AppText>
              <AppText variant="title" style={styles.summaryKg}>
                {formatKg(summary.deliveredKg)} de {formatKg(summary.goalKg)} kg
              </AppText>
              <AppText variant="label" color={colors.textMuted}>
                {summary.total === 1
                  ? `Alimentador ${summary.on ? 'ligado' : 'desligado'}`
                  : `${summary.on} de ${summary.total} alimentadores ligados`}
              </AppText>
            </View>
          </Card>

          {ponds.map(({ pond, feeders: pondFeeders }) => (
            <View key={pond.id} style={styles.pond}>
              <AppText variant="overline" color={colors.textMuted} accessibilityRole="header">
                {pond.name.toUpperCase()}
              </AppText>
              {pondFeeders.length === 0 ? (
                <AppText variant="bodyRegular" color={colors.textMuted}>
                  Nenhum alimentador neste viveiro.
                </AppText>
              ) : (
                pondFeeders.map((feeder) => (
                  <FeederCard
                    key={feeder.id}
                    feeder={feeder}
                    today={getFeederToday(feeder, logsByFeeder[feeder.id])}
                    onPress={() =>
                      router.push({ pathname: '/feederDetail', params: { feederId: feeder.id } })
                    }
                  />
                ))
              )}
            </View>
          ))}
        </>
      )}
    </Screen>
  );
}

function LoadingSkeleton() {
  return (
    <View style={styles.pond} accessibilityLabel="Carregando seus alimentadores" accessible>
      <AppText variant="body" color={colors.textMuted} align="center">
        Buscando seus alimentadores…
      </AppText>
      <Card style={styles.summary}>
        <Skeleton width={72} height={72} rounded />
        <View style={[styles.flex, styles.skeletonLines]}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="80%" height={22} />
        </View>
      </Card>
      {[0, 1].map((i) => (
        <Card key={i}>
          <Skeleton width="55%" height={24} />
          <View style={styles.skeletonPills}>
            <Skeleton width={110} height={34} rounded />
            <Skeleton width={120} height={34} rounded />
          </View>
          <Skeleton height={12} rounded />
          <Skeleton width="45%" height={18} />
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  summaryKg: {
    fontFamily: 'Nunito_900Black',
  },
  pond: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  offlineBar: {
    backgroundColor: colors.offlineBar,
    borderRadius: 12,
    padding: spacing.md,
  },
  emptyBox: {
    minHeight: 420,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  skeletonLines: {
    gap: spacing.sm,
  },
  skeletonPills: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
