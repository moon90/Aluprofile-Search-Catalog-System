import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Mail, Search, ShieldCheck, Users } from 'lucide-react';
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
const PAGE_SIZE = 5;

const TXT = {
  en: {
    title: 'User Management',
    search: 'Filter users',
    searchBtn: 'Refresh Users',
    newForm: 'New User Form',
    email: 'Email',
    password: 'Password (required for new user)',
    username: 'Username',
    firstName: 'First name',
    lastName: 'Last name',
    update: 'Update User',
    create: 'Create User',
    edit: 'Edit',
    delete: 'Delete',
    saved: 'User saved.',
    deleted: 'User deleted.',
    directory: 'User Directory',
    sortBy: 'Sort by',
    nameAsc: 'Name A-Z',
    emailAsc: 'Email A-Z',
    usernameAsc: 'Username A-Z',
    exportExcel: 'Export Excel',
    exportPdf: 'Export PDF',
    previous: 'Previous',
    next: 'Next',
    pageLabel: 'Page',
    ofLabel: 'of',
    showing: 'Showing',
    records: 'records',
    actions: 'Actions',
    userId: 'User ID',
  },
  de: {
    title: 'Benutzerverwaltung',
    search: 'Benutzer filtern',
    searchBtn: 'Benutzer aktualisieren',
    newForm: 'Neues Benutzerformular',
    email: 'E-Mail',
    password: 'Passwort (fur neuen Benutzer erforderlich)',
    username: 'Benutzername',
    firstName: 'Vorname',
    lastName: 'Nachname',
    update: 'Benutzer aktualisieren',
    create: 'Benutzer erstellen',
    edit: 'Bearbeiten',
    delete: 'Loschen',
    saved: 'Benutzer gespeichert.',
    deleted: 'Benutzer geloscht.',
    directory: 'Benutzerverzeichnis',
    sortBy: 'Sortieren nach',
    nameAsc: 'Name A-Z',
    emailAsc: 'E-Mail A-Z',
    usernameAsc: 'Benutzername A-Z',
    exportExcel: 'Excel exportieren',
    exportPdf: 'PDF exportieren',
    previous: 'Zuruck',
    next: 'Weiter',
    pageLabel: 'Seite',
    ofLabel: 'von',
    showing: 'Zeige',
    records: 'Eintrage',
    actions: 'Aktionen',
    userId: 'Benutzer-ID',
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
    // ignore
  }

  return raw || fallback;
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

export default function ClerkUsersPanel({ canManageUsers, lang }: Props) {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'email-asc' | 'username-asc'>('name-asc');
  const [page, setPage] = useState(1);
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
        const message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message || raw;
        throw new Error(message);
      } catch {
        throw new Error(raw);
      }
    }

    return res.json();
  }

  async function loadUsers() {
    if (!canManageUsers) return;
    const data = await api('/admin/clerk-users');
    setUsers(data);
  }

  useEffect(() => {
    loadUsers().catch((err) => showToast(parseApiError(err), 'error'));
  }, [canManageUsers]);

  useEffect(() => {
    setPage(1);
  }, [query, sortBy, users.length]);

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return [...users]
      .filter((item) => {
        if (!search) return true;
        return [
          item.id,
          item.username,
          item.firstName,
          item.lastName,
          item.primaryEmailAddress,
          item.emailAddresses?.[0]?.emailAddress,
        ].some((value) => String(value ?? '').toLowerCase().includes(search));
      })
      .sort((a, b) => {
        if (sortBy === 'email-asc') {
          return compareText(a.primaryEmailAddress || a.emailAddresses?.[0]?.emailAddress, b.primaryEmailAddress || b.emailAddresses?.[0]?.emailAddress);
        }
        if (sortBy === 'username-asc') {
          return compareText(a.username, b.username);
        }
        return compareText([a.firstName, a.lastName].filter(Boolean).join(' ') || a.username || a.id, [b.firstName, b.lastName].filter(Boolean).join(' ') || b.username || b.id);
      });
  }, [query, sortBy, users]);

  const pagedUsers = paginateItems(filteredUsers, page);

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
      await api(`/admin/clerk-users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
      showToast(t.deleted, 'success');
      await loadUsers();
    } catch (err) {
      showToast(parseApiError(err), 'error');
    }
  }

  function editUser(item: ClerkUser) {
    setForm({
      userId: item.id,
      email: item.primaryEmailAddress ?? item.emailAddresses?.[0]?.emailAddress ?? '',
      password: '',
      firstName: item.firstName ?? '',
      lastName: item.lastName ?? '',
      username: item.username ?? '',
    });
  }

  function exportUsers(kind: 'excel' | 'pdf') {
    const headers = [t.userId, t.nameAsc.replace(' A-Z', ''), t.email, t.username];
    const rows = filteredUsers.map((item) => [
      item.id,
      [item.firstName, item.lastName].filter(Boolean).join(' ') || '-',
      item.primaryEmailAddress || item.emailAddresses?.[0]?.emailAddress || '-',
      item.username || '-',
    ]);
    if (kind === 'excel') {
      downloadCsv('user-management.csv', headers, rows);
      return;
    }
    exportTablePdf(t.title, headers, rows);
  }

  if (!canManageUsers) return null;

  return (
    <Card id="admin-users" className="material-panel">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-slate-50/70">
        <CardTitle className="flex items-center gap-3 text-2xl font-semibold tracking-[-0.02em] text-slate-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Users className="h-5 w-5" /></span>
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {toast && (
          <div className={`app-feedback ${toast.kind === 'error' ? 'app-feedback-error' : 'app-feedback-success'}`}>{toast.text}</div>
        )}

        <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Search className="h-4 w-4 text-primary" /> {t.directory}
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto_auto]">
            <Input placeholder={t.search} value={query} onChange={(e) => setQuery(e.target.value)} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name-asc' | 'email-asc' | 'username-asc')}>
              <option value="name-asc">{t.nameAsc}</option>
              <option value="email-asc">{t.emailAsc}</option>
              <option value="username-asc">{t.usernameAsc}</option>
            </select>
            <Button variant="outline" onClick={() => exportUsers('excel')}>{t.exportExcel}</Button>
            <Button variant="outline" onClick={() => exportUsers('pdf')}>{t.exportPdf}</Button>
            <Button variant="secondary" onClick={() => { setForm({ userId: '', email: '', password: '', firstName: '', lastName: '', username: '' }); loadUsers().catch((err) => showToast(parseApiError(err), 'error')); }}>{t.searchBtn}</Button>
          </div>
          <div className="mt-4 admin-table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-4 py-3">{t.nameAsc.replace(' A-Z', '')}</th>
                  <th className="px-4 py-3">{t.email}</th>
                  <th className="px-4 py-3">{t.username}</th>
                  <th className="px-4 py-3">{t.userId}</th>
                  <th className="px-4 py-3 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.items.map((item) => (
                  <tr key={item.id} className="material-table-row">
                    <td className="px-4 py-3 font-medium text-slate-950">{[item.firstName, item.lastName].filter(Boolean).join(' ') || '-'}</td>
                    <td className="px-4 py-3 text-slate-600"><span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-primary" /> {item.primaryEmailAddress || item.emailAddresses?.[0]?.emailAddress || '-'}</span></td>
                    <td className="px-4 py-3 text-slate-600">{item.username || '-'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{item.id}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => editUser(item)}>{t.edit}</Button><Button size="sm" variant="destructive" onClick={() => deleteUser(item.id)}>{t.delete}</Button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 admin-pagination"><span>{t.showing} {pagedUsers.start}-{pagedUsers.end} / {pagedUsers.total} {t.records}</span><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={pagedUsers.page <= 1} onClick={() => setPage((value) => value - 1)}>{t.previous}</Button><span>{t.pageLabel} {pagedUsers.page} {t.ofLabel} {pagedUsers.totalPages}</span><Button size="sm" variant="outline" disabled={pagedUsers.page >= pagedUsers.totalPages} onClick={() => setPage((value) => value + 1)}>{t.next}</Button></div></div>
        </div>

        <div className="rounded-[1.4rem] border border-primary/10 bg-primary/[0.04] p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            <ShieldCheck className="h-4 w-4 text-primary" /> {form.userId ? t.update : t.newForm}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Input placeholder={t.email} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input type="password" placeholder={t.password} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            <Input placeholder={t.username} value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
            <Input placeholder={t.firstName} value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
            <Input placeholder={t.lastName} value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
            <Button onClick={saveUser}>{form.userId ? t.update : t.create}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
