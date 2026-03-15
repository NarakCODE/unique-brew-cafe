import { TextInput, TextInputProps, View } from 'react-native';

import { Text } from '@/components/nativewindui/Text';
import { cn } from '@/lib/cn';
import { useColorScheme } from "@/lib/color-scheme";

type AuthFormFieldProps = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
};

export function AuthFormField({
  label,
  error,
  helperText,
  className,
  ...props
}: AuthFormFieldProps) {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <View className="gap-2">
      <Text variant="subhead" className="font-medium text-black dark:text-white">
        {label}
      </Text>

      <TextInput
        className={cn(
          'h-14 rounded-2xl border bg-gray-100 px-4 text-base text-black dark:bg-neutral-900 dark:text-white',
          error ? 'border-red-500' : 'border-transparent',
          className
        )}
        placeholderTextColor={isDarkColorScheme ? '#6B7280' : '#9CA3AF'}
        {...props}
      />

      {error ? (
        <Text variant="caption1" className="text-red-500">
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption1" color="tertiary">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
