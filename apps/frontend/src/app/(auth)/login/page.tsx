import { Login } from "@/components/auth/login";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Corner Coffee Admin",
    description: "Login to your admin account",
};

export default function LoginPage() {
    return <Login />;
}
