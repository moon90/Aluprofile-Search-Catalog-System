import { useEffect, useMemo, useState } from 'react'
import { SignIn, SignedIn, SignedOut, UserButton, useAuth, useUser } from '@clerk/clerk-react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import './App.css'

type RefOption = { id: number; name: string; profilesCount?: number }
type Supplier = {
  id: number
  name: string
  address?: string
  contactPerson?: string
  email?: string
  phone?: string
  website?: string
}
type Profile = {
  id: number
  name: string
  description?: string
  usage?: string
  drawingUrl?: string
  photoUrl?: string
  logoUrl?: string
  dimensions?: string
  weightPerMeter?: number
  material?: string
  lengthMm?: number
  status: string
  supplier: Supplier
  applications: RefOption[]
  crossSections: RefOption[]
}
type AppRole = 'ADMIN' | 'MANAGER' | 'USER'
type AppPermission =
  | 'VIEW_ADMIN'
  | 'PROFILES_MANAGE'
  | 'SUPPLIERS_MANAGE'
  | 'CATEGORIES_MANAGE'
  | 'USERS_MANAGE'
type AuthContext = {
  clerkUserId: string
  appRole: AppRole
  appPermissions: AppPermission[]
  source: 'database' | 'bootstrap'
}
type UserAccess = {
  id: number
  clerkUserId: string
  role: AppRole
  permissions: AppPermission[]
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api'

const TXT = {
  en: {
    title: 'Aluprofile Search & Catalog',
    subtitle: 'Search aluminium profiles and manage catalog data',
    public: 'Public Catalog',
    admin: 'Admin',
    search: 'Search',
    language: 'Language',
    login: 'Login',
    logout: 'Logout',
  },
  de: {
    title: 'Aluprofile Suche & Katalog',
    subtitle: 'Aluminiumprofile suchen und Katalogdaten verwalten',
    public: 'Katalog',
    admin: 'Admin',
    search: 'Suche',
    language: 'Sprache',
    login: 'Anmelden',
    logout: 'Abmelden',
  },
} as const

function App() {
  const { getToken, isSignedIn } = useAuth()
  const { user } = useUser()
  const [lang, setLang] = useState<'en' | 'de'>('en')
  const [view, setView] = useState<'public' | 'admin'>('public')
  const [overview, setOverview] = useState<{
    applications: RefOption[]
    crossSections: RefOption[]
    newestProfiles: Profile[]
    totals: { profiles: number }
  } | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [detail, setDetail] = useState<Profile | null>(null)
  const [filters, setFilters] = useState({
    q: '',
    applicationId: '',
    crossSectionId: '',
    supplierId: '',
    material: '',
    dimensions: '',
  })
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [message, setMessage] = useState('')
  const [adminRef, setAdminRef] = useState<{
    suppliers: Supplier[]
    applications: RefOption[]
    crossSections: RefOption[]
    statusOptions: string[]
    roleOptions: AppRole[]
    permissionOptions: AppPermission[]
  } | null>(null)
  const [adminProfiles, setAdminProfiles] = useState<Profile[]>([])
  const [authContext, setAuthContext] = useState<AuthContext | null>(null)
  const [userAccessList, setUserAccessList] = useState<UserAccess[]>([])
  const [supplierForm, setSupplierForm] = useState<Partial<Supplier>>({ name: '' })
  const [applicationName, setApplicationName] = useState('')
  const [crossSectionName, setCrossSectionName] = useState('')
  const [editType, setEditType] = useState<'supplier' | 'application' | 'cross' | 'profile' | ''>('')
  const [editId, setEditId] = useState<number | null>(null)
  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    usage: '',
    drawingUrl: '',
    photoUrl: '',
    logoUrl: '',
    dimensions: '',
    weightPerMeter: '',
    material: '',
    lengthMm: '',
    status: 'AVAILABLE',
    supplierId: '',
    applicationIds: [] as number[],
    crossSectionIds: [] as number[],
  })
  const [userAccessForm, setUserAccessForm] = useState<{
    clerkUserId: string
    role: AppRole
    permissions: AppPermission[]
  }>({
    clerkUserId: '',
    role: 'USER',
    permissions: ['VIEW_ADMIN'],
  })

  const t = useMemo(() => TXT[lang], [lang])
  const canViewAdmin = !!authContext?.appPermissions.includes('VIEW_ADMIN')
  const canManageUsers =
    authContext?.appRole === 'ADMIN' &&
    authContext.appPermissions.includes('USERS_MANAGE')

  const qs = (obj: Record<string, string>) => {
    const params = new URLSearchParams()
    Object.entries(obj).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    return params.toString()
  }

  async function api(path: string, options?: RequestInit, requiresAuth = false) {
    const authToken = requiresAuth ? await getToken() : null
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options?.headers ?? {}),
      },
      ...options,
    })
    if (!res.ok) {
      throw new Error(await res.text())
    }
    return res.json()
  }

  async function loadPublic() {
    const [overviewData, profileData] = await Promise.all([
      api('/public/overview'),
      api(`/public/profiles?${qs(filters)}`),
    ])
    setOverview(overviewData)
    setProfiles(profileData)
    setSuppliers((profileData as Profile[]).map((p) => p.supplier).filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i))
  }

  async function loadDetail(id: number) {
    setDetail(await api(`/public/profiles/${id}`))
  }

  async function adminLoad() {
    if (!canViewAdmin) return
    const [ref, adminProfileData] = await Promise.all([
      api('/admin/reference-data', undefined, true),
      api('/admin/profiles', undefined, true),
    ])
    setAdminRef(ref)
    setAdminProfiles(adminProfileData)
  }

  async function loadAuthContext() {
    if (!isSignedIn) {
      setAuthContext(null)
      return
    }
    try {
      const me = await api('/auth/me', undefined, true)
      setAuthContext(me.auth ?? null)
    } catch {
      setAuthContext(null)
    }
  }

  async function loadUserAccess() {
    if (!canManageUsers) return
    const list = await api('/admin/user-access', undefined, true)
    setUserAccessList(list)
  }

  useEffect(() => {
    loadPublic().catch((err) => setMessage(String(err)))
  }, [])

  useEffect(() => {
    if (view === 'public') {
      loadPublic().catch((err) => setMessage(String(err)))
    }
  }, [filters, view])

  useEffect(() => {
    loadAuthContext().catch((err) => setMessage(String(err)))
  }, [isSignedIn])

  useEffect(() => {
    adminLoad().catch((err) => canViewAdmin && setMessage(String(err)))
  }, [canViewAdmin])

  useEffect(() => {
    loadUserAccess().catch((err) => canManageUsers && setMessage(String(err)))
  }, [canManageUsers])

  async function uploadFile(file: File) {
    const form = new FormData()
    form.append('file', file)
    const authToken = await getToken()
    const res = await fetch(`${API_BASE}/admin/uploads`, {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: form,
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async function saveSupplier() {
    if (!supplierForm.name) return
    const method = editType === 'supplier' && editId ? 'PUT' : 'POST'
    const path =
      method === 'PUT' ? `/admin/suppliers/${editId}` : '/admin/suppliers'
    await api(path, { method, body: JSON.stringify(supplierForm) }, true)
    setSupplierForm({ name: '' })
    setEditType('')
    setEditId(null)
    await adminLoad()
  }

  async function saveApplication() {
    if (!applicationName) return
    const method = editType === 'application' && editId ? 'PUT' : 'POST'
    const path =
      method === 'PUT' ? `/admin/applications/${editId}` : '/admin/applications'
    await api(path, { method, body: JSON.stringify({ name: applicationName }) }, true)
    setApplicationName('')
    setEditType('')
    setEditId(null)
    await adminLoad()
  }

  async function saveCrossSection() {
    if (!crossSectionName) return
    const method = editType === 'cross' && editId ? 'PUT' : 'POST'
    const path =
      method === 'PUT'
        ? `/admin/cross-sections/${editId}`
        : '/admin/cross-sections'
    await api(path, { method, body: JSON.stringify({ name: crossSectionName }) }, true)
    setCrossSectionName('')
    setEditType('')
    setEditId(null)
    await adminLoad()
  }

  async function saveProfile() {
    const method = editType === 'profile' && editId ? 'PUT' : 'POST'
    const path = method === 'PUT' ? `/admin/profiles/${editId}` : '/admin/profiles'
    await api(path, {
      method,
      body: JSON.stringify({
        ...profileForm,
        supplierId: Number(profileForm.supplierId),
      }),
    }, true)
    setProfileForm({
      name: '',
      description: '',
      usage: '',
      drawingUrl: '',
      photoUrl: '',
      logoUrl: '',
      dimensions: '',
      weightPerMeter: '',
      material: '',
      lengthMm: '',
      status: 'AVAILABLE',
      supplierId: '',
      applicationIds: [],
      crossSectionIds: [],
    })
    setEditType('')
    setEditId(null)
    await adminLoad()
    await loadPublic()
  }

  const deleteItem = async (path: string) => {
    await api(path, { method: 'DELETE' }, true)
    await adminLoad()
    await loadPublic()
  }

  async function saveUserAccess() {
    if (!userAccessForm.clerkUserId.trim()) return
    await api(
      '/admin/user-access',
      {
        method: 'POST',
        body: JSON.stringify({
          clerkUserId: userAccessForm.clerkUserId.trim(),
          role: userAccessForm.role,
          permissions: userAccessForm.permissions,
        }),
      },
      true,
    )
    setUserAccessForm({
      clerkUserId: '',
      role: 'USER',
      permissions: ['VIEW_ADMIN'],
    })
    await loadUserAccess()
  }

  async function deleteUserAccess(clerkUserId: string) {
    await api(`/admin/user-access/${encodeURIComponent(clerkUserId)}`, { method: 'DELETE' }, true)
    await loadUserAccess()
  }

  return (
    <div className="container py-6">
      <header className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={view === 'public' ? 'default' : 'secondary'} onClick={() => setView('public')}>{t.public}</Button>
          <Button variant={view === 'admin' ? 'default' : 'secondary'} onClick={() => setView('admin')}>{t.admin}</Button>
          <label>
            {t.language}:{' '}
            <select className="rounded-md border bg-background px-3 py-2" value={lang} onChange={(e) => setLang(e.target.value as 'en' | 'de')}>
              <option value="en">EN</option>
              <option value="de">DE</option>
            </select>
          </label>
          <SignedIn>
            <div className="rounded-md border bg-card p-1">
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </header>
      {message && <p className="mb-4 text-sm text-red-700">{message}</p>}

      {view === 'public' && (
        <main className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
            <p>Total profiles: {overview?.totals?.profiles ?? 0}</p>
            <h3>Applications</h3>
            <ul>{overview?.applications.map((a) => <li key={a.id}>{a.name} ({a.profilesCount})</li>)}</ul>
            <h3>Cross-sections</h3>
            <ul>{overview?.crossSections.map((c) => <li key={c.id}>{c.name} ({c.profilesCount})</li>)}</ul>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t.search}</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="mb-3 grid gap-2 md:grid-cols-3">
              <Input placeholder="text" value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
              <select className="rounded-md border bg-background px-3 py-2" value={filters.applicationId} onChange={(e) => setFilters((f) => ({ ...f, applicationId: e.target.value }))}>
                <option value="">Application</option>
                {overview?.applications.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <select className="rounded-md border bg-background px-3 py-2" value={filters.crossSectionId} onChange={(e) => setFilters((f) => ({ ...f, crossSectionId: e.target.value }))}>
                <option value="">Cross-section</option>
                {overview?.crossSections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="rounded-md border bg-background px-3 py-2" value={filters.supplierId} onChange={(e) => setFilters((f) => ({ ...f, supplierId: e.target.value }))}>
                <option value="">Supplier</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <Input placeholder="material" value={filters.material} onChange={(e) => setFilters((f) => ({ ...f, material: e.target.value }))} />
              <Input placeholder="dimensions" value={filters.dimensions} onChange={(e) => setFilters((f) => ({ ...f, dimensions: e.target.value }))} />
            </div>
            <table className="w-full border-collapse text-sm">
              <thead><tr><th>Name</th><th>Dimensions</th><th>Usage</th><th>Supplier</th><th>Status</th></tr></thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} onClick={() => loadDetail(p.id)}>
                    <td>{p.name}</td>
                    <td>{p.dimensions}</td>
                    <td>{p.usage}</td>
                    <td>{p.supplier?.name}</td>
                    <td>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Detail</CardTitle>
            </CardHeader>
            <CardContent>
            {!detail && <p>Select a profile from the list.</p>}
            {detail && (
              <div className="detail">
                <h3>{detail.name}</h3>
                <p>{detail.description}</p>
                <p><b>Usage:</b> {detail.usage}</p>
                <p><b>Dimensions:</b> {detail.dimensions}</p>
                <p><b>Weight/m:</b> {detail.weightPerMeter}</p>
                <p><b>Length (mm):</b> {detail.lengthMm}</p>
                <p><b>Material:</b> {detail.material}</p>
                <p><b>Status:</b> {detail.status}</p>
                <p><b>Supplier:</b> {detail.supplier?.name} / {detail.supplier?.phone}</p>
                <div className="images">
                  {detail.drawingUrl && <a href={detail.drawingUrl} target="_blank">Drawing</a>}
                  {detail.photoUrl && <a href={detail.photoUrl} target="_blank">Photo</a>}
                  {detail.logoUrl && <a href={detail.logoUrl} target="_blank">Logo</a>}
                </div>
              </div>
            )}
            </CardContent>
          </Card>
        </main>
      )}

      {view === 'admin' && (
        <main className="grid gap-4 lg:grid-cols-3">
          <SignedOut>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{t.login}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <SignIn routing="hash" />
              </CardContent>
            </Card>
          </SignedOut>
          <SignedIn>
            {!canViewAdmin && (
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Access denied</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Signed in as {user?.primaryEmailAddress?.emailAddress ?? 'unknown user'}, but no app access is configured yet.
                  </p>
                </CardContent>
              </Card>
            )}
            {canViewAdmin && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Admin Controls</CardTitle>
                </CardHeader>
                <CardContent>
                <h3>Supplier</h3>
                <div className="mb-3 grid gap-2 md:grid-cols-2">
                  <Input placeholder="Name" value={supplierForm.name ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, name: e.target.value }))} />
                  <Input placeholder="Address" value={supplierForm.address ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, address: e.target.value }))} />
                  <Input placeholder="Contact person" value={supplierForm.contactPerson ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, contactPerson: e.target.value }))} />
                  <Input placeholder="Phone" value={supplierForm.phone ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, phone: e.target.value }))} />
                  <Input placeholder="Email" value={supplierForm.email ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, email: e.target.value }))} />
                  <Input placeholder="Website" value={supplierForm.website ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, website: e.target.value }))} />
                </div>
                <Button onClick={saveSupplier}>Save Supplier</Button>
                <ul>
                  {adminRef?.suppliers.map((s) => (
                    <li key={s.id}>
                      {s.name}
                      <Button size="sm" variant="ghost" onClick={() => { setEditType('supplier'); setEditId(s.id); setSupplierForm(s) }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteItem(`/admin/suppliers/${s.id}`)}>Delete</Button>
                    </li>
                  ))}
                </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Controls</CardTitle>
                </CardHeader>
                <CardContent>
                <h3>Application</h3>
                <Input value={applicationName} onChange={(e) => setApplicationName(e.target.value)} placeholder="Application name" />
                <Button className="mt-2" onClick={saveApplication}>Save Application</Button>
                <ul>
                  {adminRef?.applications.map((a) => (
                    <li key={a.id}>
                      {a.name}
                      <Button size="sm" variant="ghost" onClick={() => { setEditType('application'); setEditId(a.id); setApplicationName(a.name) }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteItem(`/admin/applications/${a.id}`)}>Delete</Button>
                    </li>
                  ))}
                </ul>

                <h3>Cross-section</h3>
                <Input value={crossSectionName} onChange={(e) => setCrossSectionName(e.target.value)} placeholder="Cross-section name" />
                <Button className="mt-2" onClick={saveCrossSection}>Save Cross-section</Button>
                <ul>
                  {adminRef?.crossSections.map((c) => (
                    <li key={c.id}>
                      {c.name}
                      <Button size="sm" variant="ghost" onClick={() => { setEditType('cross'); setEditId(c.id); setCrossSectionName(c.name) }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteItem(`/admin/cross-sections/${c.id}`)}>Delete</Button>
                    </li>
                  ))}
                </ul>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent>
                <h3>Profile</h3>
                <div className="mb-3 grid gap-2 md:grid-cols-3">
                  <Input placeholder="Name" value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
                  <Input placeholder="Description" value={profileForm.description} onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))} />
                  <Input placeholder="Usage" value={profileForm.usage} onChange={(e) => setProfileForm((f) => ({ ...f, usage: e.target.value }))} />
                  <Input placeholder="Dimensions" value={profileForm.dimensions} onChange={(e) => setProfileForm((f) => ({ ...f, dimensions: e.target.value }))} />
                  <Input placeholder="Weight/m" value={profileForm.weightPerMeter} onChange={(e) => setProfileForm((f) => ({ ...f, weightPerMeter: e.target.value }))} />
                  <Input placeholder="Length mm" value={profileForm.lengthMm} onChange={(e) => setProfileForm((f) => ({ ...f, lengthMm: e.target.value }))} />
                  <Input placeholder="Material" value={profileForm.material} onChange={(e) => setProfileForm((f) => ({ ...f, material: e.target.value }))} />
                  <select className="rounded-md border bg-background px-3 py-2" value={profileForm.status} onChange={(e) => setProfileForm((f) => ({ ...f, status: e.target.value }))}>
                    {adminRef?.statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select className="rounded-md border bg-background px-3 py-2" value={profileForm.supplierId} onChange={(e) => setProfileForm((f) => ({ ...f, supplierId: e.target.value }))}>
                    <option value="">Supplier</option>
                    {adminRef?.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select className="rounded-md border bg-background px-3 py-2" multiple value={profileForm.applicationIds.map(String)} onChange={(e) => setProfileForm((f) => ({ ...f, applicationIds: Array.from(e.target.selectedOptions).map((o) => Number(o.value)) }))}>
                    {adminRef?.applications.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <select className="rounded-md border bg-background px-3 py-2" multiple value={profileForm.crossSectionIds.map(String)} onChange={(e) => setProfileForm((f) => ({ ...f, crossSectionIds: Array.from(e.target.selectedOptions).map((o) => Number(o.value)) }))}>
                    {adminRef?.crossSections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <label>Drawing file
                    <input type="file" accept="image/*,.pdf" onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const data = await uploadFile(file)
                      setProfileForm((f) => ({ ...f, drawingUrl: data.url }))
                    }} />
                  </label>
                  <label>Photo file
                    <input type="file" accept="image/*,.pdf" onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const data = await uploadFile(file)
                      setProfileForm((f) => ({ ...f, photoUrl: data.url }))
                    }} />
                  </label>
                </div>
                <Button onClick={saveProfile}>Save Profile</Button>
                <ul>
                  {adminProfiles.map((p) => (
                    <li key={p.id}>
                      {p.name} ({p.status})
                      <Button size="sm" variant="ghost" onClick={() => {
                        setEditType('profile')
                        setEditId(p.id)
                        setProfileForm({
                          name: p.name ?? '',
                          description: p.description ?? '',
                          usage: p.usage ?? '',
                          drawingUrl: p.drawingUrl ?? '',
                          photoUrl: p.photoUrl ?? '',
                          logoUrl: p.logoUrl ?? '',
                          dimensions: p.dimensions ?? '',
                          weightPerMeter: String(p.weightPerMeter ?? ''),
                          material: p.material ?? '',
                          lengthMm: String(p.lengthMm ?? ''),
                          status: p.status ?? 'AVAILABLE',
                          supplierId: String(p.supplier?.id ?? ''),
                          applicationIds: p.applications.map((a) => a.id),
                          crossSectionIds: p.crossSections.map((c) => c.id),
                        })
                      }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteItem(`/admin/profiles/${p.id}`)}>Delete</Button>
                    </li>
                  ))}
                </ul>
                </CardContent>
              </Card>
              {canManageUsers && (
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Role & Permission Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Roles: Admin, Manager, User
                    </p>
                    <div className="mb-3 grid gap-2 md:grid-cols-3">
                      <Input
                        placeholder="Clerk User ID (user_xxx)"
                        value={userAccessForm.clerkUserId}
                        onChange={(e) =>
                          setUserAccessForm((f) => ({
                            ...f,
                            clerkUserId: e.target.value,
                          }))
                        }
                      />
                      <select
                        className="rounded-md border bg-background px-3 py-2"
                        value={userAccessForm.role}
                        onChange={(e) =>
                          setUserAccessForm((f) => ({
                            ...f,
                            role: e.target.value as AppRole,
                          }))
                        }
                      >
                        {(adminRef?.roleOptions ?? ['ADMIN', 'MANAGER', 'USER']).map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <Button onClick={saveUserAccess}>Save User Access</Button>
                    </div>
                    <div className="mb-3 grid gap-2 md:grid-cols-2">
                      {(adminRef?.permissionOptions ?? ['VIEW_ADMIN', 'PROFILES_MANAGE', 'SUPPLIERS_MANAGE', 'CATEGORIES_MANAGE', 'USERS_MANAGE'] as AppPermission[]).map((permission) => (
                        <label key={permission} className="flex items-center gap-2 rounded-md border p-2">
                          <input
                            type="checkbox"
                            checked={userAccessForm.permissions.includes(permission)}
                            onChange={(e) =>
                              setUserAccessForm((f) => ({
                                ...f,
                                permissions: e.target.checked
                                  ? [...new Set([...f.permissions, permission])]
                                  : f.permissions.filter((item) => item !== permission),
                              }))
                            }
                          />
                          <span className="text-sm">{permission}</span>
                        </label>
                      ))}
                    </div>
                    <ul>
                      {userAccessList.map((item) => (
                        <li key={item.id}>
                          <span className="mr-2 font-medium">{item.clerkUserId}</span>
                          <span className="mr-2">Role: {item.role}</span>
                          <span className="mr-2">Perms: {item.permissions.join(', ')}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setUserAccessForm({
                                clerkUserId: item.clerkUserId,
                                role: item.role,
                                permissions: item.permissions,
                              })
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUserAccess(item.clerkUserId)}
                          >
                            Delete
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
            )}
          </SignedIn>
        </main>
      )}
    </div>
  )
}

export default App
