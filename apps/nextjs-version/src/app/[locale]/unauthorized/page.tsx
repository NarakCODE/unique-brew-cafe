import { UnauthorizedPage } from "./components/unauthorized-page";

export const metadata = {
  title: "Access Denied | Unique Brew Cafe",
  description:
    "You do not have permission to access this page. Dashboard access is restricted to admin accounts.",
};

export default function Unauthorized() {
  return <UnauthorizedPage />;
}
