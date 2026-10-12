import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Button } from '../../components/ui/button'
import { ProviderCard } from '../../components/ProviderCard'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { useCities, useProfessionals } from '../../services/professionals'
import { SUPPORT_CATEGORIES } from '../../lib/constants'

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'availability', label: 'Next available' },
  { value: 'experience', label: 'Most experienced' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
]

export default function Professionals() {
  const [q, setQ] = useState('')
  const [specialization, setSpecialization] = useState('all')
  const [city, setCity] = useState('all')
  const [language, setLanguage] = useState('all')
  const [sort, setSort] = useState('recommended')
  const [pageSize, setPageSize] = useState(12)

  const cities = useCities()

  const { data, isLoading, isError } = useProfessionals({
    q,
    specialization: specialization === 'all' ? undefined : specialization,
    city: city === 'all' ? undefined : city,
    language: language === 'all' ? undefined : language,
    sort,
    pageSize,
  })

  const providers = data?.data ?? []
  const total = data?.meta?.total ?? 0

  return (
    <div className="container-hub py-10">
      <PageHeader
        title="Find support"
        description="Browse verified psychological, counselling and wellbeing professionals across Rwanda."
      />

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Search by name, speciality…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={specialization} onValueChange={setSpecialization}>
          <SelectTrigger><SelectValue placeholder="Speciality" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All specialities</SelectItem>
            {SUPPORT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {(cities.data?.data.cities ?? []).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All languages</SelectItem>
            <SelectItem value="Kinyarwanda">Kinyarwanda</SelectItem>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="French">French</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-sm text-hub-muted">{total} professional{total === 1 ? '' : 's'} available</span>
      </div>

      {isLoading ? (
        <Loading label="Finding professionals…" />
      ) : isError ? (
        <EmptyState title="Could not load professionals" description="Please check your connection and try again." />
      ) : providers.length === 0 ? (
        <EmptyState title="No matches yet" description="Try clearing a filter or changing city." />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => <ProviderCard key={p.id} provider={p} />)}
        </div>
      )}

      {total > pageSize && (
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => setPageSize((s) => s + 12)}>
            Show more ({total - pageSize} more)
          </Button>
        </div>
      )}
    </div>
  )
}