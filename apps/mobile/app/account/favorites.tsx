import { AccountActionHeader } from "@/components/account/account-action-header";
import { FavoritesScreenContent } from "@/components/favorite/favorites-screen-content";

export default function AccountFavoritesScreen() {
  return (
    <FavoritesScreenContent
      showTitle={false}
      bottomInsetOffset={36}
      headerComponent={<AccountActionHeader title="Favorites" />}
    />
  );
}
