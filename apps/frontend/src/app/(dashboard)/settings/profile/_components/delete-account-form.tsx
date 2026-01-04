"use client";

import { Button } from "@/components/ui/button";

export function DeleteAccountForm() {
    return (
        <div className="flex gap-x-2">
            <Button variant={"outline"}>Disable Account</Button>
            <Button variant={"destructive"}>Delete Account</Button>
        </div>
    );
}
