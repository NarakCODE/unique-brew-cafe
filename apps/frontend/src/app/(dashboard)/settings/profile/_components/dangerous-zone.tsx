import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DeleteAccountForm } from "./delete-account-form";
import { User } from "@/types";
import { EmptyState } from "@/components/common/empty-state";

interface DangerousZoneProps {
    user: User;
}

export function DangerousZone({ user }: DangerousZoneProps) {
    if (!user) {
        return <EmptyState title="User not found" />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dangerous Zone</CardTitle>
                <CardDescription>
                    Manage sensitive settings, such as account deletion or
                    deactivation. Proceed with caution.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DeleteAccountForm />
            </CardContent>
        </Card>
    );
}
