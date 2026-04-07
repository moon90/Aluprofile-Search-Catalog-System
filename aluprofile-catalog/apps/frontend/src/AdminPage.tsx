import { useEffect, useMemo, useState } from 'react';
import { SignedIn, SignedOut, UserButton, useAuth, useSignIn, useUser } from '@clerk/clerk-react';
import {
  BadgeCheck,
  Boxes,
  Building2,
  ChevronRight,
  Eye,
  EyeOff,
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
const PAGE_SIZE = 5;

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
    clerkUsers: 'Users',
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
    clerkUserId: 'User ID (user_xxx)',
    saveUserAccess: 'Save User Access',
    backendEnforced: 'Admin role plus permissions are enforced by backend for all /admin endpoints.',
    login: 'Catalog System Login',
    accessDenied: 'Access denied',
    accessDeniedText: 'you do not have VIEW_ADMIN permission for this page.',
    quickActions: 'Quick Actions',
    seedDemoData: 'Seed Demo Data',
    supplierControls: 'Supplier Controls',
    categoryControls: 'Category Controls',
    profileControls: 'Profile Controls',
    appRolePermissions: 'App Role & Permission Management',
    usernameOrEmail: 'Username or email',
    password: 'Password',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    forgotPassword: 'Forgot password?',
    backToLogin: 'Back to login',
    sendResetCode: 'Send reset code',
    sendingResetCode: 'Sending code...',
    resetCode: 'Reset code',
    newPassword: 'New password',
    setNewPassword: 'Set new password',
    resettingPassword: 'Updating password...',
    resetPasswordHelp: 'Use your account email or username to request a password reset code.',
    resetPasswordSent: 'Reset code sent. Check your email and enter the code below.',
    showPassword: 'Show',
    hidePassword: 'Hide',
    role: 'Role',
    permissions: 'Permissions',
    addNew: 'Add New',
    cancel: 'Cancel',
    actions: 'Actions',
    status: 'Status',
    dimensions: 'Dimensions',
    previous: 'Previous',
    next: 'Next',
    pageLabel: 'Page',
    ofLabel: 'of',
    showing: 'Showing',
    records: 'records',
    sectionTools: 'Section Tools',
    addSupplier: 'Add Supplier',
    addApplication: 'Add Application',
    addCrossSection: 'Add Cross-section',
    addProfile: 'Add Profile',
    addAccessRule: 'Add Access Rule',
    closeEditor: 'Close Editor',
    profileCount: 'Profiles',
    contact: 'Contact',
    details: 'Details',
    filter: 'Filter',
    sortBy: 'Sort by',
    exportExcel: 'Export Excel',
    exportPdf: 'Export PDF',
    nameAsc: 'Name A-Z',
    nameDesc: 'Name Z-A',
    contactAsc: 'Contact A-Z',
    supplierAsc: 'Supplier A-Z',
    statusAsc: 'Status A-Z',
    roleAsc: 'Role A-Z',
    countDesc: 'Most profiles',
    filterSuppliers: 'Filter suppliers',
    filterApplications: 'Filter applications',
    filterCrossSections: 'Filter cross-sections',
    filterProfiles: 'Filter profiles',
    filterRoles: 'Filter roles & permissions',
  },
  de: {
    adminPanel: 'Admin-Panel',
    adminSubtitle: 'Benutzer, Berechtigungen und Katalog-Stammdaten verwalten',
    backToCatalog: 'Zuruck zum Katalog',
    language: 'Sprache',
    profiles: 'Profile',
    suppliers: 'Lieferanten',
    categories: 'Kategorien',
    clerkUsers: 'Benutzer',
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
    clerkUserId: 'Benutzer-ID (user_xxx)',
    saveUserAccess: 'Benutzerzugriff speichern',
    backendEnforced: 'Admin-Rolle und Berechtigungen werden fur alle /admin-Endpunkte im Backend erzwungen.',
    login: 'Katalogsystem-Anmeldung',
    accessDenied: 'Zugriff verweigert',
    accessDeniedText: 'Sie haben keine VIEW_ADMIN-Berechtigung fur diese Seite.',
    quickActions: 'Schnellaktionen',
    seedDemoData: 'Demo-Daten laden',
    supplierControls: 'Lieferantenverwaltung',
    categoryControls: 'Kategorienverwaltung',
    profileControls: 'Profilverwaltung',
    appRolePermissions: 'App-Rollen- und Berechtigungsverwaltung',
    usernameOrEmail: 'Benutzername oder E-Mail',
    password: 'Passwort',
    signIn: 'Anmelden',
    signingIn: 'Anmeldung...',
    forgotPassword: 'Passwort vergessen?',
    backToLogin: 'Zuruck zur Anmeldung',
    sendResetCode: 'Code senden',
    sendingResetCode: 'Code wird gesendet...',
    resetCode: 'Zurucksetzungscode',
    newPassword: 'Neues Passwort',
    setNewPassword: 'Neues Passwort setzen',
    resettingPassword: 'Passwort wird aktualisiert...',
    resetPasswordHelp: 'Verwenden Sie Ihre Konto-E-Mail oder Ihren Benutzernamen, um einen Zurucksetzungscode anzufordern.',
    resetPasswordSent: 'Der Zurucksetzungscode wurde gesendet. Prufen Sie Ihre E-Mail und geben Sie den Code unten ein.',
    showPassword: 'Anzeigen',
    hidePassword: 'Ausblenden',
    role: 'Rolle',
    permissions: 'Berechtigungen',
    addNew: 'Neu hinzufugen',
    cancel: 'Abbrechen',
    actions: 'Aktionen',
    status: 'Status',
    dimensions: 'Abmessungen',
    previous: 'Zuruck',
    next: 'Weiter',
    pageLabel: 'Seite',
    ofLabel: 'von',
    showing: 'Zeige',
    records: 'Eintrage',
    sectionTools: 'Bereichswerkzeuge',
    addSupplier: 'Lieferant hinzufugen',
    addApplication: 'Anwendung hinzufugen',
    addCrossSection: 'Querschnitt hinzufugen',
    addProfile: 'Profil hinzufugen',
    addAccessRule: 'Zugriffsregel hinzufugen',
    closeEditor: 'Editor schliessen',
    profileCount: 'Profile',
    contact: 'Kontakt',
    details: 'Details',
    filter: 'Filter',
    sortBy: 'Sortieren nach',
    exportExcel: 'Excel exportieren',
    exportPdf: 'PDF exportieren',
    nameAsc: 'Name A-Z',
    nameDesc: 'Name Z-A',
    contactAsc: 'Kontakt A-Z',
    supplierAsc: 'Lieferant A-Z',
    statusAsc: 'Status A-Z',
    roleAsc: 'Rolle A-Z',
    countDesc: 'Meiste Profile',
    filterSuppliers: 'Lieferanten filtern',
    filterApplications: 'Anwendungen filtern',
    filterCrossSections: 'Querschnitte filtern',
    filterProfiles: 'Profile filtern',
    filterRoles: 'Rollen und Berechtigungen filtern',
  },
} as const;

function normalizeForSearch(value: unknown) {
  return String(value ?? '').toLowerCase().trim();
}

