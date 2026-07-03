import { useAuthStore } from "@/store/auth.store";

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">BTP Manager</h1>
          <p className="mt-2 text-gray-500">Connexion requise</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 p-4">
        <h1 className="text-lg font-bold text-gray-900 mb-6">BTP Manager</h1>
        <nav className="space-y-1">
          <a
            href="#"
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Chantiers
          </a>
          <a
            href="#"
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Pointages
          </a>
          <a
            href="#"
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Dépenses
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
        <p className="mt-2 text-gray-500">Bienvenue dans BTP Manager.</p>
      </main>
    </div>
  );
}

export default App;
