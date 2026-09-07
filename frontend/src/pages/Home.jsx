import { useNavigate } from 'react-router-dom'
import { Card, Shell } from '../ui.jsx'

export default function Home() {
  const navigate = useNavigate()
  return (
    <Shell title="타이어케어">
      <p className="mb-8 text-sm leading-6 text-slate-300">
        AI로 타이어 상태를 확인하고, 내 주변에서 바로 교체 예약까지 진행하세요.
      </p>
      <div className="space-y-4">
        <Card onClick={() => navigate('/diagnosis')} className="hover:border-amberx/50">
          <p className="text-xs font-semibold text-amberx">기능 1</p>
          <h2 className="mt-2 text-xl font-bold">AI 타이어 진단</h2>
          <p className="mt-2 text-sm text-slate-400">사진을 올리면 YOLO가 마모·균열·찢김을 분석합니다.</p>
        </Card>
        <Card onClick={() => navigate('/service')} className="hover:border-amberx/50">
          <p className="text-xs font-semibold text-amberx">기능 2</p>
          <h2 className="mt-2 text-xl font-bold">타이어 교체 서비스</h2>
          <p className="mt-2 text-sm text-slate-400">주변 매장을 찾고 방문 예약 또는 기사 픽업을 선택하세요.</p>
        </Card>
      </div>
    </Shell>
  )
}
