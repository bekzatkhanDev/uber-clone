// Native: uses React Native's built-in tintColor prop
import { Image, ImageProps } from "react-native";

interface TintedImageProps extends ImageProps {
  tintColor?: string;
  size?: number;
}

const TintedImage = ({ tintColor, size, style, ...props }: TintedImageProps) => {
  return (
    <Image
      tintColor={tintColor}
      style={[size ? { width: size, height: size } : undefined, style]}
      {...props}
    />
  );
};

export default TintedImage;
