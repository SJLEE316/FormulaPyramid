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

interface AppUserInfo {
  uid: string;
  displayName: string;
}

interface RankingScreenProps {
  finalScore: number;
  eliminated: boolean;
  /** 토스인앱 환경의 유저 해시 */
  userHash: string | null;
  /** 네이티브 앱 환경의 Firebase 유저 정보 */
  appUserInfo: AppUserInfo | null;
  /** 네이티브 앱 환경에서 구글 로그인 트리거 */
  onSignIn?: () => void;
  onRestart: () => void;
}

export default function RankingScreen({
  finalScore,
  eliminated,
  userHash,
  appUserInfo,
  onSignIn,
  onRestart,
}: RankingScreenProps) {
  const [nickname, setNickname] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewRecord, setIsNewRecord] = useState(false);
  const hasAutoSubmitted = useRef(false);

  // 토스인앱: userHash 기반 자동 등록
  useEffect(() => {
    if (!userHash || hasAutoSubmitted.current) return;
    hasAutoSubmitted.current = true;
    submitWithHash(userHash);
  }, [userHash]);

  // 네이티브 앱: Firebase UID 기반 자동 등록
  useEffect(() => {
    if (!appUserInfo || hasAutoSubmitted.current) return;
    hasAutoSubmitted.current = true;
    submitWithUid(appUserInfo.uid, appUserInfo.displayName);
  }, [appUserInfo]);

  /** 토스인앱 전용: 해시를 문서 ID로 사용, 최고점만 갱신 */
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

  /** 네이티브 앱 전용: Firebase UID를 문서 ID로 사용, 최고점만 갱신 */
  const submitWithUid = async (uid: string, displayName: string) => {
    setLoading(true);
    setError("");
    try {
      const docRef = doc(db, "rankings", uid);
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        const prevScore = existing.data().score as number;
        if (finalScore > prevScore) {
          await setDoc(
            docRef,
            {
              score: finalScore,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );
          setIsNewRecord(true);
        }
      } else {
        await setDoc(docRef, {
          nickname: displayName,
          score: finalScore,
          uid,
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

  /** 비로그인(일반 브라우저 fallback): 닉네임 직접 입력 후 등록 */
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

  // 네이티브 앱 + 비로그인 상태 → 로그인 유도 UI
  const isNativeNotLoggedIn = onSignIn !== undefined && appUserInfo === null;

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

      {/* 토스인앱: 자동 등록 상태 표시 */}
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
      ) : /* 네이티브 앱 + 구글 로그인 완료: 자동 등록 상태 표시 */
      appUserInfo ? (
        <p className="submitted-msg">
          {loading
            ? "랭킹 등록 중..."
            : submitted
              ? isNewRecord
                ? "🎉 최고 기록 갱신!"
                : "랭킹에 등록되었습니다!"
              : error}
        </p>
      ) : /* 네이티브 앱 + 비로그인: 로그인 유도 */
      isNativeNotLoggedIn ? (
        <div className="nickname-form">
          <p>구글 로그인 후 랭킹에 등록할 수 있어요</p>
          <button className="submit-btn" onClick={onSignIn}>
            🔐 구글 로그인으로 랭킹 등록
          </button>
          <p className="login-skip-msg">로그인하지 않으면 랭킹에 등록되지 않습니다.</p>
        </div>
      ) : /* 일반 브라우저 fallback: 닉네임 직접 입력 */
      !submitted ? (
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
        highlightHash={userHash ?? appUserInfo?.uid ?? undefined}
        highlightScore={submitted ? finalScore : undefined}
      />

      <button className="restart-btn" onClick={onRestart}>
        다시 하기
      </button>
    </div>
  );
}
