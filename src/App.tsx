import { useState } from "react";
import GameScreen from "./components/GameScreen";
import HomeScreen from "./components/HomeScreen";
import RankingScreen from "./components/RankingScreen";
import RankingPage from "./components/RankingPage";
import { useTossUser } from "./hooks/useTossUser";
import "./App.css";

type Screen = "home" | "game" | "ranking" | "ranking-page";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [finalScore, setFinalScore] = useState(0);
  const [eliminated, setEliminated] = useState(false);
  const tossUser = useTossUser();

  const handleGameEnd = (score: number, isEliminated: boolean) => {
    setFinalScore(score);
    setEliminated(isEliminated);
    setScreen("ranking");
  };

  const handleRestart = () => {
    setScreen("home");
  };

  const userHash = tossUser.status === "hash" ? tossUser.hash : null;

  if (screen === "game") {
    return <GameScreen onGameEnd={handleGameEnd} />;
  }

  if (screen === "ranking") {
    return (
      <RankingScreen
        finalScore={finalScore}
        eliminated={eliminated}
        userHash={userHash}
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
