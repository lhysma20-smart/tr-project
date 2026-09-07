import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { useNavigate } from 'react-router-dom'
import { getServiceStatus } from '../../api.js'
import { useApp } from '../../state.jsx'
import { Card, Shell } from '../../ui.jsx'

const LABELS = {
  MATCHING: '기사님을 찾고 있습니다',
  MATCHED: '기사님 매칭 완료',
  MOVING_TO_USER: '기사님 이동 중',
  VEHICLE_PICKUP: '차량 픽업 중',
  MOVING_TO_STORE: '타이어 교체 지점으로 이동 중',
  TIRE_REPLACEMENT: '타이어 교체 중입니다',
  RETURNING: '고객님 위치로 반환 중',
  COMPLETED: '서비스 완료',
}

const driverIcon = L.divIcon({ className: '', html: '<div style="font-size:22px">🚙</div>', iconSize: [28, 28], iconAnchor: [14, 14] })
const userIcon = L.divIcon({ className: '', html: '<div style="font-size:22px">🚗</div>', iconSize: [28, 28], iconAnchor: [14, 14] })

export default function ServiceProgress() {
  const navigate = useNavigate()
  const { state, patch } = useApp()
  const [service, setService] = useState(state.service)

  useEffect(() => {
    if (!state.order?.id) {
      navigate('/service/match', { replace: true })
      return
    }
    const tick = async () => {
      const data = await getServiceStatus(state.order.id)
      setService(data)
      patch({ service: data })
      if (data.status === 'COMPLETED') navigate('/service/complete', { replace: true })
    }
    tick()
    const id = setInterval(tick, 1500)
    return () => clearInterval(id)
  }, [])

  const driverPos = service?.driver ? [service.driver.lat, service.driver.lng] : [37.498, 127.027]
  const userPos = service?.user ? [service.user.lat, service.user.lng] : [state.userLocation.lat, state.userLocation.lng]
  const path = useMemo(() => (service?.route || []).map((p) => [p.lat, p.lng]), [service])

  if (!service) return null

  return (
    <Shell title="서비스 진행" back="/service/match">
      <h2 className="mb-4 text-center text-xl font-bold">{LABELS[service.status] || service.status}</h2>
      <div className="mb-4 h-56 overflow-hidden rounded-3xl border border-line">
        <MapContainer center={userPos} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {path.length > 1 && <Polyline positions={path} color="#F5A623" />}
          <Marker position={userPos} icon={userIcon} />
          <Marker position={driverPos} icon={driverIcon} />
        </MapContainer>
      </div>
      <Card>
        {service.status === 'TIRE_REPLACEMENT' ? (
          <>
            <p className="text-sm">작업 진행률</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-amberx" style={{ width: `${service.progress}%` }} />
            </div>
            <p className="mt-2 text-lg font-bold">{service.progress}%</p>
            <p className="mt-3 text-sm text-slate-400">예상 완료 {service.eta}분</p>
          </>
        ) : service.status === 'RETURNING' ? (
          <>
            <p className="font-bold">타이어 교체 완료</p>
            <p className="mt-2 text-sm text-slate-300">현재 차량을 고객님 위치로 이동하고 있습니다.</p>
            <p className="mt-4 text-2xl">🚙 ───────→ 🚗</p>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-400">예상 도착</p>
            <p className="mt-1 text-3xl font-black">{service.eta}분</p>
            <p className="mt-3 text-sm text-slate-400">상태 {service.status}</p>
          </>
        )}
      </Card>
    </Shell>
  )
}
