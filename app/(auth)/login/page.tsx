import { LoginForm } from "@/components/auth/LoginForm";

export default function Page() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}