import RankingList from './RankingList'

interface RankingPageProps {
  onBack: () => void
}

export default function RankingPage({ onBack }: RankingPageProps) {
  return (
    <div className="ranking-screen">
      <h2 className="ranking-title">🏆 랭킹</h2>
      <RankingList />
      <button className="restart-btn" onClick={onBack}>
        홈으로
      </button>
    </div>
  )
}
