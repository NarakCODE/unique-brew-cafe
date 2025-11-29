import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="flex h-[80vh] flex-col items-center justify-center space-y-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-500" />
            </div>
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground max-w-md">
                You do not have permission to access this page. Please contact
                your administrator if you believe this is an error.
            </p>
            <Button asChild variant="outline">
                <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
        </div>
    );
}
