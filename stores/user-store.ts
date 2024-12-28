import { Buddy } from '@/types';
import { createStore } from 'zustand';

export type UserState = {
    user: Buddy | null;
}

export type UserActions = {
    setUser: (user: Buddy | null) => void;
}

export type UserStore = UserState & UserActions;

export const defaultUserState: UserState = {
    user: null,
}

export const createUserStore = (initState: UserState = defaultUserState)=> {
    return createStore<UserStore>((set) => ({
        ...initState,
        setUser: (user: Buddy | null) => set({ user }),
    }));
}