import { create } from "zustand";
import { persist } from "zustand/middleware";
import OneSignal from "react-onesignal";

interface OneSignalSate {
    isInitialized: boolean;
    initializeOneSignal: (userId: string) => void;
    subscribe: () => Promise<boolean>;
    unsubscribe: () => Promise<boolean>;
}

export const useOneSignalStore = create<OneSignalSate>()(
    (set, get) => ({
        isInitialized: false,
        initializeOneSignal: async (userId: string) => {
            if (get().isInitialized) {
                console.log("User already initalized")
                return;
            }

            try {
                console.log("Start OneSignal-Initialization...");
                await OneSignal.init({
                    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
                    notifyButton: {
                        enable: true,
                    },
                    allowLocalhostAsSecureOrigin: true,
                });
                console.log("OneSignal successfully initialized.");

                await OneSignal.login(userId);
                console.log(
                    "OneSignal successfully signed in user:",
                    userId
                );
                set({ isInitialized: true });
            } catch (err) {
                console.error("Error with OneSignal-Initialization:", err);
            }
        },
        subscribe: async () => {
            try {
                await OneSignal.User.PushSubscription.optIn()
                console.log("User subscribed to push notifications");
                return true;
                } catch (err) {
                console.error("Error subscribing to notifications:", err);
                return false;
                }
        },
        unsubscribe: async () => {
            try {
                await OneSignal.User.PushSubscription.optOut()
                console.log("User unsubscribed to push notifications");
                return true;
                } catch (err) {
                console.error("Error unsubscribing from notifications:", err);
                return false;
                }
        }
    }),
)