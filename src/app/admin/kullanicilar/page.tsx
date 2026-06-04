'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminKullanicilarPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Kullanıcılar yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500/10 text-red-700 hover:bg-red-500/10 border-red-500/20">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/10 border-blue-500/20">Moderatör</Badge>;
      default:
        return <Badge variant="secondary">Üye</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-accent" />
            Kullanıcı Listesi
          </h2>
          <p className="text-xs text-muted-foreground">
            Sisteme kayıtlı üyeler, yöneticiler ve modlar.
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="icon">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Users Table Card */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
          <CardTitle className="text-base font-bold">Kayıtlı Üyeler Havuzu</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-accent animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground font-semibold text-sm">
              Sistemde kayıtlı üye bulunmamaktadır.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className="text-xs font-bold uppercase text-muted-foreground">Kullanıcı</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-muted-foreground">E-posta</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-muted-foreground">Rol</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-muted-foreground">Veri Giriş Sayısı</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-muted-foreground text-right">Kayıt Tarihi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userObj) => (
                    <TableRow key={userObj.id} className="hover:bg-muted/10 transition-colors">
                      {/* Name */}
                      <TableCell className="py-4">
                        <span className="font-semibold text-xs text-foreground">
                          {userObj.name || 'İsimsiz Kullanıcı'}
                        </span>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="text-xs text-muted-foreground">
                        {userObj.email}
                      </TableCell>

                      {/* Role */}
                      <TableCell>{getRoleBadge(userObj.role)}</TableCell>

                      {/* Submitted report count */}
                      <TableCell className="font-semibold text-xs text-foreground">
                        {userObj._count.rentReports} Adet Kira Girişi
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {new Date(userObj.createdAt).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
