"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArsipHukdis } from "@prisma/client";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Search,
  ArrowUpDown,
  Trash2,
  Edit,
  FileText,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

type SortConfig = {
  key: keyof ArsipHukdis;
  direction: "ascending" | "descending";
};

export default function DashboardPage() {
  const router = useRouter();
  const [arsipAktif, setArsipAktif] = useState<ArsipHukdis[]>([]);
  const [arsipSelesai, setArsipSelesai] = useState<ArsipHukdis[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"aktif" | "selesai">("aktif");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: "tanggalAkhirHukuman",
    direction: "ascending",
  });
  const [selectedDetail, setSelectedDetail] = useState<ArsipHukdis | null>(
    null
  );
  const [itemToDelete, setItemToDelete] = useState<ArsipHukdis | null>(null);

  const fetchData = async () => {
    // No setLoading(true) here to avoid flashing on manual refresh
    try {
      const [resAktif, resSelesai] = await Promise.all([
        fetch("/api/arsip?status=aktif"),
        fetch("/api/arsip?status=selesai"),
      ]);
      const dataAktif = await resAktif.json();
      const dataSelesai = await resSelesai.json();
      setArsipAktif(Array.isArray(dataAktif) ? dataAktif : []);
      setArsipSelesai(Array.isArray(dataSelesai) ? dataSelesai : []);
    } catch (error) {
      toast.error("Gagal memuat data dashboard.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kpi = useMemo(() => {
    const selesai30Hari = arsipSelesai.filter((item) => {
      const diffDays =
        (new Date().getTime() - new Date(item.tanggalAkhirHukuman).getTime()) /
        (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 30;
    }).length;
    const rincianAktif = arsipAktif.reduce((acc, item) => {
      acc[item.keteranganHukdis] = (acc[item.keteranganHukdis] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { totalAktif: arsipAktif.length, selesai30Hari, rincianAktif };
  }, [arsipAktif, arsipSelesai]);

  const notifikasi = useMemo(() => {
    return arsipAktif.filter((item) => {
      const diffDays =
        (new Date(item.tanggalAkhirHukuman).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= 7;
    });
  }, [arsipAktif]);

  const dataUntukTabel = activeTab === "aktif" ? arsipAktif : arsipSelesai;

  const dataTabelTersaring = useMemo(() => {
    let data = [...dataUntukTabel];
    if (searchTerm) {
      data = data.filter(
        (item) =>
          item.namaPegawai.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.nip &&
            item.nip.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (sortConfig !== null) {
      data.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        let comparison = 0;
        if (valA > valB) comparison = 1;
        else if (valA < valB) comparison = -1;
        return sortConfig.direction === "ascending" ? comparison : -comparison;
      });
    }
    return data;
  }, [dataUntukTabel, searchTerm, sortConfig]);

  const requestSort = (key: keyof ArsipHukdis) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig?.key === key && sortConfig.direction === "ascending")
      direction = "descending";
    setSortConfig({ key, direction });
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const toastId = toast.loading("Menghapus data...");
    try {
      const res = await fetch(`/api/arsip/${itemToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Data berhasil dihapus.", { id: toastId });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus data.", { id: toastId });
      }
    } catch (error) {
      toast.error("Tidak dapat terhubung ke server.", { id: toastId });
    }
    setItemToDelete(null);
  };

  const handleExport = () => {
    const data = dataTabelTersaring;
    if (data.length === 0) {
      toast.error("Tidak ada data untuk diekspor.");
      return;
    }
    const headers = [
      "NIP",
      "Nama Pegawai",
      "Tanggal Mulai",
      "Tanggal Akhir",
      "Keterangan",
    ];
    const csvContent = [
      headers.join(","),
      ...data.map((item) =>
        [
          item.nip || "",
          item.namaPegawai,
          new Date(item.tanggalMulaiHukuman).toLocaleDateString("id-ID"),
          new Date(item.tanggalAkhirHukuman).toLocaleDateString("id-ID"),
          item.keteranganHukdis,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `arsip_${activeTab}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortArrow = (key: keyof ArsipHukdis) => {
    if (sortConfig?.key !== key)
      return <ArrowUpDown className="h-3 w-3 ml-2 opacity-30" />;
    return sortConfig.direction === "ascending" ? "▲" : "▼";
  };

  const SkeletonRow = () => (
    <tr className="border-b">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <td key={i} className="px-4 py-2">
            <Skeleton className="h-5 w-full" />
          </td>
        ))}
    </tr>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-1/2" />
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr>
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <th key={i} className="px-4 py-2">
                        <Skeleton className="h-5 w-full" />
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pegawai Aktif Dihukum
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.totalAktif}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Selesai 30 Hari Terakhir
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.selesai30Hari}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Rincian Hukuman Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Ringan:</span>{" "}
              <span className="font-bold">{kpi.rincianAktif.ringan || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Sedang:</span>{" "}
              <span className="font-bold">{kpi.rincianAktif.sedang || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Berat:</span>{" "}
              <span className="font-bold">{kpi.rincianAktif.berat || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {notifikasi.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-yellow-800">
              Notifikasi Penting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
              {notifikasi.map((item) => (
                <li key={item.id}>
                  Hukuman untuk <strong>{item.namaPegawai}</strong> akan
                  berakhir pada{" "}
                  <strong>
                    {new Date(item.tanggalAkhirHukuman).toLocaleDateString(
                      "id-ID"
                    )}
                  </strong>
                  .
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("aktif")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "aktif"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setActiveTab("selesai")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "selesai"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Selesai
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari Nama/NIP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Ekspor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {[
                    "nip",
                    "namaPegawai",
                    "tanggalMulaiHukuman",
                    "tanggalAkhirHukuman",
                    "keteranganHukdis",
                  ].map((key) => (
                    <th
                      key={key}
                      className="px-4 py-2 text-left font-medium text-muted-foreground cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort(key as keyof ArsipHukdis)}
                    >
                      <div className="flex items-center">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}{" "}
                        {renderSortArrow(key as keyof ArsipHukdis)}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {dataTabelTersaring.length > 0 ? (
                  dataTabelTersaring.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{item.nip}</td>
                      <td className="px-4 py-2">{item.namaPegawai}</td>
                      <td className="px-4 py-2">
                        {new Date(item.tanggalMulaiHukuman).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(item.tanggalAkhirHukuman).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>
                      <td className="px-4 py-2">{item.keteranganHukdis}</td>
                      <td className="px-4 py-2 flex gap-1">
                        <Button
                          onClick={() => setSelectedDetail(item)}
                          variant="ghost"
                          size="sm"
                          title="Lihat Detail"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() =>
                            router.push(`/dashboard/arsip/edit/${item.id}`)
                          }
                          variant="outline"
                          size="sm"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => setItemToDelete(item)}
                          variant="destructive"
                          size="sm"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Tidak ada data untuk ditampilkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={selectedDetail !== null}
        onOpenChange={(isOpen) => !isOpen && setSelectedDetail(null)}
      >
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Detail Arsip: {selectedDetail?.namaPegawai}</SheetTitle>
          </SheetHeader>
          {selectedDetail && (
            <div className="space-y-4 py-4">
              <div>
                <strong>Nama:</strong> {selectedDetail.namaPegawai}
              </div>
              <div>
                <strong>NIP:</strong> {selectedDetail.nip}
              </div>
              <div>
                <strong>Keterangan:</strong> {selectedDetail.keteranganHukdis}
              </div>
              <div>
                <strong>Masa Hukuman:</strong>{" "}
                {new Date(
                  selectedDetail.tanggalMulaiHukuman
                ).toLocaleDateString("id-ID")}{" "}
                -{" "}
                {new Date(
                  selectedDetail.tanggalAkhirHukuman
                ).toLocaleDateString("id-ID")}
              </div>
              <div className="pt-4">
                <h4 className="font-medium mb-2">Berkas SK</h4>
                <iframe
                  src={`https://docs.google.com/gview?url=${selectedDetail.berkas}&embedded=true`}
                  className="w-full h-[60vh] border rounded-md"
                />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog
        open={itemToDelete !== null}
        onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data hukuman disiplin untuk{" "}
              <strong>{itemToDelete?.namaPegawai}</strong> (NIP:{" "}
              {itemToDelete?.nip})? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
