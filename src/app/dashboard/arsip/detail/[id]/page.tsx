"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArsipHukdis } from '@prisma/client';

export default function DetailArsipPage() {
  const { id } = useParams();
  const [arsip, setArsip] = useState<ArsipHukdis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArsip = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/arsip/${id}`);
        if (res.ok) {
          const data = await res.json();
          setArsip(data);
        }
      } catch (error) {
        console.error('Failed to fetch arsip:', error);
      }
      setLoading(false);
    };

    if (id) {
      fetchArsip();
    }
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!arsip) {
    return <p>Arsip not found.</p>;
  }

  const pdfUrl = arsip.berkas; // The URL from DB is now a direct preview link

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Arsip: {arsip.namaPegawai}</CardTitle>
      </CardHeader>
      <CardContent>
        <iframe src={pdfUrl} style={{ width: '100%', height: '80vh' }} frameBorder="0" />
      </CardContent>
    </Card>
  );
}
