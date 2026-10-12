import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/auth-context'
import type { Role } from '../types'
import { Loading } from '../components/PageHeader'

const ADMIN_ROLES: Role[] = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPERVISOR']

export function dashboardPathFor(role?: Role | string): string {
  if (role === 'PROFESSIONAL') return '/professional'
  if (role && ADMIN_ROLES.includes(role as Role)) return '/admin'
  if (role && (role as Role) === 'USER') return '/app'
  return '/'
}

export function LandingRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, onboardingComplete } = useAuth()
  if (isLoading) return <div className="grid min-h-screen place-items-center"><Loading label="Checking your session…" /></div>
  if (isAuthenticated && user) {
    if (user.role === 'USER' && !onboardingComplete) return <Navigate to="/onboarding" replace />
    return <Navigate to={dashboardPathFor(user.role)} replace />
  }
  return <>{children}</>
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loading label="Checking your session…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}

export function RoleRoute({ roles }: { roles: Role[] }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loading label="Loading your space…" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={dashboardPathFor(user.role)} replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { isAuthenticated, isLoading, onboardingComplete, user } = useAuth()

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loading label="Checking your session…" />
      </div>
    )
  }

  if (isAuthenticated && user) {
    if (user.role === 'USER' && !onboardingComplete) return <Navigate to="/onboarding" replace />
    return <Navigate to={dashboardPathFor(user.role)} replace />
  }

  return <Outlet />
}

export function OnboardingRoute() {
  const { isAuthenticated, isLoading, onboardingComplete, user } = useAuth()

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loading label="Preparing your space…" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (user?.role !== 'USER') return <Navigate to={dashboardPathFor(user?.role)} replace />

  if (onboardingComplete) return <Navigate to="/app" replace />

  return <Outlet />
}

export function RequireOnboardingRoute() {
  const { isAuthenticated, onboardingComplete, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (user?.role === 'USER' && !onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}