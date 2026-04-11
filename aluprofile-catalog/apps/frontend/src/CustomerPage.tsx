import { useEffect, useMemo, useState } from 'react';
import {
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useSignIn,
  useSignUp,
  useUser,
} from '@clerk/clerk-react';
import {
  Boxes,
  Eye,
  EyeOff,
  LayoutGrid,
  UserRoundPlus,
  Wrench,
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';

type Lang = 'en' | 'de';
type RefOption = { id: number; name: string; nameDe?: string };
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

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api';

const TXT = {
  en: {
    title: 'Customer Profile Portal',
    subtitle: 'Create an account, sign in, and manage your own aluminum profiles.',
    backToCatalog: 'Back to Catalog',
    language: 'Language',
    signIn: 'Customer Login',
    loginLabel: 'Login',
    signUp: 'Customer Registration',
    signInNote: 'Use your email or username and password to access your customer workspace.',
    signUpNote: 'Create a customer account first, then manage your own profile records.',
    usernameOrEmail: 'Username or email',
    password: 'Password',
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
    showPassword: 'Show',
    hidePassword: 'Hide',
    alreadyHaveAccount: 'Already have an account?',
    firstName: 'First name',
    lastName: 'Last name',
    emailAddress: 'Email address',
    verificationCode: 'Verification code',
    createAccount: 'Create account',
    creatingAccount: 'Creating account...',
    verifyEmail: 'Verify your email',
    verifyEmailNote: 'Enter the code sent to your email address to complete registration.',
    completeRegistration: 'Complete registration',
    verifyingAccount: 'Verifying account...',
    yourProfiles: 'Your Profiles',
    totalProfiles: 'Owned Profiles',
    suppliers: 'Suppliers',
    categories: 'Categories',
    profileControls: 'Profile Controls',
    addProfile: 'Add Profile',
    editProfile: 'Edit Profile',
    closeEditor: 'Close Editor',
    cancel: 'Cancel',
    saveProfile: 'Save Profile',
    filterProfiles: 'Filter profiles',
    exportExcel: 'Export Excel',
    exportPdf: 'Export PDF',
    nameAsc: 'Name A-Z',
    nameDesc: 'Name Z-A',
    supplierAsc: 'Supplier A-Z',
    statusAsc: 'Status',
    showing: 'Showing',
    records: 'records',
    pageLabel: 'Page',
    ofLabel: 'of',
    previous: 'Previous',
    next: 'Next',
    name: 'Name',
    description: 'Description',
    usage: 'Usage',
    drawing: 'Drawing',
    dimensions: 'Dimensions',
    material: 'Material',
    weightPerMeter: 'Weight per meter',
    lengthMm: 'Length mm',
    status: 'Status',
    supplier: 'Supplier',
    applications: 'Applications',
    crossSections: 'Cross-sections',
    drawingFile: 'Drawing file',
    photoFile: 'Photo file',
    logoFile: 'Logo file',
    noProfiles: 'No profiles created yet.',
    signedInAs: 'Signed in as',
    profileWorkspace: 'Profile Workspace',
    profileWorkspaceNote: 'Manage only the profile records owned by this customer account.',
    actions: 'Actions',
    uploadReady: 'Upload complete',
    delete: 'Delete',
    edit: 'Edit',
  },
  de: {
    title: 'Kundenprofil-Portal',
    subtitle: 'Konto erstellen, anmelden und eigene Aluminiumprofile verwalten.',
    backToCatalog: 'Zuruck zum Katalog',
    language: 'Sprache',
    signIn: 'Kunden-Anmeldung',
    loginLabel: 'Login',
    signUp: 'Kunden-Registrierung',
    signInNote: 'Verwenden Sie Ihre E-Mail oder Ihren Benutzernamen und Ihr Passwort fur den Zugang.',
    signUpNote: 'Erstellen Sie zuerst ein Kundenkonto und verwalten Sie dann Ihre eigenen Profildatensatze.',
    usernameOrEmail: 'Benutzername oder E-Mail',
    password: 'Passwort',
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
    showPassword: 'Anzeigen',
    hidePassword: 'Ausblenden',
    alreadyHaveAccount: 'Sie haben bereits ein Konto?',
    firstName: 'Vorname',
    lastName: 'Nachname',
    emailAddress: 'E-Mail-Adresse',
    verificationCode: 'Bestatigungscode',
    createAccount: 'Konto erstellen',
    creatingAccount: 'Konto wird erstellt...',
    verifyEmail: 'E-Mail bestatigen',
    verifyEmailNote: 'Geben Sie den Code aus Ihrer E-Mail ein, um die Registrierung abzuschliessen.',
    completeRegistration: 'Registrierung abschliessen',
    verifyingAccount: 'Konto wird bestatigt...',
    yourProfiles: 'Ihre Profile',
    totalProfiles: 'Eigene Profile',
    suppliers: 'Lieferanten',
    categories: 'Kategorien',
    profileControls: 'Profilsteuerung',
    addProfile: 'Profil hinzufugen',
    editProfile: 'Profil bearbeiten',
    closeEditor: 'Editor schliessen',
    cancel: 'Abbrechen',
    saveProfile: 'Profil speichern',
    filterProfiles: 'Profile filtern',
    exportExcel: 'Excel exportieren',
    exportPdf: 'PDF exportieren',
    nameAsc: 'Name A-Z',
    nameDesc: 'Name Z-A',
    supplierAsc: 'Lieferant A-Z',
    statusAsc: 'Status',
    showing: 'Zeige',
    records: 'Eintrage',
    pageLabel: 'Seite',
    ofLabel: 'von',
    previous: 'Zuruck',
    next: 'Weiter',
    name: 'Name',
    description: 'Beschreibung',
    usage: 'Anwendung',
    drawing: 'Zeichnung',
    dimensions: 'Abmessungen',
    material: 'Material',
    weightPerMeter: 'Gewicht pro Meter',
    lengthMm: 'Lange mm',
    status: 'Status',
    supplier: 'Lieferant',
    applications: 'Anwendungen',
    crossSections: 'Querschnitte',
    drawingFile: 'Zeichnungsdatei',
    photoFile: 'Fotodatei',
    logoFile: 'Logo-Datei',
    noProfiles: 'Noch keine Profile erstellt.',
    signedInAs: 'Angemeldet als',
    profileWorkspace: 'Profil-Arbeitsbereich',
    profileWorkspaceNote: 'Verwalten Sie nur die Profil-Datensatze dieses Kundenkontos.',
    actions: 'Aktionen',
    uploadReady: 'Upload abgeschlossen',
    delete: 'Loschen',
    edit: 'Bearbeiten',
  },
} as const;

function parseApiError(error: unknown) {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Request failed';
}

const PAGE_SIZE = 5;

function paginateItems<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paged = items.slice(startIndex, startIndex + pageSize);
  return {
    items: paged,
    total,
    totalPages,
    page: currentPage,
    start: total === 0 ? 0 : startIndex + 1,
    end: total === 0 ? 0 : startIndex + paged.length,
  };
}

