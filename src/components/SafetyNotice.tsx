import { Link } from 'react-router-dom'
import { HeartCrack } from 'lucide-react'
import { useEmergencyContacts } from '../services/emergency'

export function SafetyNotice({ compact = false }: { compact?: boolean }) {
  const { data } = useEmergencyContacts()
  const primary = data?.data.primary

  return (
    <div className="rounded-xl border border-hub-info/20 bg-hub-info/5 px-4 py-3 text-sm text-slate-700">
      <div className="flex items-start gap-3">
        <HeartCrack className="mt-0.5 h-5 w-5 shrink-0 text-hub-info" />
        <div>
          <p className="font-semibold text-hub-text">In immediate danger or feeling unsafe?</p>
          <p className="mt-1">
            {primary ? (
              <>
                Call <span className="font-bold text-hub-info">{primary.label}</span> on{' '}
                <a href={`tel:${primary.phone}`} className="font-bold text-hub-info underline">
                  {primary.phone}
                </a>
                , contact a trusted person, or reach your nearest health facility now.
              </>
            ) : (
              <>Contact emergency services, a trusted person, or your nearest health facility now.</>
            )}
          </p>
          {compact && (
            <p className="mt-1">
              <Link to="/help/emergency" className="font-medium text-hub-info underline underline-offset-2">
                See all emergency contacts and helplines
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}