function compareText(a: unknown, b: unknown) {
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { sensitivity: 'base' });
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportTablePdf(title: string, headers: string[], rows: Array<Array<string | number>>) {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const headerHtml = headers.map((header) => `<th>${escapeHtml(String(header))}</th>`).join('');
  const rowHtml = rows
    .map(
      (row) =>
        `<tr>${row
          .map((cell) => `<td>${escapeHtml(String(cell ?? ''))}</td>`)
          .join('')}</tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page { size: A4 landscape; margin: 14mm; }
      body { font-family: Segoe UI, Arial, sans-serif; margin: 0; color: #0f172a; }
      .sheet { padding: 12px; }
      h1 { margin: 0 0 16px; font-size: 24px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
      th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; vertical-align: top; word-break: break-word; }
      th { background: #e2e8f0; text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; }
    </style>
  </head>
  <body>
    <div class="sheet">
      <h1>${escapeHtml(title)}</h1>
      <table>
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${rowHtml}</tbody>
      </table>
    </div>
    <script>
      window.addEventListener('load', function () {
        setTimeout(function () {
          window.focus();
          window.print();
        }, 300);
      });
      window.addEventListener('afterprint', function () {
        window.close();
      });
    </script>
  </body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    URL.revokeObjectURL(url);
    return;
  }

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60000);
}

function AdminPage() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();
  const [message, setMessage] = useState('');
  const [lang, setLang] = useState<Lang>('en');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'request' | 'verify'>('request');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'profiles' | 'suppliers' | 'categories' | 'users' | 'roles'>('overview');
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
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showCrossSectionForm, setShowCrossSectionForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [supplierPage, setSupplierPage] = useState(1);
  const [applicationPage, setApplicationPage] = useState(1);
  const [crossSectionPage, setCrossSectionPage] = useState(1);
  const [profilePage, setProfilePage] = useState(1);
  const [rolePage, setRolePage] = useState(1);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [supplierSort, setSupplierSort] = useState<'name-asc' | 'name-desc' | 'contact-asc'>('name-asc');
  const [applicationFilter, setApplicationFilter] = useState('');
  const [applicationSort, setApplicationSort] = useState<'name-asc' | 'name-desc' | 'count-desc'>('name-asc');
  const [crossSectionFilter, setCrossSectionFilter] = useState('');
  const [crossSectionSort, setCrossSectionSort] = useState<'name-asc' | 'name-desc' | 'count-desc'>('name-asc');
  const [profileFilter, setProfileFilter] = useState('');
  const [profileSort, setProfileSort] = useState<'name-asc' | 'name-desc' | 'supplier-asc' | 'status-asc'>('name-asc');
  const [roleFilter, setRoleFilter] = useState('');
  const [roleSort, setRoleSort] = useState<'user-asc' | 'role-asc'>('user-asc');

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

  useEffect(() => {
    const nextSection =
      canManageProfiles ? 'profiles' : canManageSuppliers ? 'suppliers' : canManageCategories ? 'categories' : canManageUsers ? 'users' : 'overview';

    if (activeSection === 'overview') return;
    if (activeSection === 'profiles' && canManageProfiles) return;
    if (activeSection === 'suppliers' && canManageSuppliers) return;
    if (activeSection === 'categories' && canManageCategories) return;
    if ((activeSection === 'users' || activeSection === 'roles') && canManageUsers) return;

    setActiveSection(nextSection);
  }, [activeSection, canManageCategories, canManageProfiles, canManageSuppliers, canManageUsers]);

  function parseAuthError(error: unknown) {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object') {
      const authError = error as { errors?: Array<{ longMessage?: string; message?: string }>; message?: string };
      if (Array.isArray(authError.errors) && authError.errors.length > 0) {
        return authError.errors[0].longMessage || authError.errors[0].message || 'Authentication failed';
      }
      if (authError.message) return authError.message;
    }
    return 'Authentication failed';
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSignInLoaded || !signIn || !setActive) return;
    setMessage('');
    setLoginLoading(true);
    try {
      const result = await signIn.create({
        identifier: identifier.trim(),
        password,
      });
      if (result.status !== 'complete' || !result.createdSessionId) {
        throw new Error('Sign-in could not be completed.');
      }
      await setActive({ session: result.createdSessionId });
      window.location.assign('/admin');
    } catch (error) {
      setMessage(parseAuthError(error));
    } finally {
      setLoginLoading(false);
    }
  }

  function openForgotPassword() {
    setMessage('');
    setForgotPasswordMode(true);
    setForgotPasswordStep('request');
    setResetCode('');
    setResetPassword('');
    setShowResetPassword(false);
  }

  function backToLogin() {
    setMessage('');
    setForgotPasswordMode(false);
    setForgotPasswordStep('request');
    setResetCode('');
    setResetPassword('');
    setForgotPasswordLoading(false);
  }

  async function handleForgotPasswordRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSignInLoaded || !signIn) return;
    setMessage('');
    setForgotPasswordLoading(true);
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: identifier.trim(),
      });
      setForgotPasswordStep('verify');
      setMessage(t.resetPasswordSent);
    } catch (error) {
      setMessage(parseAuthError(error));
    } finally {
      setForgotPasswordLoading(false);
    }
  }

  function resetSupplierForm() {
    setSupplierForm({ name: '' });
    setEditType('');
    setEditId(null);
    setShowSupplierForm(false);
  }

  function resetApplicationForm() {
    setApplicationName('');
    setApplicationNameDe('');
    setEditType('');
    setEditId(null);
    setShowApplicationForm(false);
  }

  function resetCrossSectionForm() {
    setCrossSectionName('');
    setCrossSectionNameDe('');
    setEditType('');
    setEditId(null);
    setShowCrossSectionForm(false);
  }

  function resetProfileForm() {
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
    setShowProfileForm(false);
  }

  function resetRoleForm() {
    setUserAccessForm({
      clerkUserId: '',
      role: 'USER',
      permissions: ['VIEW_ADMIN'],
    });
    setShowRoleForm(false);
  }

  function startEditSupplier(supplier: Supplier) {
    setEditType('supplier');
    setEditId(supplier.id);
    setSupplierForm(supplier);
    setShowSupplierForm(true);
  }

  function startEditApplication(application: RefOption) {
    setEditType('application');
    setEditId(application.id);
    setApplicationName(application.name);
    setApplicationNameDe(application.nameDe ?? '');
    setShowApplicationForm(true);
  }

  function startEditCrossSection(crossSection: RefOption) {
    setEditType('cross');
    setEditId(crossSection.id);
    setCrossSectionName(crossSection.name);
    setCrossSectionNameDe(crossSection.nameDe ?? '');
    setShowCrossSectionForm(true);
  }

  function startEditProfile(profile: Profile) {
    setEditType('profile');
    setEditId(profile.id);
    setProfileForm({
      name: profile.name ?? '',
      nameDe: profile.nameDe ?? '',
      description: profile.description ?? '',
      descriptionDe: profile.descriptionDe ?? '',
      usage: profile.usage ?? '',
      usageDe: profile.usageDe ?? '',
      drawingUrl: profile.drawingUrl ?? '',
      photoUrl: profile.photoUrl ?? '',
      logoUrl: profile.logoUrl ?? '',
      dimensions: profile.dimensions ?? '',
      weightPerMeter: String(profile.weightPerMeter ?? ''),
      material: profile.material ?? '',
      materialDe: profile.materialDe ?? '',
      lengthMm: String(profile.lengthMm ?? ''),
      status: profile.status ?? 'AVAILABLE',
      supplierId: String(profile.supplier?.id ?? ''),
      applicationIds: profile.applications.map((item) => item.id),
      crossSectionIds: profile.crossSections.map((item) => item.id),
    });
    setShowProfileForm(true);
  }

  function startEditRole(item: UserAccess) {
    setUserAccessForm({
      clerkUserId: item.clerkUserId,
      role: item.role,
      permissions: item.permissions,
    });
    setShowRoleForm(true);
  }

  async function handleForgotPasswordReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSignInLoaded || !signIn || !setActive) return;
    setMessage('');
    setForgotPasswordLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode.trim(),
        password: resetPassword,
      });
      if (result.status !== 'complete' || !result.createdSessionId) {
        throw new Error('Password reset could not be completed.');
      }
      await setActive({ session: result.createdSessionId });
      window.location.assign('/admin');
    } catch (error) {
      setMessage(parseAuthError(error));
    } finally {
      setForgotPasswordLoading(false);
    }
  }

  async function api(path: string, options?: RequestInit, requiresAuth = false) {
    const authToken = requiresAuth ? await getToken() : null;
    const res = await fetch(API_BASE + path, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: 'Bearer ' + authToken } : {}),
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
    const res = await fetch(API_BASE + '/admin/uploads', {
      method: 'POST',
      headers: authToken ? { Authorization: 'Bearer ' + authToken } : {},
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function saveSupplier() {
    if (!supplierForm.name) return;
    const method = editType === 'supplier' && editId ? 'PUT' : 'POST';
    const path = method === 'PUT' ? '/admin/suppliers/' + editId : '/admin/suppliers';
    await api(path, { method, body: JSON.stringify(supplierForm) }, true);
    resetSupplierForm();
    setSupplierPage(1);
    await adminLoad();
  }

  async function saveApplication() {
    if (!applicationName) return;
    const method = editType === 'application' && editId ? 'PUT' : 'POST';
    const path = method === 'PUT' ? '/admin/applications/' + editId : '/admin/applications';
    await api(path, { method, body: JSON.stringify({ name: applicationName, nameDe: applicationNameDe || undefined }) }, true);
    resetApplicationForm();
    setApplicationPage(1);
    await adminLoad();
  }

  async function saveCrossSection() {
    if (!crossSectionName) return;
    const method = editType === 'cross' && editId ? 'PUT' : 'POST';
    const path = method === 'PUT' ? '/admin/cross-sections/' + editId : '/admin/cross-sections';
    await api(path, { method, body: JSON.stringify({ name: crossSectionName, nameDe: crossSectionNameDe || undefined }) }, true);
    resetCrossSectionForm();
    setCrossSectionPage(1);
    await adminLoad();
  }

  async function saveProfile() {
    const method = editType === 'profile' && editId ? 'PUT' : 'POST';
    const path = method === 'PUT' ? '/admin/profiles/' + editId : '/admin/profiles';
    await api(path, {
      method,
      body: JSON.stringify({
        ...profileForm,
        supplierId: Number(profileForm.supplierId),
      }),
    }, true);
    resetProfileForm();
    setProfilePage(1);
    await adminLoad();
  }

  const deleteItem = async (path: string) => {
    await api(path, { method: 'DELETE' }, true);
    await adminLoad();
  };

  async function saveUserAccess() {
    if (!userAccessForm.clerkUserId.trim()) return;
    await api('/admin/user-access', {
      method: 'POST',
      body: JSON.stringify({
        clerkUserId: userAccessForm.clerkUserId.trim(),
        role: userAccessForm.role,
        permissions: userAccessForm.permissions,
      }),
    }, true);
    resetRoleForm();
    setRolePage(1);
    await loadUserAccess();
  }

  async function deleteUserAccess(clerkUserId: string) {
    await api('/admin/user-access/' + encodeURIComponent(clerkUserId), { method: 'DELETE' }, true);
    await loadUserAccess();
  }

  async function seedDemoData() {
    const result = await api('/admin/demo-data/seed', { method: 'POST' }, true);
    setMessage(result.message + '. Profiles: ' + (result.totals?.profiles ?? 0));
    await adminLoad();
  }

  const suppliers = adminRef?.suppliers ?? [];
  const applications = adminRef?.applications ?? [];
  const crossSections = adminRef?.crossSections ?? [];

  useEffect(() => setSupplierPage(1), [supplierFilter, supplierSort, suppliers.length]);
  useEffect(() => setApplicationPage(1), [applicationFilter, applicationSort, applications.length]);
  useEffect(() => setCrossSectionPage(1), [crossSectionFilter, crossSectionSort, crossSections.length]);
  useEffect(() => setProfilePage(1), [profileFilter, profileSort, adminProfiles.length]);
  useEffect(() => setRolePage(1), [roleFilter, roleSort, userAccessList.length]);

  const filteredSuppliers = useMemo(() => {
    const query = normalizeForSearch(supplierFilter);
    return [...suppliers]
      .filter((item) => !query || [item.name, item.nameDe, item.contactPerson, item.phone, item.email, item.website, item.address].some((value) => normalizeForSearch(value).includes(query)))
      .sort((a, b) => {
        if (supplierSort === 'name-desc') return compareText(b.name, a.name);
        if (supplierSort === 'contact-asc') return compareText(a.contactPerson || a.email || a.phone, b.contactPerson || b.email || b.phone);
        return compareText(a.name, b.name);
      });
  }, [supplierFilter, supplierSort, suppliers]);

  const filteredApplications = useMemo(() => {
    const query = normalizeForSearch(applicationFilter);
    return [...applications]
      .filter((item) => !query || [item.name, item.nameDe].some((value) => normalizeForSearch(value).includes(query)))
      .sort((a, b) => {
        if (applicationSort === 'name-desc') return compareText(b.name, a.name);
        if (applicationSort === 'count-desc') return (b.profilesCount ?? 0) - (a.profilesCount ?? 0);
        return compareText(a.name, b.name);
      });
  }, [applicationFilter, applicationSort, applications]);

  const filteredCrossSections = useMemo(() => {
    const query = normalizeForSearch(crossSectionFilter);
    return [...crossSections]
      .filter((item) => !query || [item.name, item.nameDe].some((value) => normalizeForSearch(value).includes(query)))
      .sort((a, b) => {
        if (crossSectionSort === 'name-desc') return compareText(b.name, a.name);
        if (crossSectionSort === 'count-desc') return (b.profilesCount ?? 0) - (a.profilesCount ?? 0);
        return compareText(a.name, b.name);
      });
  }, [crossSectionFilter, crossSectionSort, crossSections]);

  const filteredProfiles = useMemo(() => {
    const query = normalizeForSearch(profileFilter);
    return [...adminProfiles]
      .filter((item) => !query || [item.name, item.nameDe, item.dimensions, item.material, item.materialDe, item.status, item.supplier?.name].some((value) => normalizeForSearch(value).includes(query)))
      .sort((a, b) => {
        if (profileSort === 'name-desc') return compareText(b.name, a.name);
        if (profileSort === 'supplier-asc') return compareText(a.supplier?.name, b.supplier?.name);
        if (profileSort === 'status-asc') return compareText(a.status, b.status);
        return compareText(a.name, b.name);
      });
  }, [adminProfiles, profileFilter, profileSort]);

  const filteredRoles = useMemo(() => {
    const query = normalizeForSearch(roleFilter);
    return [...userAccessList]
      .filter((item) => !query || [item.clerkUserId, item.role, item.permissions.join(', ')].some((value) => normalizeForSearch(value).includes(query)))
      .sort((a, b) => {
        if (roleSort === 'role-asc') return compareText(a.role, b.role) || compareText(a.clerkUserId, b.clerkUserId);
        return compareText(a.clerkUserId, b.clerkUserId);
      });
  }, [roleFilter, roleSort, userAccessList]);

  const supplierRows = paginateItems(filteredSuppliers, supplierPage);
  const applicationRows = paginateItems(filteredApplications, applicationPage);
  const crossSectionRows = paginateItems(filteredCrossSections, crossSectionPage);
  const profileRows = paginateItems(filteredProfiles, profilePage);
  const roleRows = paginateItems(filteredRoles, rolePage);

  function exportAdminSection(kind: 'excel' | 'pdf', title: string, headers: string[], rows: Array<Array<string | number>>) {
    if (kind === 'excel') {
      downloadCsv(title.toLowerCase().split(' ').join('-') + '.csv', headers, rows);
      return;
    }
    exportTablePdf(title, headers, rows);
  }

  return (
    <div className="min-h-screen">
      <div className="material-shell">
        {isSignedIn && (
        <header className="material-hero mb-6 p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-primary">catalog system</p>
              <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-950 md:text-6xl">{t.adminPanel}</h1>
              <p className="mt-2 max-w-3xl text-slate-600">{t.adminSubtitle}</p>
            </div>
            <div className="flex items-center gap-3">
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
                <div className="rounded-full border border-white/70 bg-white/90 p-1.5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.4)]">
                  <UserButton />
                </div>
              </SignedIn>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="material-stat">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{t.profiles}</p>
              <p className="mt-3 flex items-center gap-3 text-3xl font-bold tracking-[-0.03em] text-slate-950"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Boxes className="h-5 w-5" /></span> {adminProfiles.length}</p>
            </div>
            <div className="material-stat">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{t.suppliers}</p>
              <p className="mt-3 flex items-center gap-3 text-3xl font-bold tracking-[-0.03em] text-slate-950"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></span> {adminRef?.suppliers.length ?? 0}</p>
            </div>
            <div className="material-stat">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{t.categories}</p>
              <p className="mt-3 flex items-center gap-3 text-3xl font-bold tracking-[-0.03em] text-slate-950"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Layers className="h-5 w-5" /></span> {(adminRef?.applications.length ?? 0) + (adminRef?.crossSections.length ?? 0)}</p>
            </div>
            <div className="material-stat">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{t.managedUsers}</p>
              <p className="mt-3 flex items-center gap-3 text-3xl font-bold tracking-[-0.03em] text-slate-950"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Users className="h-5 w-5" /></span> {userAccessList.length}</p>
            </div>
          </div>
        </header>
        )}

        {message && <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-[0_16px_32px_-28px_rgba(239,68,68,0.55)]">{message}</p>}

        <main className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <SignedOut>
            <Card className="material-panel lg:col-span-3">
              <CardContent className="flex min-h-[60vh] items-center justify-center rounded-2xl bg-gradient-to-b from-white to-teal-50/40 p-6">
                {!forgotPasswordMode ? (
                  <form onSubmit={handleLogin} className="w-full max-w-md rounded-[1.75rem] border border-white/80 bg-white/95 p-7 shadow-[0_30px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm"><div className="mb-6 text-center space-y-2"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">catalog system</p><h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">{t.login}</h2></div>
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-700">
                        {t.usernameOrEmail}
                        <Input
                          className="mt-1"
                          autoComplete="username"
                          autoFocus
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder={t.usernameOrEmail}
                        />
                      </label>
                      <label className="block text-sm font-medium text-slate-700">
                        {t.password}
                        <div className="relative mt-1">
                          <Input
                            className="pr-16"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t.password}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center gap-1 px-3 text-xs font-medium text-slate-500"
                            onClick={() => setShowPassword((value: boolean) => !value)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showPassword ? t.hidePassword : t.showPassword}
                          </button>
                        </div>
                      </label>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button type="button" className="text-sm font-medium text-teal-700 hover:text-teal-800" onClick={openForgotPassword}>
                        {t.forgotPassword}
                      </button>
                    </div>
                    <Button className="mt-4 w-full" type="submit" disabled={loginLoading || !isSignInLoaded}>
                      {loginLoading ? t.signingIn : t.signIn}
                    </Button>
                  </form>
                ) : forgotPasswordStep === 'request' ? (
                  <form onSubmit={handleForgotPasswordRequest} className="w-full max-w-md rounded-[1.75rem] border border-white/80 bg-white/95 p-7 shadow-[0_30px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm"><div className="mb-6 text-center space-y-2"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">catalog system</p><h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">{t.forgotPassword}</h2></div>
                    <p className="mb-4 text-sm text-slate-600">{t.resetPasswordHelp}</p>
                    <label className="block text-sm font-medium text-slate-700">
                      {t.usernameOrEmail}
                      <Input
                        className="mt-1"
                        autoComplete="username"
                        autoFocus
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={t.usernameOrEmail}
                      />
                    </label>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button type="button" className="text-sm font-medium text-teal-700 hover:text-teal-800" onClick={backToLogin}>
                        {t.backToLogin}
                      </button>
                    </div>
                    <Button className="mt-4 w-full" type="submit" disabled={forgotPasswordLoading || !isSignInLoaded}>
                      {forgotPasswordLoading ? t.sendingResetCode : t.sendResetCode}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotPasswordReset} className="w-full max-w-md rounded-[1.75rem] border border-white/80 bg-white/95 p-7 shadow-[0_30px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm"><div className="mb-6 text-center space-y-2"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">catalog system</p><h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">{t.forgotPassword}</h2></div>
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-700">
                        {t.resetCode}
                        <Input
                          className="mt-1"
                          autoComplete="one-time-code"
                          autoFocus
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          placeholder={t.resetCode}
                        />
                      </label>
                      <label className="block text-sm font-medium text-slate-700">
                        {t.newPassword}
                        <div className="relative mt-1">
                          <Input
                            className="pr-16"
                            type={showResetPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                            placeholder={t.newPassword}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center gap-1 px-3 text-xs font-medium text-slate-500"
                            onClick={() => setShowResetPassword((value: boolean) => !value)}
                          >
                            {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showResetPassword ? t.hidePassword : t.showPassword}
                          </button>
                        </div>
                      </label>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button type="button" className="text-sm font-medium text-teal-700 hover:text-teal-800" onClick={backToLogin}>
                        {t.backToLogin}
                      </button>
                    </div>
                    <Button className="mt-4 w-full" type="submit" disabled={forgotPasswordLoading || !isSignInLoaded}>
                      {forgotPasswordLoading ? t.resettingPassword : t.setNewPassword}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </SignedOut>

          <SignedIn>
            {!canViewAdmin && (
              <Card className="material-panel lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 text-2xl tracking-[-0.02em]"><Shield className="h-5 w-5" /> {t.accessDenied}</CardTitle>
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
                <aside className="admin-sidebar">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">catalog system</p>
                  <p className="mt-3 text-2xl font-black tracking-[-0.03em] text-white">{t.adminPanel}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{t.adminSubtitle}</p>
                  <div className="mt-6 space-y-2">
                    <button type="button" className={`admin-nav-link ${activeSection === 'overview' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('overview')}><span>{t.quickActions}</span><ChevronRight className="h-4 w-4" /></button>
                    {canManageProfiles && <button type="button" className={`admin-nav-link ${activeSection === 'profiles' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('profiles')}><span>{t.profileControls}</span><ChevronRight className="h-4 w-4" /></button>}
                    {canManageSuppliers && <button type="button" className={`admin-nav-link ${activeSection === 'suppliers' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('suppliers')}><span>{t.supplierControls}</span><ChevronRight className="h-4 w-4" /></button>}
                    {canManageCategories && <button type="button" className={`admin-nav-link ${activeSection === 'categories' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('categories')}><span>{t.categoryControls}</span><ChevronRight className="h-4 w-4" /></button>}
                    {canManageUsers && <button type="button" className={`admin-nav-link ${activeSection === 'users' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('users')}><span>{t.clerkUsers}</span><ChevronRight className="h-4 w-4" /></button>}
                    {canManageUsers && <button type="button" className={`admin-nav-link ${activeSection === 'roles' ? 'bg-white/14 text-white shadow-[0_16px_30px_-22px_rgba(15,23,42,0.8)]' : ''}`} onClick={() => setActiveSection('roles')}><span>{t.appRolePermissions}</span><ChevronRight className="h-4 w-4" /></button>}
                  </div>
                  <div className="mt-6 rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
                    <p className="font-semibold uppercase tracking-[0.24em] text-slate-400">{t.role}</p>
                    <p className="mt-2 text-sm font-medium text-white">{authContext?.appRole ?? '-'}</p>
                    <p className="mt-4 font-semibold uppercase tracking-[0.24em] text-slate-400">{t.permissions}</p>
                    <div className="mt-2 flex flex-wrap gap-2">{permissions.map((permission) => <span key={permission} className="rounded-full bg-white/10 px-3 py-1">{permission}</span>)}</div>
                  </div>
                </aside>
                <div className="space-y-6">
                  {activeSection === 'overview' && (
                    <Card id="admin-overview" className="material-panel">
                      <CardHeader className="border-b border-slate-200/80">
                        <CardTitle className="flex items-center gap-3"><Wrench className="h-5 w-5 text-teal-700" /> {t.quickActions}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {canManageProfiles && <button type="button" className="admin-action-tile" onClick={() => setActiveSection('profiles')}><span className="text-xs uppercase tracking-[0.2em] text-primary/70">{t.quickActions}</span><span className="mt-3 text-xl font-bold text-slate-950">{t.profileControls}</span><span className="mt-2 text-sm text-slate-600">{adminProfiles.length} {t.records}</span><span className="mt-3 text-sm text-slate-500">Create, edit, and review technical profile entries.</span></button>}
                          {canManageSuppliers && <button type="button" className="admin-action-tile" onClick={() => setActiveSection('suppliers')}><span className="text-xs uppercase tracking-[0.2em] text-primary/70">{t.quickActions}</span><span className="mt-3 text-xl font-bold text-slate-950">{t.supplierControls}</span><span className="mt-2 text-sm text-slate-600">{suppliers.length} {t.records}</span><span className="mt-3 text-sm text-slate-500">Maintain supplier contacts, addresses, and logos.</span></button>}
                          {canManageCategories && <button type="button" className="admin-action-tile" onClick={() => setActiveSection('categories')}><span className="text-xs uppercase tracking-[0.2em] text-primary/70">{t.quickActions}</span><span className="mt-3 text-xl font-bold text-slate-950">{t.categoryControls}</span><span className="mt-2 text-sm text-slate-600">{applications.length + crossSections.length} {t.records}</span><span className="mt-3 text-sm text-slate-500">Organize applications and cross-sections for search.</span></button>}
                          {canManageUsers && <button type="button" className="admin-action-tile" onClick={() => setActiveSection('users')}><span className="text-xs uppercase tracking-[0.2em] text-primary/70">{t.quickActions}</span><span className="mt-3 text-xl font-bold text-slate-950">{t.clerkUsers}</span><span className="mt-2 text-sm text-slate-600">{userAccessList.length} {t.records}</span><span className="mt-3 text-sm text-slate-500">Invite, update, and remove authenticated users.</span></button>}
                          {canManageUsers && <button type="button" className="admin-action-tile" onClick={() => setActiveSection('roles')}><span className="text-xs uppercase tracking-[0.2em] text-primary/70">{t.quickActions}</span><span className="mt-3 text-xl font-bold text-slate-950">{t.appRolePermissions}</span><span className="mt-2 text-sm text-slate-600">{roleRows.total} {t.records}</span><span className="mt-3 text-sm text-slate-500">Control role assignment and section permissions.</span></button>}
                        </div>
                        <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50/80 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{t.seedDemoData}</p>
                              <p className="text-sm text-slate-600">Use demo content to populate profiles, suppliers, and category records for review.</p>
                            </div>
                            <Button onClick={seedDemoData}>{t.seedDemoData}</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {activeSection === 'users' && <div id="admin-users"><ClerkUsersPanel canManageUsers={canManageUsers} lang={lang} /></div>}

                {activeSection === 'suppliers' && canManageSuppliers && (
                <Card id="admin-suppliers" className="material-panel">
                  <CardHeader className="border-b border-slate-200/80">
                    <div className="admin-section-toolbar">
                      <CardTitle className="flex items-center gap-3"><Building2 className="h-5 w-5 text-teal-700" /> {t.supplierControls}</CardTitle>
                      <Button variant={showSupplierForm ? 'secondary' : 'default'} onClick={() => showSupplierForm ? resetSupplierForm() : setShowSupplierForm(true)}>{showSupplierForm ? t.closeEditor : t.addSupplier}</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    {showSupplierForm && (
                      <div className="admin-editor-grid">
                        <Input placeholder={t.name + ' (EN)'} value={supplierForm.name ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, name: e.target.value }))} />
                        <Input placeholder={t.name + ' (DE)'} value={supplierForm.nameDe ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, nameDe: e.target.value }))} />
                        <Input placeholder={t.address} value={supplierForm.address ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, address: e.target.value }))} />
                        <Input placeholder={t.contactPerson} value={supplierForm.contactPerson ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, contactPerson: e.target.value }))} />
                        <Input placeholder={t.phone} value={supplierForm.phone ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, phone: e.target.value }))} />
                        <Input placeholder={t.email} value={supplierForm.email ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, email: e.target.value }))} />
                        <Input className="md:col-span-2" placeholder={t.website} value={supplierForm.website ?? ''} onChange={(e) => setSupplierForm((f) => ({ ...f, website: e.target.value }))} />
                        <div className="admin-editor-actions md:col-span-2">
                          <Button onClick={saveSupplier}>{t.saveSupplier}</Button>
                          <Button variant="outline" onClick={resetSupplierForm}>{t.cancel}</Button>
                        </div>
                      </div>
                    )}
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                      <Input placeholder={t.filterSuppliers} value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} />
                      <select value={supplierSort} onChange={(e) => setSupplierSort(e.target.value as 'name-asc' | 'name-desc' | 'contact-asc')}>
                        <option value="name-asc">{t.nameAsc}</option>
                        <option value="name-desc">{t.nameDesc}</option>
                        <option value="contact-asc">{t.contactAsc}</option>
                      </select>
                      <Button variant="outline" onClick={() => exportAdminSection('excel', t.supplierControls, [t.name, t.contact, t.details], filteredSuppliers.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, [item.contactPerson || '-', item.phone || '-', item.email || '-'].join(' | '), item.website || item.address || '-']))}>{t.exportExcel}</Button>
                      <Button variant="outline" onClick={() => exportAdminSection('pdf', t.supplierControls, [t.name, t.contact, t.details], filteredSuppliers.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, [item.contactPerson || '-', item.phone || '-', item.email || '-'].join(' | '), item.website || item.address || '-']))}>{t.exportPdf}</Button>
                    </div>
                    <div className="admin-table-wrap">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            <th className="px-4 py-3">{t.name}</th><th className="px-4 py-3">{t.contact}</th><th className="px-4 py-3">{t.details}</th><th className="px-4 py-3 text-right">{t.actions}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {supplierRows.items.map((item) => (
                            <tr key={item.id} className="material-table-row">
                              <td className="px-4 py-3 font-medium text-slate-900">{item.name}{item.nameDe ? ' / ' + item.nameDe : ''}</td>
                              <td className="px-4 py-3 text-slate-600">{item.contactPerson || '-'}<div>{item.phone || item.email || '-'}</div></td>
                              <td className="px-4 py-3 text-slate-600">{item.website || item.address || '-'}</td>
                              <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => startEditSupplier(item)}>{t.edit}</Button><Button size="sm" variant="destructive" onClick={() => deleteItem('/admin/suppliers/' + item.id)}>{t.delete}</Button></div></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="admin-pagination">
                      <span>{t.showing} {supplierRows.start}-{supplierRows.end} / {supplierRows.total} {t.records}</span>
                      <div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={supplierRows.page <= 1} onClick={() => setSupplierPage((page) => page - 1)}>{t.previous}</Button><span>{t.pageLabel} {supplierRows.page} {t.ofLabel} {supplierRows.totalPages}</span><Button size="sm" variant="outline" disabled={supplierRows.page >= supplierRows.totalPages} onClick={() => setSupplierPage((page) => page + 1)}>{t.next}</Button></div>
                    </div>
                  </CardContent>
                </Card>
                )}

                {activeSection === 'categories' && canManageCategories && (
                <div id="admin-categories" className="space-y-6">
                  <Card className="material-panel">
                    <CardHeader className="border-b border-slate-200/80">
                      <div className="admin-section-toolbar">
                        <CardTitle className="flex items-center gap-3"><Layers className="h-5 w-5 text-teal-700" /> {t.application}</CardTitle>
                        <Button variant={showApplicationForm ? 'secondary' : 'default'} onClick={() => showApplicationForm ? resetApplicationForm() : setShowApplicationForm(true)}>{showApplicationForm ? t.closeEditor : t.addApplication}</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      {showApplicationForm && (
                        <div className="admin-editor-grid">
                          <Input placeholder={t.appName + ' (EN)'} value={applicationName} onChange={(e) => setApplicationName(e.target.value)} />
                          <Input placeholder={t.appName + ' (DE)'} value={applicationNameDe} onChange={(e) => setApplicationNameDe(e.target.value)} />
                          <div className="admin-editor-actions md:col-span-2">
                            <Button onClick={saveApplication}>{t.saveApplication}</Button>
                            <Button variant="outline" onClick={resetApplicationForm}>{t.cancel}</Button>
                          </div>
                        </div>
                      )}
                      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                        <Input placeholder={t.filterApplications} value={applicationFilter} onChange={(e) => setApplicationFilter(e.target.value)} />
                        <select value={applicationSort} onChange={(e) => setApplicationSort(e.target.value as 'name-asc' | 'name-desc' | 'count-desc')}>
                          <option value="name-asc">{t.nameAsc}</option>
                          <option value="name-desc">{t.nameDesc}</option>
                          <option value="count-desc">{t.countDesc}</option>
                        </select>
                        <Button variant="outline" onClick={() => exportAdminSection('excel', t.application, [t.name, t.profileCount], filteredApplications.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.profilesCount ?? 0]))}>{t.exportExcel}</Button>
                        <Button variant="outline" onClick={() => exportAdminSection('pdf', t.application, [t.name, t.profileCount], filteredApplications.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.profilesCount ?? 0]))}>{t.exportPdf}</Button>
                      </div>
                      <div className="admin-table-wrap">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><th className="px-4 py-3">{t.name}</th><th className="px-4 py-3">{t.profileCount}</th><th className="px-4 py-3 text-right">{t.actions}</th></tr></thead>
                          <tbody>
                            {applicationRows.items.map((item) => (
                              <tr key={item.id} className="material-table-row">
                                <td className="px-4 py-3 font-medium text-slate-900">{item.name}{item.nameDe ? ' / ' + item.nameDe : ''}</td>
                                <td className="px-4 py-3 text-slate-600">{item.profilesCount ?? 0}</td>
                                <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => startEditApplication(item)}>{t.edit}</Button><Button size="sm" variant="destructive" onClick={() => deleteItem('/admin/applications/' + item.id)}>{t.delete}</Button></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="admin-pagination"><span>{t.showing} {applicationRows.start}-{applicationRows.end} / {applicationRows.total} {t.records}</span><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={applicationRows.page <= 1} onClick={() => setApplicationPage((page) => page - 1)}>{t.previous}</Button><span>{t.pageLabel} {applicationRows.page} {t.ofLabel} {applicationRows.totalPages}</span><Button size="sm" variant="outline" disabled={applicationRows.page >= applicationRows.totalPages} onClick={() => setApplicationPage((page) => page + 1)}>{t.next}</Button></div></div>
                    </CardContent>
                  </Card>

                  <Card className="material-panel">
                    <CardHeader className="border-b border-slate-200/80">
                      <div className="admin-section-toolbar">
                        <CardTitle className="flex items-center gap-3"><Layers className="h-5 w-5 text-teal-700" /> {t.crossSection}</CardTitle>
                        <Button variant={showCrossSectionForm ? 'secondary' : 'default'} onClick={() => showCrossSectionForm ? resetCrossSectionForm() : setShowCrossSectionForm(true)}>{showCrossSectionForm ? t.closeEditor : t.addCrossSection}</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      {showCrossSectionForm && (
                        <div className="admin-editor-grid">
                          <Input placeholder={t.crossSectionName + ' (EN)'} value={crossSectionName} onChange={(e) => setCrossSectionName(e.target.value)} />
                          <Input placeholder={t.crossSectionName + ' (DE)'} value={crossSectionNameDe} onChange={(e) => setCrossSectionNameDe(e.target.value)} />
                          <div className="admin-editor-actions md:col-span-2">
                            <Button onClick={saveCrossSection}>{t.saveCrossSection}</Button>
                            <Button variant="outline" onClick={resetCrossSectionForm}>{t.cancel}</Button>
                          </div>
                        </div>
                      )}
                      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                        <Input placeholder={t.filterCrossSections} value={crossSectionFilter} onChange={(e) => setCrossSectionFilter(e.target.value)} />
                        <select value={crossSectionSort} onChange={(e) => setCrossSectionSort(e.target.value as 'name-asc' | 'name-desc' | 'count-desc')}>
                          <option value="name-asc">{t.nameAsc}</option>
                          <option value="name-desc">{t.nameDesc}</option>
                          <option value="count-desc">{t.countDesc}</option>
                        </select>
                        <Button variant="outline" onClick={() => exportAdminSection('excel', t.crossSection, [t.name, t.profileCount], filteredCrossSections.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.profilesCount ?? 0]))}>{t.exportExcel}</Button>
                        <Button variant="outline" onClick={() => exportAdminSection('pdf', t.crossSection, [t.name, t.profileCount], filteredCrossSections.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.profilesCount ?? 0]))}>{t.exportPdf}</Button>
                      </div>
                      <div className="admin-table-wrap">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><th className="px-4 py-3">{t.name}</th><th className="px-4 py-3">{t.profileCount}</th><th className="px-4 py-3 text-right">{t.actions}</th></tr></thead>
                          <tbody>
                            {crossSectionRows.items.map((item) => (
                              <tr key={item.id} className="material-table-row">
                                <td className="px-4 py-3 font-medium text-slate-900">{item.name}{item.nameDe ? ' / ' + item.nameDe : ''}</td>
                                <td className="px-4 py-3 text-slate-600">{item.profilesCount ?? 0}</td>
                                <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => startEditCrossSection(item)}>{t.edit}</Button><Button size="sm" variant="destructive" onClick={() => deleteItem('/admin/cross-sections/' + item.id)}>{t.delete}</Button></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="admin-pagination"><span>{t.showing} {crossSectionRows.start}-{crossSectionRows.end} / {crossSectionRows.total} {t.records}</span><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={crossSectionRows.page <= 1} onClick={() => setCrossSectionPage((page) => page - 1)}>{t.previous}</Button><span>{t.pageLabel} {crossSectionRows.page} {t.ofLabel} {crossSectionRows.totalPages}</span><Button size="sm" variant="outline" disabled={crossSectionRows.page >= crossSectionRows.totalPages} onClick={() => setCrossSectionPage((page) => page + 1)}>{t.next}</Button></div></div>
                    </CardContent>
                  </Card>
                </div>
                )}

                {activeSection === 'profiles' && canManageProfiles && (
                <Card id="admin-profiles" className="material-panel">
                  <CardHeader className="border-b border-slate-200/80">
                    <div className="admin-section-toolbar">
                      <CardTitle className="flex items-center gap-3"><Boxes className="h-5 w-5 text-teal-700" /> {t.profileControls}</CardTitle>
                      <Button variant={showProfileForm ? 'secondary' : 'default'} onClick={() => showProfileForm ? resetProfileForm() : setShowProfileForm(true)}>{showProfileForm ? t.closeEditor : t.addProfile}</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    {showProfileForm && (
                      <div className="admin-editor-grid admin-editor-grid-wide">
                        <Input placeholder={t.name + ' (EN)'} value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
                        <Input placeholder={t.name + ' (DE)'} value={profileForm.nameDe} onChange={(e) => setProfileForm((f) => ({ ...f, nameDe: e.target.value }))} />
                        <Input placeholder="Description (EN)" value={profileForm.description} onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))} />
                        <Input placeholder="Description (DE)" value={profileForm.descriptionDe} onChange={(e) => setProfileForm((f) => ({ ...f, descriptionDe: e.target.value }))} />
                        <Input placeholder="Usage (EN)" value={profileForm.usage} onChange={(e) => setProfileForm((f) => ({ ...f, usage: e.target.value }))} />
                        <Input placeholder="Usage (DE)" value={profileForm.usageDe} onChange={(e) => setProfileForm((f) => ({ ...f, usageDe: e.target.value }))} />
                        <Input placeholder={t.dimensions} value={profileForm.dimensions} onChange={(e) => setProfileForm((f) => ({ ...f, dimensions: e.target.value }))} />
                        <Input placeholder="Weight/m" value={profileForm.weightPerMeter} onChange={(e) => setProfileForm((f) => ({ ...f, weightPerMeter: e.target.value }))} />
                        <Input placeholder="Length mm" value={profileForm.lengthMm} onChange={(e) => setProfileForm((f) => ({ ...f, lengthMm: e.target.value }))} />
                        <Input placeholder="Material (EN)" value={profileForm.material} onChange={(e) => setProfileForm((f) => ({ ...f, material: e.target.value }))} />
                        <Input placeholder="Material (DE)" value={profileForm.materialDe} onChange={(e) => setProfileForm((f) => ({ ...f, materialDe: e.target.value }))} />
                        <select value={profileForm.status} onChange={(e) => setProfileForm((f) => ({ ...f, status: e.target.value }))}>
                          {adminRef?.statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                        <select value={profileForm.supplierId} onChange={(e) => setProfileForm((f) => ({ ...f, supplierId: e.target.value }))}>
                          <option value="">{t.supplier}</option>
                          {suppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                        <select multiple value={profileForm.applicationIds.map(String)} onChange={(e) => setProfileForm((f) => ({ ...f, applicationIds: Array.from(e.target.selectedOptions).map((option) => Number(option.value)) }))}>
                          {applications.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                        <select multiple value={profileForm.crossSectionIds.map(String)} onChange={(e) => setProfileForm((f) => ({ ...f, crossSectionIds: Array.from(e.target.selectedOptions).map((option) => Number(option.value)) }))}>
                          {crossSections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                        <label className="admin-upload-field">{t.drawingFile}<input className="mt-1 block w-full" type="file" accept="image/*,.pdf" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const data = await uploadFile(file); setProfileForm((f) => ({ ...f, drawingUrl: data.url })); }} /></label>
                        <label className="admin-upload-field">{t.photoFile}<input className="mt-1 block w-full" type="file" accept="image/*,.pdf" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const data = await uploadFile(file); setProfileForm((f) => ({ ...f, photoUrl: data.url })); }} /></label>
                        <div className="admin-editor-actions md:col-span-3">
                          <Button onClick={saveProfile}>{t.saveProfile}</Button>
                          <Button variant="outline" onClick={resetProfileForm}>{t.cancel}</Button>
                        </div>
                      </div>
                    )}
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                      <Input placeholder={t.filterProfiles} value={profileFilter} onChange={(e) => setProfileFilter(e.target.value)} />
                      <select value={profileSort} onChange={(e) => setProfileSort(e.target.value as 'name-asc' | 'name-desc' | 'supplier-asc' | 'status-asc')}>
                        <option value="name-asc">{t.nameAsc}</option>
                        <option value="name-desc">{t.nameDesc}</option>
                        <option value="supplier-asc">{t.supplierAsc}</option>
                        <option value="status-asc">{t.statusAsc}</option>
                      </select>
                      <Button variant="outline" onClick={() => exportAdminSection('excel', t.profileControls, [t.name, t.supplier, t.status, t.dimensions], filteredProfiles.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.supplier?.name || '-', item.status, item.dimensions || '-']))}>{t.exportExcel}</Button>
                      <Button variant="outline" onClick={() => exportAdminSection('pdf', t.profileControls, [t.name, t.supplier, t.status, t.dimensions], filteredProfiles.map((item) => [item.nameDe ? item.name + ' / ' + item.nameDe : item.name, item.supplier?.name || '-', item.status, item.dimensions || '-']))}>{t.exportPdf}</Button>
                    </div>
                    <div className="admin-table-wrap">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><th className="px-4 py-3">{t.name}</th><th className="px-4 py-3">{t.supplier}</th><th className="px-4 py-3">{t.status}</th><th className="px-4 py-3">{t.dimensions}</th><th className="px-4 py-3 text-right">{t.actions}</th></tr></thead>
                        <tbody>
                          {profileRows.items.map((item) => (
                            <tr key={item.id} className="material-table-row">
                              <td className="px-4 py-3 font-medium text-slate-900">{item.name}{item.nameDe ? ' / ' + item.nameDe : ''}</td>
                              <td className="px-4 py-3 text-slate-600">{item.supplier?.name || '-'}</td>
                              <td className="px-4 py-3"><span className="material-chip bg-teal-100 text-teal-700">{item.status}</span></td>
                              <td className="px-4 py-3 text-slate-600">{item.dimensions || '-'}</td>
                              <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => startEditProfile(item)}>{t.edit}</Button><Button size="sm" variant="destructive" onClick={() => deleteItem('/admin/profiles/' + item.id)}>{t.delete}</Button></div></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="admin-pagination"><span>{t.showing} {profileRows.start}-{profileRows.end} / {profileRows.total} {t.records}</span><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={profileRows.page <= 1} onClick={() => setProfilePage((page) => page - 1)}>{t.previous}</Button><span>{t.pageLabel} {profileRows.page} {t.ofLabel} {profileRows.totalPages}</span><Button size="sm" variant="outline" disabled={profileRows.page >= profileRows.totalPages} onClick={() => setProfilePage((page) => page + 1)}>{t.next}</Button></div></div>
                  </CardContent>
                </Card>
                )}

                {activeSection === 'roles' && canManageUsers && (
                  <Card id="admin-roles" className="material-panel">
                    <CardHeader className="border-b border-slate-200/80">
                      <div className="admin-section-toolbar">
                        <CardTitle className="flex items-center gap-3"><UserCog className="h-5 w-5 text-teal-700" /> {t.appRolePermissions}</CardTitle>
                        <Button variant={showRoleForm ? 'secondary' : 'default'} onClick={() => showRoleForm ? resetRoleForm() : setShowRoleForm(true)}>{showRoleForm ? t.closeEditor : t.addAccessRule}</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      {showRoleForm && (
                        <div className="admin-editor-grid">
                          <Input placeholder={t.clerkUserId} value={userAccessForm.clerkUserId} onChange={(e) => setUserAccessForm((f) => ({ ...f, clerkUserId: e.target.value }))} />
                          <select value={userAccessForm.role} onChange={(e) => setUserAccessForm((f) => ({ ...f, role: e.target.value as AppRole }))}>
                            {(adminRef?.roleOptions ?? ['ADMIN', 'MANAGER', 'USER']).map((role) => <option key={role} value={role}>{role}</option>)}
                          </select>
                          <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
                            {(adminRef?.permissionOptions ?? ['VIEW_ADMIN', 'PROFILES_MANAGE', 'SUPPLIERS_MANAGE', 'CATEGORIES_MANAGE', 'USERS_MANAGE'] as AppPermission[]).map((permission) => (
                              <label key={permission} className="flex items-center gap-2 rounded-[1rem] border border-slate-200 bg-slate-50/80 p-3">
                                <input type="checkbox" checked={userAccessForm.permissions.includes(permission)} onChange={(e) => setUserAccessForm((f) => ({ ...f, permissions: e.target.checked ? [...new Set([...f.permissions, permission])] : f.permissions.filter((item) => item !== permission) }))} />
                                <KeyRound className="h-4 w-4 text-teal-700" />
                                <span className="text-sm">{permission}</span>
                              </label>
                            ))}
                          </div>
                          <div className="admin-editor-actions md:col-span-2">
                            <Button onClick={saveUserAccess}>{t.saveUserAccess}</Button>
                            <Button variant="outline" onClick={resetRoleForm}>{t.cancel}</Button>
                          </div>
                        </div>
                      )}
                      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                        <Input placeholder={t.filterRoles} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} />
                        <select value={roleSort} onChange={(e) => setRoleSort(e.target.value as 'user-asc' | 'role-asc')}>
                          <option value="user-asc">{t.nameAsc}</option>
                          <option value="role-asc">{t.roleAsc}</option>
                        </select>
                        <Button variant="outline" onClick={() => exportAdminSection('excel', t.appRolePermissions, [t.clerkUserId, t.role, t.permissions], filteredRoles.map((item) => [item.clerkUserId, item.role, item.permissions.join(', ')]))}>{t.exportExcel}</Button>
                        <Button variant="outline" onClick={() => exportAdminSection('pdf', t.appRolePermissions, [t.clerkUserId, t.role, t.permissions], filteredRoles.map((item) => [item.clerkUserId, item.role, item.permissions.join(', ')]))}>{t.exportPdf}</Button>
                      </div>
                      <div className="admin-table-wrap">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><th className="px-4 py-3">{t.clerkUserId}</th><th className="px-4 py-3">{t.role}</th><th className="px-4 py-3">{t.permissions}</th><th className="px-4 py-3 text-right">{t.actions}</th></tr></thead>
                          <tbody>
                            {roleRows.items.map((item) => (
                              <tr key={item.id} className="material-table-row">
                                <td className="px-4 py-3 font-medium text-slate-900">{item.clerkUserId}</td>
                                <td className="px-4 py-3"><span className="material-chip bg-slate-100 text-slate-700">{item.role}</span></td>
                                <td className="px-4 py-3 text-slate-600">{item.permissions.join(', ')}</td>
                                <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => startEditRole(item)}>{t.edit}</Button><Button size="sm" variant="destructive" onClick={() => deleteUserAccess(item.clerkUserId)}>{t.delete}</Button></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="admin-pagination"><span>{t.showing} {roleRows.start}-{roleRows.end} / {roleRows.total} {t.records}</span><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={roleRows.page <= 1} onClick={() => setRolePage((page) => page - 1)}>{t.previous}</Button><span>{t.pageLabel} {roleRows.page} {t.ofLabel} {roleRows.totalPages}</span><Button size="sm" variant="outline" disabled={roleRows.page >= roleRows.totalPages} onClick={() => setRolePage((page) => page + 1)}>{t.next}</Button></div></div>
                      <p className="mt-3 flex items-center gap-1 text-xs text-slate-500"><BadgeCheck className="h-3 w-3" /> {t.backendEnforced}</p>
                    </CardContent>
                  </Card>
                )}
                </div>
              </>
            )}
          </SignedIn>
        </main>
      </div>
    </div>
  );
}

export default AdminPage;






















