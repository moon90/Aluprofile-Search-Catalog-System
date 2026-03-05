import { useEffect, useMemo, useState } from 'react';
import { SignIn, SignedIn, SignedOut, UserButton, useAuth, useUser } from '@clerk/clerk-react';
import {
  BadgeCheck,
  Boxes,
  Building2,
  KeyRound,
  Layers,
  Shield,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import ClerkUsersPanel from './ClerkUsersPanel';

type RefOption = { id: number; name: string; nameDe?: string; profilesCount?: number };
type Supplier = {
  id: number;
  name: string;
  nameDe?: string;
  address?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
};
type Profile = {
  id: number;
  name: string;
  nameDe?: string;
  description?: string;
  descriptionDe?: string;
  usage?: string;
  usageDe?: string;
  drawingUrl?: string;
  photoUrl?: string;
  logoUrl?: string;
  dimensions?: string;
  weightPerMeter?: number;
  material?: string;
  materialDe?: string;
  lengthMm?: number;
  status: string;
  supplier: Supplier;
  applications: RefOption[];
  crossSections: RefOption[];
};
type AppRole = 'ADMIN' | 'MANAGER' | 'USER';
type AppPermission =
  | 'VIEW_ADMIN'
  | 'PROFILES_MANAGE'
  | 'SUPPLIERS_MANAGE'
  | 'CATEGORIES_MANAGE'
  | 'USERS_MANAGE';
type AuthContext = {
  clerkUserId: string;
  appRole: AppRole;
  appPermissions: AppPermission[];
  source: 'database' | 'bootstrap';
};
type UserAccess = {
  id: number;
  clerkUserId: string;
  role: AppRole;
  permissions: AppPermission[];
};

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api';

type Lang = 'en' | 'de';
const TXT = {
  en: {
    adminPanel: 'Admin Panel',
    adminSubtitle: 'Manage users, permissions, and catalog master data',
    backToCatalog: 'Back to Catalog',
    language: 'Language',
    profiles: 'Profiles',
    suppliers: 'Suppliers',
    categories: 'Categories',
    clerkUsers: 'Clerk Users',
    managedUsers: 'Managed Users',
    signedInAs: 'Signed in as',
    unknownUser: 'unknown user',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    name: 'Name',
    address: 'Address',
    contactPerson: 'Contact person',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    saveSupplier: 'Save Supplier',
    application: 'Application',
    appName: 'Application name',
    saveApplication: 'Save Application',
    crossSection: 'Cross-section',
    crossSectionName: 'Cross-section name',
    saveCrossSection: 'Save Cross-section',
    saveProfile: 'Save Profile',
    drawingFile: 'Drawing file',
    photoFile: 'Photo file',
    supplier: 'Supplier',
    clerkUserId: 'Clerk User ID (user_xxx)',
    saveUserAccess: 'Save User Access',
    backendEnforced: 'Admin role plus permissions are enforced by backend for all /admin endpoints.',
    login: 'Login',
    accessDenied: 'Access denied',
    accessDeniedText: 'you do not have VIEW_ADMIN permission for this page.',
    quickActions: 'Quick Actions',
    seedDemoData: 'Seed Demo Data',
    supplierControls: 'Supplier Controls',
    categoryControls: 'Category Controls',
    profileControls: 'Profile Controls',
    appRolePermissions: 'App Role & Permission Management',
  },
  de: {
    adminPanel: 'Admin-Panel',
    adminSubtitle: 'Benutzer, Berechtigungen und Katalog-Stammdaten verwalten',
    backToCatalog: 'Zuruck zum Katalog',
    language: 'Sprache',
    profiles: 'Profile',
    suppliers: 'Lieferanten',
    categories: 'Kategorien',
    clerkUsers: 'Clerk-Benutzer',
    managedUsers: 'Verwaltete Benutzer',
    signedInAs: 'Angemeldet als',
    unknownUser: 'unbekannter Benutzer',
    save: 'Speichern',
    edit: 'Bearbeiten',
    delete: 'Loschen',
    name: 'Name',
    address: 'Adresse',
    contactPerson: 'Ansprechpartner',
    phone: 'Telefon',
    email: 'E-Mail',
    website: 'Webseite',
    saveSupplier: 'Lieferant speichern',
    application: 'Anwendung',
    appName: 'Anwendungsname',
    saveApplication: 'Anwendung speichern',
    crossSection: 'Querschnitt',
    crossSectionName: 'Querschnittsname',
    saveCrossSection: 'Querschnitt speichern',
    saveProfile: 'Profil speichern',
    drawingFile: 'Zeichnungsdatei',
    photoFile: 'Fotodatei',
    supplier: 'Lieferant',
    clerkUserId: 'Clerk-Benutzer-ID (user_xxx)',
    saveUserAccess: 'Benutzerzugriff speichern',
    backendEnforced: 'Admin-Rolle und Berechtigungen werden fur alle /admin-Endpunkte im Backend erzwungen.',
    login: 'Anmelden',
    accessDenied: 'Zugriff verweigert',
    accessDeniedText: 'Sie haben keine VIEW_ADMIN-Berechtigung fur diese Seite.',
    quickActions: 'Schnellaktionen',
    seedDemoData: 'Demo-Daten laden',
    supplierControls: 'Lieferantenverwaltung',
    categoryControls: 'Kategorienverwaltung',
    profileControls: 'Profilverwaltung',
    appRolePermissions: 'App-Rollen- und Berechtigungsverwaltung',
  },
} as const;

function AdminPage() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const [lang, setLang] = useState<Lang>('en');
  const [adminRef, setAdminRef] = useState<{
    suppliers: Supplier[];
    applications: RefOption[];
    crossSections: RefOption[];
    statusOptions: string[];
    roleOptions: AppRole[];
    permissionOptions: AppPermission[];
  } | null>(null);
  const [adminProfiles, setAdminProfiles] = useState<Profile[]>([]);
  const [authContext, setAuthContext] = useState<AuthContext | null>(null);
  const [userAccessList, setUserAccessList] = useState<UserAccess[]>([]);
  const [supplierForm, setSupplierForm] = useState<Partial<Supplier>>({ name: '' });
  const [applicationName, setApplicationName] = useState('');
  const [applicationNameDe, setApplicationNameDe] = useState('');
  const [crossSectionName, setCrossSectionName] = useState('');
  const [crossSectionNameDe, setCrossSectionNameDe] = useState('');
  const [editType, setEditType] = useState<'supplier' | 'application' | 'cross' | 'profile' | ''>('');
  const [editId, setEditId] = useState<number | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    nameDe: '',
    description: '',
    descriptionDe: '',
    usage: '',
    usageDe: '',
    drawingUrl: '',
    photoUrl: '',
    logoUrl: '',
    dimensions: '',
    weightPerMeter: '',
    material: '',
    materialDe: '',
    lengthMm: '',
    status: 'AVAILABLE',
    supplierId: '',
    applicationIds: [] as number[],
    crossSectionIds: [] as number[],
  });
  const [userAccessForm, setUserAccessForm] = useState<{
    clerkUserId: string;
    role: AppRole;
    permissions: AppPermission[];
  }>({
    clerkUserId: '',
    role: 'USER',
    permissions: ['VIEW_ADMIN'],
  });

  const t = TXT[lang];

  useEffect(() => {
    const saved = window.localStorage.getItem('aluprofile_lang');
    if (saved === 'en' || saved === 'de') setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('aluprofile_lang', lang);
  }, [lang]);

  const permissions = authContext?.appPermissions ?? [];
  const canViewAdmin = permissions.includes('VIEW_ADMIN');
  const canManageUsers = permissions.includes('USERS_MANAGE');
  const canManageProfiles = permissions.includes('PROFILES_MANAGE');
  const canManageSuppliers = permissions.includes('SUPPLIERS_MANAGE');
  const canManageCategories = permissions.includes('CATEGORIES_MANAGE');

  const clerkAppearance = useMemo(
    () => ({
      variables: {
        colorPrimary: 'hsl(188 62% 28%)',
        colorBackground: '#ffffff',
        colorInputBackground: '#f7fbfb',
        colorText: 'hsl(188 34% 14%)',
        borderRadius: '0.8rem',
      },
      elements: {
        card: 'rounded-2xl border border-teal-100 bg-white shadow-[0_15px_40px_-24px_rgba(17,94,89,0.45)]',
        headerTitle: 'text-slate-900 font-black',
        headerSubtitle: 'text-slate-600',
        formButtonPrimary: 'bg-teal-700 hover:bg-teal-800 text-white',
        formFieldInput: 'border-slate-200 bg-slate-50',
        socialButtonsBlockButton: 'hidden',
        dividerRow: 'hidden',
        footer: 'hidden',
      },
    }),
    [],
  );

  async function api(path: string, options?: RequestInit, requiresAuth = false) {
    const authToken = requiresAuth ? await getToken() : null;
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options?.headers ?? {}),
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res.json();
  }

  async function adminLoad() {
    if (!canViewAdmin) return;

    const ref = await api('/admin/reference-data', undefined, true);
    setAdminRef(ref);

    if (canManageProfiles) {
      const adminProfileData = await api('/admin/profiles', undefined, true);
      setAdminProfiles(adminProfileData);
    } else {
      setAdminProfiles([]);
    }
  }

  async function loadAuthContext() {
    if (!isSignedIn) {
      setAuthContext(null);
      return;
    }
    try {
      const me = await api('/auth/me', undefined, true);
      setAuthContext(me.auth ?? null);
    } catch {
      setAuthContext(null);
    }
  }

  async function loadUserAccess() {
    if (!canManageUsers) return;
    const list = await api('/admin/user-access', undefined, true);
    setUserAccessList(list);
  }

  useEffect(() => {
    loadAuthContext().catch((err) => setMessage(String(err)));
  }, [isSignedIn]);

  useEffect(() => {
    adminLoad().catch((err) => canViewAdmin && setMessage(String(err)));
  }, [canViewAdmin, canManageProfiles]);

  useEffect(() => {
    loadUserAccess().catch((err) => canManageUsers && setMessage(String(err)));
  }, [canManageUsers]);

  async function uploadFile(file: File) {
    const form = new FormData();
    form.append('file', file);
    const authToken = await getToken();
    const res = await fetch(`${API_BASE}/admin/uploads`, {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function saveSupplier() {
    if (!supplierForm.name) return;
    const method = editType === 'supplier' && editId ? 'PUT' : 'POST';
    const path =
      method === 'PUT' ? `/admin/suppliers/${editId}` : '/admin/suppliers';
    await api(path, { method, body: JSON.stringify(supplierForm) }, true);
    setSupplierForm({ name: '' });
    setEditType('');
    setEditId(null);
    await adminLoad();
  }

  async function saveApplication() {
    if (!applicationName) return;
    const method = editType === 'application' && editId ? 'PUT' : 'POST';
    const path =
      method === 'PUT' ? `/admin/applications/${editId}` : '/admin/applications';
    await api(path, { method, body: JSON.stringify({ name: applicationName, nameDe: applicationNameDe || undefined }) }, true);
    setApplicationName('');
    setApplicationNameDe('');
    setEditType('');
    setEditId(null);
    await adminLoad();
  }

  async function saveCrossSection() {
    if (!crossSectionName) return;
    const method = editType === 'cross' && editId ? 'PUT' : 'POST';
    const path =
      method === 'PUT'
        ? `/admin/cross-sections/${editId}`
        : '/admin/cross-sections';
    await api(path, { method, body: JSON.stringify({ name: crossSectionName, nameDe: crossSectionNameDe || undefined }) }, true);
    setCrossSectionName('');
    setCrossSectionNameDe('');
    setEditType('');
    setEditId(null);
    await adminLoad();
  }

  async function saveProfile() {
    const method = editType === 'profile' && editId ? 'PUT' : 'POST';
    const path = method === 'PUT' ? `/admin/profiles/${editId}` : '/admin/profiles';
    await api(
      path,
      {
        method,
        body: JSON.stringify({
          ...profileForm,
          supplierId: Number(profileForm.supplierId),
        }),
      },
      true,
    );
    setProfileForm({
      name: '',
      nameDe: '',
      description: '',
      descriptionDe: '',
      usage: '',
      usageDe: '',
      drawingUrl: '',
      photoUrl: '',
      logoUrl: '',
      dimensions: '',
      weightPerMeter: '',
      material: '',
      materialDe: '',
      lengthMm: '',
      status: 'AVAILABLE',
      supplierId: '',
      applicationIds: [],
      crossSectionIds: [],
    });
    setEditType('');
    setEditId(null);
    await adminLoad();
  }

  const deleteItem = async (path: string) => {
    await api(path, { method: 'DELETE' }, true);
    await adminLoad();
  };

  async function saveUserAccess() {
    if (!userAccessForm.clerkUserId.trim()) return;
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
    );
    setUserAccessForm({
      clerkUserId: '',
      role: 'USER',
      permissions: ['VIEW_ADMIN'],
    });
    await loadUserAccess();
  }

  async function deleteUserAccess(clerkUserId: string) {
    await api(`/admin/user-access/${encodeURIComponent(clerkUserId)}`, { method: 'DELETE' }, true);
    await loadUserAccess();
  }

  async function seedDemoData() {
    const result = await api('/admin/demo-data/seed', { method: 'POST' }, true);
    setMessage(`${result.message}. Profiles: ${result.totals?.profiles ?? 0}`);
    await adminLoad();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_8%,#dff0f0,transparent_34%),radial-gradient(circle_at_86%_0%,#d6ecec,transparent_36%),linear-gradient(180deg,#eef6f6_0%,#f9fbfb_100%)]">
      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
        {isSignedIn && (
        <header className="mb-6 rounded-2xl border border-teal-100/70 bg-white/95 p-5 shadow-[0_15px_40px_-24px_rgba(17,94,89,0.45)] md:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">catalog system</p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">{t.adminPanel}</h1>
              <p className="mt-2 max-w-3xl text-slate-600">{t.adminSubtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <a href="/">
                <Button variant="secondary">{t.backToCatalog}</Button>
              </a>
              {/* language */}
              <label className="text-sm font-medium text-slate-700">
                {t.language}:{' '}
                <select className="rounded-md border bg-background px-3 py-2" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
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
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
              <p className="text-xs uppercase tracking-wider text-teal-700">{t.profiles}</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900"><Boxes className="h-5 w-5 text-teal-700" /> {adminProfiles.length}</p>
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
              <p className="text-xs uppercase tracking-wider text-teal-700">{t.suppliers}</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900"><Building2 className="h-5 w-5 text-teal-700" /> {adminRef?.suppliers.length ?? 0}</p>
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
              <p className="text-xs uppercase tracking-wider text-teal-700">{t.categories}</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900"><Layers className="h-5 w-5 text-teal-700" /> {(adminRef?.applications.length ?? 0) + (adminRef?.crossSections.length ?? 0)}</p>
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
              <p className="text-xs uppercase tracking-wider text-teal-700">{t.managedUsers}</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900"><Users className="h-5 w-5 text-teal-700" /> {userAccessList.length}</p>
            </div>
          </div>
        </header>
        )}

        {message && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</p>}

        <main className="grid gap-4 lg:grid-cols-3">
          <SignedOut>
            <Card className="rounded-2xl border-slate-200 bg-white/95 lg:col-span-3">
              <CardHeader>
                <CardTitle>{t.login}</CardTitle>
              </CardHeader>
              <CardContent className="flex min-h-[60vh] items-center justify-center rounded-b-xl bg-gradient-to-b from-white to-teal-50/40">
                <SignIn routing="hash" appearance={clerkAppearance} forceRedirectUrl="/admin" fallbackRedirectUrl="/admin" />
              </CardContent>
            </Card>
          </SignedOut>

          <SignedIn>
            {!canViewAdmin && (
              <Card className="rounded-2xl border-slate-200 bg-white/95 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700"><Shield className="h-5 w-5" /> {t.accessDenied}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t.signedInAs} {user?.primaryEmailAddress?.emailAddress ?? t.unknownUser}, but {t.accessDeniedText}
                  </p>
                </CardContent>
              </Card>
            )}

            {canViewAdmin && (
              <>
                {canManageProfiles && (
                  <Card className="rounded-2xl border-slate-200 bg-white/95 lg:col-span-3">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-teal-700" /> {t.quickActions}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      <Button onClick={seedDemoData}>{t.seedDemoData}</Button>
                    </CardContent>
                  </Card>
                )}

                <ClerkUsersPanel canManageUsers={canManageUsers} lang={lang} />

                {canManageSuppliers && (
                <Card className="rounded-2xl border-slate-200 bg-white/95">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-teal-700" /> {t.supplierControls}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 grid gap-2 md:grid-cols-2">
                      <Input placeholder={t.name + ' (EN)'} value={supplierForm.name ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, name: e.target.value }))} />
                      <Input placeholder={t.name + ' (DE)'} value={supplierForm.nameDe ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, nameDe: e.target.value }))} />
                      <Input placeholder={t.address} value={supplierForm.address ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, address: e.target.value }))} />
                      <Input placeholder={t.contactPerson} value={supplierForm.contactPerson ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, contactPerson: e.target.value }))} />
                      <Input placeholder={t.phone} value={supplierForm.phone ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, phone: e.target.value }))} />
                      <Input placeholder={t.email} value={supplierForm.email ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, email: e.target.value }))} />
                      <Input placeholder={t.website} value={supplierForm.website ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, website: e.target.value }))} />
                    </div>
                    <Button onClick={saveSupplier}>{t.saveSupplier}</Button>
                    <ul className="mt-2 space-y-1 text-sm">
                      {adminRef?.suppliers.map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <span className="font-medium text-slate-800">{s.name}{s.nameDe ? ` / ${s.nameDe}` : ''}</span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setEditType('supplier'); setEditId(s.id); setSupplierForm(s); }}>{t.edit}</Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteItem(`/admin/suppliers/${s.id}`)}>{t.delete}</Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                )}

                {canManageCategories && (
                <Card className="rounded-2xl border-slate-200 bg-white/95">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-teal-700" /> {t.categoryControls}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="mb-1 font-semibold">{t.application}</h3>
                    <Input value={applicationName} onChange={(e) => setApplicationName(e.target.value)} placeholder={t.appName + ' (EN)'} />
                    <Input value={applicationNameDe} onChange={(e) => setApplicationNameDe(e.target.value)} placeholder={t.appName + ' (DE)'} />
                    <Button className="mt-2" onClick={saveApplication}>{t.saveApplication}</Button>
                    <ul className="mt-2 space-y-1 text-sm">
                      {adminRef?.applications.map((a) => (
                        <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <span className="font-medium text-slate-800">{a.name}{a.nameDe ? ` / ${a.nameDe}` : ''}</span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setEditType('application'); setEditId(a.id); setApplicationName(a.name); setApplicationNameDe(a.nameDe ?? ''); }}>{t.edit}</Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteItem(`/admin/applications/${a.id}`)}>{t.delete}</Button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <h3 className="mb-1 mt-4 font-semibold">{t.crossSection}</h3>
                    <Input value={crossSectionName} onChange={(e) => setCrossSectionName(e.target.value)} placeholder={t.crossSectionName + ' (EN)'} />
                    <Input value={crossSectionNameDe} onChange={(e) => setCrossSectionNameDe(e.target.value)} placeholder={t.crossSectionName + ' (DE)'} />
                    <Button className="mt-2" onClick={saveCrossSection}>{t.saveCrossSection}</Button>
                    <ul className="mt-2 space-y-1 text-sm">
                      {adminRef?.crossSections.map((c) => (
                        <li key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <span className="font-medium text-slate-800">{c.name}{c.nameDe ? ` / ${c.nameDe}` : ''}</span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setEditType('cross'); setEditId(c.id); setCrossSectionName(c.name); setCrossSectionNameDe(c.nameDe ?? ''); }}>{t.edit}</Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteItem(`/admin/cross-sections/${c.id}`)}>{t.delete}</Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                )}

                {canManageProfiles && (
                <Card className="rounded-2xl border-slate-200 bg-white/95 lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Boxes className="h-5 w-5 text-teal-700" /> {t.profileControls}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 grid gap-2 md:grid-cols-3">
                      <Input placeholder={t.name + ' (EN)'} value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
                      <Input placeholder={t.name + ' (DE)'} value={profileForm.nameDe} onChange={(e) => setProfileForm((f) => ({ ...f, nameDe: e.target.value }))} />
                      <Input placeholder="Description (EN)" value={profileForm.description} onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))} />
                      <Input placeholder="Description (DE)" value={profileForm.descriptionDe} onChange={(e) => setProfileForm((f) => ({ ...f, descriptionDe: e.target.value }))} />
                      <Input placeholder="Usage (EN)" value={profileForm.usage} onChange={(e) => setProfileForm((f) => ({ ...f, usage: e.target.value }))} />
                      <Input placeholder="Usage (DE)" value={profileForm.usageDe} onChange={(e) => setProfileForm((f) => ({ ...f, usageDe: e.target.value }))} />
                      <Input placeholder="Dimensions" value={profileForm.dimensions} onChange={(e) => setProfileForm((f) => ({ ...f, dimensions: e.target.value }))} />
                      <Input placeholder="Weight/m" value={profileForm.weightPerMeter} onChange={(e) => setProfileForm((f) => ({ ...f, weightPerMeter: e.target.value }))} />
                      <Input placeholder="Length mm" value={profileForm.lengthMm} onChange={(e) => setProfileForm((f) => ({ ...f, lengthMm: e.target.value }))} />
                      <Input placeholder="Material (EN)" value={profileForm.material} onChange={(e) => setProfileForm((f) => ({ ...f, material: e.target.value }))} />
                      <Input placeholder="Material (DE)" value={profileForm.materialDe} onChange={(e) => setProfileForm((f) => ({ ...f, materialDe: e.target.value }))} />
                      <select className="rounded-md border bg-background px-3 py-2" value={profileForm.status} onChange={(e) => setProfileForm((f) => ({ ...f, status: e.target.value }))}>
                        {adminRef?.statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select className="rounded-md border bg-background px-3 py-2" value={profileForm.supplierId} onChange={(e) => setProfileForm((f) => ({ ...f, supplierId: e.target.value }))}>
                        <option value="">{t.supplier}</option>
                        {adminRef?.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <select className="rounded-md border bg-background px-3 py-2" multiple value={profileForm.applicationIds.map(String)} onChange={(e) => setProfileForm((f) => ({ ...f, applicationIds: Array.from(e.target.selectedOptions).map((o) => Number(o.value)) }))}>
                        {adminRef?.applications.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      <select className="rounded-md border bg-background px-3 py-2" multiple value={profileForm.crossSectionIds.map(String)} onChange={(e) => setProfileForm((f) => ({ ...f, crossSectionIds: Array.from(e.target.selectedOptions).map((o) => Number(o.value)) }))}>
                        {adminRef?.crossSections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <label className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">{t.drawingFile}
                        <input className="mt-1 block w-full" type="file" accept="image/*,.pdf" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const data = await uploadFile(file);
                          setProfileForm((f) => ({ ...f, drawingUrl: data.url }));
                        }} />
                      </label>
                      <label className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">{t.photoFile}
                        <input className="mt-1 block w-full" type="file" accept="image/*,.pdf" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const data = await uploadFile(file);
                          setProfileForm((f) => ({ ...f, photoUrl: data.url }));
                        }} />
                      </label>
                    </div>
                    <Button onClick={saveProfile}>{t.saveProfile}</Button>
                    <ul className="mt-3 space-y-1 text-sm">
                      {adminProfiles.map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <span className="font-medium text-slate-800">{p.name}{p.nameDe ? ` / ${p.nameDe}` : ''} ({p.status})</span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => {
                              setEditType('profile');
                              setEditId(p.id);
                              setProfileForm({
                                name: p.name ?? '',
                                nameDe: p.nameDe ?? '',
                                description: p.description ?? '',
                                descriptionDe: p.descriptionDe ?? '',
                                usage: p.usage ?? '',
                                usageDe: p.usageDe ?? '',
                                drawingUrl: p.drawingUrl ?? '',
                                photoUrl: p.photoUrl ?? '',
                                logoUrl: p.logoUrl ?? '',
                                dimensions: p.dimensions ?? '',
                                weightPerMeter: String(p.weightPerMeter ?? ''),
                                material: p.material ?? '',
                                materialDe: p.materialDe ?? '',
                                lengthMm: String(p.lengthMm ?? ''),
                                status: p.status ?? 'AVAILABLE',
                                supplierId: String(p.supplier?.id ?? ''),
                                applicationIds: p.applications.map((a) => a.id),
                                crossSectionIds: p.crossSections.map((c) => c.id),
                              });
                            }}>{t.edit}</Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteItem(`/admin/profiles/${p.id}`)}>{t.delete}</Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                )}

                {canManageUsers && (
                  <Card className="rounded-2xl border-slate-200 bg-white/95 lg:col-span-3">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><UserCog className="h-5 w-5 text-teal-700" /> {t.appRolePermissions}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3 grid gap-2 md:grid-cols-3">
                        <Input
                          placeholder={t.clerkUserId}
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
                        <Button onClick={saveUserAccess}>{t.saveUserAccess}</Button>
                      </div>
                      <div className="mb-3 grid gap-2 md:grid-cols-2">
                        {(adminRef?.permissionOptions ?? ['VIEW_ADMIN', 'PROFILES_MANAGE', 'SUPPLIERS_MANAGE', 'CATEGORIES_MANAGE', 'USERS_MANAGE'] as AppPermission[]).map((permission) => (
                          <label key={permission} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
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
                            <KeyRound className="h-4 w-4 text-teal-700" />
                            <span className="text-sm">{permission}</span>
                          </label>
                        ))}
                      </div>
                      <ul className="space-y-1 text-sm">
                        {userAccessList.map((item) => (
                          <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <div>
                              <span className="mr-2 font-medium text-slate-800">{item.clerkUserId}</span>
                              <span className="mr-2 rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold">{item.role}</span>
                              <span className="text-slate-600">{item.permissions.join(', ')}</span>
                            </div>
                            <div className="flex gap-1">
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
                            </div>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 flex items-center gap-1 text-xs text-slate-500"><BadgeCheck className="h-3 w-3" /> {t.backendEnforced}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </SignedIn>
        </main>
      </div>
    </div>
  );
}

export default AdminPage;
