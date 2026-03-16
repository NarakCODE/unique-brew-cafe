import { GlobalSearch } from "@/components/search/GlobalSearch";
import { ScreenLayout } from "@/components/layout/screen-layout";

export default function SearchScreen() {
  return (
    <ScreenLayout contentClassName="px-4">
      <GlobalSearch autoFocus />
    </ScreenLayout>
  );
}
