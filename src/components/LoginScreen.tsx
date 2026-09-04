import GoogleSignInButton from "./GoogleSignInButton";

interface LoginScreenProps {
  loading: boolean;
  onSignIn: () => void;
  onSkip: () => void;
}

export default function LoginScreen({ loading, onSignIn, onSkip }: LoginScreenProps) {
  return (
    <div className="home-screen">
      <h1 className="home-title">수식 피라미드</h1>
      <p className="home-desc">
        구글 로그인을 하면
        <br />
        랭킹에 기록을 남길 수 있어요!
      </p>
      <GoogleSignInButton loading={loading} onClick={onSignIn} />
      <button className="ranking-page-btn" onClick={onSkip} disabled={loading}>
        게스트로 시작하기
      </button>
    </div>
  );
}
