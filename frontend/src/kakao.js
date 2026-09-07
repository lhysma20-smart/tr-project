let loadingPromise = null

/**
 * 카카오맵 JS SDK를 1회만 동적으로 로드하고 kakao 전역 객체를 반환한다.
 * VITE_KAKAO_MAP_KEY 환경변수(프론트엔드용 JavaScript 키)가 필요하다.
 */
export function loadKakaoMaps() {
  if (window.kakao && window.kakao.maps) {
    return Promise.resolve(window.kakao)
  }
  if (loadingPromise) return loadingPromise

  loadingPromise = new Promise((resolve, reject) => {
    const key = import.meta.env.VITE_KAKAO_MAP_KEY
    if (!key) {
      reject(new Error('VITE_KAKAO_MAP_KEY가 설정되지 않았습니다. frontend/.env 파일을 확인해주세요.'))
      return
    }
    const existing = document.querySelector('script[data-kakao-map-sdk]')
    if (existing) {
      existing.addEventListener('load', () => window.kakao.maps.load(() => resolve(window.kakao)))
      existing.addEventListener('error', () => reject(new Error('카카오 지도 SDK 로드에 실패했습니다.')))
      return
    }
    const script = document.createElement('script')
    script.dataset.kakaoMapSdk = 'true'
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`
    script.async = true
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao))
    }
    script.onerror = () => reject(new Error('카카오 지도 SDK 로드에 실패했습니다.'))
    document.head.appendChild(script)
  })

  return loadingPromise
}
