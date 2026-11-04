import { StyleSheet, View } from 'react-native';

import { AppText, Card, Icon, ProgressBar, StatusPill } from '@/components/ui';
import { colors, spacing } from '@/theme';
import { IFeeder } from '@/types/feeder';
import { formatMinutes, isoToMinutes } from '@/utils/feedTime';
import { FeederToday, needsAttention } from '@/utils/feeding';
import { formatKg } from '@/utils/format';

interface FeederCardProps {
  feeder: IFeeder;
  today: FeederToday;
  onPress: () => void;
}

/** Card da tela Início: o card inteiro abre o alimentador. */
export function FeederCard({ feeder, today, onPress }: FeederCardProps) {
  const start = isoToMinutes(feeder.startFeedTime);
  const stop = isoToMinutes(feeder.stopFeedTime);
  const attention = needsAttention(feeder);
  const stateLabel = feeder.isActive ? 'ligado' : 'desligado';
  const signalLabel = feeder.isOnline ? 'com sinal' : 'sem sinal';
  const todayLabel =
    today.deliveredKg !== null && today.goalKg
      ? `, hoje ${formatKg(today.deliveredKg)} de ${formatKg(today.goalKg)} quilos`
      : '';

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${feeder.name}, ${stateLabel}, ${signalLabel}${todayLabel}${attention ? ', precisa de atenção' : ''}`}
      accessibilityHint="Abre o alimentador">
      <View style={styles.titleRow}>
        <AppText variant="cardTitle" style={styles.flex} numberOfLines={2}>
          {feeder.name}
        </AppText>
        <Icon name="chevron-right" size={30} color={colors.textMuted} />
      </View>

      <View style={styles.pills}>
        {feeder.isActive ? (
          <StatusPill variant="on" icon="power" label="LIGADO" />
        ) : (
          <StatusPill variant="off" icon="power" label="DESLIGADO" />
        )}
        {feeder.isOnline ? (
          <StatusPill variant="ok" icon="wifi" label="Com sinal" />
        ) : (
          <StatusPill variant="warning" icon="wifi-off" label="Sem sinal" />
        )}
      </View>

      {today.goalKg !== null && today.deliveredKg !== null && (
        <View style={styles.today}>
          <View style={styles.todayRow}>
            <AppText variant="body">Hoje</AppText>
            <AppText variant="bodyRegular">
              <AppText variant="body" style={styles.strong}>
                {formatKg(today.deliveredKg)}
              </AppText>{' '}
              de {formatKg(today.goalKg)} kg
            </AppText>
          </View>
          <ProgressBar
            progress={today.progress ?? 0}
            accessibilityLabel={`${formatKg(today.deliveredKg)} de ${formatKg(today.goalKg)} quilos hoje`}
          />
        </View>
      )}

      {start !== null && stop !== null && (
        <View style={styles.infoRow}>
          <Icon name="clock-outline" size={22} color={colors.textSecondary} />
          <AppText variant="bodyRegular" color={colors.textSecondary}>
            {formatMinutes(start)} até {formatMinutes(stop)}
          </AppText>
        </View>
      )}

      {attention && (
        <View style={styles.infoRow}>
          <Icon name="alert" size={22} color={colors.onWarning} />
          <AppText variant="body" color={colors.onWarning}>
            Precisa de atenção
          </AppText>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  today: {
    gap: 6,
  },
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  strong: {
    fontFamily: 'Nunito_900Black',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
