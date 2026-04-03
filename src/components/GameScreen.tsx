import { useState, useEffect, useRef, useCallback } from "react";
import { loadFullScreenAd, showFullScreenAd } from "@apps-in-toss/web-framework";
import PyramidBoard from "./PyramidBoard";
import {
  type Cell,
  generateRound,
  findAllAnswers,
  evaluateTriple,
} from "../gameLogic";

const TOTAL_ROUNDS = 10;
const ROUND_TIME = 120;
const MIN_ROUND_SCORE = 3;
const AD_GROUP_ID = "ait.dev.43daa14da3ae487b"; // TODO: 실제 adGroupId로 교체

interface GameScreenProps {
  onGameEnd: (totalScore: number, eliminated: boolean) => void;
}

export default function GameScreen({ onGameEnd }: GameScreenProps) {
  const [round, setRound] = useState(1);
  const [cells, setCells] = useState<Cell[]>([]);
  const [target, setTarget] = useState(0);
  const [allAnswers, setAllAnswers] = useState<string[][]>([]);
  const [foundAnswers, setFoundAnswers] = useState<string[][]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [feedback, setFeedback] = useState<{
    msg: string;
    type: "correct" | "wrong" | "duplicate";
  } | null>(null);
  const [roundEnding, setRoundEnding] = useState(false);
  const [eliminated, setEliminated] = useState(false);
  const [showRevivePrompt, setShowRevivePrompt] = useState(false);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isAdShowing, setIsAdShowing] = useState(false);
  const pendingTotalScoreRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundScoreRef = useRef(0);

  const startRound = useCallback((roundNum: number) => {
    const { cells: newCells, target: newTarget } = generateRound();
    const answers = findAllAnswers(newCells, newTarget);
    setCells(newCells);
    setTarget(newTarget);
    setAllAnswers(answers);
    setFoundAnswers([]);
    setSelectedIds([]);
    setSolvedIds([]);
    setRoundScore(0);
    roundScoreRef.current = 0;
    setTimeLeft(ROUND_TIME);
    setFeedback(null);
    setRoundEnding(false);
    console.log(`[Round ${roundNum}] Target: ${newTarget}, Answers:`, answers);
  }, []);

  // 광고 미리 로드
  useEffect(() => {
    if (!loadFullScreenAd.isSupported()) return;
    const unregister = loadFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === "loaded") setIsAdLoaded(true);
      },
      onError: () => setIsAdLoaded(false),
    });
    return () => unregister();
  }, []);

  useEffect(() => {
    startRound(1);
  }, [startRound]);

  // 타이머
  useEffect(() => {
    if (roundEnding) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          endRound(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [round, roundEnding]);

  const endRound = useCallback(
    (allFound: boolean) => {
      setRoundEnding(true);
      clearInterval(timerRef.current!);

      let bonus = 0;
      if (allFound) {
        const remaining = timeLeft;
        if (remaining >= 60) bonus = 3;
        else if (remaining >= 40) bonus = 2;
        else bonus = 1;
      }

      const currentRoundScore = roundScoreRef.current;
      const finalRoundScore = currentRoundScore + bonus;
      setRoundScore(finalRoundScore);

      const isEliminated = finalRoundScore < MIN_ROUND_SCORE;

      setTotalScore((total) => {
        const newTotal = total + finalRoundScore;
        pendingTotalScoreRef.current = newTotal;
        setTimeout(() => {
          if (isEliminated) {
            setEliminated(true);
            // 광고 지원 시 부활 팝업, 아니면 바로 게임 종료
            if (loadFullScreenAd.isSupported() && isAdLoaded) {
              setShowRevivePrompt(true);
            } else {
              onGameEnd(newTotal, true);
            }
          } else if (round >= TOTAL_ROUNDS) {
            onGameEnd(newTotal, false);
          } else {
            setRound((r) => r + 1);
            startRound(round + 1);
          }
        }, 2000);
        return newTotal;
      });
    },
    [round, timeLeft, onGameEnd, startRound],
  );

  const handleReviveWithAd = () => {
    if (isAdShowing) return;
    setIsAdShowing(true);
    showFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === "dismissed" || event.type === "failedToShow") {
          setIsAdShowing(false);
          setShowRevivePrompt(false);
          setEliminated(false);
          setRoundEnding(false);
          // 다음 광고 미리 로드
          if (loadFullScreenAd.isSupported()) {
            setIsAdLoaded(false);
            loadFullScreenAd({
              options: { adGroupId: AD_GROUP_ID },
              onEvent: (e) => { if (e.type === "loaded") setIsAdLoaded(true); },
              onError: () => setIsAdLoaded(false),
            });
          }
          if (event.type === "dismissed") {
            // 부활 성공 → 다음 라운드 진행
            setRound((r) => r + 1);
            startRound(round + 1);
          } else {
            // 광고 표시 실패 → 게임 종료
            onGameEnd(pendingTotalScoreRef.current, true);
          }
        }
      },
      onError: () => {
        setIsAdShowing(false);
        onGameEnd(pendingTotalScoreRef.current, true);
      },
    });
  };

  const handleGiveUp = () => {
    setShowRevivePrompt(false);
    onGameEnd(pendingTotalScoreRef.current, true);
  };

  const handleCellClick = (id: string) => {
    if (roundEnding) return;
    if (selectedIds.length >= 3) return;
    if (selectedIds.includes(id)) return;
    const next = [...selectedIds, id];
    setSelectedIds(next);
    if (next.length === 3) {
      setTimeout(() => {
        checkAnswer(next);
        setSelectedIds([]);
      }, 50);
    }
  };

  const handleReset = () => {
    setSelectedIds([]);
  };

  const foundAnswersRef = useRef(foundAnswers);
  const allAnswersRef = useRef(allAnswers);
  const cellsRef = useRef(cells);
  const targetRef = useRef(target);
  const endRoundRef = useRef(endRound);

  useEffect(() => {
    foundAnswersRef.current = foundAnswers;
  }, [foundAnswers]);
  useEffect(() => {
    allAnswersRef.current = allAnswers;
  }, [allAnswers]);
  useEffect(() => {
    cellsRef.current = cells;
  }, [cells]);
  useEffect(() => {
    targetRef.current = target;
  }, [target]);
  useEffect(() => {
    endRoundRef.current = endRound;
  }, [endRound]);

  const checkAnswer = useCallback((ids: string[]) => {
    const currentCells = cellsRef.current;
    const currentTarget = targetRef.current;
    const currentFoundAnswers = foundAnswersRef.current;
    const currentAllAnswers = allAnswersRef.current;

    const [c1, c2, c3] = ids.map(
      (id) => currentCells.find((c) => c.id === id)!,
    );
    const result = evaluateTriple(c1, c2, c3);
    const isCorrect = Math.abs(result - currentTarget) < 1e-9;

    const alreadyFound = currentFoundAnswers.some(
      (ans) => ans[0] === ids[0] && ans[1] === ids[1] && ans[2] === ids[2],
    );

    if (isCorrect && !alreadyFound) {
      const newFoundAnswers = [...currentFoundAnswers, ids];
      setFoundAnswers(newFoundAnswers);
      roundScoreRef.current += 1;
      setRoundScore(roundScoreRef.current);
      showFeedback("정답! +1점", "correct");
      if (newFoundAnswers.length >= currentAllAnswers.length) {
        endRoundRef.current(true);
      }
    } else if (isCorrect && alreadyFound) {
      showFeedback("이미 맞춘 정답이에요!", "duplicate");
    } else {
      roundScoreRef.current -= 1;
      setRoundScore(roundScoreRef.current);
      showFeedback("오답! -1점", "wrong");
    }
  }, []);

  const showFeedback = (
    msg: string,
    type: "correct" | "wrong" | "duplicate",
  ) => {
    setFeedback({ msg, type });
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
    feedbackRef.current = setTimeout(() => setFeedback(null), 1200);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  if (cells.length === 0) return null;

  return (
    <div className="game-screen">
      <div className="game-header">
        <div className="game-info">
          <span className="round-label">
            ROUND {round} / {TOTAL_ROUNDS}
          </span>
          <span className="total-score">총점 {totalScore}</span>
        </div>
        <div className={`timer ${timeLeft <= 30 ? "timer-warning" : ""}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="target-display">
        <span className="target-label">타겟 넘버</span>
        <span className="target-number">{target}</span>
      </div>

      <PyramidBoard
        cells={cells}
        selectedIds={selectedIds}
        solvedIds={solvedIds}
        onCellClick={handleCellClick}
      />

      <div className="game-footer">
        <div className="selected-preview">
          {selectedIds.length > 0
            ? `선택: ${selectedIds.join(" → ")}`
            : "칸을 3개 선택하세요"}
        </div>
        <div className="footer-row">
          <div className="round-score">이번 라운드: {roundScore}점</div>
          <button
            className="reset-btn"
            onClick={handleReset}
            disabled={selectedIds.length === 0}
          >
            초기화
          </button>
        </div>
        <div className="answer-progress">
          정답 {foundAnswers.length} / {allAnswers.length}
        </div>
      </div>

      {feedback && (
        <div className={`feedback-toast ${feedback.type}`}>{feedback.msg}</div>
      )}

      {roundEnding && !showRevivePrompt && (
        <div className="round-end-overlay">
          <div className="round-end-box">
            {eliminated ? (
              <>
                <p>💀 탈락!</p>
                <p>이번 라운드 {roundScore}점으로 3점 미달</p>
              </>
            ) : (
              <>
                <p>라운드 {round} 종료!</p>
                <p>획득 점수: {roundScore}점</p>
                {round < TOTAL_ROUNDS ? (
                  <p>다음 라운드 준비 중...</p>
                ) : (
                  <p>게임 종료!</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showRevivePrompt && (
        <div className="round-end-overlay">
          <div className="revive-box">
            <p className="revive-title">💔 탈락!</p>
            <p className="revive-desc">
              광고를 보면<br />탈락이 면제돼요!
            </p>
            <p className="revive-score">이번 라운드 {roundScore}점</p>
            <div className="revive-buttons">
              <button
                className="revive-ad-btn"
                onClick={handleReviveWithAd}
                disabled={isAdShowing || !isAdLoaded}
              >
                {isAdShowing ? "광고 로딩 중..." : isAdLoaded ? "📺 광고 보고 계속하기" : "광고 준비 중..."}
              </button>
              <button className="revive-give-up-btn" onClick={handleGiveUp}>
                포기하고 랭킹 보기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
