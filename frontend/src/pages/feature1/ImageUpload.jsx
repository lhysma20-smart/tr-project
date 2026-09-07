import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../state.jsx'
import { Card, PrimaryButton, Shell } from '../../ui.jsx'

export default function ImageUpload() {
  const navigate = useNavigate()
  const { state, patch } = useApp()
  const fileRef = useRef(null)
  const cameraRef = useRef(null)

  const onFile = (file) => {
    if (!file) return
    const preview = URL.createObjectURL(file)
    patch({ imageFile: file, imagePreview: preview, diagnosis: null })
  }

  return (
    <Shell title="사진 등록" back="/diagnosis">
      <p className="mb-5 text-sm text-slate-300">타이어 사진을 등록해주세요.</p>
      <Card className="mb-5 flex min-h-[240px] items-center justify-center overflow-hidden p-0">
        {state.imagePreview ? (
          <img src={state.imagePreview} alt="타이어 미리보기" className="h-64 w-full object-cover" />
        ) : (
          <div className="py-16 text-center text-slate-500">이미지 영역</div>
        )}
      </Card>
      <div className="mb-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="rounded-2xl bg-card py-4 text-sm font-semibold"
        >
          📷 사진 촬영
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-2xl bg-card py-4 text-sm font-semibold"
        >
          🖼 사진 업로드
        </button>
      </div>
      {state.imagePreview && (
        <button
          type="button"
          className="mb-4 text-sm text-slate-400 underline"
          onClick={() => patch({ imageFile: null, imagePreview: null })}
        >
          이미지 삭제 및 재선택
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <div className="mt-auto">
        <PrimaryButton disabled={!state.imageFile} onClick={() => navigate('/diagnosis/analyzing')}>
          AI 진단 시작
        </PrimaryButton>
      </div>
    </Shell>
  )
}
