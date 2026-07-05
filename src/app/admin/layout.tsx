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
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 md:ml-64 min-h-screen relative pt-16 md:pt-0 w-full overflow-x-hidden">
        <main className="p-4 md:p-8 pb-24 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
