"use client";

import { useProfile } from "@/hooks";
import { DangerousZone } from "./_components/dangerous-zone";
import { ProfileInfo } from "./_components/profile-info";

export default function ProfileInfoPage() {
    const { data: userData, isLoading, isError, error } = useProfile();

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error: {error.message}</div>;

    return (
        <div className="grid gap-4">
            <ProfileInfo user={userData!} />
            <DangerousZone user={userData!} />
        </div>
    );
}
