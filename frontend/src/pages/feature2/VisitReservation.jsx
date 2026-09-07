import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../../api.js'
import { useApp } from '../../state.jsx'
import { Card, PrimaryButton, Shell } from '../../ui.jsx'

export default function VisitReservation() {
  const navigate = useNavigate()
  const { state, patch } = useApp()
  const defaultDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().slice(0, 10)
  }, [])
  const [date, setDate] = useState(state.visitDate || defaultDate)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!state.store || !state.tire) navigate('/service/map', { replace: true })
  }, [state.store, state.tire, navigate])

  if (!state.store || !state.tire) return null

  const submit = async () => {
    try {
      const order = await createOrder({
        store_id: state.store.id,
        tire_id: state.tire.id,
        method: 'visit',
        date,
        user_lat: state.userLocation.lat,
        user_lng: state.userLocation.lng,
      })
      patch({ visitDate: date, order })
      setDone(true)
    } catch (err) {
      setError(err.message)
    }
  }

  if (done) {
    const pretty = date.replaceAll('-', '.')
    return (
      <Shell title="예약 완료" back="/">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-2xl font-bold">예약이 완료되었습니다.</p>
          <Card className="mt-8 w-full text-left">
            <p className="text-xs text-slate-400">예약 지점</p>
            <p className="mt-1 font-bold">{state.store.name}</p>
            <p className="mt-4 text-xs text-slate-400">예약 날짜</p>
            <p className="mt-1 font-bold">{pretty}</p>
            <p className="mt-4 text-xs text-slate-400">상품</p>
            <p className="mt-1 font-bold">{state.tire.name}</p>
          </Card>
        </div>
        <PrimaryButton onClick={() => navigate('/')}>확인</PrimaryButton>
      </Shell>
    )
  }

  return (
    <Shell title="예약 날짜 선택" back="/service/method">
      <p className="mb-4 text-sm text-slate-300">방문하실 날짜를 선택해주세요.</p>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mb-6 w-full rounded-2xl bg-card px-4 py-4 text-white outline-none"
      />
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      <div className="mt-auto">
        <PrimaryButton onClick={submit}>예약 완료</PrimaryButton>
      </div>
    </Shell>
  )
}
