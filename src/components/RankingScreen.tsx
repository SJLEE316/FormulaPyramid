import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import RankingList from "./RankingList";

interface RankingScreenProps {
  finalScore: number;
  eliminated: boolean;
  userHash: string | null;
  onRestart: () => void;
}

export default function RankingScreen({
  finalScore,
  eliminated,
  userHash,
  onRestart,
}: RankingScreenProps) {
  const [nickname, setNickname] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewRecord, setIsNewRecord] = useState(false);
  const hasAutoSubmitted = useRef(false);

  // 토스앱 환경: userHash를 문서 ID로 사용해 중복 방지, 최고점만 갱신
  useEffect(() => {
    if (!userHash || hasAutoSubmitted.current) return;
    hasAutoSubmitted.current = true;
    submitWithHash(userHash);
  }, [userHash]);

  const submitWithHash = async (hash: string) => {
    setLoading(true);
    setError("");
    try {
      const docRef = doc(db, "rankings", hash);
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        const prevScore = existing.data().score as number;
        if (finalScore > prevScore) {
          await setDoc(
            docRef,
            {
              nickname: existing.data().nickname,
              score: finalScore,
              userHash: hash,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );
          setIsNewRecord(true);
        }
      } else {
        await setDoc(docRef, {
          nickname: `토스유저_${hash.slice(-4)}`,
          score: finalScore,
          userHash: hash,
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

  const submitRanking = async (name: string) => {
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "rankings"), {
        nickname: name,
        score: finalScore,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (e) {
      setError("등록 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    if (trimmed.length > 12) {
      setError("닉네임은 12자 이하로 입력해 주세요.");
      return;
    }
    await submitRanking(trimmed);
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

      {userHash ? (
        <p className="submitted-msg">
          {loading
            ? "랭킹 등록 중..."
            : submitted
              ? isNewRecord
                ? "🎉 최고 기록 갱신!"
                : "랭킹에 등록되었습니다!"
              : error}
        </p>
      ) : !submitted ? (
        <div className="nickname-form">
          <p>닉네임을 입력하고 랭킹에 등록하세요</p>
          <input
            className="nickname-input"
            type="text"
            placeholder="닉네임 입력 (최대 12자)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            maxLength={12}
          />
          {error && <p className="input-error">{error}</p>}
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "등록 중..." : "랭킹 등록"}
          </button>
        </div>
      ) : (
        <p className="submitted-msg">랭킹에 등록되었습니다!</p>
      )}

      <RankingList
        highlightHash={userHash}
        highlightScore={submitted ? finalScore : undefined}
      />

      <button className="restart-btn" onClick={onRestart}>
        다시 하기
      </button>
    </div>
  );
}
