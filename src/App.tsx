import { useState, useEffect } from "react";
import GameScreen from "./components/GameScreen";
import HomeScreen from "./components/HomeScreen";
import LoginScreen from "./components/LoginScreen";
import RankingScreen from "./components/RankingScreen";
import RankingPage from "./components/RankingPage";
import { useTossUser } from "./hooks/useTossUser";
import { useAppUser } from "./hooks/useAppUser";
import { isNativeApp } from "./utils/environment";
import "./App.css";

type Screen = "login" | "home" | "game" | "ranking" | "ranking-page";

function App() {
  const nativeApp = isNativeApp();
  // 네이티브 앱은 홈 진입 전 로그인 화면부터 시작 (게스트 스킵 가능)
  const [screen, setScreen] = useState<Screen>(() => (nativeApp ? "login" : "home"));
  const [finalScore, setFinalScore] = useState(0);
  const [eliminated, setEliminated] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // 환경에 따라 유저 훅 분기
  const tossUser = useTossUser(); // 네이티브 앱에서는 즉시 fallback 반환
  const appUser = useAppUser();   // Firebase Auth (네이티브 앱 환경에서 실제 사용)

  // 이미 로그인되어 있으면(세션 유지) 로그인 화면을 건너뜀
  useEffect(() => {
    if (screen === "login" && appUser.state.status === "signed-in") {
      setScreen("home");
    }
  }, [screen, appUser.state.status]);

  const handleSignIn = async () => {
    setSigningIn(true);
    await appUser.signIn();
    setSigningIn(false);
  };

  const handleGameEnd = (score: number, isEliminated: boolean) => {
    setFinalScore(score);
    setEliminated(isEliminated);
    setScreen("ranking");
  };

  const handleRestart = () => {
    setScreen("home");
  };

  // 토스인앱: 해시 기반 / 네이티브 앱: Firebase UID 기반
  const userHash = !nativeApp && tossUser.status === "hash" ? tossUser.hash : null;
  const appUserInfo =
    nativeApp && appUser.state.status === "signed-in"
      ? { uid: appUser.state.user.uid, displayName: appUser.state.user.displayName ?? "앱유저" }
      : null;

  if (screen === "login") {
    return (
      <LoginScreen
        loading={signingIn || appUser.state.status === "loading"}
        onSignIn={handleSignIn}
        onSkip={() => setScreen("home")}
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
        userHash={userHash}
        appUserInfo={appUserInfo}
        onSignIn={nativeApp ? appUser.signIn : undefined}
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
    />
  );
}

export default App;
