import { useState, useEffect, useRef, useCallback } from 'react'
import PyramidBoard from './PyramidBoard'
import { type Cell, generateRound, findAllAnswers, evaluateTriple } from '../gameLogic'

const TOTAL_ROUNDS = 10
const ROUND_TIME = 180

interface GameScreenProps {
  onGameEnd: (totalScore: number) => void
}

export default function GameScreen({ onGameEnd }: GameScreenProps) {
  const [round, setRound] = useState(1)
  const [cells, setCells] = useState<Cell[]>([])
  const [target, setTarget] = useState(0)
  const [allAnswers, setAllAnswers] = useState<string[][]>([])
  const [foundAnswers, setFoundAnswers] = useState<string[][]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [solvedIds, setSolvedIds] = useState<string[]>([])
  const [roundScore, setRoundScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME)
  const [feedback, setFeedback] = useState<{ msg: string; type: 'correct' | 'wrong' } | null>(null)
  const [roundEnding, setRoundEnding] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const roundScoreRef = useRef(0)

  const startRound = useCallback((roundNum: number) => {
    const { cells: newCells, target: newTarget } = generateRound()
    const answers = findAllAnswers(newCells, newTarget)
    setCells(newCells)
    setTarget(newTarget)
    setAllAnswers(answers)
    setFoundAnswers([])
    setSelectedIds([])
    setSolvedIds([])
    setRoundScore(0)
    roundScoreRef.current = 0
    setTimeLeft(ROUND_TIME)
    setFeedback(null)
    setRoundEnding(false)
    console.log(`[Round ${roundNum}] Target: ${newTarget}, Answers:`, answers)
  }, [])

  useEffect(() => {
    startRound(1)
  }, [startRound])

  // 타이머
  useEffect(() => {
    if (roundEnding) return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          endRound(false)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [round, roundEnding])

  const endRound = useCallback(
    (allFound: boolean) => {
      setRoundEnding(true)
      clearInterval(timerRef.current!)

      let bonus = 0
      if (allFound) {
        const remaining = timeLeft
        if (remaining >= 60) bonus = 5
        else if (remaining >= 30) bonus = 3
        else bonus = 1
      }

      const currentRoundScore = roundScoreRef.current
      const finalRoundScore = currentRoundScore + bonus
      setRoundScore(finalRoundScore)

      setTotalScore((total) => {
        const newTotal = total + finalRoundScore
        setTimeout(() => {
          if (round >= TOTAL_ROUNDS) {
            onGameEnd(newTotal)
          } else {
            setRound((r) => r + 1)
            startRound(round + 1)
          }
        }, 2000)
        return newTotal
      })
    },
    [round, timeLeft, onGameEnd, startRound]
  )

  const handleCellClick = (id: string) => {
    if (roundEnding) return
    if (selectedIds.length >= 3) return
    if (selectedIds.includes(id)) return
    const next = [...selectedIds, id]
    setSelectedIds(next)
    if (next.length === 3) {
      setTimeout(() => {
        checkAnswer(next)
        setSelectedIds([])
      }, 50)
    }
  }

  const handleReset = () => {
    setSelectedIds([])
  }

  const foundAnswersRef = useRef(foundAnswers)
  const allAnswersRef = useRef(allAnswers)
  const cellsRef = useRef(cells)
  const targetRef = useRef(target)
  const endRoundRef = useRef(endRound)

  useEffect(() => { foundAnswersRef.current = foundAnswers }, [foundAnswers])
  useEffect(() => { allAnswersRef.current = allAnswers }, [allAnswers])
  useEffect(() => { cellsRef.current = cells }, [cells])
  useEffect(() => { targetRef.current = target }, [target])
  useEffect(() => { endRoundRef.current = endRound }, [endRound])

  const checkAnswer = useCallback((ids: string[]) => {
    const currentCells = cellsRef.current
    const currentTarget = targetRef.current
    const currentFoundAnswers = foundAnswersRef.current
    const currentAllAnswers = allAnswersRef.current

    const [c1, c2, c3] = ids.map((id) => currentCells.find((c) => c.id === id)!)
    const result = evaluateTriple(c1, c2, c3)
    const isCorrect = Math.abs(result - currentTarget) < 1e-9

    const alreadyFound = currentFoundAnswers.some(
      (ans) => ans[0] === ids[0] && ans[1] === ids[1] && ans[2] === ids[2]
    )

    if (isCorrect && !alreadyFound) {
      const newFoundAnswers = [...currentFoundAnswers, ids]
      setFoundAnswers(newFoundAnswers)
      roundScoreRef.current += 1
      setRoundScore(roundScoreRef.current)
      showFeedback('정답! +1점', 'correct')
      if (newFoundAnswers.length >= currentAllAnswers.length) {
        endRoundRef.current(true)
      }
    } else {
      roundScoreRef.current -= 1
      setRoundScore(roundScoreRef.current)
      showFeedback('오답! -1점', 'wrong')
    }
  }, [])

  const showFeedback = (msg: string, type: 'correct' | 'wrong') => {
    setFeedback({ msg, type })
    if (feedbackRef.current) clearTimeout(feedbackRef.current)
    feedbackRef.current = setTimeout(() => setFeedback(null), 1200)
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  if (cells.length === 0) return null

  return (
    <div className="game-screen">
      <div className="game-header">
        <div className="game-info">
          <span className="round-label">ROUND {round} / {TOTAL_ROUNDS}</span>
          <span className="total-score">총점 {totalScore}</span>
        </div>
        <div className={`timer ${timeLeft <= 30 ? 'timer-warning' : ''}`}>
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
            ? `선택: ${selectedIds.join(' → ')}`
            : '칸을 3개 선택하세요'}
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
        <div className={`feedback-toast ${feedback.type}`}>
          {feedback.msg}
        </div>
      )}

      {roundEnding && (
        <div className="round-end-overlay">
          <div className="round-end-box">
            <p>라운드 {round} 종료!</p>
            <p>획득 점수: {roundScore}점</p>
            {round < TOTAL_ROUNDS ? <p>다음 라운드 준비 중...</p> : <p>게임 종료!</p>}
          </div>
        </div>
      )}
    </div>
  )
}
