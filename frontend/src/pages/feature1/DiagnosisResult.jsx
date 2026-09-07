import { useNavigate } from 'react-router-dom'
import { useApp } from '../../state.jsx'
import { Card, PrimaryButton, Shell } from '../../ui.jsx'

const STATUS = {
  good: { label: '양호', emoji: '🟢', color: 'text-emerald-400' },
  warning: { label: '주의', emoji: '⚠', color: 'text-yellow-400' },
  replace: { label: '교체 권장', emoji: '🟠', color: 'text-orange-400' },
  critical: { label: '즉시 점검', emoji: '🔴', color: 'text-red-400' },
}

function Bar({ label, value }) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-slate-400">{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-amberx" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function DiagnosisResult() {
  const navigate = useNavigate()
  const { state } = useApp()
  const result = state.diagnosis

  if (!result) {
    return (
      <Shell title="AI 진단 결과" back="/diagnosis">
        <p className="text-sm text-slate-400">진단 결과가 없습니다.</p>
      </Shell>
    )
  }

  const meta = STATUS[result.status] || STATUS.warning

  return (
    <Shell title="AI 진단 결과" back="/diagnosis">
      <div className="mb-6 text-center">
        <p className="text-6xl font-black">{result.score}점</p>
        <p className={`mt-3 text-xl font-bold ${meta.color}`}>
          {meta.emoji} {meta.label}
        </p>
      </div>
      <Card className="mb-5">
        <Bar label="마모도" value={result.wear} />
        <Bar label="균열" value={result.crack} />
        <Bar label="찢김" value={result.tear} />
      </Card>
      <Card>
        <p className="text-xs font-semibold text-amberx">AI 분석 결과</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">{result.message}</p>
      </Card>
      <div className="mt-8 space-y-3">
        <PrimaryButton onClick={() => navigate('/service')}>주변에서 타이어 교체하기</PrimaryButton>
        <button type="button" className="w-full py-3 text-sm text-slate-400" onClick={() => navigate('/diagnosis/upload')}>
          다시 진단하기
        </button>
      </div>
    </Shell>
  )
}
