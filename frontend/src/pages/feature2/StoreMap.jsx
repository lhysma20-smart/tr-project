import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useNavigate } from 'react-router-dom'
import { getStores } from '../../api.js'
import { useApp } from '../../state.jsx'
import { Card, PrimaryButton, Shell } from '../../ui.jsx'

const userIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:22px">🚗</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const storeIcon = (recommended) =>
  L.divIcon({
    className: '',
    html: `<div style="font-size:22px">${recommended ? '⭐' : '📍'}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

function Recenter({ center }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 15)
  }, [center, map])
  return null
}

export default function StoreMap() {
  const navigate = useNavigate()
  const { state, patch } = useApp()
  const [stores, setStores] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')

  const center = useMemo(() => [state.userLocation.lat, state.userLocation.lng], [state.userLocation])

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
      { timeout: 4000 },
    )
  }, [])

  return (
    <Shell title="현재 위치 주변" back="/service">
      <div className="mb-4 h-72 overflow-hidden rounded-3xl border border-line">
        <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Recenter center={center} />
          <Marker position={center} icon={userIcon}>
            <Popup>현재 위치</Popup>
          </Marker>
          {stores.map((store) => (
            <Marker
              key={store.id}
              position={[store.lat, store.lng]}
              icon={storeIcon(store.recommended)}
              eventHandlers={{ click: () => setSelected(store) }}
            >
              <Popup>
                {store.name} ★{store.rating}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
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
                  평점 {store.rating} · {store.distance}
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
