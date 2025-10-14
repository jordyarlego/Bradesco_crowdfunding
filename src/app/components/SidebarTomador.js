import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SidebarTomador({ user }) {
  const router = useRouter();
  return (
    <div className="w-20 bg-gradient-to-b from-brand-purple-light to-brand-purple-dark flex flex-col items-center py-8 min-h-screen">
      {/* Logo topo */}
      <button onClick={() => router.push('/dashboard-tomador')} className="mb-6 focus:outline-none w-14 h-14 flex items-center justify-center rounded-full shadow-lg bg-brand-pink">
        <Image src="/logo.png" alt="Logo" width={40} height={40} />
      </button>
      {/* Avatar */}
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
        <span className="text-brand-purple-dark font-bold text-lg">
          {user?.nome?.charAt(0).toUpperCase()}
        </span>
      </div>
      {/* Botão Dashboard */}
      <button
        onClick={() => router.push('/dashboard-tomador')}
        className="mb-1 bg-gradient-to-br from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white p-4 rounded-xl shadow-lg flex flex-col items-center transition-all duration-200 border-2 border-white/10 hover:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink"
        title="Dashboard"
        style={{ minWidth: 0 }}
      >
        <Image src="/logo.png" alt="Logo" width={26} height={26} />
      </button>
      <span className="text-xs text-white font-semibold mb-7">Dashboard</span>
      {/* Botão Solicitar Empréstimo */}
      <Link href="/dashboard-tomador/solicitar-emprestimo" className="mb-8 w-full flex flex-col items-center">
        <button
          className="bg-gradient-to-br from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white p-4 rounded-xl shadow-lg flex flex-col items-center transition-all duration-200 border-2 border-white/10 hover:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink"
          title="Solicitar Empréstimo"
          style={{ minWidth: 0 }}
        >
          <Image src="/logo.png" alt="Logo" width={26} height={26} />
        </button>
        <div className="text-xs text-white mt-2 text-center font-semibold">Solicitar<br/>Empréstimo</div>
      </Link>
      {/* Logout */}
      <button
        onClick={() => {
          if (typeof window !== 'undefined') {
            localStorage.clear();
            router.push('/');
          }
        }}
        className="mt-auto text-white hover:text-brand-pink transition-colors"
        title="Sair"
      >
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
          <span className="text-brand-purple-dark text-sm">→</span>
        </div>
        <div className="text-xs mt-1">Sair</div>
      </button>
    </div>
  );
}
