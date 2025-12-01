import Link from "next/link";
import Image from "next/image";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../utils/authContext";

export default function SidebarTomador({ user }) {  
  const router = useRouter();
  const { usuario, autenticado, loading, isBorrower } = useContext(AuthContext);

  const handleEmprestimoAtivo = async () => {
    if (loading) return;

    // 🔐 Verificação de autenticação e role
    if (!autenticado || !isBorrower()) {
      router.push("/entrar");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/entrar");
        return;
      }

      if (!usuario || !usuario.id) {
        alert("Erro: usuário não encontrado.");
        return;
      }

      // 📌 Chamando o service REAL
      const emprestimos = await emprestimoService.listarEmprestimosPorTomador(
        usuario.id,
        token
      );

      // 📌 Localizar o empréstimo ativo
      const ativo = emprestimos.find((e) => e.status === "ativo");

      if (!ativo) {
        alert("Nenhum empréstimo ativo encontrado.");
        return;
      }

      // 📌 Redirecionar
      router.push(`/dashboard-tomador/emprestimo-ativo/${emprestimos.id}`);
    } catch (err) {
      console.error("Erro ao carregar empréstimo ativo:", err);
      alert("Erro ao buscar empréstimo ativo.");
    }
  };
  return (
    <div className="w-20 bg-gradient-to-b from-brand-purple-light to-brand-purple-dark flex flex-col items-center py-8 min-h-screen">
      {/* Logo topo */}
      <button
        onClick={() => router.push("/dashboard-tomador")}
        className="mb-6 focus:outline-none w-14 h-14 flex items-center justify-center rounded-full shadow-lg bg-brand-pink"
      >
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
        onClick={() => router.push("/dashboard-tomador")}
        className="mb-1 bg-gradient-to-br from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white p-4 rounded-xl shadow-lg flex flex-col items-center transition-all duration-200 border-2 border-white/10 hover:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink"
        title="Dashboard"
        style={{ minWidth: 0 }}
      >
        <Image src="/logo.png" alt="Logo" width={26} height={26} />
      </button>
      <span className="text-xs text-white font-semibold mb-7">Dashboard</span>
      {/* Botão Solicitar Empréstimo */}
      <Link
        href="/dashboard-tomador/solicitar-emprestimo"
        className="mb-2 w-full flex flex-col items-center"
      >
        <button
          className="bg-gradient-to-br from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white p-4 rounded-xl shadow-lg flex flex-col items-center transition-all duration-200 border-2 border-white/10 hover:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink"
          title="Solicitar Empréstimo"
          style={{ minWidth: 0 }}
        >
          <Image src="/logo.png" alt="Logo" width={26} height={26} />
        </button>
        <div className="text-xs text-white mt-2 text-center font-semibold mb-6">
          Solicitar
          <br />
          Empréstimo
        </div>
      </Link>
      {/* Botão Empréstimo Ativo */}
      <Link
        href="/dashboard-tomador/emprestimo-ativo"
        className="mb-8 w-full flex flex-col items-center"
      >
        <button
           onClick={()=> handleEmprestimoAtivo()}
          className="bg-gradient-to-br from-brand-pink to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-pink text-white p-4 rounded-xl shadow-lg flex flex-col items-center transition-all duration-200 border-2 border-white/10 hover:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink"
          title="Empréstimo Ativo"
          style={{ minWidth: 0 }}
        >
          <Image src="/logo.png" alt="Logo" width={26} height={26} />
        </button>
        <div className="text-xs text-white mt-2 text-center font-semibold">
          Empréstimo
          <br />
          Ativo
        </div>
      </Link>
      {/* Logout */}
      <button
        onClick={() => {
          if (typeof window !== "undefined") {
            localStorage.clear();
            router.push("/");
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
