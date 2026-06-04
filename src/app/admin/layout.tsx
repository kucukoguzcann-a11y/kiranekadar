import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, LayoutDashboard, Database, Users, Home } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('kira-auth');
  let user: { email: string; role: string; name?: string } | null = null;

  if (authCookie?.value) {
    try {
      user = JSON.parse(authCookie.value);
    } catch {
      user = null;
    }
  }

  // Double check role guard (even though middleware blocks it)
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    redirect('/');
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-zinc-950/20">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-border/60 bg-card p-6 space-y-6 hidden md:block">
        <div className="flex items-center gap-2 pb-4 border-b border-border/40">
          <Shield className="h-5 w-5 text-accent" />
          <span className="font-extrabold text-sm text-foreground uppercase tracking-wider">
            Yönetim Paneli
          </span>
        </div>
        
        <nav className="flex flex-col gap-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Özet Raporlar
          </Link>
          <Link
            href="/admin/veriler"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Database className="h-4 w-4" />
            Veri Moderasyonu
          </Link>
          <Link
            href="/admin/kullanicilar"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Users className="h-4 w-4" />
            Kullanıcı Listesi
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border-t border-border/40 mt-4 pt-4"
          >
            <Home className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>
        </nav>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
