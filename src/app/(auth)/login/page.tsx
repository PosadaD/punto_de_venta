import LoginForm from "./loginForm";


export default function LoginPage() {
  return (
    <main className="flex justify-center items-center h-screen">
      <div className="shadow-lg p-8 rounded-2xl w-96">
        <h1 className="text-2xl font-semibold mb-4 text-center">Iniciar Sesión</h1>
        <LoginForm />
      </div>
    </main>
  );
}
