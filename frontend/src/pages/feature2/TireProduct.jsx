import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTires } from '../../api.js'
import { useApp } from '../../state.jsx'
import { Card, Shell } from '../../ui.jsx'

export default function TireProduct() {
  const navigate = useNavigate()
  const { state, patch } = useApp()
  const [tires, setTires] = useState([])

  useEffect(() => {
    if (!state.store) {
      navigate('/service/map', { replace: true })
      return
    }
    getTires().then(setTires).catch(() => setTires([]))
  }, [])

  if (!state.store) return null

  return (
    <Shell title="타이어 상품" back="/service/map">
      <Card className="mb-5">
        <p className="text-xs text-amberx">{state.store.recommended ? '⭐ 추천' : '선택 지점'}</p>
        <h2 className="mt-1 text-lg font-bold">{state.store.name}</h2>
        <p className="mt-1 text-sm text-slate-400">
          평점 {state.store.rating} · {state.store.distance}
        </p>
      </Card>
      <div className="space-y-4">
        {tires.map((tire) => (
          <Card key={tire.id}>
            <h3 className="text-lg font-bold">{tire.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{tire.desc}</p>
            <p className="mt-3 text-xl font-black">₩{tire.price.toLocaleString()}</p>
            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-amberx py-3 font-bold text-ink"
              onClick={() => {
                patch({ tire })
                navigate('/service/method')
              }}
            >
              구매하기
            </button>
          </Card>
        ))}
      </div>
    </Shell>
  )
}
