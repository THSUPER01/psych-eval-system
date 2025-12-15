import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import LoadingScreen from '@/components/ui/loading-screen'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import SelectionLayout from '@/layouts/SelectionLayout'

// Lazy loading de páginas públicas
const HomePage = lazy(() => import('@/pages/HomePage'))
const AplicarPage = lazy(() => import('@/pages/AplicarPage'))
const AccesoPage = lazy(() => import('@/pages/candidato/AccesoPage'))

// Lazy loading de páginas de autenticación
const LoginPage = lazy(() => import('@/pages/psicologo/LoginPage'))
const VerifyPage = lazy(() => import('@/pages/psicologo/VerifyPage'))
const VerifyCodePage = lazy(() => import('@/pages/psicologo/VerifyCodePage'))

// Lazy loading de páginas de candidato
const CandidatoFormPage = lazy(() => import('@/pages/candidato/CandidatoFormPage'))

// Lazy loading de páginas de pruebas
const Test16PFPage = lazy(() => import('@/pages/prueba/Test16PFPage'))
const Test16PFExitoPage = lazy(() => import('@/pages/prueba/Test16PFExitoPage'))
const TestCMTPage = lazy(() => import('@/pages/prueba/TestCMTPage'))
const TestCMTExitoPage = lazy(() => import('@/pages/prueba/TestCMTExitoPage'))

// Lazy loading de páginas del panel (protegidas)
const DashboardPage = lazy(() => import('@/pages/panel/seleccion/DashboardPage'))
const RequerimientosPage = lazy(() => import('@/pages/panel/seleccion/RequerimientosPage'))
const RequerimientoDetallePage = lazy(() => import('@/pages/panel/seleccion/RequerimientoDetallePage'))
const CandidatosPage = lazy(() => import('@/pages/panel/seleccion/CandidatosPage'))
const CandidatoDetallePage = lazy(() => import('@/pages/panel/seleccion/CandidatoDetallePage'))
const PruebasPage = lazy(() => import('@/pages/panel/seleccion/PruebasPage'))
const PruebaDetallePage = lazy(() => import('@/pages/panel/seleccion/PruebaDetallePage'))
const PruebaVersionesItemsPage = lazy(() => import('@/pages/panel/seleccion/PruebaVersionesItemsPage'))
const ResultadosPage = lazy(() => import('@/pages/panel/seleccion/ResultadosPage'))
const ResultadoDetallePage = lazy(() => import('@/pages/panel/seleccion/ResultadoDetallePage'))
const ConfiguracionPage = lazy(() => import('@/pages/panel/seleccion/ConfiguracionPage'))
const AdminUsuariosPage = lazy(() => import('@/pages/panel/seleccion/AdminUsuariosPage'))

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/aplicar" element={<AplicarPage />} />
        <Route path="/candidato/acceso" element={<AccesoPage />} />
        
        {/* Rutas de psicólogo */}
        <Route path="/psicologo/login" element={<LoginPage />} />
        <Route path="/psicologo/verify" element={<VerifyPage />} />
        <Route path="/psicologo/verify/code" element={<VerifyCodePage />} />
        
        {/* Rutas de candidato */}
        <Route path="/candidato/:token" element={<CandidatoFormPage />} />
        
        {/* Rutas de pruebas */}
        <Route path="/prueba/16pf/:token" element={<Test16PFPage />} />
        <Route path="/prueba/16pf/:token/exito" element={<Test16PFExitoPage />} />
        <Route path="/prueba/cmt/:token" element={<TestCMTPage />} />
        <Route path="/prueba/cmt/:token/exito" element={<TestCMTExitoPage />} />
        
        {/* Rutas protegidas del panel - Con Layout Anidado */}
        <Route
          path="/panel/seleccion"
          element={
            <ProtectedRoute>
              <SelectionLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="requerimientos" element={<RequerimientosPage />} />
          <Route path="requerimientos/:id" element={<RequerimientoDetallePage />} />
          <Route path="candidatos" element={<CandidatosPage />} />
          <Route path="candidatos/:id" element={<CandidatoDetallePage />} />
          <Route path="pruebas" element={<PruebasPage />} />
          <Route path="pruebas/:id" element={<PruebaDetallePage />} />
          <Route path="pruebas/:id/versiones/:versionId/items" element={<PruebaVersionesItemsPage />} />
          <Route path="resultados" element={<ResultadosPage />} />
          <Route path="resultados/:id" element={<ResultadoDetallePage />} />
          <Route path="configuracion" element={<ConfiguracionPage />} />
          <Route path="admin/usuarios" element={<AdminUsuariosPage />} />
        </Route>
        
        {/* 404 - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
