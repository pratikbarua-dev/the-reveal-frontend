import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'Admin - The Reveal',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  console.log('Session in Admin Layout:', JSON.stringify(session));

  if (!session || !(session as any).isAdmin) {
    redirect('/play');
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 min-h-screen relative">
        <main className="p-8 pb-24">
          {children}
        </main>
      </div>
    </div>
  );
}
