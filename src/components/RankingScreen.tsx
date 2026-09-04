import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import RankingList from "./RankingList";
import GoogleSignInButton from "./GoogleSignInButton";

interface RankingScreenProps {
  finalScore: number;
  eliminated: boolean;
  /** 구글 UID 또는 토스 유저 해시 (비로그인 게스트는 null) */
  userId: string | null;
  /** userId에 연결된 닉네임 (실명 대신 랭킹에 표시) */
  nickname: string | null;
  /** 게스트일 때 로그인을 유도하기 위한 콜백 */
  onSignIn?: () => void;
  onRestart: () => void;
}

export default function RankingScreen({
  finalScore,
  eliminated,
  userId,
  nickname,
  onSignIn,
  onRestart,
}: RankingScreenProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewRecord, setIsNewRecord] = useState(false);
  const hasAutoSubmitted = useRef(false);

  // 로그인 + 닉네임 설정이 완료된 유저는 자동으로 랭킹 등록 (최고점만 갱신)
  useEffect(() => {
    if (!userId || !nickname || hasAutoSubmitted.current) return;
    hasAutoSubmitted.current = true;
    submitRanking(userId, nickname);
  }, [userId, nickname]);

  const submitRanking = async (id: string, name: string) => {
    setLoading(true);
    setError("");
    try {
      const docRef = doc(db, "rankings", id);
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        const prevScore = existing.data().score as number;
        if (finalScore > prevScore) {
          await setDoc(
            docRef,
            {
              nickname: name,
              score: finalScore,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );
          setIsNewRecord(true);
        }
      } else {
        await setDoc(docRef, {
          nickname: name,
          score: finalScore,
          createdAt: serverTimestamp(),
        });
      }
      setSubmitted(true);
    } catch (e) {
      setError("등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ranking-screen">
      <h2 className="ranking-title">
        {eliminated ? "💀 탈락!" : "게임 종료!"}
      </h2>
      <div className="final-score-display">
        {eliminated && (
          <p className="elim-msg">라운드 점수 3점 미달로 탈락했습니다.</p>
        )}
        최종 점수: <strong>{finalScore}점</strong>
      </div>

      {/* 게스트: 로그인하지 않으면 랭킹에 기록되지 않음 */}
      {!userId ? (
        <div className="nickname-form">
          <p>로그인 후 랭킹에 등록할 수 있어요</p>
          <GoogleSignInButton loading={false} onClick={onSignIn ?? (() => {})} />
          <p className="login-skip-msg">로그인하지 않으면 랭킹에 등록되지 않습니다.</p>
        </div>
      ) : (
        <p className="submitted-msg">
          {loading
            ? "랭킹 등록 중..."
            : submitted
              ? isNewRecord
                ? "🎉 최고 기록 갱신!"
                : "랭킹에 등록되었습니다!"
              : error}
        </p>
      )}

      <RankingList highlightId={userId} />

      <button className="restart-btn" onClick={onRestart}>
        다시 하기
      </button>
    </div>
  );
}

