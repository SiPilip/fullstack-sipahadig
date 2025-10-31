"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { KategoriDokumen } from '@prisma/client';
import { UploadCloud, Search, ExternalLink, FolderPlus, Trash2, Folder as FolderIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface DriveItem {
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
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [itemToDelete, setItemToDelete] = useState<DriveItem | null>(null);

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
          setItems(filesData);
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

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [items, searchTerm]);

  const handleUpload = async () => { /* ... existing upload logic ... */ };
  const handleCreateFolder = async () => {
    if (!newFolderName || !kategori) return;
    const toastId = toast.loading(`Membuat folder ${newFolderName}...`);
    try {
        const res = await fetch('/api/dokumen/create-folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderName: newFolderName, parentFolderId: kategori.folderId })
        });
        if (res.ok) {
            toast.success('Folder berhasil dibuat!', { id: toastId });
            fetchFiles(); // Refresh
        } else {
            const data = await res.json();
            toast.error(data.error || 'Gagal membuat folder.', { id: toastId });
        }
    } catch (e) { toast.error('Gagal terhubung ke server.', { id: toastId }); }
    setCreateFolderOpen(false);
    setNewFolderName('');
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const toastId = toast.loading(`Menghapus ${itemToDelete.name}...`);
    try {
        const res = await fetch('/api/dokumen/delete-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileId: itemToDelete.id })
        });
        if (res.ok) {
            toast.success('Item berhasil dihapus.', { id: toastId });
            fetchFiles(); // Refresh
        } else {
            const data = await res.json();
            toast.error(data.error || 'Gagal menghapus item.', { id: toastId });
        }
    } catch (e) { toast.error('Gagal terhubung ke server.', { id: toastId }); }
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* ... Upload Card ... */}
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center gap-4">
                <CardTitle>{kategori?.nama || 'Galeri Dokumen'}</CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCreateFolderOpen(true)}><FolderPlus className="h-4 w-4 mr-2"/>Buat Folder</Button>
                    {/* ... Search Input and Open Folder Button ... */}
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <table className="w-full table-auto text-sm">
                <thead>{/* ... Table Headers ... */}</thead>
                <tbody>
                    {loading ? (<tr><td colSpan={4} className="text-center py-8">Memuat...</td></tr>) :
                    filteredItems.length > 0 ? filteredItems.map(item => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2"><img src={item.iconLink} alt="icon" className="w-5 h-5" /></td>
                            <td className="px-4 py-2 font-medium">{item.name}</td>
                            <td className="px-4 py-2 text-muted-foreground">{new Date(item.modifiedTime).toLocaleDateString('id-ID')}</td>
                            <td className="px-4 py-2 flex gap-1">
                                <a href={item.webViewLink} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" title="Buka di Drive"><ExternalLink className="h-4 w-4" /></Button></a>
                                <Button variant="destructive" size="sm" title="Hapus" onClick={() => setItemToDelete(item)}><Trash2 className="h-4 w-4" /></Button>
                            </td>
                        </tr>
                    )) : (<tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Folder ini kosong.</td></tr>)}
                </tbody>
            </table>
        </CardContent>
      </Card>

      {/* Create Folder Modal */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Buat Folder Baru</DialogTitle></DialogHeader>
            <div className="py-4">
                <Input placeholder="Nama folder..." value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                <Button onClick={handleCreateFolder}>Buat</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={itemToDelete !== null} onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}>
        <DialogContent>
            <DialogHeader><DialogTitle>Konfirmasi Hapus</DialogTitle><DialogDescription>Apakah Anda yakin ingin menghapus <strong>{itemToDelete?.name}</strong>? Tindakan ini tidak dapat dibatalkan.</DialogDescription></DialogHeader>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}