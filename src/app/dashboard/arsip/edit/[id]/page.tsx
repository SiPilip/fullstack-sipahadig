"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { ArsipHukdis } from '@prisma/client';
import toast from 'react-hot-toast';

export default function EditArsipPage() {
  const router = useRouter();
  const { id } = useParams();
  const [namaPegawai, setNamaPegawai] = useState('');
  const [nip, setNip] = useState('');
  const [tanggalMulaiHukuman, setTanggalMulaiHukuman] = useState('');
  const [tanggalAkhirHukuman, setTanggalAkhirHukuman] = useState('');
  const [keteranganHukdis, setKeteranganHukdis] = useState('ringan');
  const [berkas, setBerkas] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchArsip = async () => {
      try {
        const res = await fetch(`/api/arsip/${id}`);
        if (res.ok) {
          const data: ArsipHukdis = await res.json();
          setNamaPegawai(data.namaPegawai);
          setNip(data.nip || '');
          setTanggalMulaiHukuman(new Date(data.tanggalMulaiHukuman).toISOString().split('T')[0]);
          setTanggalAkhirHukuman(new Date(data.tanggalAkhirHukuman).toISOString().split('T')[0]);
          setKeteranganHukdis(data.keteranganHukdis);
          setBerkas(data.berkas);
        } else {
          toast.error('Gagal memuat data arsip.');
        }
      } catch (error) {
        toast.error('Tidak dapat terhubung ke server.');
        console.error('Failed to fetch arsip:', error);
      }
    };
    fetchArsip();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Memperbarui data...');

    try {
      const res = await fetch(`/api/arsip/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namaPegawai,
          nip,
          tanggalMulaiHukuman,
          tanggalAkhirHukuman,
          keteranganHukdis,
          berkas,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Data berhasil diperbarui!', { id: toastId });
        router.push(`/dashboard`);
      } else {
        toast.error(data.error || 'Gagal memperbarui data.', { id: toastId });
      }
    } catch (error) {
      toast.error('Tidak dapat terhubung ke server.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Arsip Hukuman Disiplin</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="namaPegawai">Nama Pegawai</FieldLabel>
              <Input
                id="namaPegawai"
                type="text"
                required
                value={namaPegawai}
                onChange={(e) => setNamaPegawai(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="nip">NIP</FieldLabel>
              <Input
                id="nip"
                type="text"
                required
                value={nip}
                onChange={(e) => setNip(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="tanggalMulaiHukuman">Tanggal Mulai Hukuman</FieldLabel>
              <Input
                id="tanggalMulaiHukuman"
                type="date"
                required
                value={tanggalMulaiHukuman}
                onChange={(e) => setTanggalMulaiHukuman(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="tanggalAkhirHukuman">Tanggal Akhir Hukuman</FieldLabel>
              <Input
                id="tanggalAkhirHukuman"
                type="date"
                required
                value={tanggalAkhirHukuman}
                onChange={(e) => setTanggalAkhirHukuman(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="keteranganHukdis">Keterangan Hukdis</FieldLabel>
              <select
                id="keteranganHukdis"
                required
                value={keteranganHukdis}
                onChange={(e) => setKeteranganHukdis(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="ringan">Ringan</option>
                <option value="sedang">Sedang</option>
                <option value="berat">Berat</option>
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="berkas">Berkas (Link Google Drive)</FieldLabel>
              <Input
                id="berkas"
                type="url"
                required
                value={berkas}
                onChange={(e) => setBerkas(e.target.value)}
              />
            </Field>
            <Field>
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
