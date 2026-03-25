import Footer from "@/components/Footer";
import OwnerHeader from "@/components/OwnerHeader";
import OwnerMobileNav from "@/components/OwnerMobileNav";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 min-h-full">
      <OwnerHeader />
      <div className="flex flex-1 flex-col lg:flex-row min-h-0">
        <Sidebar />
        <main
          id="main-content"
          className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8"
        >
          {children}
        </main>
      </div>
      <Footer />
      <OwnerMobileNav />
    </div>
  );
}
