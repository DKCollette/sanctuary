"use client";

import ForumNavbar from "@/components/forum/forum-navbar";
import GalaxyBackground from "@/components/galaxy-background";

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <GalaxyBackground />
      <ForumNavbar />
      {children}
    </div>
  );
}