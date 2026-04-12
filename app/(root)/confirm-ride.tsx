// Disable static rendering for pages using react-leaflet
export const dynamic = 'force-dynamic';

import { router } from "expo-router";
import { ActivityIndicator, Image, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import BankSelector, { BankId } from "@/components/BankSelector";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import { useTranslation, useCurrency } from "@/i18n/I18nProvider";

const Row = ({ label, value, valueStyle }: { label: string; value: React.ReactNode; valueStyle?: any }) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 }}>
    <Text style={{ fontSize: 14, color: "#6b7280", flex: 1 }}>{label}</Text>
    <View style={{ flex: 1, alignItems: "flex-end" }}>
      {typeof value === "string" ? (
        <Text style={[{ fontSize: 14, fontWeight: "600", color: "#111827", textAlign: "right" }, valueStyle]}>{value}</Text>
      ) : value}
    </View>
  </View>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <View style={{ backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}>
    {children}
  </View>
);

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={{ fontSize: 13, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>{title}</Text>
);

const ConfirmRide = () => {
  const { t } = useTranslation();
  const { symbol } = useCurrency();
  const { userAddress, destinationAddress, selectedTariff, estimate, selectedPaymentMethod, setSelectedPaymentMethod } = useLocationStore();

  const estimatedTime = estimate?.duration_min || 0;
  const estimatedDistance = estimate?.distance_km || 0;
  const estimatedPrice = estimate?.price || 0;
  const isCalculating = !estimate;

  const formatPrice = (price: number | string) =>
    `${symbol}${parseFloat(price as string).toFixed(2)}`;

  return (
    <RideLayout title={t.confirmRide.confirmRide} snapPoints={["60%"]}>
      {/* Route card */}
      <Card>
        <SectionTitle title={t.confirmRide.rideSummary} />

        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
          <Image source={icons.point} style={{ width: 18, height: 18, marginTop: 2, marginRight: 10 }} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>{t.confirmRide.pickup}</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>{userAddress || t.confirmRide.notSet}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Image source={icons.to} style={{ width: 18, height: 18, marginTop: 2, marginRight: 10 }} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>{t.confirmRide.destination}</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>{destinationAddress || t.confirmRide.notSet}</Text>
          </View>
        </View>
      </Card>

      {/* Price hero */}
      <Card>
        <View style={{ alignItems: "center", paddingVertical: 8 }}>
          <Text style={{ fontSize: 13, color: "#9ca3af", marginBottom: 4 }}>{t.confirmRide.estimatedPrice}</Text>
          {isCalculating ? (
            <ActivityIndicator size="large" color="#0CC25F" />
          ) : (
            <Text style={{ fontSize: 40, fontWeight: "800", color: "#0CC25F" }}>{formatPrice(estimatedPrice)}</Text>
          )}
          {estimate?.is_estimate && (
            <View style={{ backgroundColor: "#fef9c3", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: "#a16207" }}>⚠️ {t.confirmRide.priceEstimate}</Text>
            </View>
          )}
        </View>
      </Card>

      {/* Trip details */}
      <Card>
        <SectionTitle title={t.confirmRide.tariff} />
        <Row
          label={t.confirmRide.tariff}
          value={selectedTariff?.code ? selectedTariff.code.charAt(0).toUpperCase() + selectedTariff.code.slice(1) : t.confirmRide.notSelected}
        />
        <View style={{ height: 1, backgroundColor: "#f3f4f6" }} />
        <Row
          label={t.confirmRide.distance}
          value={isCalculating ? <ActivityIndicator size="small" color="#0CC25F" /> : `${estimatedDistance.toFixed(1)} km`}
        />
        <View style={{ height: 1, backgroundColor: "#f3f4f6" }} />
        <Row
          label={t.confirmRide.duration}
          value={isCalculating ? <ActivityIndicator size="small" color="#0CC25F" /> : `${Math.round(estimatedTime)} min`}
        />
      </Card>

      {/* Driver info */}
      <Card>
        <SectionTitle title={t.confirmRide.driver} />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
            <Image source={icons.person} style={{ width: 24, height: 24 }} resizeMode="contain" />
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{t.confirmRide.willBeAssigned}</Text>
            <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{t.confirmRide.driverAssigned}</Text>
          </View>
        </View>
      </Card>

      {/* Payment method */}
      <Card>
        <SectionTitle title="Payment Method" />
        <BankSelector
          selectedBank={selectedPaymentMethod as BankId | null}
          onSelect={(id) => setSelectedPaymentMethod(id)}
          compact
        />
      </Card>

      {/* Confirm button */}
      <View style={{ marginTop: 4 }}>
        <CustomButton
          title={t.confirmRide.confirmRide}
          onPress={() => router.push("/(root)/book-ride")}
          disabled={isCalculating}
        />
      </View>
    </RideLayout>
  );
};

export default ConfirmRide;
