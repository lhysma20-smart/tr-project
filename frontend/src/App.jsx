import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import DiagnosisHome from './pages/feature1/DiagnosisHome.jsx'
import ImageUpload from './pages/feature1/ImageUpload.jsx'
import Analyzing from './pages/feature1/Analyzing.jsx'
import DiagnosisResult from './pages/feature1/DiagnosisResult.jsx'
import TireServiceHome from './pages/feature2/TireServiceHome.jsx'
import StoreMap from './pages/feature2/StoreMap.jsx'
import TireProduct from './pages/feature2/TireProduct.jsx'
import ReplaceMethod from './pages/feature2/ReplaceMethod.jsx'
import VisitReservation from './pages/feature2/VisitReservation.jsx'
import DriverMatch from './pages/feature2/DriverMatch.jsx'
import ServiceProgress from './pages/feature2/ServiceProgress.jsx'
import ServiceComplete from './pages/feature2/ServiceComplete.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/diagnosis" element={<DiagnosisHome />} />
      <Route path="/diagnosis/upload" element={<ImageUpload />} />
      <Route path="/diagnosis/analyzing" element={<Analyzing />} />
      <Route path="/diagnosis/result" element={<DiagnosisResult />} />
      <Route path="/service" element={<TireServiceHome />} />
      <Route path="/service/map" element={<StoreMap />} />
      <Route path="/service/tires" element={<TireProduct />} />
      <Route path="/service/method" element={<ReplaceMethod />} />
      <Route path="/service/visit" element={<VisitReservation />} />
      <Route path="/service/match" element={<DriverMatch />} />
      <Route path="/service/progress" element={<ServiceProgress />} />
      <Route path="/service/complete" element={<ServiceComplete />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
