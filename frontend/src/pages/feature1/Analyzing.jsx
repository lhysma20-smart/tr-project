import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { diagnoseImage } from '../../api.js'
import { useApp } from '../../state.jsx'
import { Shell } from '../../ui.jsx'

const STEPS = ['타이어 영역 탐색', '표면 상태 분석', '손상 여부 분석']

export default function Analyzing() {
  const navigate = useNavigate()
  const { state, patch } = useApp()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!state.imageFile) {
      navigate('/diagnosis/upload', { replace: true })
      return
    }
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 2400),
    ]
    diagnoseImage(state.imageFile)
      .then((diagnosis) => {
        patch({ diagnosis })
        setTimeout(() => navigate('/diagnosis/result', { replace: true }), 700)
      })
      .catch((err) => setError(err.message))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <Shell title="AI 분석 중" back="/diagnosis/upload">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-line border-t-amberx" />
        <h2 className="text-xl font-bold">AI가 타이어를 분석하고 있습니다.</h2>
        <p className="mt-2 text-sm text-slate-400">이미지 분석 중...</p>
        <ul className="mt-10 w-full space-y-3 text-left">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-sm">
              <span className={i < step ? 'text-emerald-400' : 'text-slate-500'}>{i < step ? '✓' : '○'}</span>
              {label}
            </li>
          ))}
        </ul>
        {error && <p className="mt-6 text-sm text-red-400">{error}</p>}
      </div>
    </Shell>
  )
}
