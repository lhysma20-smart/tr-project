export async function diagnoseImage(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/diagnosis', { method: 'POST', body: form })
  if (!res.ok) throw new Error('진단 요청에 실패했습니다.')
  return res.json()
}

export async function getStores(lat, lng) {
  const res = await fetch(`/api/stores?lat=${lat}&lng=${lng}`)
  if (!res.ok) throw new Error('매장 조회에 실패했습니다.')
  return res.json()
}

export async function getTires() {
  const res = await fetch('/api/tires')
  if (!res.ok) throw new Error('상품 조회에 실패했습니다.')
  return res.json()
}

export async function createOrder(payload) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('예약에 실패했습니다.')
  return res.json()
}

export async function matchDriver(orderId) {
  const res = await fetch('/api/drivers/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId }),
  })
  if (!res.ok) throw new Error('기사 매칭에 실패했습니다.')
  return res.json()
}

export async function getServiceStatus(orderId) {
  const res = await fetch(`/api/service/status?order_id=${orderId}`)
  if (!res.ok) throw new Error('진행 상태를 불러오지 못했습니다.')
  return res.json()
}
