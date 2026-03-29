import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireProfile={true}>
      <div className="min-h-screen bg-background pb-20">
        {children}
        <BottomNav />
      </div>
    </AuthGuard>
  );
}