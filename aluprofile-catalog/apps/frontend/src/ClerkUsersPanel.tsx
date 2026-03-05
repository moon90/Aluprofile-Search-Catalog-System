import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Mail, Users } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';

type ClerkUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  primaryEmailAddress?: string;
  emailAddresses?: { id: string; emailAddress: string; verificationStatus?: string | null }[];
};

type Lang = 'en' | 'de';

type Props = {
  canManageUsers: boolean;
  lang: Lang;
};

type ToastState = {
  text: string;
  kind: 'success' | 'error';
};

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api';

const TXT = {
  en: {
    title: 'Clerk User Management',
    search: 'Search by email/name',
    searchBtn: 'Search Users',
    newForm: 'New User Form',
    email: 'Email',
    password: 'Password (required for new user)',
    username: 'Username',
    firstName: 'First name',
    lastName: 'Last name',
    update: 'Update Clerk User',
    create: 'Create Clerk User',
    edit: 'Edit',
    delete: 'Delete',
    saved: 'Clerk user saved.',
    deleted: 'Clerk user deleted.',
  },
  de: {
    title: 'Clerk-Benutzerverwaltung',
    search: 'Suche nach E-Mail/Name',
    searchBtn: 'Benutzer suchen',
    newForm: 'Neues Benutzerformular',
    email: 'E-Mail',
    password: 'Passwort (fur neuen Benutzer erforderlich)',
    username: 'Benutzername',
    firstName: 'Vorname',
    lastName: 'Nachname',
    update: 'Clerk-Benutzer aktualisieren',
    create: 'Clerk-Benutzer erstellen',
    edit: 'Bearbeiten',
    delete: 'Loschen',
    saved: 'Clerk-Benutzer gespeichert.',
    deleted: 'Clerk-Benutzer geloscht.',
  },
} as const;

function parseApiError(error: unknown) {
  const fallback = 'Request failed';
  const raw =
    error instanceof Error
      ? error.message.replace(/^Error:\s*/, '')
      : typeof error === 'string'
        ? error
        : fallback;

  try {
    const parsed = JSON.parse(raw) as { message?: string | string[] };
    if (Array.isArray(parsed.message)) {
      return parsed.message.join(', ');
    }
    if (typeof parsed.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // Ignore parse errors and return raw below.
  }

  return raw || fallback;
}

export default function ClerkUsersPanel({ canManageUsers, lang }: Props) {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [form, setForm] = useState({
    userId: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    username: '',
  });

  const t = TXT[lang];

  function showToast(text: string, kind: 'success' | 'error') {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 4500);
  }

  async function api(path: string, options?: RequestInit) {
    const token = await getToken();
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
      ...options,
    });

    if (!res.ok) {
      const raw = await res.text();
      try {
        const parsed = JSON.parse(raw) as { message?: string | string[] };
        const message = Array.isArray(parsed.message)
          ? parsed.message.join(', ')
          : parsed.message || raw;
        throw new Error(message);
      } catch {
        throw new Error(raw);
      }
    }

    return res.json();
  }

  async function loadUsers() {
    if (!canManageUsers) return;
    const url = query.trim()
      ? `/admin/clerk-users?query=${encodeURIComponent(query.trim())}`
      : '/admin/clerk-users';
    const data = await api(url);
    setUsers(data);
  }

  useEffect(() => {
    loadUsers().catch((err) => showToast(parseApiError(err), 'error'));
  }, [canManageUsers]);

  async function saveUser() {
    if (!canManageUsers) return;
    try {
      if (form.userId) {
        await api(`/admin/clerk-users/${encodeURIComponent(form.userId)}`, {
          method: 'PUT',
          body: JSON.stringify({
            firstName: form.firstName.trim() || undefined,
            lastName: form.lastName.trim() || undefined,
            username: form.username.trim() || undefined,
            password: form.password.trim() || undefined,
          }),
        });
      } else {
        await api('/admin/clerk-users', {
          method: 'POST',
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password.trim(),
            firstName: form.firstName.trim() || undefined,
            lastName: form.lastName.trim() || undefined,
            username: form.username.trim() || undefined,
          }),
        });
      }

      setForm({ userId: '', email: '', password: '', firstName: '', lastName: '', username: '' });
      showToast(t.saved, 'success');
      await loadUsers();
    } catch (err) {
      showToast(parseApiError(err), 'error');
    }
  }

  async function deleteUser(userId: string) {
    if (!canManageUsers) return;
    try {
      await api(`/admin/clerk-users/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      showToast(t.deleted, 'success');
      await loadUsers();
    } catch (err) {
      showToast(parseApiError(err), 'error');
    }
  }

  function editUser(item: ClerkUser) {
    setForm({
      userId: item.id,
      email: item.primaryEmailAddress ?? '',
      password: '',
      firstName: item.firstName ?? '',
      lastName: item.lastName ?? '',
      username: item.username ?? '',
    });
  }

  if (!canManageUsers) return null;

  return (
    <Card className="rounded-2xl border-slate-200 bg-white/95 lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-teal-700" /> {t.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {toast && (
          <div
            className={`mb-3 rounded-md border px-3 py-2 text-sm ${
              toast.kind === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {toast.text}
          </div>
        )}

        <div className="mb-3 grid gap-2 md:grid-cols-4">
          <Input placeholder={t.search} value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button variant="outline" onClick={() => loadUsers().catch((err) => showToast(parseApiError(err), 'error'))}>{t.searchBtn}</Button>
          <Button variant="secondary" onClick={() => setForm({ userId: '', email: '', password: '', firstName: '', lastName: '', username: '' })}>{t.newForm}</Button>
        </div>

        <div className="mb-3 grid gap-2 md:grid-cols-3">
          <Input placeholder={t.email} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input placeholder={t.password} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          <Input placeholder={t.username} value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
          <Input placeholder={t.firstName} value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
          <Input placeholder={t.lastName} value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
          <Button onClick={saveUser}>{form.userId ? t.update : t.create}</Button>
        </div>

        <ul className="space-y-1 text-sm">
          {users.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div>
                <p className="font-medium text-slate-900">{[item.firstName, item.lastName].filter(Boolean).join(' ') || item.username || item.id}</p>
                <p className="flex items-center gap-1 text-slate-600"><Mail className="h-3 w-3" /> {item.primaryEmailAddress || item.emailAddresses?.[0]?.emailAddress || '-'}</p>
                <p className="text-xs text-slate-500">{item.id}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => editUser(item)}>{t.edit}</Button>
                <Button size="sm" variant="destructive" onClick={() => deleteUser(item.id)}>{t.delete}</Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
