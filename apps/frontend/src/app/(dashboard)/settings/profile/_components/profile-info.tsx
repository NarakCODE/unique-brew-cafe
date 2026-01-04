import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { User } from "@/types";
import { ProfileInfoForm } from "./profile-info-form";

export function ProfileInfo({ user }: { user: User }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                    Update your public profile details.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ProfileInfoForm user={user} />
            </CardContent>
        </Card>
    );
}
