import { Button } from "@/components/ui/button";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <Button variant="default" asChild>
                <Link href="/dashboard">
                    <HugeiconsIcon icon={SparklesIcon} />
                    <span>Dashboard</span>
                </Link>
            </Button>
        </div>
    );
}
