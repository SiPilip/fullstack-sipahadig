"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { KategoriDokumen } from '@prisma/client';
import { CheckCircle, XCircle, LogOut } from 'lucide-react';

export default function PengaturanDokumenPage() {
  const [kategori, setKategori] = useState<KategoriDokumen[]>([]);
  const [googleStatus, setGoogleStatus] = useState<{ isConnected: boolean; email?: string }>({ isConnected: false });
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const statusRes = await fetch('/api/auth/google/status');
      const statusData = await statusRes.json();
      setGoogleStatus(statusData);

      const kategoriRes = await fetch('/api/dokumen/kategori');
      const kategoriData = await kategoriRes.json();
      if (kategoriRes.ok) {
        setKategori(kategoriData);
      } else {
        toast.error(kategoriData.error || 'Gagal memuat kategori.');
      }
    } catch (err) {
      toast.error('Gagal mengambil data pengaturan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleFolderIdChange = (id: number, folderId: string) => {
    setKategori(kategori.map(k => k.id === id ? { ...k, folderId } : k));
  };

  const handleSave = async (k: KategoriDokumen) => {
    const toastId = toast.loading(`Menyimpan ${k.nama}...`);
    try {
        const res = await fetch(`/api/dokumen/kategori`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: k.id, folderId: k.folderId }),
        });
        if (res.ok) {
            toast.success('Folder ID berhasil disimpan.', { id: toastId });
        } else {
            const data = await res.json();
            toast.error(data.error || 'Gagal menyimpan.', { id: toastId });
        }
    } catch (err) {
        toast.error('Gagal terhubung ke server.', { id: toastId });
    }
  };

  const handleDisconnect = async () => {
    const toastId = toast.loading('Memutuskan hubungan...');
    try {
        const res = await fetch('/api/auth/google/disconnect', { method: 'POST' });
        if (res.ok) {
            toast.success('Hubungan akun Google berhasil diputus.', { id: toastId });
            fetchStatus(); // Refresh status
        } else {
            toast.error('Gagal memutuskan hubungan.', { id: toastId });
        }
    } catch (err) {
        toast.error('Gagal terhubung ke server.', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Google Drive</CardTitle>
          <CardDescription>Hubungkan atau putuskan akun Google Anda untuk integrasi Google Drive.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p>Memeriksa status...</p> : (
            googleStatus.isConnected ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <p>Terhubung sebagai: <strong>{googleStatus.email}</strong></p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Putuskan Hubungan
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <p>Status: <strong>Tidak Terhubung</strong></p>
                <a href="/api/auth/google/authorize">
                  <Button>Hubungkan Akun Google</Button>
                </a>
              </div>
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Penautan Folder Dokumen</CardTitle>
          <CardDescription>Masukkan ID folder Google Drive untuk setiap kategori.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? <p>Memuat kategori...</p> : kategori.map(k => (
            <div key={k.id} className="flex items-center gap-4">
              <label className="w-1/3 font-medium">{k.nama}</label>
              <Input 
                className="flex-grow" 
                placeholder="Contoh: 1a2b3c4d5e6f7g8h9i0j..."
                value={k.folderId}
                onChange={(e) => handleFolderIdChange(k.id, e.target.value)}
              />
              <Button onClick={() => handleSave(k)}>Simpan</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}