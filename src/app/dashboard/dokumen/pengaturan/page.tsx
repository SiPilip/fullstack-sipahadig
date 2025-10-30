"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { KategoriDokumen } from '@prisma/client';

export default function PengaturanDokumenPage() {
  const [kategori, setKategori] = useState<KategoriDokumen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await fetch('/api/dokumen/kategori');
        const data = await res.json();
        if (res.ok) {
          setKategori(data);
        } else {
          toast.error(data.error || 'Gagal memuat kategori.');
        }
      } catch (err) {
        toast.error('Gagal terhubung ke server.');
      }
      setLoading(false);
    };
    fetchKategori();
  }, []);

  const handleFolderIdChange = (id: number, folderId: string) => {
    setKategori(kategori.map(k => k.id === id ? { ...k, folderId } : k));
  };

  const handleSave = async (k: KategoriDokumen) => {
    const toastId = toast.loading(`Menyimpan ${k.nama}...`);
    try {
        const res = await fetch(`/api/dokumen/kategori`, { // Simplified POST
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Google Drive</CardTitle>
          <CardDescription>Hubungkan akun Google Anda dan tautkan ID folder untuk setiap kategori dokumen.</CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/api/auth/google/authorize">
            <Button>Hubungkan Akun Google</Button>
          </a>
          <p className="text-xs text-muted-foreground mt-2">Anda mungkin perlu menghubungkan ulang jika sesi berakhir.</p>
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
