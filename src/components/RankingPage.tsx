import RankingList from './RankingList'

interface RankingPageProps {
  onBack: () => void
  userId?: string | null
}

export default function RankingPage({ onBack, userId }: RankingPageProps) {
  return (
    <div className="ranking-screen">
      <h2 className="ranking-title">🏆 랭킹</h2>
      <RankingList highlightId={userId} />
      <button className="restart-btn" onClick={onBack}>
        홈으로
      </button>
    </div>
  )
}
