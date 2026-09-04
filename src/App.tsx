import { useState, useEffect } from "react";
import GameScreen from "./components/GameScreen";
import HomeScreen from "./components/HomeScreen";
import LoginScreen from "./components/LoginScreen";
import NicknameSetupScreen from "./components/NicknameSetupScreen";
import RankingScreen from "./components/RankingScreen";
import RankingPage from "./components/RankingPage";
import { useTossUser } from "./hooks/useTossUser";
import { useAppUser } from "./hooks/useAppUser";
import { useNickname } from "./hooks/useNickname";
import { isNativeApp } from "./utils/environment";
import "./App.css";

type Screen = "login" | "nickname-setup" | "home" | "game" | "ranking" | "ranking-page";

function App() {
  const nativeApp = isNativeApp();
  // 네이티브 앱은 홈 진입 전 로그인 화면부터 시작 (게스트 스킵 가능)
  const [screen, setScreen] = useState<Screen>(() => (nativeApp ? "login" : "home"));
  // 닉네임 설정 완료 후 되돌아갈 화면
  const [pendingScreen, setPendingScreen] = useState<Screen>("home");
  const [finalScore, setFinalScore] = useState(0);
  const [eliminated, setEliminated] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [nicknameSubmitting, setNicknameSubmitting] = useState(false);

  // 환경에 따라 유저 훅 분기
  const tossUser = useTossUser(); // 네이티브 앱에서는 즉시 fallback 반환
  const appUser = useAppUser();   // Firebase Auth (구글 로그인, 네이티브/웹 공용)

  // 토스인앱: 해시 기반 / 그 외(네이티브 앱, 일반 웹): 구글 로그인 UID 기반
  const userHash = !nativeApp && tossUser.status === "hash" ? tossUser.hash : null;
  const googleUid = appUser.state.status === "signed-in" ? appUser.state.user.uid : null;
  const identityId = userHash ?? googleUid;

  // 닉네임은 개인정보(구글 실명) 노출을 피하기 위해 별도 저장하고 한 번 설정하면 수정 불가
  const { nickname, registerNickname } = useNickname(identityId);

  // 이미 로그인되어 있으면(세션 유지) 로그인 화면을 건너뜀
  useEffect(() => {
    if (screen === "login" && appUser.state.status === "signed-in") {
      setScreen("home");
    }
  }, [screen, appUser.state.status]);

  // 로그인된 유저(토스/구글)가 닉네임을 아직 설정하지 않았다면 닉네임 설정 화면으로 유도
  useEffect(() => {
    if (identityId && nickname === null && (screen === "home" || screen === "ranking")) {
      setPendingScreen(screen);
      setScreen("nickname-setup");
    }
  }, [identityId, nickname, screen]);

  const handleSignIn = async () => {
    setSigningIn(true);
    await appUser.signIn();
    setSigningIn(false);
  };

  const handleSignOut = async () => {
    const success = await appUser.signOut();
    if (success) {
      alert("로그아웃되었습니다.");
      setScreen("login");
    }
  };

  const handleNicknameSubmit = async (name: string) => {
    setNicknameSubmitting(true);
    await registerNickname(name);
    setNicknameSubmitting(false);
    setScreen(pendingScreen);
  };

  const handleGameEnd = (score: number, isEliminated: boolean) => {
    setFinalScore(score);
    setEliminated(isEliminated);
    setScreen("ranking");
  };

  const handleRestart = () => {
    setScreen("home");
  };

  if (screen === "login") {
    return (
      <LoginScreen
        loading={signingIn || appUser.state.status === "loading"}
        onSignIn={handleSignIn}
        onSkip={() => setScreen("home")}
      />
    );
  }

  if (screen === "nickname-setup") {
    return (
      <NicknameSetupScreen
        loading={nicknameSubmitting}
        onSubmit={handleNicknameSubmit}
      />
    );
  }

  if (screen === "game") {
    return <GameScreen onGameEnd={handleGameEnd} />;
  }

  if (screen === "ranking") {
    return (
      <RankingScreen
        finalScore={finalScore}
        eliminated={eliminated}
        userId={identityId}
        nickname={nickname ?? null}
        onSignIn={identityId ? undefined : handleSignIn}
        onRestart={handleRestart}
      />
    );
  }

  if (screen === "ranking-page") {
    return <RankingPage onBack={() => setScreen("home")} />;
  }

  return (
    <HomeScreen
      onStart={() => setScreen("game")}
      onRanking={() => setScreen("ranking-page")}
      isSignedIn={googleUid !== null}
      onSignOut={handleSignOut}
    />
  );
}

export default App;
