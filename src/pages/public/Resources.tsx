import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Button } from '../../components/ui/button'
import { ResourceCard } from '../../components/ResourceCard'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { useResourceCategories, useResources } from '../../services/resources'
import { RESOURCE_CATEGORIES } from '../../lib/constants'

export default function Resources() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('all')
  const [language, setLanguage] = useState('all')
  const [pageSize, setPageSize] = useState(12)

  const { data: categories } = useResourceCategories()
  const backendCategories = categories?.data.categories ?? []

  const { data, isLoading, isError } = useResources({
    q,
    category: category === 'all' ? undefined : category,
    language: language === 'all' ? undefined : language,
    pageSize,
  })

  const resources = data?.data ?? []
  const total = data?.meta?.total ?? 0
  const categoryOptions = backendCategories.length ? backendCategories : [...RESOURCE_CATEGORIES]

  return (
    <div className="container-hub py-10">
      <PageHeader
        title="Wellbeing resources"
        description="Practical guides on mental health, stress, sleep and relationships — written with Rwanda in mind."
      />

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Search resources…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
      </div>

      {isLoading ? (
        <Loading label="Loading resources…" />
      ) : isError ? (
        <EmptyState title="Could not load resources" description="Please check your connection and try again." />
      ) : resources.length === 0 ? (
        <EmptyState title="No resources found" description="Try a different search or category." />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => <ResourceCard key={r.id} resource={r} />)}
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