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

type Props = {
  canManageUsers: boolean;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api';

export default function ClerkUsersPanel({ canManageUsers }: Props) {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    userId: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    username: '',
  });

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
    if (!res.ok) throw new Error(await res.text());
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
    loadUsers().catch((err) => setMessage(String(err)));
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
      setMessage('Clerk user saved.');
      await loadUsers();
    } catch (err) {
      setMessage(String(err));
    }
  }

  async function deleteUser(userId: string) {
    if (!canManageUsers) return;
    try {
      await api(`/admin/clerk-users/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      setMessage('Clerk user deleted.');
      await loadUsers();
    } catch (err) {
      setMessage(String(err));
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
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-teal-700" /> Clerk User Management</CardTitle>
      </CardHeader>
      <CardContent>
        {message && <p className="mb-2 text-sm text-slate-600">{message}</p>}

        <div className="mb-3 grid gap-2 md:grid-cols-4">
          <Input placeholder="Search by email/name" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button variant="outline" onClick={() => loadUsers()}>Search Users</Button>
          <Button variant="secondary" onClick={() => setForm({ userId: '', email: '', password: '', firstName: '', lastName: '', username: '' })}>New User Form</Button>
        </div>

        <div className="mb-3 grid gap-2 md:grid-cols-3">
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input placeholder="Password (required for new user)" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          <Input placeholder="Username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
          <Input placeholder="First name" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
          <Input placeholder="Last name" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
          <Button onClick={saveUser}>{form.userId ? 'Update Clerk User' : 'Create Clerk User'}</Button>
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
                <Button size="sm" variant="ghost" onClick={() => editUser(item)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => deleteUser(item.id)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
