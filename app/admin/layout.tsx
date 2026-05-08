import Link from "next/link";
import { Suspense } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b h-16">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5">
          <div className="flex gap-5 items-center font-semibold">
            <Link href="/admin">UPMin Admin</Link>
          </div>
          <div>
            <Link href="/login" className="text-sm hover:underline">
              Sign out
            </Link>
          </div>
        </div>
      </nav>
      <div className="flex-1">
        {children}
      </div>
    </main>
  );
}