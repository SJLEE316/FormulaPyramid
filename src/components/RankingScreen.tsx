import { useState, useEffect } from 'react'
import { db } from '../firebase'
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'

interface RankingEntry {
  id: string
  nickname: string
  score: number
  createdAt: any
}

interface RankingScreenProps {
  finalScore: number
  userHash: string | null
  onRestart: () => void
}

export default function RankingScreen({ finalScore, userHash, onRestart }: RankingScreenProps) {
  const [nickname, setNickname] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [rankings, setRankings] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'rankings'), orderBy('score', 'desc'), limit(20))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<RankingEntry, 'id'>),
      }))
      setRankings(data)
    })
    return () => unsubscribe()
  }, [])

  const submitRanking = async (name: string) => {
    setLoading(true)
    setError('')
    try {
      await addDoc(collection(db, 'rankings'), {
        nickname: name,
        score: finalScore,
        ...(userHash ? { userHash } : {}),
        createdAt: serverTimestamp(),
      })
      setSubmitted(true)
    } catch (e) {
      setError('등록 중 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  // 토스앱 환경: 닉네임 입력 없이 hash로 자동 등록 (hash를 닉네임으로 축약)
  useEffect(() => {
    if (userHash && !submitted) {
      const shortName = userHash.slice(0, 8)
      submitRanking(shortName)
    }
  }, [userHash])

  const handleSubmit = async () => {
    const trimmed = nickname.trim()
    if (!trimmed) {
      setError('닉네임을 입력해 주세요.')
      return
    }
    if (trimmed.length > 12) {
      setError('닉네임은 12자 이하로 입력해 주세요.')
      return
    }
    await submitRanking(trimmed)
  }

  return (
    <div className="ranking-screen">
      <h2 className="ranking-title">게임 종료!</h2>
      <div className="final-score-display">
        최종 점수: <strong>{finalScore}점</strong>
      </div>

      {userHash ? (
        <p className="submitted-msg">
          {submitted ? '랭킹에 등록되었습니다!' : loading ? '등록 중...' : ''}
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
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            maxLength={12}
          />
          {error && <p className="input-error">{error}</p>}
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? '등록 중...' : '랭킹 등록'}
          </button>
        </div>
      ) : (
        <p className="submitted-msg">랭킹에 등록되었습니다!</p>
      )}

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
            {rankings.map((entry, idx) => (
              <tr
                key={entry.id}
                className={submitted && entry.nickname === nickname.trim() && entry.score === finalScore ? 'my-rank' : ''}
              >
                <td>{idx + 1}</td>
                <td>{entry.nickname}</td>
                <td>{entry.score}점</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="restart-btn" onClick={onRestart}>
        다시 하기
      </button>
    </div>
  )
}
