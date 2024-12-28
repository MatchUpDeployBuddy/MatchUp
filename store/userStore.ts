import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/utils/supabase/client";
import { Buddy } from "@/types";

interface UserState {
  user: Buddy | null;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
  updateUser: (user: Partial<Buddy>) => void;
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

        // If no user or error, set store to null
        if (error || !user) {
          set({ user: null });
          return;
        }

        // Then fetch the user's profile from DB
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

        // Store the combined user data
        set({
          user: {
            ...userData,
            id: user.id,
            email: user.email,
          },
        });
      },

      clearUser: () => {
        set({ user: null });
      },
      updateUser: (partialUser: Partial<Buddy>) => 
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),
    }),
    {
      name: "user-storage",
    }
  )
);