function normalizeForSearch(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function compareText(a: unknown, b: unknown) {
  return normalizeForSearch(a).localeCompare(normalizeForSearch(b));
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => '"' + String(value ?? '').replace(/"/g, '""') + '"').join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportTablePdf(title: string, headers: string[], rows: Array<Array<string | number>>) {
  const documentHtml = '<!doctype html><html><head><meta charset="utf-8" /><title>' + title + '</title><style>body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; } h1 { font-size: 22px; margin: 0 0 16px; } table { width: 100%; border-collapse: collapse; font-size: 12px; } th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; } th { background: #f1f5f9; text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; }</style></head><body><h1>' + title + '</h1><table><thead><tr>' + headers.map((header) => '<th>' + header + '</th>').join('') + '</tr></thead><tbody>' + rows.map((row) => '<tr>' + row.map((value) => '<td>' + String(value ?? '') + '</td>').join('') + '</tr>').join('') + '</tbody></table></body></html>';
  const blob = new Blob([documentHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) {
    URL.revokeObjectURL(url);
    return;
  }
  win.onload = () => {
    setTimeout(() => {
      win.focus();
      win.print();
      setTimeout(() => {
        win.close();
        URL.revokeObjectURL(url);
      }, 150);
    }, 250);
  };
}

function CustomerPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const initialMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'sign-up' ? 'sign-up' : 'sign-in';
  const [lang, setLang] = useState<Lang>('en');
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>(initialMode);
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
  const [signUpStep, setSignUpStep] = useState<'details' | 'verify'>('details');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpFirstName, setSignUpFirstName] = useState('');
  const [signUpLastName, setSignUpLastName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpCode, setSignUpCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState<'error' | 'success'>('error');
  const [isSaving, setIsSaving] = useState(false);
  const [referenceData, setReferenceData] = useState<{
    suppliers: Supplier[];
    applications: RefOption[];
    crossSections: RefOption[];
    statusOptions: string[];
  } | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [profilePage, setProfilePage] = useState(1);
  const [profileFilter, setProfileFilter] = useState('');
  const [profileSort, setProfileSort] = useState<'name-asc' | 'name-desc' | 'supplier-asc' | 'status-asc'>('name-asc');
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

  const t = useMemo(() => TXT[lang], [lang]);

  function showMessage(text: string, kind: 'error' | 'success' = 'error') {
    setMessageKind(kind);
    setMessage(text);
  }

  useEffect(() => {
    const saved = window.localStorage.getItem('aluprofile_lang');
    if (saved === 'en' || saved === 'de') setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('aluprofile_lang', lang);
  }, [lang]);

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
      window.location.assign('/customer');
    } catch (error) {
      showMessage(parseApiError(error), 'error');
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
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    } finally {
      setForgotPasswordLoading(false);
    }
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
      window.location.assign('/customer');
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    } finally {
      setForgotPasswordLoading(false);
    }
  }

  function resetSignUpState() {
    setSignUpStep('details');
    setSignUpLoading(false);
    setSignUpCode('');
    setShowSignUpPassword(false);
  }

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSignUpLoaded || !signUp) return;
    setMessage('');
    setSignUpLoading(true);
    try {
      await signUp.create({
        firstName: signUpFirstName.trim() || undefined,
        lastName: signUpLastName.trim() || undefined,
        username: signUpUsername.trim() || undefined,
        emailAddress: signUpEmail.trim(),
        password: signUpPassword,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setSignUpStep('verify');
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    } finally {
      setSignUpLoading(false);
    }
  }

  async function handleSignUpVerification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSignUpLoaded || !signUp || !setSignUpActive) return;
    setMessage('');
    setSignUpLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: signUpCode.trim(),
      });
      if (result.status !== 'complete' || !result.createdSessionId) {
        throw new Error('Registration could not be completed.');
      }
      await setSignUpActive({ session: result.createdSessionId });
      window.location.assign('/customer');
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    } finally {
      setSignUpLoading(false);
    }
  }

  function openSignUp() {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/customer?mode=sign-up');
    }
    setAuthMode('sign-up');
    setMessage('');
    setForgotPasswordMode(false);
    resetSignUpState();
  }

  function openSignIn() {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/customer?mode=sign-in');
    }
    setAuthMode('sign-in');
    backToLogin();
    resetSignUpState();
  }

  async function authedApi(path: string, options?: RequestInit) {
    const token = await getToken();
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...(options?.headers ?? {}),
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res.json();
  }

  async function loadCustomerData() {
    try {
      const [refs, ownProfiles] = await Promise.all([
        authedApi('/customer/reference-data'),
        authedApi('/customer/profiles'),
      ]);
      setReferenceData(refs);
      setProfiles(ownProfiles);
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    }
  }

  useEffect(() => {
    if (!user) return;
    loadCustomerData();
  }, [user?.id]);

  function resetProfileForm() {
    setEditId(null);
    setShowForm(false);
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
  }

  function startEditProfile(profile: Profile) {
    setEditId(profile.id);
    setShowForm(true);
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
      weightPerMeter: profile.weightPerMeter ? String(profile.weightPerMeter) : '',
      material: profile.material ?? '',
      materialDe: profile.materialDe ?? '',
      lengthMm: profile.lengthMm ? String(profile.lengthMm) : '',
      status: profile.status ?? 'AVAILABLE',
      supplierId: profile.supplier?.id ? String(profile.supplier.id) : '',
      applicationIds: (profile.applications ?? []).map((item) => item.id),
      crossSectionIds: (profile.crossSections ?? []).map((item) => item.id),
    });
  }

  async function uploadFile(file: File) {
    const token = await getToken();
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/customer/uploads`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const data = await response.json();
    showMessage(`${t.uploadReady}: ${data.filename}`, 'success');
    return data;
  }

  async function saveProfile() {
    setIsSaving(true);
    setMessage('');
    const payload = {
      ...profileForm,
      supplierId: profileForm.supplierId ? Number(profileForm.supplierId) : '',
      weightPerMeter: profileForm.weightPerMeter || undefined,
      lengthMm: profileForm.lengthMm || undefined,
    };
    try {
      if (editId) {
        await authedApi(`/customer/profiles/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await authedApi('/customer/profiles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      await loadCustomerData();
      resetProfileForm();
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProfile(id: number) {
    try {
      await authedApi(`/customer/profiles/${id}`, { method: 'DELETE' });
      await loadCustomerData();
      if (editId === id) resetProfileForm();
    } catch (error) {
      showMessage(parseApiError(error), 'error');
    }
  }

  useEffect(() => {
    setProfilePage(1);
  }, [profileFilter, profileSort, profiles.length]);

  const filteredProfiles = useMemo(() => {
    const query = normalizeForSearch(profileFilter);
    return [...profiles]
      .filter((item) => !query || [item.name, item.nameDe, item.description, item.descriptionDe, item.usage, item.usageDe, item.dimensions, item.material, item.materialDe, item.status, item.supplier?.name].some((value) => normalizeForSearch(value).includes(query)))
      .sort((a, b) => {
        if (profileSort === 'name-desc') return compareText(b.name, a.name);
        if (profileSort === 'supplier-asc') return compareText(a.supplier?.name, b.supplier?.name);
        if (profileSort === 'status-asc') return compareText(a.status, b.status) || compareText(a.name, b.name);
        return compareText(a.name, b.name);
      });
  }, [profiles, profileFilter, profileSort]);

  const profileRows = paginateItems(filteredProfiles, profilePage);

  function exportCustomerProfiles(kind: 'excel' | 'pdf') {
    const headers = [t.drawing, t.name, t.description, t.usage, t.supplier, t.applications, t.crossSections, t.status, t.dimensions, t.material, t.weightPerMeter, t.lengthMm];
    const rows = filteredProfiles.map((item) => [
      item.drawingUrl || '-',
      item.nameDe ? item.name + ' / ' + item.nameDe : item.name,
      item.descriptionDe ? (item.description || '-') + ' / ' + item.descriptionDe : item.description || '-',
      item.usageDe ? (item.usage || '-') + ' / ' + item.usageDe : item.usage || '-',
      item.supplier?.name || '-',
      (item.applications ?? []).map((entry) => entry.nameDe ? entry.name + ' / ' + entry.nameDe : entry.name).join(', ') || '-',
      (item.crossSections ?? []).map((entry) => entry.nameDe ? entry.name + ' / ' + entry.nameDe : entry.name).join(', ') || '-',
      item.status,
      item.dimensions || '-',
      item.materialDe ? (item.material || '-') + ' / ' + item.materialDe : item.material || '-',
      item.weightPerMeter ?? '-',
      item.lengthMm ?? '-',
    ]);

    if (kind === 'excel') {
      downloadCsv('customer-profiles.csv', headers, rows);
      return;
    }

    exportTablePdf(t.profileControls, headers, rows);
  }
  return (
    <div className="min-h-screen">
      <div className="material-shell">
        <SignedIn>
        <header className="material-hero mb-6 p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                <UserRoundPlus className="h-3.5 w-3.5" /> Customer Portal
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] text-slate-950 md:text-6xl">{t.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">{t.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <a href="/"><Button className="h-12 rounded-full px-6" variant="secondary">{t.backToCatalog}</Button></a>
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
          </div>
        </header>
        </SignedIn>

        {message && <div className={`app-feedback ${messageKind === 'error' ? 'app-feedback-error' : 'app-feedback-success'}`}>{message}</div>}

        <SignedOut>
          <Card className="material-panel lg:col-span-3">
            <CardContent className="flex min-h-[60vh] items-center justify-center rounded-2xl bg-gradient-to-b from-white to-teal-50/40 p-6">
              {authMode === 'sign-in' ? (
                !forgotPasswordMode ? (
                  <form onSubmit={handleLogin} className="w-full max-w-md rounded-[1.75rem] border border-white/80 bg-white/95 p-7 shadow-[0_30px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                    <div className="mb-6 text-center space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">catalog system</p>
                      <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">{t.signIn}</h2>
                      <p className="text-sm text-slate-500">{t.signInNote}</p>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-700">
                        {t.usernameOrEmail}
                        <Input className="mt-1" autoComplete="username" autoFocus value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={t.usernameOrEmail} />
                      </label>
                      <label className="block text-sm font-medium text-slate-700">
                        {t.password}
                        <div className="relative mt-1">
                          <Input className="pr-16" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.password} />
                          <button type="button" className="absolute inset-y-0 right-0 flex items-center gap-1 px-3 text-xs font-medium text-slate-500" onClick={() => setShowPassword((value: boolean) => !value)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showPassword ? t.hidePassword : t.showPassword}
                          </button>
                        </div>
                      </label>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button type="button" className="text-sm font-medium text-teal-700 hover:text-teal-800" onClick={openForgotPassword}>{t.forgotPassword}</button>
                      <button type="button" className="text-sm font-medium text-teal-700 hover:text-teal-800" onClick={openSignUp}>{t.signUp}</button>
                    </div>
                    <Button className="mt-4 w-full" type="submit" disabled={loginLoading || !isSignInLoaded}>
                      {loginLoading ? t.signingIn : t.signIn}
                    </Button>
                  </form>
                ) : forgotPasswordStep === 'request' ? (
                  <form onSubmit={handleForgotPasswordRequest} className="w-full max-w-md rounded-[1.75rem] border border-white/80 bg-white/95 p-7 shadow-[0_30px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                    <div className="mb-6 text-center space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">catalog system</p>
                      <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">{t.forgotPassword}</h2>
                    </div>
                    <p className="mb-4 text-sm text-slate-600">{t.resetPasswordHelp}</p>
                    <label className="block text-sm font-medium text-slate-700">
                      {t.usernameOrEmail}
                      <Input className="mt-1" autoComplete="username" autoFocus value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={t.usernameOrEmail} />
                    </label>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button type="button" className="text-sm font-medium text-teal-700 hover:text-teal-800" onClick={backToLogin}>{t.backToLogin}</button>
                    </div>
                    <Button className="mt-4 w-full" type="submit" disabled={forgotPasswordLoading || !isSignInLoaded}>
                      {forgotPasswordLoading ? t.sendingResetCode : t.sendResetCode}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotPasswordReset} className="w-full max-w-md rounded-[1.75rem] border border-white/80 bg-white/95 p-7 shadow-[0_30px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                    <div className="mb-6 text-center space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">catalog system</p>
                      <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">{t.forgotPassword}</h2>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-700">
                        {t.resetCode}
                        <Input className="mt-1" autoComplete="one-time-code" autoFocus value={resetCode} onChange={(e) => setResetCode(e.target.value)} placeholder={t.resetCode} />
                      </label>
                      <label className="block text-sm font-medium text-slate-700">
                        {t.newPassword}
                        <div className="relative mt-1">
                          <Input className="pr-16" type={showResetPassword ? 'text' : 'password'} autoComplete="new-password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder={t.newPassword} />
                          <button type="button" className="absolute inset-y-0 right-0 flex items-center gap-1 px-3 text-xs font-medium text-slate-500" onClick={() => setShowResetPassword((value: boolean) => !value)}>
                            {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showResetPassword ? t.hidePassword : t.showPassword}
                          </button>
                        </div>
                      </label>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button type="button" className="text-sm font-medium text-teal-700 hover:text-teal-800" onClick={backToLogin}>{t.backToLogin}</button>
                    </div>
                    <Button className="mt-4 w-full" type="submit" disabled={forgotPasswordLoading || !isSignInLoaded}>
                      {forgotPasswordLoading ? t.resettingPassword : t.setNewPassword}
                    </Button>
                  </form>
                )
              ) : signUpStep === 'details' ? (
                <form onSubmit={handleSignUp} className="w-full max-w-md rounded-[1.75rem] border border-white/80 bg-white/95 p-7 shadow-[0_30px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                  <div className="mb-6 text-center space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">catalog system</p>
                    <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">{t.signUp}</h2>
                    <p className="text-sm text-slate-500">{t.signUpNote}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-medium text-slate-700">
                        {t.firstName}
                        <Input className="mt-1" autoComplete="given-name" value={signUpFirstName} onChange={(e) => setSignUpFirstName(e.target.value)} placeholder={t.firstName} />
                      </label>
                      <label className="block text-sm font-medium text-slate-700">
                        {t.lastName}
                        <Input className="mt-1" autoComplete="family-name" value={signUpLastName} onChange={(e) => setSignUpLastName(e.target.value)} placeholder={t.lastName} />
                      </label>
                    </div>
                    <label className="block text-sm font-medium text-slate-700">
                      {t.usernameOrEmail.replace(' or email', '').replace(' oder E-Mail', '')}
                      <Input className="mt-1" autoComplete="username" value={signUpUsername} onChange={(e) => setSignUpUsername(e.target.value)} placeholder={t.usernameOrEmail.replace(' or email', '').replace(' oder E-Mail', '')} />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      {t.emailAddress}
                      <Input className="mt-1" type="email" autoComplete="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} placeholder={t.emailAddress} />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      {t.password}
                      <div className="relative mt-1">
                        <Input className="pr-16" type={showSignUpPassword ? 'text' : 'password'} autoComplete="new-password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} placeholder={t.password} />
                        <button type="button" className="absolute inset-y-0 right-0 flex items-center gap-1 px-3 text-xs font-medium text-slate-500" onClick={() => setShowSignUpPassword((value) => !value)}>
                          {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          {showSignUpPassword ? t.hidePassword : t.showPassword}
                        </button>
                      </div>
                    </label>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-3">
                    <button type="button" className="text-sm font-medium text-teal-700 hover:text-teal-800" onClick={openSignIn}>{t.signIn}</button>
                  </div>
                  <Button className="mt-4 w-full" type="submit" disabled={signUpLoading || !isSignUpLoaded}>
                    {signUpLoading ? t.creatingAccount : t.createAccount}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignUpVerification} className="w-full max-w-md rounded-[1.75rem] border border-white/80 bg-white/95 p-7 shadow-[0_30px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                  <div className="mb-6 text-center space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">catalog system</p>
                    <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">{t.verifyEmail}</h2>
                    <p className="text-sm text-slate-500">{t.verifyEmailNote}</p>
                  </div>
                  <label className="block text-sm font-medium text-slate-700">
                    {t.verificationCode}
                    <Input className="mt-1" autoComplete="one-time-code" autoFocus value={signUpCode} onChange={(e) => setSignUpCode(e.target.value)} placeholder={t.verificationCode} />
                  </label>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button type="button" className="text-sm font-medium text-teal-700 hover:text-teal-800" onClick={openSignUp}>{t.backToLogin}</button>
                    <button type="button" className="text-sm font-medium text-teal-700 hover:text-teal-800" onClick={openSignIn}>{t.signIn}</button>
                  </div>
                  <Button className="mt-4 w-full" type="submit" disabled={signUpLoading || !isSignUpLoaded}>
                    {signUpLoading ? t.verifyingAccount : t.completeRegistration}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </SignedOut>

        <SignedIn>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="material-stat public-stat-card"><p className="public-stat-label">{t.totalProfiles}</p><p className="public-stat-value"><span className="public-stat-icon"><Boxes className="h-5 w-5" /></span>{profiles.length}</p></div>
              <div className="material-stat public-stat-card"><p className="public-stat-label">{t.suppliers}</p><p className="public-stat-value"><span className="public-stat-icon"><LayoutGrid className="h-5 w-5" /></span>{referenceData?.suppliers.length ?? 0}</p></div>
              <div className="material-stat public-stat-card"><p className="public-stat-label">{t.categories}</p><p className="public-stat-value"><span className="public-stat-icon"><Wrench className="h-5 w-5" /></span>{(referenceData?.applications.length ?? 0) + (referenceData?.crossSections.length ?? 0)}</p></div>
            </div>

            <Card className="material-panel">
              <CardHeader className="border-b border-slate-200/80">
                <div className="admin-section-toolbar">
                  <CardTitle className="flex items-center gap-3"><Boxes className="h-5 w-5 text-teal-700" /> {t.profileControls}</CardTitle>
                  <Button variant={showForm ? 'secondary' : 'default'} onClick={() => showForm ? resetProfileForm() : setShowForm(true)}>{showForm ? t.closeEditor : t.addProfile}</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                {showForm && (
                  <>
                    <div className="mb-2 text-sm text-slate-500">{t.signedInAs}: {user?.primaryEmailAddress?.emailAddress || user?.username || user?.id}</div>
                    <div className="admin-editor-grid admin-editor-grid-wide">
                      <Input placeholder={t.name + ' (EN)'} value={profileForm.name} onChange={(e) => setProfileForm((current) => ({ ...current, name: e.target.value }))} />
                      <Input placeholder={t.name + ' (DE)'} value={profileForm.nameDe} onChange={(e) => setProfileForm((current) => ({ ...current, nameDe: e.target.value }))} />
                      <Input placeholder={t.description + ' (EN)'} value={profileForm.description} onChange={(e) => setProfileForm((current) => ({ ...current, description: e.target.value }))} />
                      <Input placeholder={t.description + ' (DE)'} value={profileForm.descriptionDe} onChange={(e) => setProfileForm((current) => ({ ...current, descriptionDe: e.target.value }))} />
                      <Input placeholder={t.usage + ' (EN)'} value={profileForm.usage} onChange={(e) => setProfileForm((current) => ({ ...current, usage: e.target.value }))} />
                      <Input placeholder={t.usage + ' (DE)'} value={profileForm.usageDe} onChange={(e) => setProfileForm((current) => ({ ...current, usageDe: e.target.value }))} />
                      <Input placeholder={t.dimensions} value={profileForm.dimensions} onChange={(e) => setProfileForm((current) => ({ ...current, dimensions: e.target.value }))} />
                      <Input placeholder={t.weightPerMeter} value={profileForm.weightPerMeter} onChange={(e) => setProfileForm((current) => ({ ...current, weightPerMeter: e.target.value }))} />
                      <Input placeholder={t.lengthMm} value={profileForm.lengthMm} onChange={(e) => setProfileForm((current) => ({ ...current, lengthMm: e.target.value }))} />
                      <Input placeholder={t.material + ' (EN)'} value={profileForm.material} onChange={(e) => setProfileForm((current) => ({ ...current, material: e.target.value }))} />
                      <Input placeholder={t.material + ' (DE)'} value={profileForm.materialDe} onChange={(e) => setProfileForm((current) => ({ ...current, materialDe: e.target.value }))} />
                      <select value={profileForm.status} onChange={(e) => setProfileForm((current) => ({ ...current, status: e.target.value }))}>
                        {(referenceData?.statusOptions ?? []).map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <select value={profileForm.supplierId} onChange={(e) => setProfileForm((current) => ({ ...current, supplierId: e.target.value }))}>
                        <option value="">{t.supplier}</option>
                        {(referenceData?.suppliers ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                      </select>
                      <select multiple value={profileForm.applicationIds.map(String)} onChange={(e) => setProfileForm((current) => ({ ...current, applicationIds: Array.from(e.target.selectedOptions).map((option) => Number(option.value)) }))}>
                        {(referenceData?.applications ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                      </select>
                      <select multiple value={profileForm.crossSectionIds.map(String)} onChange={(e) => setProfileForm((current) => ({ ...current, crossSectionIds: Array.from(e.target.selectedOptions).map((option) => Number(option.value)) }))}>
                        {(referenceData?.crossSections ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                      </select>
                      <label className="admin-upload-field">{t.drawingFile}<input className="mt-1 block w-full" type="file" accept="image/*,.pdf" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const data = await uploadFile(file); setProfileForm((current) => ({ ...current, drawingUrl: data.url })); }} /></label>
                      <label className="admin-upload-field">{t.photoFile}<input className="mt-1 block w-full" type="file" accept="image/*,.pdf" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const data = await uploadFile(file); setProfileForm((current) => ({ ...current, photoUrl: data.url })); }} /></label>
                      <div className="admin-editor-actions md:col-span-3">
                        <Button onClick={saveProfile} disabled={isSaving}>{isSaving ? '...' : t.saveProfile}</Button>
                        <Button variant="outline" onClick={resetProfileForm}>{t.cancel}</Button>
                      </div>
                    </div>
                  </>
                )}

                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                  <Input placeholder={t.filterProfiles} value={profileFilter} onChange={(e) => setProfileFilter(e.target.value)} />
                  <select value={profileSort} onChange={(e) => setProfileSort(e.target.value as 'name-asc' | 'name-desc' | 'supplier-asc' | 'status-asc')}>
                    <option value="name-asc">{t.nameAsc}</option>
                    <option value="name-desc">{t.nameDesc}</option>
                    <option value="supplier-asc">{t.supplierAsc}</option>
                    <option value="status-asc">{t.statusAsc}</option>
                  </select>
                  <Button variant="outline" onClick={() => exportCustomerProfiles('excel')}>{t.exportExcel}</Button>
                  <Button variant="outline" onClick={() => exportCustomerProfiles('pdf')}>{t.exportPdf}</Button>
                </div>

                {!filteredProfiles.length ? (
                  <div className="rounded-[1rem] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">{t.noProfiles}</div>
                ) : (
                  <>
                    <div className="admin-table-wrap">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            <th className="px-4 py-3">{t.drawing}</th>
                            <th className="px-4 py-3">{t.name}</th>
                            <th className="px-4 py-3">{t.description}</th>
                            <th className="px-4 py-3">{t.usage}</th>
                            <th className="px-4 py-3">{t.supplier}</th>
                            <th className="px-4 py-3">{t.applications}</th>
                            <th className="px-4 py-3">{t.crossSections}</th>
                            <th className="px-4 py-3">{t.status}</th>
                            <th className="px-4 py-3">{t.dimensions}</th>
                            <th className="px-4 py-3">{t.material}</th>
                            <th className="px-4 py-3">{t.weightPerMeter}</th>
                            <th className="px-4 py-3">{t.lengthMm}</th>
                            <th className="px-4 py-3 text-right">{t.actions}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profileRows.items.map((profile) => {
                            const displayName = profile.nameDe ? profile.name + ' / ' + profile.nameDe : profile.name;
                            const descriptionText = profile.descriptionDe ? (profile.description || '-') + ' / ' + profile.descriptionDe : profile.description || '-';
                            const displayUsage = profile.usageDe ? (profile.usage || '-') + ' / ' + profile.usageDe : profile.usage || '-';
                            const displayMaterial = profile.materialDe ? (profile.material || '-') + ' / ' + profile.materialDe : profile.material || '-';
                            const displayApplications = (profile.applications ?? []).map((entry) => entry.nameDe ? entry.name + ' / ' + entry.nameDe : entry.name).join(', ') || '-';
                            const displayCrossSections = (profile.crossSections ?? []).map((entry) => entry.nameDe ? entry.name + ' / ' + entry.nameDe : entry.name).join(', ') || '-';
                            return (
                              <tr key={profile.id} className="material-table-row align-top">
                                <td className="px-4 py-3">
                                  {profile.drawingUrl ? (
                                    <a href={profile.drawingUrl} target="_blank" rel="noreferrer" className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                      <img src={profile.drawingUrl} alt={profile.name} className="public-media-fit h-full w-full" loading="lazy" />
                                    </a>
                                  ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400">N/A</div>
                                  )}
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-900">{displayName}</td>
                                <td className="px-4 py-3 text-slate-600">{descriptionText}</td>
                                <td className="px-4 py-3 text-slate-600">{displayUsage}</td>
                                <td className="px-4 py-3 text-slate-600">{profile.supplier?.name || '-'}</td>
                                <td className="px-4 py-3 text-slate-600">{displayApplications}</td>
                                <td className="px-4 py-3 text-slate-600">{displayCrossSections}</td>
                                <td className="px-4 py-3"><span className="material-chip bg-teal-100 text-teal-700">{profile.status}</span></td>
                                <td className="px-4 py-3 text-slate-600">{profile.dimensions || '-'}</td>
                                <td className="px-4 py-3 text-slate-600">{displayMaterial}</td>
                                <td className="px-4 py-3 text-slate-600">{profile.weightPerMeter ?? '-'}</td>
                                <td className="px-4 py-3 text-slate-600">{profile.lengthMm ?? '-'}</td>
                                <td className="px-4 py-3">
                                  <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => startEditProfile(profile)}>{t.edit}</Button>
                                    <Button size="sm" variant="destructive" onClick={() => deleteProfile(profile.id)}>{t.delete}</Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="admin-pagination">
                      <span>{t.showing} {profileRows.start}-{profileRows.end} / {profileRows.total} {t.records}</span>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" disabled={profileRows.page <= 1} onClick={() => setProfilePage((page) => page - 1)}>{t.previous}</Button>
                        <span>{t.pageLabel} {profileRows.page} {t.ofLabel} {profileRows.totalPages}</span>
                        <Button size="sm" variant="outline" disabled={profileRows.page >= profileRows.totalPages} onClick={() => setProfilePage((page) => page + 1)}>{t.next}</Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}

export default CustomerPage;




















