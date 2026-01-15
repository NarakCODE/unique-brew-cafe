import { PageHeader } from "@/components/page-header";
import { StoreForm } from "../components/store-form";
import { BackBtn } from "@/components/back-btn";

export default function CreateStorePage() {
  return (
    <div className="flex h-full flex-1 flex-col space-y-8 md:flex">
      <BackBtn href="/dashboard/stores" label="Back to Stores" />{" "}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Create Store"
          description="Add a new store to the system."
        />
      </div>
      <StoreForm />
    </div>
  );
}
