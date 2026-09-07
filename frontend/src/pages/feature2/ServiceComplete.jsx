import { useNavigate } from 'react-router-dom'
import { useApp } from '../../state.jsx'
import { PrimaryButton, Shell } from '../../ui.jsx'

export default function ServiceComplete() {
  const navigate = useNavigate()
  const { resetService } = useApp()
  return (
    <Shell title="서비스 완료" back="/">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-5xl">🎉</p>
        <h2 className="mt-6 text-2xl font-bold">타이어 교체 완료</h2>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          차량이 원래 위치에
          <br />
          반환되었습니다.
        </p>
        <p className="mt-6 text-sm text-slate-400">
          새로운 타이어와 함께
          <br />
          안전한 운전 되세요!
        </p>
      </div>
      <PrimaryButton
        onClick={() => {
          resetService()
          navigate('/')
        }}
      >
        서비스 종료
      </PrimaryButton>
    </Shell>
  )
}
