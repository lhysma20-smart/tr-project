import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../state.jsx'
import { Card, PrimaryButton, Shell } from '../../ui.jsx'

export default function ReplaceMethod() {
  const navigate = useNavigate()
  const { state, patch } = useApp()
  const [method, setMethod] = useState(
    state.method || (state.store?.mechanic_available ? 'driver' : 'visit'),
  )

  useEffect(() => {
    if (!state.store || !state.tire) navigate('/service/map', { replace: true })
  }, [state.store, state.tire, navigate])

  if (!state.store || !state.tire) return null

  return (
    <Shell title="타이어 교체 방법" back="/service/tires">
      <div className="space-y-4">
        <Card onClick={() => setMethod('visit')} className={method === 'visit' ? 'border-amberx' : ''}>
          <p className="font-bold">{method === 'visit' ? '●' : '○'} 직접 방문</p>
          <p className="mt-2 text-sm text-slate-400">매장을 직접 방문하여 타이어를 교체합니다.</p>
        </Card>
        <Card
          onClick={() => {
            if (state.store.mechanic_available) setMethod('driver')
          }}
          className={`${method === 'driver' ? 'border-amberx' : ''} ${state.store.mechanic_available ? '' : 'opacity-50'}`}
        >
          <p className="font-bold">{method === 'driver' ? '●' : '○'} 기사님 픽업 서비스</p>
          <p className="mt-2 text-sm text-slate-400">기사님이 차량을 픽업하여 타이어 교체 후 다시 반환합니다.</p>
          {!state.store.mechanic_available && <p className="mt-2 text-xs text-red-400">이 매장은 기사 매칭을 지원하지 않습니다.</p>}
        </Card>
      </div>
      <div className="mt-auto pt-8">
        <PrimaryButton
          onClick={() => {
            patch({ method })
            navigate(method === 'visit' ? '/service/visit' : '/service/match')
          }}
        >
          선택 완료
        </PrimaryButton>
      </div>
    </Shell>
  )
}
