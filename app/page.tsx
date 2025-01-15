import { createClient } from "@/utils/supabase/server";
import DashboardPage from "./dashboard/page";
import LandingPage from "./landingpage/page";

export default async function Home() {
  const supabase = await createClient();

  // Check if user is logged in
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return <LandingPage />;
  }

  return <DashboardPage />;
}