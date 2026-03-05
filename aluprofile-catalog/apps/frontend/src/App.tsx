import { useEffect, useMemo, useState } from 'react';
import { SignedIn, UserButton } from '@clerk/clerk-react';
import {
  BadgeCheck,
  Boxes,
  Building2,
  ExternalLink,
  Globe,
  ImageIcon,
  LayoutGrid,
  Mail,
  Phone,
  Ruler,
  Search,
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import './App.css';

type RefOption = { id: number; name: string; profilesCount?: number };
type Supplier = {
  id: number;
  name: string;
  address?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
};
type Profile = {
  id: number;
  name: string;
  description?: string;
  usage?: string;
  drawingUrl?: string;
  photoUrl?: string;
  logoUrl?: string;
  dimensions?: string;
  weightPerMeter?: number;
  material?: string;
  lengthMm?: number;
  status: string;
  supplier: Supplier;
  applications: RefOption[];
  crossSections: RefOption[];
};

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api';

const TXT = {
  en: {
    title: 'Aluprofile Search & Catalog',
    subtitle: 'Find the right aluminum profile with technical details and supplier contact.',
    search: 'Search',
    language: 'Language',
    adminPanel: 'Admin Panel',
    totalProfiles: 'Total Profiles',
    applications: 'Applications',
    crossSections: 'Cross-sections',
    nameKeyword: 'Name / keyword',
    application: 'Application',
    crossSection: 'Cross-section',
    supplier: 'Supplier',
    material: 'Material',
    dimensions: 'Dimensions',
    profileCatalog: 'Profile Catalog',
    drawing: 'Drawing',
    description: 'Description',
    applicationCol: 'Application',
    visual: 'Visual',
    contact: 'Contact',
    details: 'Details',
    noProfiles: '{t.noProfiles}',
    profileDetailSheet: 'Profile Detail Sheet',
    selectProfile: 'Select a profile from the table.',
    technicalView: 'Technical View',
    designation: 'Designation',
    masse: 'Size',
    weightPerMeter: 'Weight kg/m',
    length: 'Length',
    usage: 'Usage',
    status: 'Status',
    supplierFiles: 'Supplier & Files',
    contactPerson: 'Contact person',
    openDrawing: 'Open Drawing',
    openPhoto: 'Open Photo',
    openLogo: 'Open Logo',
    linkedCategories: 'Linked Categories',
  },
  de: {
    title: 'Aluprofile Suche & Katalog',
    subtitle: 'Finden Sie das passende Aluminiumprofil mit technischen Daten und Lieferantenkontakt.',
    search: 'Suche',
    language: 'Sprache',
    adminPanel: 'Admin-Panel',
    totalProfiles: 'Gesamtprofile',
    applications: 'Anwendungen',
    crossSections: 'Querschnitte',
    nameKeyword: 'Name / Stichwort',
    application: 'Anwendung',
    crossSection: 'Querschnitt',
    supplier: 'Lieferant',
    material: 'Material',
    dimensions: 'Abmessungen',
    profileCatalog: 'Profilkatalog',
    drawing: 'Zeichnung',
    description: 'Beschreibung',
    applicationCol: 'Anwendung',
    visual: 'Ansicht',
    contact: 'Kontakt',
    details: 'Details',
    noProfiles: 'Keine Profile fur die aktuellen Filter gefunden.',
    profileDetailSheet: 'Profil-Detailblatt',
    selectProfile: 'Bitte ein Profil aus der Tabelle auswahlen.',
    technicalView: 'Technische Ansicht',
    designation: 'Bezeichnung',
    masse: 'Masse',
    weightPerMeter: 'Gewicht kg/m',
    length: 'Lange',
    usage: 'Anwendung',
    status: 'Status',
    supplierFiles: 'Lieferant & Dateien',
    contactPerson: 'Ansprechpartner',
    openDrawing: 'Zeichnung offnen',
    openPhoto: 'Foto offnen',
    openLogo: 'Logo offnen',
    linkedCategories: 'Verknupfte Kategorien',
  },
} as const;

function statusStyle(status?: string) {
  if (status === 'AVAILABLE') return 'bg-emerald-100 text-emerald-800';
  if (status === 'IN_DEVELOPMENT') return 'bg-amber-100 text-amber-900';
  return 'bg-slate-200 text-slate-700';
}

function safeUrl(value?: string) {
  return value && value.trim().length > 0 ? value : undefined;
}

function App() {
  const [lang, setLang] = useState<'en' | 'de'>('en');
  const [overview, setOverview] = useState<{
    applications: RefOption[];
    crossSections: RefOption[];
    newestProfiles: Profile[];
    totals: { profiles: number };
  } | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [detail, setDetail] = useState<Profile | null>(null);
  const [filters, setFilters] = useState({
    q: '',
    applicationId: '',
    crossSectionId: '',
    supplierId: '',
    material: '',
    dimensions: '',
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [message, setMessage] = useState('');

  const t = useMemo(() => TXT[lang], [lang]);

  useEffect(() => {
    const saved = window.localStorage.getItem('aluprofile_lang');
    if (saved === 'en' || saved === 'de') setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('aluprofile_lang', lang);
  }, [lang]);

  const qs = (obj: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    return params.toString();
  };

  async function api(path: string, options?: RequestInit) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res.json();
  }

  async function loadPublic() {
    const [overviewData, profileData] = await Promise.all([
      api(`/public/overview?lang=${lang}`),
      api(`/public/profiles?${qs({ ...filters, lang })}`),
    ]);
    const profileList = profileData as Profile[];
    setOverview(overviewData);
    setProfiles(profileList);
    setSuppliers(
      profileList
        .map((p) => p.supplier)
        .filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i),
    );
    if (profileList.length > 0) {
      const selectedStillExists = detail && profileList.some((p) => p.id === detail.id);
      if (!selectedStillExists) setDetail(profileList[0]);
    } else {
      setDetail(null);
    }
  }

  async function loadDetail(id: number) {
    setDetail(await api(`/public/profiles/${id}?lang=${lang}`));
  }

  useEffect(() => {
    loadPublic().catch((err) => setMessage(String(err)));
  }, []);

  useEffect(() => {
    loadPublic().catch((err) => setMessage(String(err)));
  }, [filters, lang]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_8%,#dff0f0,transparent_34%),radial-gradient(circle_at_86%_0%,#d6ecec,transparent_36%),linear-gradient(180deg,#eef6f6_0%,#f9fbfb_100%)]">
      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
        <header className="mb-6 rounded-2xl border border-teal-100/70 bg-white/95 p-5 shadow-[0_15px_40px_-24px_rgba(17,94,89,0.45)] md:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">catalog system</p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">{t.title}</h1>
              <p className="mt-2 max-w-3xl text-slate-600">{t.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SignedIn>
                <a href="/admin">
                <Button variant="secondary">{t.adminPanel}</Button>
              </a>
              </SignedIn>
              <label className="text-sm font-medium text-slate-700">
                {t.language}:{' '}
                <select
                  className="rounded-md border bg-background px-3 py-2"
                  value={lang}
                  onChange={(e) => setLang(e.target.value as 'en' | 'de')}
                >
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

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
              <p className="text-xs uppercase tracking-wider text-teal-700">{t.totalProfiles}</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
                <Boxes className="h-5 w-5 text-teal-700" /> {overview?.totals?.profiles ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
              <p className="text-xs uppercase tracking-wider text-teal-700">{t.applications}</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
                <LayoutGrid className="h-5 w-5 text-teal-700" /> {overview?.applications.length ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
              <p className="text-xs uppercase tracking-wider text-teal-700">{t.crossSections}</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
                <Ruler className="h-5 w-5 text-teal-700" /> {overview?.crossSections.length ?? 0}
              </p>
            </div>
          </div>
        </header>

        {message && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</p>}

        <Card className="mb-4 rounded-2xl border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Search className="h-5 w-5 text-teal-700" /> {t.search}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              <Input
                placeholder={t.nameKeyword}
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              />
              <select
                className="rounded-md border bg-background px-3 py-2"
                value={filters.applicationId}
                onChange={(e) => setFilters((f) => ({ ...f, applicationId: e.target.value }))}
              >
                <option value="">{t.application}</option>
                {overview?.applications.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <select
                className="rounded-md border bg-background px-3 py-2"
                value={filters.crossSectionId}
                onChange={(e) => setFilters((f) => ({ ...f, crossSectionId: e.target.value }))}
              >
                <option value="">{t.crossSection}</option>
                {overview?.crossSections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                className="rounded-md border bg-background px-3 py-2"
                value={filters.supplierId}
                onChange={(e) => setFilters((f) => ({ ...f, supplierId: e.target.value }))}
              >
                <option value="">{t.supplier}</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <Input
                placeholder={t.material}
                value={filters.material}
                onChange={(e) => setFilters((f) => ({ ...f, material: e.target.value }))}
              />
              <Input
                placeholder={t.dimensions}
                value={filters.dimensions}
                onChange={(e) => setFilters((f) => ({ ...f, dimensions: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4 overflow-hidden rounded-2xl border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle>{t.profileCatalog}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead className="bg-slate-100 text-left text-slate-700">
                  <tr>
                    <th className="px-3 py-3 font-semibold">{t.drawing}</th>
                    <th className="px-3 py-3 font-semibold">{t.description}</th>
                    <th className="px-3 py-3 font-semibold">{t.applicationCol}</th>
                    <th className="px-3 py-3 font-semibold">{t.visual}</th>
                    <th className="px-3 py-3 font-semibold">{t.contact}</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => {
                    const drawing = safeUrl(p.drawingUrl);
                    const photo = safeUrl(p.photoUrl);
                    const logo = safeUrl(p.logoUrl);
                    const active = detail?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => loadDetail(p.id)}
                        className={`cursor-pointer border-t transition ${active ? 'bg-teal-50/70' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-3 py-3">
                          <div className="h-16 w-24 overflow-hidden rounded-md border bg-slate-50">
                            {drawing ? (
                              <img src={drawing} alt={`${p.name} drawing`} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-slate-400">
                                <ImageIcon className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-semibold text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-600">{p.dimensions || '-'}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{p.description || '-'}</p>
                          <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyle(p.status)}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <p className="text-xs text-slate-800">{p.usage || '-'}</p>
                          <p className="mt-2 text-xs text-slate-500">
                            {(p.applications ?? []).map((a) => a.name).join(', ') || '-'}
                          </p>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="flex items-start gap-2">
                            <div className="h-12 w-12 overflow-hidden rounded-md border bg-slate-50">
                              {photo ? (
                                <img src={photo} alt={`${p.name} photo`} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-slate-400">
                                  <ImageIcon className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="h-12 w-12 overflow-hidden rounded-md border bg-slate-50">
                              {logo ? (
                                <img src={logo} alt={`${p.supplier?.name} logo`} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-slate-400">
                                  <Building2 className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <p className="text-xs font-semibold text-slate-800">{p.supplier?.name || '-'}</p>
                          <p className="text-xs text-slate-500">{p.supplier?.phone || '-'}</p>
                          <Button size="sm" className="mt-2" onClick={(e) => {
                            e.stopPropagation();
                            loadDetail(p.id).catch((err) => setMessage(String(err)));
                          }}>
                            Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {profiles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No profiles found for current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle>{t.profileDetailSheet}</CardTitle>
          </CardHeader>
          <CardContent>
            {!detail && <p>{t.selectProfile}</p>}
            {detail && (
              <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <div className="overflow-hidden rounded-xl border bg-white">
                  <div className="border-b bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">{t.technicalView}</div>
                  <div className="grid gap-3 p-4 md:grid-cols-[220px_1fr]">
                    <div className="h-[210px] overflow-hidden rounded-lg border bg-slate-50">
                      {safeUrl(detail.drawingUrl) ? (
                        <img src={detail.drawingUrl} alt={`${detail.name} drawing`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b"><td className="py-2 font-semibold text-slate-700">{t.designation}</td><td className="py-2 text-slate-900">{detail.name}</td></tr>
                          <tr className="border-b"><td className="py-2 font-semibold text-slate-700">{t.masse}</td><td className="py-2 text-slate-900">{detail.dimensions || '-'}</td></tr>
                          <tr className="border-b"><td className="py-2 font-semibold text-slate-700">{t.weightPerMeter}</td><td className="py-2 text-slate-900">{detail.weightPerMeter ?? '-'}</td></tr>
                          <tr className="border-b"><td className="py-2 font-semibold text-slate-700">{t.material}</td><td className="py-2 text-slate-900">{detail.material || '-'}</td></tr>
                          <tr className="border-b"><td className="py-2 font-semibold text-slate-700">{t.length}</td><td className="py-2 text-slate-900">{detail.lengthMm ? `${detail.lengthMm} mm` : '-'}</td></tr>
                          <tr className="border-b"><td className="py-2 font-semibold text-slate-700">{t.usage}</td><td className="py-2 text-slate-900">{detail.usage || '-'}</td></tr>
                          <tr><td className="py-2 font-semibold text-slate-700">{t.status}</td><td className="py-2"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle(detail.status)}`}>{detail.status}</span></td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border bg-white">
                  <div className="border-b bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">{t.supplierFiles}</div>
                  <div className="space-y-3 p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-teal-700" />
                      <span className="font-semibold">{detail.supplier?.name || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="h-4 w-4 text-teal-700" />
                      <span>{detail.supplier?.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="h-4 w-4 text-teal-700" />
                      <span>{detail.supplier?.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Globe className="h-4 w-4 text-teal-700" />
                      {detail.supplier?.website ? (
                        <a href={detail.supplier.website} target="_blank" rel="noreferrer" className="underline">
                          {detail.supplier.website}
                        </a>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                    <p className="text-slate-600">{detail.supplier?.address || '-'}</p>
                    <p className="text-slate-600">{t.contactPerson}: {detail.supplier?.contactPerson || '-'}</p>

                    <div className="grid gap-2 pt-2">
                      {safeUrl(detail.drawingUrl) && (
                        <a href={detail.drawingUrl} target="_blank" rel="noreferrer">
                          <Button className="w-full justify-between" variant="outline">
                            {t.openDrawing} <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      {safeUrl(detail.photoUrl) && (
                        <a href={detail.photoUrl} target="_blank" rel="noreferrer">
                          <Button className="w-full justify-between" variant="outline">
                            {t.openPhoto} <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      {safeUrl(detail.logoUrl) && (
                        <a href={detail.logoUrl} target="_blank" rel="noreferrer">
                          <Button className="w-full justify-between" variant="outline">
                            {t.openLogo} <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>

                    <div className="rounded-lg border border-teal-100 bg-teal-50/70 p-3 text-xs text-teal-900">
                      <p className="mb-1 flex items-center gap-1 font-semibold"><BadgeCheck className="h-3 w-3" /> {t.linkedCategories}</p>
                      <p>{t.applications}: {(detail.applications ?? []).map((item) => item.name).join(', ') || '-'}</p>
                      <p>{t.crossSections}: {(detail.crossSections ?? []).map((item) => item.name).join(', ') || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;