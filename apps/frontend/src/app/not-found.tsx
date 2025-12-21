"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();
    return (
        <div className="flex h-screen flex-col items-center justify-center space-y-4 text-center">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-xl text-muted-foreground">Page not found</p>
            <Button onClick={() => router.back()}>Back</Button>
        </div>
    );
}
