import Image from "next/image";
import kementrianImipasLogo from "@/../public/images/kementrian-imipas.png";
import lapasBengkuluLogo from "@/../public/images/lapas-bengkulu.png";
import lapasLogo from "@/../public/images/lapas.png";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";

export default function Navbar() {
  const logoList = [kementrianImipasLogo, lapasBengkuluLogo, lapasLogo];

  return (
    <nav className=" bg-[#F5F6FA] border-t-gray-200 border-b-gray-200 border z-50">
      <div className="flex gap-5 items-center justify-between mx-auto px-5 py-3 text-[#4876EE]">
        <div className="flex justify-start gap-5 items-center">
          <SidebarTrigger className="scale-125" />
          {logoList.map((logo, index) => (
            <div className="w-10 relative aspect-square" key={index}>
              <Image src={logo} fill className="object-contain" alt="logo1" />
            </div>
          ))}
        </div>
        <div className="text-2xl font-bold">
          SIPAHADIG LAPAS KELAS IIA BENGKULU
        </div>
      </div>
    </nav>
  );
}
