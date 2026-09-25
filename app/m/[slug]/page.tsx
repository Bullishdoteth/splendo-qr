import { redirect } from "next/navigation";

export default async function ShortMenuRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/menu/${slug}`);
}
