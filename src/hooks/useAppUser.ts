import { useState, useEffect } from "react";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export type AppUserState =
  | { status: "loading" }
  | { status: "signed-in"; user: User }
  | { status: "signed-out" };

export interface UseAppUserReturn {
  state: AppUserState;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Firebase Auth 기반 구글 로그인 훅 (네이티브 앱 환경 전용)
 */
export function useAppUser(): UseAppUserReturn {
  const [state, setState] = useState<AppUserState>({ status: "loading" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setState({ status: "signed-in", user });
      } else {
        setState({ status: "signed-out" });
      }
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Google 로그인 실패:", e);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error("로그아웃 실패:", e);
    }
  };

  return { state, signIn, signOut };
}
