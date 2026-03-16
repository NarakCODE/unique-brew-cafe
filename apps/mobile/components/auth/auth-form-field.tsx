import * as React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useColorScheme } from "@/lib/color-scheme";

type AuthFormFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
};

export const AuthFormField = React.forwardRef<TextInput, AuthFormFieldProps>(
  function AuthFormField(
    { label, error, helperText, className, ...props },
    ref
  ) {
    const { isDarkColorScheme } = useColorScheme();

    return (
      <View className="gap-2">
        {label ? (
          <Label className="text-black dark:text-white">
            {label}
          </Label>
        ) : null}

        <Input
          ref={ref}
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
);
