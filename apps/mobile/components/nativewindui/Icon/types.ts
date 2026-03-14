// components/nativewindui/Icon/types.ts
import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { SymbolViewProps } from 'expo-symbols';
import * as React from 'react';
import type { IconMapper } from 'rn-icon-mapper';

type MaterialCommunityIconsProps = React.ComponentProps<typeof MaterialCommunityIcons>;
type MaterialIconsProps = React.ComponentProps<typeof MaterialIcons>;

type Style = SymbolViewProps['style'] &
  MaterialIconsProps['style'] &
  MaterialCommunityIconsProps['style'];

type IconProps = IconMapper<SymbolViewProps, MaterialIconsProps, MaterialCommunityIconsProps> & {
  style?: Style;
  className?: string;
};

export type { IconProps };
