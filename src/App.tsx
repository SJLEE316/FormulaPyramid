import { useState } from 'react'
import GameScreen from './components/GameScreen'
import RankingScreen from './components/RankingScreen'
import RankingPage from './components/RankingPage'
import { useTossUser } from './hooks/useTossUser'
import './App.css'

type Screen = 'home' | 'game' | 'ranking' | 'ranking-page'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [finalScore, setFinalScore] = useState(0)
  const tossUser = useTossUser()

  const handleGameEnd = (score: number) => {
    setFinalScore(score)
    setScreen('ranking')
  }

  const handleRestart = () => {
    setScreen('home')
  }

  const userHash = tossUser.status === 'hash' ? tossUser.hash : null

  if (screen === 'game') {
    return <GameScreen onGameEnd={handleGameEnd} />
  }

  if (screen === 'ranking') {
    return <RankingScreen finalScore={finalScore} userHash={userHash} onRestart={handleRestart} />
  }

  if (screen === 'ranking-page') {
    return <RankingPage onBack={() => setScreen('home')} />
  }

  return (
    <div className="home-screen">
      <h1 className="home-title">수식 피라미드</h1>
      <p className="home-desc">
        피라미드 칸 3개를 선택해<br />타겟 넘버를 만들어보세요!
      </p>
      <ul className="home-rules">
        <li>10라운드 진행</li>
        <li>정답 <strong>+1점</strong>, 오답 <strong>-1점</strong></li>
        <li>라운드당 3분 제한</li>
        <li>모든 정답 소진 시 보너스 점수 획득</li>
        <li>첫 번째 선택 칸의 부호는 무시됩니다</li>
        <li>사칙연산 우선순위(×÷ 먼저) 적용</li>
      </ul>
      <button className="start-btn" onClick={() => setScreen('game')}>
        게임 시작
      </button>
      <button className="ranking-page-btn" onClick={() => setScreen('ranking-page')}>
        🏆 랭킹 보기
      </button>
    </div>
  )
}

export default App
