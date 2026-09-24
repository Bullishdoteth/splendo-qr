import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-1 items-center justify-center bg-white font-sans">
      <Link href="/auth/login" className="bg-green-950 text-white py-4 px-8 hover:bg-green-900 hover:scale-110 cursor-pointer rounded-md transition-all duration-300">Admin access</Link>
    </div>
  );
}
