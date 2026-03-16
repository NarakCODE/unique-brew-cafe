import { Pressable, View } from "react-native";
import { Search, X } from "lucide-react-native";

import { Input } from "@/components/ui/input";

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
};

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Search",
  onClear,
}: SearchInputProps) {
  const hasValue = value.trim().length > 0;

  return (
    <View className="relative flex-1">
      <View className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2">
        <Search size={21} color="#666C63" strokeWidth={2.2} />
      </View>

      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="search"
        className="h-16 rounded-[24px] border border-border bg-card pr-14 pl-[60px] text-[17px]"
      />

      {hasValue && onClear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-muted p-1.5 active:opacity-80"
          onPress={onClear}
        >
          <X size={15} color="#5F655C" strokeWidth={2.6} />
        </Pressable>
      ) : null}
    </View>
  );
}
