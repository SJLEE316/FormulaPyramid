import { useState, useEffect } from "react";
import { getUserKeyForGame } from "@apps-in-toss/web-framework";
import { isNativeApp } from "../utils/environment";

export type TossUserState =
  | { status: "loading" }
  | { status: "hash"; hash: string }
  | { status: "fallback" }; // 토스앱 외 환경

export function useTossUser(): TossUserState {
  const [state, setState] = useState<TossUserState>({ status: "loading" });

  useEffect(() => {
    // 네이티브 앱 환경에서는 토스 SDK를 호출하지 않음
    if (isNativeApp()) {
      setState({ status: "fallback" });
      return;
    }

    getUserKeyForGame()
      .then((result) => {
        if (!result || result === "INVALID_CATEGORY" || result === "ERROR") {
          setState({ status: "fallback" });
          return;
        }
        if (result.type === "HASH") {
          setState({ status: "hash", hash: result.hash });
        } else {
          setState({ status: "fallback" });
        }
      })
      .catch(() => {
        setState({ status: "fallback" });
      });
  }, []);

  return state;
}
