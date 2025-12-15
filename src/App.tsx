import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/context/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { NavigationLoadingSpinner } from '@/components/ui/loading-spinner'
import { Suspense } from 'react'
import AppRoutes from '@/routes'
import LoadingScreen from '@/components/ui/loading-screen'

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
})

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Suspense fallback={<LoadingScreen message="Cargando aplicación..." />}>
            <NavigationLoadingSpinner />
            <AppRoutes />
          </Suspense>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
