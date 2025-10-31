"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { KategoriDokumen } from '@prisma/client';
import { UploadCloud, Search, ArrowUpDown, ExternalLink } from 'lucide-react';

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    webViewLink: string;
    iconLink: string;
}

type SortConfig = { key: keyof DriveFile; direction: 'ascending' | 'descending' };

export default function GaleriDokumenPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [kategori, setKategori] = useState<KategoriDokumen | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'modifiedTime', direction: 'descending' });

  const fetchFiles = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
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
          toast.error(filesData.error || 'Gagal memuat file.');
        }
      } else if (currentKategori) {
        toast.error(`Folder ID untuk ${currentKategori.nama} belum diatur.`);
      }
    } catch (err) {
      toast.error('Gagal mengambil data.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const filteredAndSortedFiles = useMemo(() => {
    let sortedFiles = [...files];
    if (searchTerm) {
        sortedFiles = sortedFiles.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (sortConfig !== null) {
      sortedFiles.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortedFiles;
  }, [files, searchTerm, sortConfig]);

  const requestSort = (key: keyof DriveFile) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') direction = 'descending';
    setSortConfig({ key, direction });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !kategori) return;
    setUploading(true);
    const toastId = toast.loading(`Mengunggah ${selectedFile.name}...`);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('folderId', kategori.folderId);
    try {
      const res = await fetch('/api/dokumen/upload', { method: 'POST', body: formData });
      if (res.ok) {
        toast.success('File berhasil diunggah!', { id: toastId });
        setSelectedFile(null); 
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if(fileInput) fileInput.value = "";
        fetchFiles();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal mengunggah file.', { id: toastId });
      }
    } catch (error) {
      toast.error('Tidak dapat terhubung ke server.', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Unggah Dokumen Baru</CardTitle></CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <Input id="file-input" type="file" onChange={handleFileSelect} className="flex-grow" />
          <Button onClick={handleUpload} disabled={!selectedFile || uploading || !kategori || kategori.folderId === 'ganti-dengan-id-folder-asli'}>
            <UploadCloud className="w-4 h-4 mr-2" />
            {uploading ? 'Mengunggah...' : 'Unggah Sekarang'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-4">
            <CardTitle>{kategori?.nama || 'Galeri Dokumen'}</CardTitle>
            <div className="flex items-center gap-2">
                {kategori && kategori.folderId !== 'ganti-dengan-id-folder-asli' && (
                    <a href={`https://drive.google.com/drive/folders/${kategori.folderId}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">Buka Folder di Drive</Button>
                    </a>
                )}
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari nama file..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground w-12"></th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground cursor-pointer hover:bg-gray-100" onClick={() => requestSort('name')}>Nama File</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground cursor-pointer hover:bg-gray-100" onClick={() => requestSort('modifiedTime')}>Tanggal Diubah</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (<tr><td colSpan={4} className="text-center py-8">Memuat file...</td></tr>) :
                filteredAndSortedFiles.length > 0 ? filteredAndSortedFiles.map(file => (
                  <tr key={file.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2"><img src={file.iconLink} alt="icon" className="w-5 h-5" /></td>
                    <td className="px-4 py-2 font-medium">{file.name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{new Date(file.modifiedTime).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-2">
                      <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4" /></Button>
                      </a>
                    </td>
                  </tr>
                )) : (<tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Tidak ada file di dalam folder ini atau folder belum diatur.</td></tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
