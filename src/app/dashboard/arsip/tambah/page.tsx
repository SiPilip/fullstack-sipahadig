"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import toast from 'react-hot-toast';
import { KategoriDokumen } from '@prisma/client';

export default function TambahArsipPage() {
  const router = useRouter();
  // Form fields
  const [namaPegawai, setNamaPegawai] = useState('');
  const [nip, setNip] = useState('');
  const [tanggalMulaiHukuman, setTanggalMulaiHukuman] = useState('');
  const [tanggalAkhirHukuman, setTanggalAkhirHukuman] = useState('');
  const [keteranganHukdis, setKeteranganHukdis] = useState('ringan');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Control states
  const [loading, setLoading] = useState(false);
  const [kategoriList, setKategoriList] = useState<KategoriDokumen[]>([]);

  useEffect(() => {
    const fetchKategori = async () => {
        try {
            const res = await fetch('/api/dokumen/kategori');
            if(res.ok) setKategoriList(await res.json());
        } catch (e) { console.error(e) }
    };
    fetchKategori();
  }, []);

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
    if (!selectedFile) {
        toast.error("Anda belum memilih file SK untuk diunggah.");
        return;
    }
    const folderId = getTargetFolderId();
    if (!folderId || folderId === 'ganti-dengan-id-folder-asli') {
        toast.error(`Folder ID untuk SK Hukuman ${keteranganHukdis} belum diatur di halaman Pengaturan.`);
        return;
    }

    setLoading(true);
    const toastId = toast.loading('Mengunggah file SK ke Google Drive...');

    try {
      // Step 1: Upload file to Google Drive
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('folderId', folderId);
      uploadFormData.append('namaPegawai', namaPegawai);
      uploadFormData.append('nip', nip);
      uploadFormData.append('tanggalMulai', tanggalMulaiHukuman);

      const uploadRes = await fetch('/api/dokumen/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const uploadedFileData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadedFileData.error || 'Gagal mengunggah file ke Drive.');
      }

      toast.loading('File terunggah, menyimpan data arsip...', { id: toastId });

      // Step 2: Save the main form data with the new file link
      const arsipRes = await fetch('/api/arsip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            namaPegawai, 
            nip, 
            tanggalMulaiHukuman, 
            tanggalAkhirHukuman, 
            keteranganHukdis, 
            berkas: uploadedFileData.webViewLink // Use the link from Google Drive
        }),
      });

      const arsipData = await arsipRes.json();
      if (arsipRes.ok) {
        toast.success('Data arsip berhasil dibuat!', { id: toastId });
        router.push(`/dashboard`);
      } else {
        throw new Error(arsipData.error || 'Gagal menyimpan data arsip.');
      }

    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan yang tidak diketahui.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
      <Card>
        <CardHeader><CardTitle>Tambah Arsip Hukuman Disiplin</CardTitle></CardHeader>
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
                <FieldLabel>Unggah Berkas SK</FieldLabel>
                <Input type="file" required onChange={handleFileChange} accept=".pdf" />
                <p className="text-xs text-muted-foreground">File akan diunggah ke folder Google Drive yang sesuai.</p>
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
  );
}