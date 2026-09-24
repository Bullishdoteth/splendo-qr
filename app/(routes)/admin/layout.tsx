import { Sidebar } from "@/components/shared/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F5F5F0] text-stone-900 font-sans">
      <Sidebar />
      <main className="flex-1 min-w-0 bg-[#F5F5F0] p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
