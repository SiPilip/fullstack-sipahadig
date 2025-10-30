import { z } from 'zod';

export const arsipHukdisSchema = z.object({
  namaPegawai: z.string().min(3, { message: "Nama pegawai harus diisi." }),
  nip: z.string().regex(/^[0-9]+$/, { message: "NIP harus berupa angka." }).min(8, { message: "NIP minimal 8 digit." }),
  tanggalMulaiHukuman: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Format tanggal mulai tidak valid." }),
  tanggalAkhirHukuman: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Format tanggal akhir tidak valid." }),
  keteranganHukdis: z.enum(['ringan', 'sedang', 'berat'], { errorMap: () => ({ message: 'Keterangan harus ringan, sedang, atau berat.' }) }),
  berkas: z.string().url({ message: "URL berkas tidak valid." }).min(1, { message: "URL berkas harus diisi." }),
});
