import { useNavigate } from 'react-router-dom'
import { PrimaryButton, Shell } from '../../ui.jsx'

export default function DiagnosisHome() {
  const navigate = useNavigate()
  return (
    <Shell title="AI 타이어 진단" back="/">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-card text-5xl">🛞</div>
        <h2 className="text-2xl font-bold leading-snug">
          내 타이어 상태를
          <br />
          AI로 확인해보세요.
        </h2>
      </div>
      <PrimaryButton onClick={() => navigate('/diagnosis/upload')}>타이어 진단 시작</PrimaryButton>
    </Shell>
  )
}
