import DreamShareNavbar from "@/components/dreamshare/dreamshare-navbar";
import GalaxyBackground from "@/components/galaxy-background";

export default function DreamShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <GalaxyBackground />
      <DreamShareNavbar />
      {children}
    </div>
  );
}