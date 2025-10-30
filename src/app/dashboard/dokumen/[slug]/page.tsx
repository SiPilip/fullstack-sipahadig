"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { KategoriDokumen } from '@prisma/client';

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    webViewLink: string;
    iconLink: string;
}

export default function GaleriDokumenPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [kategori, setKategori] = useState<KategoriDokumen | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchFiles = async () => {
      try {
        // First, get all categories to find the folderId for the current slug
        const catRes = await fetch('/api/dokumen/kategori');
        const categories: KategoriDokumen[] = await catRes.json();
        const currentKategori = categories.find(c => c.slug === slug);
        setKategori(currentKategori || null);

        if (currentKategori && currentKategori.folderId !== 'ganti-dengan-id-folder-asli') {
          const filesRes = await fetch(`/api/dokumen/files?folderId=${currentKategori.folderId}`);
          const filesData = await filesRes.json();
          if (filesRes.ok) {
            setFiles(filesData);
          } else {
            toast.error(filesData.error || 'Gagal memuat file dari Google Drive.');
            if (filesData.needsReAuth) {
                // Optionally redirect to auth page
            }
          }
        } else if (currentKategori) {
            toast.error(`Folder ID untuk ${currentKategori.nama} belum diatur.`);
        }
      } catch (err) {
        toast.error('Gagal mengambil data.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [slug]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{kategori?.nama || 'Galeri Dokumen'}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <p>Memuat file...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.length > 0 ? files.map(file => (
                    <a key={file.id} href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <img src={file.iconLink} alt="file icon" className="w-6 h-6" />
                            <span className="text-sm font-medium truncate">{file.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Diubah: {new Date(file.modifiedTime).toLocaleDateString('id-ID')}</p>
                    </a>
                )) : <p>Tidak ada file di dalam folder ini atau folder belum diatur.</p>}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
