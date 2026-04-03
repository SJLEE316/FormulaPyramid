interface HomeScreenProps {
  onStart: () => void;
  onRanking: () => void;
}

export default function HomeScreen({ onStart, onRanking }: HomeScreenProps) {
  return (
    <div className="home-screen">
      <h1 className="home-title">수식 피라미드</h1>
      <p className="home-desc">
        피라미드 칸 3개를 선택해
        <br />
        타겟 넘버를 만들어보세요!
      </p>
      <ul className="home-rules">
        <li>10라운드 진행</li>
        <li>
          정답 <strong>+1점</strong>, 오답 <strong>-1점</strong>
        </li>
        <li>라운드당 2분 제한</li>
        <li>
          라운드 점수 <strong>3점 미만</strong> 시 탈락
        </li>
        <li>모든 정답 소진 시 보너스 점수 획득</li>
        <li>첫 번째 선택 칸의 부호는 무시됩니다</li>
        <li>사칙연산 우선순위(×÷ 먼저) 적용</li>
      </ul>
      <button className="start-btn" onClick={onStart}>
        게임 시작
      </button>
      <button className="ranking-page-btn" onClick={onRanking}>
        🏆 랭킹 보기
      </button>
    </div>
  );
}
