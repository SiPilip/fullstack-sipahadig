import Image from "next/image";
import kementrianImipasLogo from "@/../public/images/kementrian-imipas.png";
import lapasLogo from "@/../public/images/lapas.png";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Navbar() {
  return (
    <nav className=" bg-[#F5F6FA] border-t-gray-200 border-b-gray-200 border z-50">
      <div className="flex gap-5 items-center justify-between mx-auto px-5 py-3 text-[#1B1D55]">
        <div className="flex justify-start gap-5 items-center">
          <SidebarTrigger className="scale-125" />
          <div className="w-10 relative aspect-square">
            <Image
              src={kementrianImipasLogo}
              fill
              className="object-contain"
              alt="logo1"
            />
          </div>
        </div>
        <div className="text-2xl font-bold">
          SIPAHADIG LAPAS KELAS IIA BENGKULU
        </div>
        <div className="w-10 relative aspect-square">
          <Image src={lapasLogo} fill className="object-contain" alt="logo1" />
        </div>
      </div>
    </nav>
  );
}
