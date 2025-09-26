import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params?: Promise<{ id: string }>;
}) {
  const p = params ? await params : undefined;
  const id = p?.id;
  if (!id) {
    // If params are missing, redirect to dashboard main page
    redirect(`/dashboard/courses`);
    return;
  }
  const target = `/dashboard/courses?courseId=${id}#rate`;
  // Server-side redirect to the dashboard deep-link which already loads the course detail UI
  redirect(target);
}
