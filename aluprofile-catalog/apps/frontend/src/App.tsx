import { useEffect, useMemo, useState } from 'react';
import { SignedIn, UserButton } from '@clerk/clerk-react';
import {
  BadgeCheck,
  Boxes,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  ImageIcon,
  LayoutGrid,
  Mail,
  Phone,
  Ruler,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
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
type SortKey = 'newest' | 'nameAsc' | 'nameDesc' | 'supplier' | 'status';
type Lang = 'en' | 'de';

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
const PAGE_SIZE = 6;

const TXT = {
  en: {
    title: 'Aluprofile Search & Catalog',
    subtitle: 'Find the right aluminum profile with technical details, supplier contacts, and production-ready references.',
    heroNote: 'Industrial-grade profile discovery with a cleaner technical workflow.',
    search: 'Search',
    language: 'Language',
    adminPanel: 'Admin Panel',
    customerLogin: 'Login',
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
    noProfiles: 'No profiles found for current filters.',
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
    catalogLabel: 'Catalog System',
    sortBy: 'Sort by',
    newest: 'Newest',
    nameAsc: 'Name A-Z',
    nameDesc: 'Name Z-A',
    supplierSort: 'Supplier',
    statusSort: 'Status',
    clearFilters: 'Clear Filters',
    activeFilters: 'Active Filters',
    page: 'Page',
    of: 'of',
    previous: 'Previous',
    next: 'Next',
    showing: 'Showing',
    records: 'records',
    smartFilters: 'Smart Filters',
    searchHint: 'Use multiple filters to narrow technical matches faster.',
    categoryMatches: 'Category Matches',
    tableView: 'Table View',
    cardView: 'Card View',
    featuredProfiles: 'Featured Profiles',
    featuredNote: 'Highlighted technical profiles for a faster first review.',
    technicalSheet: 'Technical Sheet',
    availableStatus: 'Available',
    inDevelopmentStatus: 'In Development',
    archivedStatus: 'Archived',
    trustedManufacturers: 'Trusted Manufacturers',
    trustedNote: 'Reliable suppliers currently represented in the active catalog set.',
    loadingCatalog: 'Loading catalog data...',
    applicationSearch: 'Search application',
    crossSectionSearch: 'Search cross-section',
    supplierSearch: 'Search supplier',
    noResultsTitle: 'No technical matches found',
    noResultsNote: 'Try broadening the filters or clearing the search terms to see more profiles.',
  },
  de: {
    title: 'Aluprofile Suche & Katalog',
    subtitle: 'Finden Sie das passende Aluminiumprofil mit technischen Daten, Lieferantenkontakt und produktionsreifen Referenzen.',
    heroNote: 'Industrietaugliche Profilsuche mit einem klareren technischen Arbeitsablauf.',
    search: 'Suche',
    language: 'Sprache',
    adminPanel: 'Admin-Panel',
    customerLogin: 'Login',
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
    catalogLabel: 'Katalogsystem',
    sortBy: 'Sortieren nach',
    newest: 'Neueste',
    nameAsc: 'Name A-Z',
    nameDesc: 'Name Z-A',
    supplierSort: 'Lieferant',
    statusSort: 'Status',
    clearFilters: 'Filter zurucksetzen',
    activeFilters: 'Aktive Filter',
    page: 'Seite',
    of: 'von',
    previous: 'Zuruck',
    next: 'Weiter',
    showing: 'Zeige',
    records: 'Eintrage',
    smartFilters: 'Intelligente Filter',
    searchHint: 'Verwenden Sie mehrere Filter, um technische Treffer schneller einzugrenzen.',
    categoryMatches: 'Kategorie-Treffer',
    tableView: 'Tabellenansicht',
    cardView: 'Kartenansicht',
    featuredProfiles: 'Ausgewahlte Profile',
    featuredNote: 'Hervorgehobene technische Profile fur einen schnelleren Ersteindruck.',
    technicalSheet: 'Technisches Blatt',
    availableStatus: 'Verfugbar',
    inDevelopmentStatus: 'In Entwicklung',
    archivedStatus: 'Archiviert',
    trustedManufacturers: 'Vertrauenswurdige Hersteller',
    trustedNote: 'Zuverlassige Lieferanten aus dem aktuell geladenen Katalogbestand.',
    loadingCatalog: 'Katalogdaten werden geladen...',
    applicationSearch: 'Anwendung suchen',
    crossSectionSearch: 'Querschnitt suchen',
    supplierSearch: 'Lieferant suchen',
    noResultsTitle: 'Keine technischen Treffer gefunden',
    noResultsNote: 'Erweitern Sie die Filter oder setzen Sie die Suchbegriffe zuruck, um mehr Profile zu sehen.',
  },
} as const;

function statusStyle(status?: string) {
  if (status === 'AVAILABLE') return 'material-chip bg-emerald-100 text-emerald-800';
  if (status === 'IN_DEVELOPMENT') return 'material-chip bg-amber-100 text-amber-900';
  return 'material-chip bg-slate-200 text-slate-700';
}

function statusLabel(status: string | undefined, t: (typeof TXT)[keyof typeof TXT]) {
  if (status === 'AVAILABLE') return t.availableStatus;
  if (status === 'IN_DEVELOPMENT') return t.inDevelopmentStatus;
  return t.archivedStatus;
}

function safeUrl(value?: string) {
  return value && value.trim().length > 0 ? value : undefined;
}

function parseApiError(error: unknown) {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Request failed';
}

function paginateItems<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  return {
    items: items.slice(startIndex, startIndex + pageSize),
    totalPages,
    page: safePage,
    start: items.length === 0 ? 0 : startIndex + 1,
    end: Math.min(startIndex + pageSize, items.length),
    total: items.length,
  };
}


