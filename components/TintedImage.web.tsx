// Web: tintColor via CSS filter (react-native-web's SVG filter conflicts with NativeWind)
import { Image, ImageProps } from "react-native";

interface TintedImageProps extends ImageProps {
  tintColor?: string;
  size?: number;
}

// Converts common tintColor values to reliable CSS filter strings
const tintToFilter = (tintColor?: string): string | undefined => {
  if (!tintColor) return undefined;
  const c = tintColor.toLowerCase().trim();

  if (c === "white" || c === "#fff" || c === "#ffffff" || c === "rgb(255,255,255)")
    return "brightness(0) invert(1)";

  if (c === "black" || c === "#000" || c === "#000000")
    return "brightness(0)";

  if (c === "#0286ff" || c === "rgb(2,134,255)")
    return "brightness(0) saturate(100%) invert(27%) sepia(97%) saturate(1556%) hue-rotate(196deg) brightness(104%) contrast(108%)";

  if (c === "#0cc25f" || c === "rgb(12,194,95)")
    return "brightness(0) saturate(100%) invert(60%) sepia(56%) saturate(562%) hue-rotate(101deg) brightness(97%) contrast(96%)";

  if (c === "#ef4444" || c === "red")
    return "brightness(0) saturate(100%) invert(26%) sepia(92%) saturate(1852%) hue-rotate(342deg) brightness(102%) contrast(89%)";

  // Fallback: no filter (image renders as-is)
  return undefined;
};

const TintedImage = ({ tintColor, size, style, ...props }: TintedImageProps) => {
  const filter = tintToFilter(tintColor);

  return (
    <Image
      style={[
        size ? { width: size, height: size } : undefined,
        style,
        filter ? ({ filter } as any) : undefined,
      ]}
      {...props}
    />
  );
};

export default TintedImage;
