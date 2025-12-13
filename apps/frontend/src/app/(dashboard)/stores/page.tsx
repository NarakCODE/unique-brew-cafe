import { DataTable } from "@/components/ui/data-table";
import data from "./data.json";

export default function StoresPage() {
    return (
        <div>
            <DataTable data={data} />
        </div>
    );
}
