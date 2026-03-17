import { AccountActionHeader } from "@/components/account/account-action-header";
import { AccountDetailScreen } from "@/components/account/account-detail-screen";

export default function CustomerServiceScreen() {
  return (
    <AccountDetailScreen header={<AccountActionHeader title="Customer Service" />} />
  );
}
