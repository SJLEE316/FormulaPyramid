import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import {
  GoogleAuthProvider,
  signInWithCredential,
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
      if (Capacitor.isNativePlatform()) {
        // 네이티브 WebView는 스토리지 파티셔닝으로 popup/redirect 로그인이 불가능 → 네이티브 Google Sign-In 사용
        const result = await FirebaseAuthentication.signInWithGoogle();
        const idToken = result.credential?.idToken;
        if (!idToken) throw new Error("Google idToken을 받지 못했습니다.");
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (e) {
      console.error("Google 로그인 실패:", e);
    }
  };

  const signOut = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await FirebaseAuthentication.signOut();
      }
      await firebaseSignOut(auth);
    } catch (e) {
      console.error("로그아웃 실패:", e);
    }
  };

  return { state, signIn, signOut };
}
