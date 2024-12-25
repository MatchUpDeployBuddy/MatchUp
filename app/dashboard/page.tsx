import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardComponent from "@/components/dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check if user is logged in
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  // Pass the user ID to the client component
  return <DashboardComponent userId={data.user.id} />;
}
