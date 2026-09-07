import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder, matchDriver } from '../../api.js'
import { useApp } from '../../state.jsx'
import { Card, PrimaryButton, Shell } from '../../ui.jsx'

export default function DriverMatch() {
  const navigate = useNavigate()
  const { state, patch } = useApp()
  const [phase, setPhase] = useState('searching')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!state.store || !state.tire) {
      navigate('/service/map', { replace: true })
      return
    }
    let alive = true
    ;(async () => {
      try {
        const order = await createOrder({
          store_id: state.store.id,
          tire_id: state.tire.id,
          method: 'driver',
          user_lat: state.userLocation.lat,
          user_lng: state.userLocation.lng,
        })
        const matched = await matchDriver(order.id)
        if (!alive) return
        patch({ method: 'driver', order, service: matched })
        setTimeout(() => {
          if (alive) setPhase('matched')
        }, 2800)
      } catch (err) {
        if (alive) setError(err.message)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  if (phase === 'searching') {
    return (
      <Shell title="기사 매칭" back="/service/method">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-line border-t-amberx" />
          <h2 className="text-xl font-bold">기사님을 찾고 있습니다.</h2>
          <p className="mt-2 text-sm text-slate-400">주변 기사님을 확인 중입니다.</p>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>
      </Shell>
    )
  }

  const service = state.service || {}
  return (
    <Shell title="매칭 완료" back="/service/method">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-2xl font-bold">기사님 매칭 완료</p>
        <Card className="mt-8 w-full text-left">
          <p className="text-lg font-bold">{service.driver_name || '김OO'} 기사님</p>
          <p className="mt-2 text-sm text-slate-300">⭐ 평점 {service.rating ?? 4.9}</p>
          <p className="mt-4 text-xs text-slate-400">도착 예정</p>
          <p className="mt-1 text-2xl font-black">{service.eta ?? 8}분</p>
        </Card>
      </div>
      <PrimaryButton onClick={() => navigate('/service/progress')}>진행 확인</PrimaryButton>
    </Shell>
  )
}
