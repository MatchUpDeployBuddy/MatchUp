import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/utils/supabase/client";
import { Buddy } from "@/types";

interface UserState {
  user: Buddy | null;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create(
  persist<UserState>(
    (set) => ({
      user: null,
      fetchUser: async () => {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          set({ user: null });
          return;
        }

        // Fetch additional user data (account-creation)
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        if (userError) {
          console.error("Error fetching user data:", userError);
          set({ user: null });
          return;
        }

        set({
          user: {
            ...userData,
            id: user.id,
            email: user.email,
          },
        });
      },
    }),
    {
      name: "user-storage",
    }
  )
);
