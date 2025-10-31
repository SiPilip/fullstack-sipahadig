"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { ArsipHukdis } from '@prisma/client';
import toast from 'react-hot-toast';
import { KategoriDokumen } from '@prisma/client';

export default function EditArsipPage() {
  const router = useRouter();
  const { id } = useParams();
  // Form fields
  const [namaPegawai, setNamaPegawai] = useState('');
  const [nip, setNip] = useState('');
  const [tanggalMulaiHukuman, setTanggalMulaiHukuman] = useState('');
  const [tanggalAkhirHukuman, setTanggalAkhirHukuman] = useState('');
  const [keteranganHukdis, setKeteranganHukdis] = useState('ringan');
  const [berkas, setBerkas] = useState(''); // This will hold the final webViewLink
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // For new upload
  
  // Control states
  const [loading, setLoading] = useState(false);
  const [kategoriList, setKategoriList] = useState<KategoriDokumen[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const catRes = await fetch('/api/dokumen/kategori');
            if(catRes.ok) setKategoriList(await catRes.json());

            if (id) {
                const arsipRes = await fetch(`/api/arsip/${id}`);
                if (arsipRes.ok) {
                    const data: ArsipHukdis = await arsipRes.json();
                    setNamaPegawai(data.namaPegawai);
                    setNip(data.nip || '');
                    setTanggalMulaiHukuman(new Date(data.tanggalMulaiHukuman).toISOString().split('T')[0]);
                    setTanggalAkhirHukuman(new Date(data.tanggalAkhirHukuman).toISOString().split('T')[0]);
                    setKeteranganHukdis(data.keteranganHukdis);
                    setBerkas(data.berkas); // Set the existing file link
                } else { toast.error('Gagal memuat data arsip.'); }
            }
        } catch (e) { toast.error('Gagal memuat data awal.'); console.error(e); }
    };
    fetchInitialData();
  }, [id]);

  const getTargetFolderId = () => {
    const slug = `sk-hukuman-${keteranganHukdis}`;
    return kategoriList.find(k => k.slug === slug)?.folderId || null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Memproses data...');

    let finalBerkasLink = berkas; // Start with the existing link

    try {
      // Step 1 (Optional): If a new file is selected, upload it first.
      if (selectedFile) {
        const folderId = getTargetFolderId();
        if (!folderId || folderId === 'ganti-dengan-id-folder-asli') {
            throw new Error(`Folder ID untuk SK Hukuman ${keteranganHukdis} belum diatur.`);
        }
        toast.loading('Mengunggah file baru...', { id: toastId });

        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        uploadFormData.append('folderId', folderId);
        uploadFormData.append('namaPegawai', namaPegawai);
        uploadFormData.append('nip', nip);
        uploadFormData.append('tanggalMulai', tanggalMulaiHukuman);

        const uploadRes = await fetch('/api/dokumen/upload', { method: 'POST', body: uploadFormData });
        const uploadedFileData = await uploadRes.json();

        if (!uploadRes.ok) {
            throw new Error(uploadedFileData.error || 'Gagal mengunggah file baru.');
        }
        finalBerkasLink = uploadedFileData.webViewLink; // Update the link to the new file
      }

      // Step 2: Update the main form data
      toast.loading('Menyimpan data arsip...', { id: toastId });
      const arsipRes = await fetch(`/api/arsip/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            namaPegawai, nip, tanggalMulaiHukuman, tanggalAkhirHukuman, keteranganHukdis, 
            berkas: finalBerkasLink // Use the final link (new or old)
        }),
      });

      const arsipData = await arsipRes.json();
      if (arsipRes.ok) {
        toast.success('Data berhasil diperbarui!', { id: toastId });
        router.push(`/dashboard`);
      } else {
        throw new Error(arsipData.error || 'Gagal memperbarui data arsip.');
      }

    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
      <Card>
        <CardHeader><CardTitle>Edit Arsip Hukuman Disiplin</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field><FieldLabel>Nama Pegawai</FieldLabel><Input required value={namaPegawai} onChange={(e) => setNamaPegawai(e.target.value)} /></Field>
              <Field><FieldLabel>NIP</FieldLabel><Input required value={nip} onChange={(e) => setNip(e.target.value)} /></Field>
              <Field><FieldLabel>Tanggal Mulai Hukuman</FieldLabel><Input type="date" required value={tanggalMulaiHukuman} onChange={(e) => setTanggalMulaiHukuman(e.target.value)} /></Field>
              <Field><FieldLabel>Tanggal Akhir Hukuman</FieldLabel><Input type="date" required value={tanggalAkhirHukuman} onChange={(e) => setTanggalAkhirHukuman(e.target.value)} /></Field>
              <Field>
                <FieldLabel>Keterangan Hukdis</FieldLabel>
                <select required value={keteranganHukdis} onChange={(e) => setKeteranganHukdis(e.target.value)} className="w-full p-2 border rounded-md">
                  <option value="ringan">Ringan</option>
                  <option value="sedang">Sedang</option>
                  <option value="berat">Berat</option>
                </select>
              </Field>
              <Field>
                <FieldLabel>Berkas SK Saat Ini</FieldLabel>
                <a href={berkas} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">{berkas || "Belum ada berkas tertaut."}</a>
              </Field>
              <Field>
                <FieldLabel>Ganti Berkas SK (Opsional)</FieldLabel>
                <Input type="file" onChange={handleFileChange} accept=".pdf" />
                <p className="text-xs text-muted-foreground">Pilih file baru jika Anda ingin mengganti berkas SK yang lama.</p>
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
  );
}