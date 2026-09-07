import { useNavigate } from 'react-router-dom'
import { PrimaryButton, Shell } from '../../ui.jsx'

export default function TireServiceHome() {
  const navigate = useNavigate()
  return (
    <Shell title="타이어 교체 서비스" back="/">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-card text-5xl">📍</div>
        <h2 className="text-2xl font-bold leading-snug">
          내 주변에서 타이어를
          <br />
          교체할 수 있는 지점을 찾아보세요.
        </h2>
      </div>
      <PrimaryButton onClick={() => navigate('/service/map')}>주변 지점 찾기</PrimaryButton>
    </Shell>
  )
}
