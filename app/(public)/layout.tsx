import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1 pb-16 sm:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
