import { Suspense } from 'react';
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import BuddysClient from './buddys-client';

export default async function BuddysPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/login");
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BuddysClient />
    </Suspense>
  );
}

