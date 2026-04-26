import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import PushPrompt from '@/components/PushPrompt';

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
        <PushPrompt />
      </div>
    </AuthGuard>
  );
}