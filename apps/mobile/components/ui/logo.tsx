import { Image } from 'expo-image';
import { View, ViewStyle } from 'react-native';

import { cn } from '@/lib/utils';

const LOGO_SOURCE = require('@/assets/images/logo.svg');

type LogoProps = {
  size?: number;
  style?: ViewStyle;
  containerClassName?: string;
  imageClassName?: string;
};

export function Logo({
  size = 80,
  style,
  containerClassName,
  imageClassName,
}: LogoProps) {
  return (
    <View
      style={[{ width: size, height: size }, style]}
      className={cn('items-center justify-center', containerClassName)}
      accessibilityRole="image"
      accessibilityLabel="Unique Brew logo">
      <Image
        source={LOGO_SOURCE}
        style={{ width: '100%', height: '100%' }}
        className={imageClassName}
        contentFit="contain"
      />
    </View>
  );
}
