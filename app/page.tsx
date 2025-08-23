import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to dashboard page
  redirect("/dashboard");

  // This return will never be reached due to the redirect
  return null;
}
