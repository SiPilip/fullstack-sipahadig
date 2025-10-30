import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import kementrianImipasLogo from '@/../public/images/kementrian-imipas.png';
import lapasBengkuluLogo from '@/../public/images/lapas-bengkulu.png';
import lapasLogo from '@/../public/images/lapas.png';

export default function HomePage() {
  const logoList = [kementrianImipasLogo, lapasBengkuluLogo, lapasLogo];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {logoList.map((logo, index) => (
              <div className="w-12 h-12 relative" key={index}>
                <Image src={logo} layout="fill" objectFit="contain" alt={`logo-${index}`} />
              </div>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">SIPAHADIG</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          SISTEM PENGELOLAAN ARSIP HUKUMAN DISIPLIN PEGAWAI
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          LEMBAGA PEMASYARAKATAN KELAS II A BENGKULU
        </p>

        <div className="flex justify-center gap-4 mb-16">
          <Button variant="outline">Button</Button>
          <Button variant="outline">Button</Button>
          <Button variant="outline">Button</Button>
          <Button variant="outline">Button</Button>
          <Button variant="outline">Button</Button>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-4">SK BAP</h3>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button>Hukuman Disiplin Ringan</Button>
          </Link>
          <Link href="/login">
            <Button>Hukuman Disiplin Sedang</Button>
          </Link>
          <Link href="/login">
            <Button>Hukuman Disiplin Berat</Button>
          </Link>
        </div>
      </main>

      <footer className="bg-white py-4">
        <div className="container mx-auto text-center text-gray-600">
          &copy; {new Date().getFullYear()} by Site Name. Powered and secured by Wix
        </div>
      </footer>
    </div>
  );
}
