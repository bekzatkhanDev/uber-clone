// Admin tariff management: list, create, edit, toggle active
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Tariff,
  TariffPayload,
  useAdminTariffs,
  useAdminCreateTariff,
  useAdminUpdateTariff,
  useAdminToggleTariff,
} from '@/hooks/useAdmin';
import { useTranslation } from '@/i18n/I18nProvider';

// ─── Form state ───────────────────────────────────────────────────────────────

const EMPTY_FORM: TariffPayload = {
  code: '',
  base_price: '',
  price_per_km: '',
  price_per_min: '',
  min_price: '',
  is_active: true,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad';
}) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 }}>
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      keyboardType={keyboardType}
      style={{
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#0f172a',
        backgroundColor: 'white',
      }}
      placeholderTextColor="#94a3b8"
    />
  </View>
);

const TariffCard = ({
  tariff,
  onEdit,
  onToggle,
  isToggling,
}: {
  tariff: Tariff;
  onEdit: (t: Tariff) => void;
  onToggle: (t: Tariff) => void;
  isToggling: boolean;
}) => {
  const { t } = useTranslation();
  
  return (
  <View
    style={{
      backgroundColor: 'white',
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
      borderLeftWidth: 4,
      borderLeftColor: tariff.is_active ? '#10b981' : '#cbd5e1',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    }}
  >
    {/* Header row */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>{tariff.code}</Text>
      </View>
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 20,
          backgroundColor: tariff.is_active ? '#d1fae5' : '#f1f5f9',
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: '600',
            color: tariff.is_active ? '#065f46' : '#64748b',
          }}
        >
          {tariff.is_active ? t.admin.tariffs.activeLabel : t.admin.tariffs.inactiveLabel}
        </Text>
      </View>
    </View>

    {/* Price grid */}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
      <PriceChip label={t.admin.tariffs.base} value={tariff.base_price} />
      <PriceChip label={t.admin.tariffs.perKm} value={tariff.price_per_km} />
      <PriceChip label={t.admin.tariffs.perMin} value={tariff.price_per_min} />
      <PriceChip label={t.admin.tariffs.minPrice} value={tariff.min_price} />
    </View>

    {/* Actions */}
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <TouchableOpacity
        onPress={() => onEdit(tariff)}
        style={{
          flex: 1,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor: '#eff6ff',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#2563eb' }}>{t.admin.tariffs.edit}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onToggle(tariff)}
        disabled={isToggling}
        style={{
          flex: 1,
          paddingVertical: 8,
          borderRadius: 8,
          backgroundColor: tariff.is_active ? '#fef2f2' : '#f0fdf4',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: tariff.is_active ? '#dc2626' : '#16a34a',
          }}
        >
          {isToggling ? t.admin.tariffs.saving : tariff.is_active ? t.admin.tariffs.deactivate : t.admin.tariffs.activate}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);
}

const PriceChip = ({ label, value }: { label: string; value: string }) => (
  <View
    style={{
      backgroundColor: '#f8fafc',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: '#e2e8f0',
    }}
  >
    <Text style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>{label}</Text>
    <Text style={{ fontSize: 13, fontWeight: '600', color: '#0f172a' }}>
      {parseFloat(value).toFixed(2)} ₸
    </Text>
  </View>
);

// ─── Form modal ───────────────────────────────────────────────────────────────

const TariffFormModal = ({
  visible,
  initial,
  onClose,
  onSave,
  isSaving,
}: {
  visible: boolean;
  initial: TariffPayload & { id?: number };
  onClose: () => void;
  onSave: (data: TariffPayload & { id?: number }) => void;
  isSaving: boolean;
}) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<TariffPayload & { id?: number }>(initial);

  React.useEffect(() => {
    setForm(initial);
  }, [initial]);

  const set = (key: keyof TariffPayload) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const isValid =
    form.code.trim() &&
    form.base_price.trim() &&
    form.price_per_km.trim() &&
    form.price_per_min.trim() &&
    form.min_price.trim();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxWidth: 480,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 }}>
            {form.id ? t.admin.tariffs.editTariff : t.admin.tariffs.newTariff}
          </Text>

          <FormField label={t.admin.tariffs.code} value={form.code} onChange={set('code')} placeholder={t.admin.tariffs.codePlaceholder} />
          <FormField label={t.admin.tariffs.basePrice} value={form.base_price} onChange={set('base_price')} placeholder={t.admin.tariffs.basePricePlaceholder} keyboardType="decimal-pad" />
          <FormField label={t.admin.tariffs.pricePerKm} value={form.price_per_km} onChange={set('price_per_km')} placeholder={t.admin.tariffs.pricePerKmPlaceholder} keyboardType="decimal-pad" />
          <FormField label={t.admin.tariffs.pricePerMin} value={form.price_per_min} onChange={set('price_per_min')} placeholder={t.admin.tariffs.pricePerMinPlaceholder} keyboardType="decimal-pad" />
          <FormField label={t.admin.tariffs.minimumPrice} value={form.min_price} onChange={set('min_price')} placeholder={t.admin.tariffs.minimumPricePlaceholder} keyboardType="decimal-pad" />

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: '#f1f5f9',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '600', color: '#64748b' }}>{t.admin.tariffs.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onSave(form)}
              disabled={!isValid || isSaving}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: !isValid ? '#e2e8f0' : '#2563eb',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '600', color: !isValid ? '#94a3b8' : 'white' }}>
                {isSaving ? t.admin.tariffs.saving : t.admin.tariffs.save}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function TariffsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: tariffs = [], isLoading, refetch } = useAdminTariffs();
  const { mutate: createTariff, isPending: isCreating } = useAdminCreateTariff();
  const { mutate: updateTariff, isPending: isUpdating } = useAdminUpdateTariff();
  const { mutate: toggleTariff, isPending: isToggling, variables: togglingId } = useAdminToggleTariff();

  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<(TariffPayload & { id?: number })>(EMPTY_FORM);

  const openCreate = () => {
    setEditTarget({ ...EMPTY_FORM });
    setModalVisible(true);
  };

  const openEdit = (t: Tariff) => {
    setEditTarget({
      id: t.id,
      code: t.code,
      base_price: t.base_price,
      price_per_km: t.price_per_km,
      price_per_min: t.price_per_min,
      min_price: t.min_price,
      is_active: t.is_active,
    });
    setModalVisible(true);
  };

  const handleSave = (form: TariffPayload & { id?: number }) => {
    const payload: TariffPayload = {
      code: form.code.trim(),
      base_price: form.base_price,
      price_per_km: form.price_per_km,
      price_per_min: form.price_per_min,
      min_price: form.min_price,
      is_active: form.is_active ?? true,
    };

    if (form.id) {
      updateTariff(
        { id: form.id, data: payload },
        { onSuccess: () => setModalVisible(false) },
      );
    } else {
      createTariff(payload, { onSuccess: () => setModalVisible(false) });
    }
  };

  const handleToggle = (tariff: Tariff) => {
    const action = tariff.is_active ? 'deactivate' : 'activate';
    const confirmMsg = tariff.is_active ? t.admin.tariffs.confirmDeactivate : t.admin.tariffs.confirmActivate;
    const confirmDesc = tariff.is_active ? t.admin.tariffs.confirmDeactivateDesc : t.admin.tariffs.confirmActivateDesc;
    
    if (Platform.OS === 'web') {
      if (window.confirm(`${confirmMsg} "${tariff.code}"?`)) {
        toggleTariff(tariff.id);
      }
    } else {
      Alert.alert(
        confirmMsg,
        `${confirmDesc} "${tariff.code}"?`,
        [
          { text: t.common.cancel, style: 'cancel' },
          { text: confirmMsg, onPress: () => toggleTariff(tariff.id) },
        ],
      );
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const active = tariffs.filter((t) => t.is_active);
  const inactive = tariffs.filter((t) => !t.is_active);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View
        style={
          Platform.OS === 'web'
            ? { maxWidth: 900, alignSelf: 'center' as const, width: '100%', flex: 1 }
            : { flex: 1 }
        }
      >
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
          onTouchEnd={refetch}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#0f172a' }}>{t.admin.tariffs.title}</Text>
              <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                {active.length} {t.admin.tariffs.active} · {inactive.length} {t.admin.tariffs.inactive}
              </Text>
            </View>
            <TouchableOpacity
              onPress={openCreate}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#2563eb',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 10,
                gap: 6,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>+ {t.admin.tariffs.new}</Text>
            </TouchableOpacity>
          </View>

          {/* Active tariffs */}
          {active.length > 0 && (
            <>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
                {t.admin.tariffs.activeLabel}
              </Text>
              {active.map((t) => (
                <TariffCard
                  key={t.id}
                  tariff={t}
                  onEdit={openEdit}
                  onToggle={handleToggle}
                  isToggling={isToggling && togglingId === t.id}
                />
              ))}
            </>
          )}

          {/* Inactive tariffs */}
          {inactive.length > 0 && (
            <>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 12, marginBottom: 8 }}>
                {t.admin.tariffs.inactiveLabel}
              </Text>
              {inactive.map((t) => (
                <TariffCard
                  key={t.id}
                  tariff={t}
                  onEdit={openEdit}
                  onToggle={handleToggle}
                  isToggling={isToggling && togglingId === t.id}
                />
              ))}
            </>
          )}

          {tariffs.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>💰</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 }}>{t.admin.tariffs.noTariffs}</Text>
              <Text style={{ fontSize: 13, color: '#94a3b8' }}>{t.admin.tariffs.noTariffsDesc}</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <TariffFormModal
        visible={modalVisible}
        initial={editTarget}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />
    </View>
  );
}
