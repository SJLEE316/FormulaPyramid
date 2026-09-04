import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export interface UseNicknameReturn {
  /** undefined: 조회 중, null: 미설정(또는 미로그인), string: 설정된 닉네임 */
  nickname: string | null | undefined;
  registerNickname: (name: string) => Promise<void>;
}

/**
 * 유저 식별자(구글 UID 또는 토스 유저 해시)에 연결된 닉네임을 조회/등록하는 훅.
 * 닉네임은 `users/{identityId}` 문서에 저장되며, 한 번 설정되면 이 훅에서는 재수정을 지원하지 않음(불변).
 */
export function useNickname(identityId: string | null): UseNicknameReturn {
  const [nickname, setNickname] = useState<string | null | undefined>(
    identityId ? undefined : null,
  );

  useEffect(() => {
    if (!identityId) {
      setNickname(null);
      return;
    }
    setNickname(undefined);
    let cancelled = false;
    getDoc(doc(db, "users", identityId))
      .then((snap) => {
        if (cancelled) return;
        setNickname(snap.exists() ? (snap.data().nickname as string) : null);
      })
      .catch(() => {
        if (!cancelled) setNickname(null);
      });
    return () => {
      cancelled = true;
    };
  }, [identityId]);

  const registerNickname = useCallback(
    async (name: string) => {
      if (!identityId) return;
      await setDoc(doc(db, "users", identityId), {
        nickname: name,
        createdAt: serverTimestamp(),
      });
      setNickname(name);
    },
    [identityId],
  );

  return { nickname, registerNickname };
}