function resolveOptionId(query: string, options: Array<{ id: number; name: string }>) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return '';
  const exact = options.find((item) => item.name.trim().toLowerCase() === trimmed);
  return exact ? String(exact.id) : '';
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
  const [filterInputs, setFilterInputs] = useState({
    application: '',
    crossSection: '',
    supplier: '',
  });
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

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
    setIsLoading(true);
    setMessage('');
    try {
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
      setPage(1);
      if (profileList.length > 0) {
        const selectedStillExists = detail && profileList.some((p) => p.id === detail.id);
        if (!selectedStillExists) setDetail(profileList[0]);
      } else {
        setDetail(null);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDetail(id: number) {
    setIsDetailLoading(true);
    try {
      setDetail(await api(`/public/profiles/${id}?lang=${lang}`));
    } finally {
      setIsDetailLoading(false);
    }
  }

  useEffect(() => {
    loadPublic().catch((err) => {
      setIsLoading(false);
      setMessage(parseApiError(err));
    });
  }, []);

  useEffect(() => {
    loadPublic().catch((err) => {
      setIsLoading(false);
      setMessage(parseApiError(err));
    });
  }, [filters, lang]);

  const sortedProfiles = useMemo(() => {
    const next = [...profiles];
    next.sort((left, right) => {
      if (sortBy === 'nameAsc') return left.name.localeCompare(right.name);
      if (sortBy === 'nameDesc') return right.name.localeCompare(left.name);
      if (sortBy === 'supplier') return (left.supplier?.name || '').localeCompare(right.supplier?.name || '');
      if (sortBy === 'status') return (left.status || '').localeCompare(right.status || '');
      return right.id - left.id;
    });
    return next;
  }, [profiles, sortBy]);

  const pagedProfiles = useMemo(() => paginateItems(sortedProfiles, page), [sortedProfiles, page]);

  useEffect(() => {
    if (page !== pagedProfiles.page) setPage(pagedProfiles.page);
  }, [page, pagedProfiles.page]);

  const applicationOptions = overview?.applications ?? [];
  const crossSectionOptions = overview?.crossSections ?? [];

  function updateSearchFilter(
    kind: 'application' | 'crossSection' | 'supplier',
    key: 'applicationId' | 'crossSectionId' | 'supplierId',
    value: string,
    options: Array<{ id: number; name: string }>,
  ) {
    setFilterInputs((current) => ({ ...current, [kind]: value }));
    setFilters((current) => ({ ...current, [key]: resolveOptionId(value, options) }));
  }

  const activeFilterEntries = useMemo(() => {
    const labels = [];
    if (filters.q) labels.push({ key: 'q', label: filters.q });
    if (filters.applicationId) {
      const item = overview?.applications.find((entry) => String(entry.id) === filters.applicationId);
      labels.push({ key: 'applicationId', label: item?.name || filters.applicationId });
    }
    if (filters.crossSectionId) {
      const item = overview?.crossSections.find((entry) => String(entry.id) === filters.crossSectionId);
      labels.push({ key: 'crossSectionId', label: item?.name || filters.crossSectionId });
    }
    if (filters.supplierId) {
      const item = suppliers.find((entry) => String(entry.id) === filters.supplierId);
      labels.push({ key: 'supplierId', label: item?.name || filters.supplierId });
    }
    if (filters.material) labels.push({ key: 'material', label: filters.material });
    if (filters.dimensions) labels.push({ key: 'dimensions', label: filters.dimensions });
    return labels as Array<{ key: keyof typeof filters; label: string }>;
  }, [filters, overview, suppliers]);

  function clearFilters() {
    setFilterInputs({ application: '', crossSection: '', supplier: '' });
    setFilters({
      q: '',
      applicationId: '',
      crossSectionId: '',
      supplierId: '',
      material: '',
      dimensions: '',
    });
  }

  function removeFilter(key: keyof typeof filters) {
    if (key === 'applicationId') setFilterInputs((current) => ({ ...current, application: '' }));
    if (key === 'crossSectionId') setFilterInputs((current) => ({ ...current, crossSection: '' }));
    if (key === 'supplierId') setFilterInputs((current) => ({ ...current, supplier: '' }));
    setFilters((current) => ({ ...current, [key]: '' }));
  }

  return (
    <div className="min-h-screen">
      <div className="material-shell">
        <header className="material-hero public-hero mb-6 p-6 md:p-8">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {t.catalogLabel}
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.045em] text-slate-950 md:text-6xl">{t.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">{t.subtitle}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  {t.heroNote}
                </span>
              </div>
            </div>

            <div className="public-hero-side">
              <div className="public-action-cluster">
                <a href="/customer">
                  <Button className="h-12 rounded-full px-6" variant="secondary">{t.customerLogin}</Button>
                </a>
                <SignedIn>
                  <a href="/admin">
                    <Button className="h-12 rounded-full px-6" variant="secondary">{t.adminPanel}</Button>
                  </a>
                </SignedIn>
                <label className="public-language-pill">
                  <span>{t.language}</span>
                  <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="public-language-select">
                    <option value="en">EN</option>
                    <option value="de">DE</option>
                  </select>
                </label>
                <SignedIn>
                  <div className="rounded-full border border-white/70 bg-white/90 p-1.5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.4)]">
                    <UserButton />
                  </div>
                </SignedIn>
              </div>

              <div className="public-hero-panel mt-6">
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <div className="material-stat public-stat-card">
                    <p className="public-stat-label text-[0.62rem] tracking-[0.12em]">{t.totalProfiles}</p>
                    <p className="public-stat-value">
                      <span className="public-stat-icon"><Boxes className="h-5 w-5" /></span>
                      {overview?.totals?.profiles ?? 0}
                    </p>
                  </div>
                  <div className="material-stat public-stat-card">
                    <p className="public-stat-label text-[0.62rem] tracking-[0.12em]">{t.applications}</p>
                    <p className="public-stat-value">
                      <span className="public-stat-icon"><LayoutGrid className="h-5 w-5" /></span>
                      {overview?.applications.length ?? 0}
                    </p>
                  </div>
                  <div className="material-stat public-stat-card">
                    <p className="public-stat-label text-[0.62rem] tracking-[0.12em]">{t.crossSections}</p>
                    <p className="public-stat-value">
                      <span className="public-stat-icon"><Ruler className="h-5 w-5" /></span>
                      {overview?.crossSections.length ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {message && <div className="app-feedback app-feedback-error">{message}</div>}

        <Card className="material-panel mb-6 overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-slate-50/80">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl font-semibold tracking-[-0.02em] text-slate-950">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Search className="h-5 w-5" />
                </span>
                {t.smartFilters}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  <span>{t.sortBy}</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="min-h-0 w-auto border-0 bg-transparent p-0 pr-7 shadow-none focus-visible:ring-0">
                    <option value="newest">{t.newest}</option>
                    <option value="nameAsc">{t.nameAsc}</option>
                    <option value="nameDesc">{t.nameDesc}</option>
                    <option value="supplier">{t.supplierSort}</option>
                    <option value="status">{t.statusSort}</option>
                  </select>
                </label>
                <Button variant="outline" onClick={clearFilters}>{t.clearFilters}</Button>
              </div>
            </div>
            <p className="text-sm text-slate-500">{t.searchHint}</p>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Input placeholder={t.nameKeyword} value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
              <div className="space-y-2">
                <Input list="application-options" className="public-combobox-input" placeholder={t.applicationSearch} value={filterInputs.application} onChange={(e) => updateSearchFilter('application', 'applicationId', e.target.value, applicationOptions)} />
                <datalist id="application-options">
                  {applicationOptions.map((item) => (
                    <option key={item.id} value={item.name} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Input list="cross-section-options" className="public-combobox-input" placeholder={t.crossSectionSearch} value={filterInputs.crossSection} onChange={(e) => updateSearchFilter('crossSection', 'crossSectionId', e.target.value, crossSectionOptions)} />
                <datalist id="cross-section-options">
                  {crossSectionOptions.map((item) => (
                    <option key={item.id} value={item.name} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Input list="supplier-options" className="public-combobox-input" placeholder={t.supplierSearch} value={filterInputs.supplier} onChange={(e) => updateSearchFilter('supplier', 'supplierId', e.target.value, suppliers)} />
                <datalist id="supplier-options">
                  {suppliers.map((item) => (
                    <option key={item.id} value={item.name} />
                  ))}
                </datalist>
              </div>
              <Input placeholder={t.material} value={filters.material} onChange={(e) => setFilters((f) => ({ ...f, material: e.target.value }))} />
              <Input placeholder={t.dimensions} value={filters.dimensions} onChange={(e) => setFilters((f) => ({ ...f, dimensions: e.target.value }))} />
            </div>

            {activeFilterEntries.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t.activeFilters}</p>
                <div className="flex flex-wrap gap-2">
                  {activeFilterEntries.map((entry) => (
                    <button key={entry.key} type="button" onClick={() => removeFilter(entry.key)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                      <span>{entry.label}</span>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-slate-50/70">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">{t.profileCatalog}</CardTitle>
                  <div className="text-sm text-slate-500">
                    {t.showing} {pagedProfiles.start}-{pagedProfiles.end} / {pagedProfiles.total} {t.records}
                  </div>
                </div>
                <div className="public-results-toolbar">
                  <div className="public-view-toggle" role="tablist" aria-label={t.profileCatalog}>
                    <button type="button" className={viewMode === 'table' ? 'is-active' : ''} onClick={() => setViewMode('table')}>{t.tableView}</button>
                    <button type="button" className={viewMode === 'cards' ? 'is-active' : ''} onClick={() => setViewMode('cards')}>{t.cardView}</button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="public-skeleton-card">
                      <div className="public-skeleton-block h-40" />
                      <div className="public-skeleton-line mt-4 w-2/3" />
                      <div className="public-skeleton-line mt-2 w-full" />
                      <div className="public-skeleton-line mt-2 w-5/6" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
              <div className="grid gap-4 p-5 md:hidden">
                {pagedProfiles.items.map((p, index) => {
                  const drawing = safeUrl(p.drawingUrl);
                  const photo = safeUrl(p.photoUrl);
                  const active = detail?.id === p.id;
                  return (
                    <button key={p.id} type="button" onClick={() => loadDetail(p.id)} className={`public-mobile-card text-left ${active ? 'ring-2 ring-primary/30' : ''}`} style={{ animationDelay: `${index * 70}ms` }}>
                      <div className="flex items-start gap-4">
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-50">
                          {drawing ? <img src={drawing} alt={p.name + ' drawing'} className="public-media-fit" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-5 w-5" /></div>}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-base font-semibold tracking-[-0.02em] text-slate-950">{p.name}</p>
                              <p className="text-xs text-slate-500">{p.dimensions || '-'}</p>
                            </div>
                            <span className={statusStyle(p.status)}>{statusLabel(p.status, t)}</span>
                          </div>
                          <p className="line-clamp-2 text-sm leading-6 text-slate-600">{p.description || '-'}</p>
                          <div className="flex flex-wrap gap-2">
                            {p.material && <span className="material-chip bg-slate-100 text-slate-700">{p.material}</span>}
                            <span className="material-chip bg-primary/[0.08] text-primary">{p.supplier?.name || '-'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <div className="h-10 w-10 overflow-hidden rounded-[0.9rem] border border-slate-200 bg-slate-50">
                              {photo ? <img src={photo} alt={p.name + ' photo'} className="public-media-fit" loading="lazy" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-4 w-4" /></div>}
                            </div>
                            <span className="line-clamp-1">{(p.applications ?? []).map((a) => a.name).join(', ') || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {pagedProfiles.items.length === 0 && <div className="rounded-[1.25rem] border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-500">{t.noProfiles}</div>}
              </div>

              {viewMode === 'table' ? (
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[980px] text-sm">
                    <thead className="bg-slate-50/90 text-left text-slate-600">
                      <tr>
                        <th className="px-5 py-4 font-semibold">{t.drawing}</th>
                        <th className="px-5 py-4 font-semibold">{t.description}</th>
                        <th className="px-5 py-4 font-semibold">{t.applicationCol}</th>
                        <th className="px-5 py-4 font-semibold">{t.visual}</th>
                        <th className="px-5 py-4 font-semibold">{t.contact}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedProfiles.items.map((p, index) => {
                        const drawing = safeUrl(p.drawingUrl);
                        const photo = safeUrl(p.photoUrl);
                        const logo = safeUrl(p.logoUrl);
                        const active = detail?.id === p.id;
                        return (
                          <tr key={p.id} onClick={() => loadDetail(p.id)} className={`material-table-row cursor-pointer ${active ? 'bg-primary/[0.06]' : ''}`} style={{ animationDelay: `${index * 40}ms` }}>
                            <td className="px-5 py-4">
                              <div className="h-24 w-28 overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                                {drawing ? <img src={drawing} alt={p.name + ' drawing'} className="public-media-fit" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-5 w-5" /></div>}
                              </div>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <div className="space-y-2">
                                <div>
                                  <p className="text-base font-semibold tracking-[-0.02em] text-slate-950">{p.name}</p>
                                  <p className="text-xs text-slate-500">{p.dimensions || '-'}</p>
                                </div>
                                <p className="line-clamp-2 text-sm leading-6 text-slate-600">{p.description || '-'}</p>
                                <div className="flex flex-wrap gap-2">
                                  <span className={statusStyle(p.status)}>{statusLabel(p.status, t)}</span>
                                  {p.material && <span className="material-chip bg-slate-100 text-slate-700">{p.material}</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <p className="text-sm leading-6 text-slate-700">{p.usage || '-'}</p>
                              <p className="mt-2 text-xs leading-5 text-slate-500">{(p.applications ?? []).map((a) => a.name).join(', ') || '-'}</p>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <div className="flex items-start gap-3">
                                <div className="h-14 w-14 overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-50">
                                  {photo ? <img src={photo} alt={p.name + ' photo'} className="public-media-fit" loading="lazy" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-4 w-4" /></div>}
                                </div>
                                <div className="h-14 w-14 overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-50">
                                  {logo ? <img src={logo} alt={(p.supplier?.name || 'supplier') + ' logo'} className="public-media-fit" loading="lazy" /> : <div className="flex h-full items-center justify-center text-slate-400"><Building2 className="h-4 w-4" /></div>}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <div className="space-y-2">
                                <p className="font-semibold text-slate-900">{p.supplier?.name || '-'}</p>
                                <p className="text-sm text-slate-500">{p.supplier?.phone || '-'}</p>
                                <Button size="sm" onClick={(e) => {
                                  e.stopPropagation();
                                  loadDetail(p.id).catch((err) => setMessage(parseApiError(err)));
                                }}>
                                  {t.details}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {pagedProfiles.items.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">{t.noProfiles}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="hidden grid-cols-1 gap-4 p-5 md:grid lg:grid-cols-2">
                  {pagedProfiles.items.map((p, index) => {
                    const drawing = safeUrl(p.drawingUrl);
                    const photo = safeUrl(p.photoUrl);
                    const logo = safeUrl(p.logoUrl);
                    const active = detail?.id === p.id;
                    return (
                      <button key={p.id} type="button" onClick={() => loadDetail(p.id)} className={`public-result-card text-left ${active ? 'ring-2 ring-primary/30' : ''}`} style={{ animationDelay: `${index * 70}ms` }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <p className="text-lg font-semibold tracking-[-0.025em] text-slate-950">{p.name}</p>
                            <p className="text-sm text-slate-500">{p.dimensions || '-'}</p>
                          </div>
                          <span className={statusStyle(p.status)}>{statusLabel(p.status, t)}</span>
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
                          <div className="aspect-[4/3] overflow-hidden rounded-[1.1rem] border border-slate-200 bg-slate-50">
                            {drawing ? <img src={drawing} alt={p.name + ' drawing'} className="public-media-fit" loading="lazy" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-6 w-6" /></div>}
                          </div>
                          <div className="space-y-3">
                            <p className="line-clamp-3 text-sm leading-6 text-slate-600">{p.description || '-'}</p>
                            <p className="text-sm leading-6 text-slate-700">{p.usage || '-'}</p>
                            <div className="flex flex-wrap gap-2">
                              {p.material && <span className="material-chip bg-slate-100 text-slate-700">{p.material}</span>}
                              {(p.crossSections ?? []).slice(0, 2).map((item) => <span key={item.id} className="material-chip bg-primary/[0.08] text-primary">{item.name}</span>)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-50">
                              {photo ? <img src={photo} alt={p.name + ' photo'} className="public-media-fit" loading="lazy" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-4 w-4" /></div>}
                            </div>
                            <div className="h-12 w-12 overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-50">
                              {logo ? <img src={logo} alt={(p.supplier?.name || 'supplier') + ' logo'} className="public-media-fit" loading="lazy" /> : <div className="flex h-full items-center justify-center text-slate-400"><Building2 className="h-4 w-4" /></div>}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{p.supplier?.name || '-'}</p>
                              <p className="text-xs text-slate-500">{p.supplier?.phone || '-'}</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-primary">{t.details}</span>
                        </div>
                      </button>
                    );
                  })}
                  {pagedProfiles.items.length === 0 && <div className="lg:col-span-2 rounded-[1.25rem] border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-500">{t.noProfiles}</div>}
                </div>
              )}

              {pagedProfiles.items.length === 0 ? (
                <div className="border-t border-slate-200 px-6 py-12 text-center">
                  <p className="text-lg font-semibold text-slate-900">{t.noResultsTitle}</p>
                  <p className="mt-2 text-sm text-slate-500">{t.noResultsNote}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-slate-500">{t.page} {pagedProfiles.page} {t.of} {pagedProfiles.totalPages}</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" disabled={pagedProfiles.page <= 1} onClick={() => setPage((current) => current - 1)}>
                      <ChevronLeft className="mr-1 h-4 w-4" /> {t.previous}
                    </Button>
                    <Button size="sm" variant="outline" disabled={pagedProfiles.page >= pagedProfiles.totalPages} onClick={() => setPage((current) => current + 1)}>
                      {t.next} <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-slate-50/70">
              <CardTitle className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">{t.technicalSheet}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isDetailLoading ? (
                <div className="space-y-4">
                  <div className="public-skeleton-card">
                    <div className="public-skeleton-block h-64" />
                    <div className="public-skeleton-line mt-4 w-2/3" />
                    <div className="public-skeleton-line mt-2 w-full" />
                    <div className="public-skeleton-line mt-2 w-5/6" />
                  </div>
                </div>
              ) : null}
              {!isDetailLoading && !detail && <p className="text-sm text-slate-500">{t.selectProfile}</p>}
              {!isDetailLoading && detail && (
                <div className="space-y-5">
                  <div className="public-detail-sheet overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">{t.technicalView}</div>
                    <div className="grid gap-5 p-5 lg:grid-cols-[220px_1fr]">
                      <div className="h-[220px] overflow-hidden rounded-[1rem] border border-slate-200 bg-slate-50">
                        {safeUrl(detail.drawingUrl) ? (
                          <img src={detail.drawingUrl} alt={`${detail.name} drawing`} className="public-media-fit" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-8 w-8" /></div>
                        )}
                      </div>
                      <table className="public-detail-table w-full text-sm">
                        <tbody>
                          <tr className="border-b border-slate-200"><td className="py-3 font-semibold text-slate-600">{t.designation}</td><td className="py-3 text-slate-900">{detail.name}</td></tr>
                          <tr className="border-b border-slate-200"><td className="py-3 font-semibold text-slate-600">{t.masse}</td><td className="py-3 text-slate-900">{detail.dimensions || '-'}</td></tr>
                          <tr className="border-b border-slate-200"><td className="py-3 font-semibold text-slate-600">{t.weightPerMeter}</td><td className="py-3 text-slate-900">{detail.weightPerMeter ?? '-'}</td></tr>
                          <tr className="border-b border-slate-200"><td className="py-3 font-semibold text-slate-600">{t.material}</td><td className="py-3 text-slate-900">{detail.material || '-'}</td></tr>
                          <tr className="border-b border-slate-200"><td className="py-3 font-semibold text-slate-600">{t.length}</td><td className="py-3 text-slate-900">{detail.lengthMm ? `${detail.lengthMm} mm` : '-'}</td></tr>
                          <tr className="border-b border-slate-200"><td className="py-3 font-semibold text-slate-600">{t.usage}</td><td className="py-3 text-slate-900">{detail.usage || '-'}</td></tr>
                          <tr><td className="py-3 font-semibold text-slate-600">{t.status}</td><td className="py-3"><span className={statusStyle(detail.status)}>{statusLabel(detail.status, t)}</span></td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="public-detail-sheet overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">{t.supplierFiles}</div>
                    <div className="space-y-4 p-5 text-sm">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                          <div className="mb-3 flex items-center gap-2 text-slate-900"><Building2 className="h-4 w-4 text-primary" /><span className="font-semibold">{detail.supplier?.name || '-'}</span></div>
                          <div className="space-y-2 text-slate-600">
                            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><span>{detail.supplier?.phone || '-'}</span></div>
                            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><span>{detail.supplier?.email || '-'}</span></div>
                            <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />{detail.supplier?.website ? <a href={detail.supplier.website} target="_blank" rel="noreferrer" className="underline">{detail.supplier.website}</a> : <span>-</span>}</div>
                          </div>
                          <p className="mt-3 text-slate-600">{detail.supplier?.address || '-'}</p>
                          <p className="mt-1 text-slate-600">{t.contactPerson}: {detail.supplier?.contactPerson || '-'}</p>
                        </div>
                        <div className="rounded-2xl border border-primary/10 bg-primary/[0.04] p-4 text-slate-700">
                          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900"><BadgeCheck className="h-4 w-4 text-primary" /> {t.linkedCategories}</p>
                          <p className="text-sm leading-6">{t.applications}: {(detail.applications ?? []).map((item) => item.name).join(', ') || '-'}</p>
                          <p className="text-sm leading-6">{t.crossSections}: {(detail.crossSections ?? []).map((item) => item.name).join(', ') || '-'}</p>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        {safeUrl(detail.drawingUrl) && (
                          <a href={detail.drawingUrl} target="_blank" rel="noreferrer">
                            <Button className="w-full justify-between" variant="outline">{t.openDrawing} <ExternalLink className="h-4 w-4" /></Button>
                          </a>
                        )}
                        {safeUrl(detail.photoUrl) && (
                          <a href={detail.photoUrl} target="_blank" rel="noreferrer">
                            <Button className="w-full justify-between" variant="outline">{t.openPhoto} <ExternalLink className="h-4 w-4" /></Button>
                          </a>
                        )}
                        {safeUrl(detail.logoUrl) && (
                          <a href={detail.logoUrl} target="_blank" rel="noreferrer">
                            <Button className="w-full justify-between" variant="outline">{t.openLogo} <ExternalLink className="h-4 w-4" /></Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;





