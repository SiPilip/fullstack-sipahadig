"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArsipHukdis } from "@prisma/client";
import toast from "react-hot-toast";

export default function ArsipPage() {
  const { keterangan } = useParams();
  const router = useRouter();
  const [arsip, setArsip] = useState<ArsipHukdis[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const toastId = toast.loading("Menghapus data...");
      try {
        const res = await fetch(`/api/arsip/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          toast.success("Data berhasil dihapus.", { id: toastId });
          setArsip(arsip.filter((item) => item.id !== id));
        } else {
          const data = await res.json();
          toast.error(data.error || "Gagal menghapus data.", { id: toastId });
        }
      } catch (error) {
        console.log(error);
        toast.error("Tidak dapat terhubung ke server.", { id: toastId });
      }
    }
  };

  useEffect(() => {
    const fetchArsip = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/arsip?keterangan=${keterangan}`);
        if (res.ok) {
          const data = await res.json();
          setArsip(data);
        } else {
          console.log(res);
          toast.error("Gagal mengambil data.");
        }
      } catch (error) {
        toast.error("Gagal mengambil data.");
        console.error("Failed to fetch arsip:", error);
      }
      setLoading(false);
    };

    if (keterangan) {
      fetchArsip();
    }
  }, [keterangan]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Arsip Hukuman Disiplin -{" "}
          {keterangan
            ? keterangan.toString().charAt(0).toUpperCase() +
              keterangan.toString().slice(1)
            : ""}
        </CardTitle>
        <Link href="/dashboard/arsip/tambah">
          <Button>Tambah Data</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2">Nama Pegawai</th>
                <th className="px-4 py-2">NIP</th>
                <th className="px-4 py-2">Tanggal Mulai</th>
                <th className="px-4 py-2">Tanggal Akhir</th>
                <th className="px-4 py-2">Keterangan</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {arsip.map((item) => (
                <tr key={item.id}>
                  <td className="border px-4 py-2">{item.namaPegawai}</td>
                  <td className="border px-4 py-2">{item.nip}</td>
                  <td className="border px-4 py-2">
                    {new Date(item.tanggalMulaiHukuman).toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-2">
                    {new Date(item.tanggalAkhirHukuman).toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-2">{item.keteranganHukdis}</td>
                  <td className="border px-4 py-2">
                    <Link href={`/dashboard/arsip/detail/${item.id}`}>
                      <Button size="sm" variant="ghost">
                        Detail
                      </Button>
                    </Link>
                    <Link href={`/dashboard/arsip/edit/${item.id}`}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
