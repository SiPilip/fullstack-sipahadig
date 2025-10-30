import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mt-4 mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-500 mb-8">Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
      <Link href="/">
        <Button>Kembali ke Halaman Utama</Button>
      </Link>
    </div>
  );
}
