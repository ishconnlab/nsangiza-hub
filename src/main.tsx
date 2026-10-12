import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { Toaster } from 'sonner'

import './index.css'
import { Loading } from './components/PageHeader'
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
            <Toaster position="top-center" richColors />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </StrictMode>,
)