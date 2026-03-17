import { AccountActionHeader } from "@/components/account/account-action-header";
import { StoreList } from "@/components/store/StoreList";

export default function AccountStoresScreen() {
  return <StoreList headerComponent={<AccountActionHeader title="Stores" />} />;
}
