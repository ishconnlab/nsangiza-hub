import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout'
import AppLayout from '../layouts/AppLayout'
import { GuestRoute, LandingRoute, OnboardingRoute, ProtectedRoute, RequireOnboardingRoute, RoleRoute } from './guards'

import Home from '../pages/public/Home'

const AuthLayout = lazy(() => import('../layouts/AuthLayout'))

const HowItWorks = lazy(() => import('../pages/public/HowItWorks'))
const Professionals = lazy(() => import('../pages/public/Professionals'))
const ProfessionalDetail = lazy(() => import('../pages/public/ProfessionalDetail'))
const Resources = lazy(() => import('../pages/public/Resources'))
const ResourceDetail = lazy(() => import('../pages/public/ResourceDetail'))
const Contact = lazy(() => import('../pages/public/StaticPages').then((m) => ({ default: m.Contact })))
const Emergency = lazy(() => import('../pages/public/StaticPages').then((m) => ({ default: m.Emergency })))
const Join = lazy(() => import('../pages/public/StaticPages').then((m) => ({ default: m.Join })))
const Privacy = lazy(() => import('../pages/public/StaticPages').then((m) => ({ default: m.Privacy })))
const Safety = lazy(() => import('../pages/public/StaticPages').then((m) => ({ default: m.Safety })))
const Terms = lazy(() => import('../pages/public/StaticPages').then((m) => ({ default: m.Terms })))
const Login = lazy(() => import('../pages/AuthPages').then((m) => ({ default: m.Login })))
const Register = lazy(() => import('../pages/AuthPages').then((m) => ({ default: m.Register })))
const Onboarding = lazy(() => import('../pages/onboarding/Onboarding'))
const NotFound = lazy(() => import('../pages/NotFound'))

const UserDashboard = lazy(() => import('../pages/user/UserDashboard'))
const CheckIn = lazy(() => import('../pages/user/CheckIn'))
const Appointments = lazy(() => import('../pages/user/Appointments'))
const Messages = lazy(() => import('../pages/user/Messages'))
const Community = lazy(() => import('../pages/user/Community'))
const CommunityGroup = lazy(() => import('../pages/user/CommunityGroup'))
const UserResources = lazy(() => import('../pages/user/UserResources'))
const Notifications = lazy(() => import('../pages/user/Notifications'))
const ProfileSettings = lazy(() => import('../pages/user/ProfileSettings'))

const ProDashboard = lazy(() => import('../pages/professional/ProDashboard'))
const ProProfile = lazy(() => import('../pages/professional/ProProfile'))
const ProAvailability = lazy(() => import('../pages/professional/ProAvailability'))
const ProSessions = lazy(() => import('../pages/professional/ProSessions'))
const ProClients = lazy(() => import('../pages/professional/ProClients'))
const ProClientDetail = lazy(() => import('../pages/professional/ProClientDetail'))
const ProFollowUps = lazy(() => import('../pages/professional/ProFollowUps'))

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'))
const AdminProfessionals = lazy(() => import('../pages/admin/AdminProfessionals'))
const AdminSafeguarding = lazy(() => import('../pages/admin/AdminSafeguarding'))
const AdminResources = lazy(() => import('../pages/admin/AdminResources'))
const AdminCommunity = lazy(() => import('../pages/admin/AdminCommunity'))
const AdminAuditLogs = lazy(() => import('../pages/admin/AdminAuditLogs'))

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingRoute><Home /></LandingRoute> },
      { path: '/how-it-works', element: <HowItWorks /> },
      { path: '/professionals', element: <Professionals /> },
      { path: '/professionals/:id', element: <ProfessionalDetail /> },
      { path: '/resources', element: <Resources /> },
      { path: '/resources/:slug', element: <ResourceDetail /> },
      { path: '/safety', element: <Safety /> },
      { path: '/help/emergency', element: <Emergency /> },
      { path: '/help/contact', element: <Contact /> },
      { path: '/join', element: <Join /> },
      { path: '/privacy', element: <Privacy /> },
      { path: '/terms', element: <Terms /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { element: <GuestRoute />, children: [{ path: '/login', element: <Login /> }, { path: '/register', element: <Register /> }] },
    ],
  },
  {
    element: <OnboardingRoute />,
    children: [{ path: '/onboarding', element: <Onboarding /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RequireOnboardingRoute />,
        children: [
          {
            element: <RoleRoute roles={['USER']} />,
            children: [
              {
                element: <AppLayout />,
                children: [
                  { path: '/app', element: <UserDashboard /> },
                  { path: '/app/check-in', element: <CheckIn /> },
                  { path: '/app/appointments', element: <Appointments /> },
                  { path: '/app/messages', element: <Messages /> },
                  { path: '/app/messages/:conversationId', element: <Messages /> },
                  { path: '/app/community', element: <Community /> },
                  { path: '/app/community/:groupId', element: <CommunityGroup /> },
                  { path: '/app/resources', element: <UserResources /> },
                  { path: '/app/notifications', element: <Notifications /> },
                  { path: '/app/profile', element: <ProfileSettings /> },
                  { path: '*', element: <NotFound /> },
                ],
              },
            ],
          },
          {
            element: <RoleRoute roles={['PROFESSIONAL']} />,
            children: [
              {
                element: <AppLayout />,
                children: [
                  { path: '/professional', element: <ProDashboard /> },
                  { path: '/professional/profile', element: <ProProfile /> },
                  { path: '/professional/availability', element: <ProAvailability /> },
                  { path: '/professional/appointments', element: <ProSessions /> },
                  { path: '/professional/clients', element: <ProClients /> },
                  { path: '/professional/clients/:id', element: <ProClientDetail /> },
                  { path: '/professional/messages', element: <Messages /> },
                  { path: '/professional/messages/:conversationId', element: <Messages /> },
                  { path: '/professional/follow-ups', element: <ProFollowUps /> },
                  { path: '/professional/notifications', element: <Notifications /> },
                  { path: '*', element: <NotFound /> },
                ],
              },
            ],
          },
      {
        element: <RoleRoute roles={['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPERVISOR']} />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                element: <RoleRoute roles={['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPERVISOR']} />,
                children: [
                  { path: '/admin', element: <AdminDashboard /> },
                  { path: '/admin/professionals', element: <AdminProfessionals /> },
                  { path: '/admin/safeguarding', element: <AdminSafeguarding /> },
                  { path: '/admin/community', element: <AdminCommunity /> },
                ],
              },
              {
                element: <RoleRoute roles={['ADMIN', 'SUPER_ADMIN']} />,
                children: [
                  { path: '/admin/users', element: <AdminUsers /> },
                  { path: '/admin/resources', element: <AdminResources /> },
                  { path: '/admin/audit-logs', element: <AdminAuditLogs /> },
                ],
              },
              { path: '/admin/*', element: <NotFound /> },
            ],
          },
        ],
      },
        ],
      },
    ],
  },
])