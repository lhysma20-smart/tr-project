import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStores } from '../../api.js'
import { loadKakaoMaps } from '../../kakao.js'
import { useApp } from '../../state.jsx'
import { Card, PrimaryButton, Shell } from '../../ui.jsx'

export default function StoreMap() {
  const navigate = useNavigate()
  const { state, patch } = useApp()
  const [stores, setStores] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const [mapReady, setMapReady] = useState(false)

  const mapElRef = useRef(null)
  const mapRef = useRef(null)
  const overlaysRef = useRef([])

  // 1) 카카오 지도 SDK 로드 + 지도 최초 생성
  useEffect(() => {
    let alive = true
    loadKakaoMaps()
      .then((kakao) => {
        if (!alive || !mapElRef.current) return
        const center = new kakao.maps.LatLng(state.userLocation.lat, state.userLocation.lng)
        mapRef.current = new kakao.maps.Map(mapElRef.current, { center, level: 5 })
        setMapReady(true)
      })
      .catch((err) => setError(err.message))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2) 브라우저 위치 확인 후 실제 주변 타이어 매장 조회 (백엔드 -> 카카오 로컬 API)
  useEffect(() => {
    const apply = (lat, lng) => {
      patch({ userLocation: { lat, lng } })
      getStores(lat, lng)
        .then((data) => {
          setStores(data)
          setSelected(data[0] || null)
        })
        .catch((err) => setError(err.message))
    }
    if (!navigator.geolocation) {
      apply(state.userLocation.lat, state.userLocation.lng)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => apply(pos.coords.latitude, pos.coords.longitude),
      () => apply(state.userLocation.lat, state.userLocation.lng),
      { timeout: 4000, enableHighAccuracy: true },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 3) 지도 중심 이동 + 현재 위치/매장 마커 갱신
  useEffect(() => {
    if (!mapReady) return
    let alive = true
    loadKakaoMaps().then((kakao) => {
      if (!alive || !mapRef.current) return

      const center = new kakao.maps.LatLng(state.userLocation.lat, state.userLocation.lng)
      mapRef.current.setCenter(center)

      overlaysRef.current.forEach((overlay) => overlay.setMap(null))
      overlaysRef.current = []

      const userEl = document.createElement('div')
      userEl.style.fontSize = '22px'
      userEl.textContent = '🚗'
      const userOverlay = new kakao.maps.CustomOverlay({ position: center, content: userEl, yAnchor: 0.5 })
      userOverlay.setMap(mapRef.current)
      overlaysRef.current.push(userOverlay)

      stores.forEach((store) => {
        const el = document.createElement('div')
        el.style.fontSize = '22px'
        el.style.cursor = 'pointer'
        el.textContent = store.recommended ? '⭐' : '📍'
        el.addEventListener('click', () => setSelected(store))
        const overlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(store.lat, store.lng),
          content: el,
          yAnchor: 1,
        })
        overlay.setMap(mapRef.current)
        overlaysRef.current.push(overlay)
      })
    })
    return () => {
      alive = false
    }
  }, [stores, state.userLocation, mapReady])

  return (
    <Shell title="현재 위치 주변" back="/service">
      <div className="mb-4 h-72 overflow-hidden rounded-3xl border border-line bg-card">
        <div ref={mapElRef} className="h-full w-full" />
      </div>
      <div className="mb-4 space-y-3">
        {stores.map((store) => (
          <Card
            key={store.id}
            onClick={() => setSelected(store)}
            className={selected?.id === store.id ? 'border-amberx' : ''}
          >
            {store.recommended && <p className="mb-1 text-xs font-bold text-amberx">⭐ 추천 매장</p>}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{store.name}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {store.rating != null && <>평점 {store.rating} · </>}
                  {store.distance}
                </p>
                <p className="mt-1 text-xs text-slate-500">{store.address}</p>
              </div>
              <button
                type="button"
                className="rounded-full bg-ink px-3 py-1 text-xs text-amberx"
                onClick={(e) => {
                  e.stopPropagation()
                  patch({ store })
                  navigate('/service/tires')
                }}
              >
                선택
              </button>
            </div>
          </Card>
        ))}
        {stores.length === 0 && !error && (
          <p className="text-sm text-slate-400">주변 타이어 매장을 검색하고 있습니다...</p>
        )}
      </div>
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      <div className="mt-auto">
        <PrimaryButton
          disabled={!selected}
          onClick={() => {
            patch({ store: selected })
            navigate('/service/tires')
          }}
        >
          지점 상세 보기
        </PrimaryButton>
      </div>
    </Shell>
  )
}
