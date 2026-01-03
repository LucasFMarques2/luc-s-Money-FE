import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from './components/ui/sonner'
import { TransactionsProvider } from './context/TransactionsContext'
import { AuthProvider, useAuth } from './context/AuthContext'

import { AppLayout } from './components/layout/AppLayout'
import { DashboardView } from './features/dashboard/views/DashboardView'
import { TransactionsView } from './features/transactions/views/TransactionsView'
import { ReportsView } from './features/reports/views/ReportsView'
import { LoginView } from './features/auth/views/LoginView'
import { RegisterView } from './features/auth/views/RegisterView'
import type { JSX } from 'react'

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { signed } = useAuth()
  return signed ? children : <Navigate to='/login' />
}

function App() {
  return (
    <AuthProvider>
      <TransactionsProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/login' element={<LoginView />} />
            <Route path='/register' element={<RegisterView />} />

            <Route
              path='/'
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardView />} />
              <Route path='transactions' element={<TransactionsView />} />
              <Route path='reports' element={<ReportsView />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster richColors />
      </TransactionsProvider>
    </AuthProvider>
  )
}

export default App
