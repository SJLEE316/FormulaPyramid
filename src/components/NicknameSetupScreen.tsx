import { useState } from "react";
import { generateRandomNickname } from "../utils/randomNickname";

interface NicknameSetupScreenProps {
  loading: boolean;
  onSubmit: (nickname: string) => void;
}

export default function NicknameSetupScreen({
  loading,
  onSubmit,
}: NicknameSetupScreenProps) {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const handleRandom = () => {
    setNickname(generateRandomNickname());
    setError("");
  };

  const handleSubmit = () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    if (trimmed.length > 12) {
      setError("닉네임은 12자 이하로 입력해 주세요.");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div className="home-screen">
      <h1 className="home-title">닉네임 설정</h1>
      <p className="home-desc">
        랭킹에 표시될 닉네임을 설정해 주세요.
        <br />
        설정 후에는 변경할 수 없어요!
      </p>
      <div className="nickname-form">
        <input
          className="nickname-input"
          type="text"
          placeholder="닉네임 입력 (최대 12자)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          maxLength={12}
          disabled={loading}
        />
        {error && <p className="input-error">{error}</p>}
        <button
          className="ranking-page-btn"
          onClick={handleRandom}
          disabled={loading}
        >
          🎲 랜덤 닉네임
        </button>
        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "설정 중..." : "설정 완료"}
        </button>
      </div>
    </div>
  );
}
