import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { Toaster } from 'sonner'

import './index.css'
import { Loading } from './components/PageHeader'
import { InstallPrompt } from './components/InstallPrompt'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './hooks/AuthProvider'
import { LanguageProvider } from './i18n/LanguageProvider'
import { router } from './router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={200}>
            <Suspense fallback={<div className="grid min-h-screen place-items-center"><Loading label="Loading…" /></div>}>
              <RouterProvider router={router} />
            </Suspense>
            <InstallPrompt />
            <Toaster position="top-center" richColors />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </StrictMode>,
)

function hideBootSplash() {
  const boot = document.getElementById('nsz-boot')
  if (!boot) return
  boot.classList.add('nsz-hide')
  window.setTimeout(() => boot.remove(), 400)
}

requestAnimationFrame(() => {
  requestAnimationFrame(hideBootSplash)
})
window.setTimeout(hideBootSplash, 2500)
