import { useState } from "react";
import GameScreen from "./components/GameScreen";
import HomeScreen from "./components/HomeScreen";
import RankingScreen from "./components/RankingScreen";
import RankingPage from "./components/RankingPage";
import { useTossUser } from "./hooks/useTossUser";
import { useAppUser } from "./hooks/useAppUser";
import { isNativeApp } from "./utils/environment";
import "./App.css";

type Screen = "home" | "game" | "ranking" | "ranking-page";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [finalScore, setFinalScore] = useState(0);
  const [eliminated, setEliminated] = useState(false);

  // 환경에 따라 유저 훅 분기
  const tossUser = useTossUser(); // 네이티브 앱에서는 즉시 fallback 반환
  const appUser = useAppUser();   // Firebase Auth (네이티브 앱 환경에서 실제 사용)

  const nativeApp = isNativeApp();

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
