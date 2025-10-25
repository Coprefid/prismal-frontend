import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 py-10">
      <div className="container-page flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Image src="/isotipo.png" alt="Prismal AI" width={20} height={20} className="h-5 w-5" />
          <span>Prismal AI</span>
        </div>
        <div className="text-xs text-slate-500">© {new Date().getFullYear()} Prismal AI. Todos los derechos reservados.</div>
      </div>
    </footer>
  );
}
