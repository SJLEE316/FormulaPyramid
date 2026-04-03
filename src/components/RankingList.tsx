import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

interface RankingEntry {
  id: string;
  nickname: string;
  score: number;
  userHash?: string;
}

interface RankingListProps {
  highlightHash?: string | null;
  highlightScore?: number;
}

export default function RankingList({
  highlightHash,
  highlightScore,
}: RankingListProps) {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "rankings"),
      orderBy("score", "desc"),
      limit(20),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRankings(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<RankingEntry, "id">),
        })),
      );
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="ranking-list">
      <h3>TOP 20 랭킹</h3>
      <table>
        <thead>
          <tr>
            <th>순위</th>
            <th>닉네임</th>
            <th>점수</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((entry, idx) => {
            const isMe =
              highlightScore !== undefined &&
              entry.score === highlightScore &&
              (highlightHash
                ? entry.id === highlightHash || entry.userHash === highlightHash
                : false);
            return (
              <tr key={entry.id} className={isMe ? "my-rank" : ""}>
                <td>{idx + 1}</td>
                <td>{entry.nickname}</td>
                <td>{entry.score}점</td>
              </tr>
            );
          })}
          {rankings.length === 0 && (
            <tr>
              <td colSpan={3} style={{ color: "#c9a0dc", padding: "1rem" }}>
                아직 기록이 없어요!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
