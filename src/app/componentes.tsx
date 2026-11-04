/**
 * Vitrine dos componentes base (só em desenvolvimento).
 * Abrir no emulador: adb shell am start -a android.intent.action.VIEW -d "exp://10.0.2.2:8081/--/componentes"
 */
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppHeader,
  AppText,
  Banner,
  BigButton,
  Card,
  ChoiceChips,
  EmptyState,
  ProgressBar,
  ProgressRing,
  Screen,
  Skeleton,
  SpeakButton,
  StatusPill,
  Stepper,
  SuccessView,
} from '@/components/ui';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { colors, spacing } from '@/theme';
import { haptics } from '@/utils/haptics';
import { buildFeederSpeech } from '@/utils/speech';

const INTERVALS = [
  { value: 15, label: '15', sublabel: 'minutos', accessibilityLabel: '15 minutos' },
  { value: 30, label: '30', sublabel: 'minutos', accessibilityLabel: '30 minutos' },
  { value: 60, label: '1', sublabel: 'hora', accessibilityLabel: '1 hora' },
  { value: 120, label: '2', sublabel: 'horas', accessibilityLabel: '2 horas' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="overline" color={colors.textMuted}>
        {title.toUpperCase()}
      </AppText>
      {children}
    </View>
  );
}

export default function Componentes() {
  const router = useRouter();
  const [kg, setKg] = useState(40);
  const [intervalMin, setIntervalMin] = useState(30);
  const [isOn, setIsOn] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = useCallback(() => {
    setRefreshCount((n) => n + 1);
    setLastRefresh(new Date());
  }, []);
  useAutoRefresh(refresh);

  if (!__DEV__) return <Redirect href="/" />;

  if (showSuccess) {
    return (
      <SuccessView
        message="O Alimentador 1 já vai seguir a nova configuração."
        action={{ label: 'Voltar', onPress: () => setShowSuccess(false) }}
      />
    );
  }

  const speech = () =>
    buildFeederSpeech({
      name: 'Alimentador 1',
      isActive: isOn,
      isOnline: true,
      deliveredKg: 22,
      goalKg: kg,
      nextFeedMinutes: 14 * 60 + 30,
    });

  return (
    <Screen
      header={
        <AppHeader
          title="Componentes"
          back={router.canGoBack() ? { onPress: () => router.back() } : undefined}
          right={<SpeakButton text={speech} />}
        />
      }
      footer={
        <BigButton title="Salvar" icon="check-bold" large onPress={() => setShowSuccess(true)} />
      }>
      <Section title="Textos">
        <AppText variant="question">Quanta ração por dia?</AppText>
        <AppText variant="title">Título da tela</AppText>
        <AppText variant="body">Texto normal em negrito</AppText>
        <AppText variant="bodyRegular" color={colors.textSecondary}>
          Texto normal para explicações mais longas.
        </AppText>
        <AppText variant="label" color={colors.textMuted}>
          Rótulo (tamanho mínimo)
        </AppText>
      </Section>

      <Section title="Ligar / desligar (vibra)">
        <BigButton
          title={isOn ? 'LIGADO · toque para desligar' : 'DESLIGADO · toque para ligar'}
          icon="power"
          variant={isOn ? 'primary' : 'secondary'}
          large
          onPress={() => {
            if (isOn) haptics.turnOff();
            else haptics.turnOn();
            setIsOn(!isOn);
          }}
        />
      </Section>

      <Section title="Botões">
        <BigButton
          title="Ação principal"
          icon="arrow-right"
          iconPosition="right"
          onPress={() => {}}
        />
        <BigButton
          title="Ação secundária"
          icon="tune-variant"
          variant="secondary"
          onPress={() => {}}
        />
        <BigButton title="Salvando..." loading onPress={() => {}} />
        <BigButton title="Desligar de vez" icon="power" variant="danger" onPress={() => {}} />
        <BigButton title="Cancelar" variant="ghost" onPress={() => {}} />
      </Section>

      <Section title="Estados">
        <View style={styles.row}>
          <StatusPill variant="on" icon="power" label="LIGADO" />
          <StatusPill variant="off" icon="power" label="DESLIGADO" />
          <StatusPill variant="ok" icon="wifi" label="Com sinal" />
          <StatusPill variant="warning" icon="wifi-off" label="Sem sinal" />
          <StatusPill variant="error" icon="close-circle" label="Não saiu" />
        </View>
      </Section>

      <Section title="Card (toque inteiro)">
        <Card onPress={() => {}} accessibilityLabel="Alimentador 1, ligado, com sinal">
          <AppText variant="cardTitle">Alimentador 1</AppText>
          <View style={styles.row}>
            <StatusPill variant="on" icon="power" label="LIGADO" />
            <StatusPill variant="ok" icon="wifi" label="Com sinal" />
          </View>
          <View style={styles.spaceBetween}>
            <AppText variant="body">Hoje</AppText>
            <AppText variant="bodyRegular">22 de {kg} kg</AppText>
          </View>
          <ProgressBar progress={22 / kg} accessibilityLabel={`22 de ${kg} quilos hoje`} />
        </Card>
      </Section>

      <Section title="Anel de progresso">
        <ProgressRing progress={22 / kg} accessibilityLabel={`22 de ${kg} quilos hoje`}>
          <AppText variant="question">22</AppText>
          <AppText variant="label" color={colors.textMuted}>
            de {kg} kg
          </AppText>
        </ProgressRing>
      </Section>

      <Section title="Sem teclado: – / +">
        <Stepper value={kg} onChange={setKg} min={1} max={500} unit="quilos" unitSingular="quilo" />
        <ChoiceChips
          columns={4}
          value={kg}
          onChange={setKg}
          options={[20, 30, 40, 50].map((v) => ({ value: v, label: `${v} kg` }))}
        />
      </Section>

      <Section title="Sem teclado: opções">
        <ChoiceChips
          columns={2}
          value={intervalMin}
          onChange={setIntervalMin}
          options={INTERVALS}
        />
      </Section>

      <Section title="Avisos">
        <Banner
          title="Sem sinal há 2 horas"
          icon="wifi-off"
          message="Veja se o alimentador está na tomada e se a internet da fazenda está funcionando."
        />
        <Banner
          title="Falta ajustar o motor"
          message="Até isso ser ajustado, ele não vai alimentar."
          action={{ label: 'Chamar o suporte', icon: 'whatsapp', onPress: () => {} }}
        />
        <Banner variant="error" title="Não foi possível salvar" message="Tente de novo." />
      </Section>

      <Section title="Carregando">
        <Card>
          <Skeleton width="55%" height={22} />
          <View style={styles.row}>
            <Skeleton width={96} height={34} rounded />
            <Skeleton width={110} height={34} rounded />
          </View>
          <Skeleton height={12} rounded />
        </Card>
      </Section>

      <Section title="Atualização automática (30 s)">
        <Card>
          <AppText variant="body">Atualizou {refreshCount} vezes</AppText>
          <AppText variant="label" color={colors.textMuted}>
            Última: {lastRefresh.toLocaleTimeString('pt-BR')}
          </AppText>
        </Card>
      </Section>

      <Section title="Estado vazio">
        <View style={styles.emptyBox}>
          <EmptyState
            icon="wifi-off"
            title="Sem internet"
            message="Os alimentadores continuam funcionando normalmente."
            action={{ label: 'Tentar de novo', icon: 'refresh', onPress: () => {} }}
          />
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyBox: {
    height: 480,
    backgroundColor: colors.surface,
    borderRadius: 16,
  },
});
