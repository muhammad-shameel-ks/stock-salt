"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MobileMenuToggle() {
  const pathname = usePathname();

  useEffect(() => {
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const sidebar = document.querySelector("[data-sidebar]");
    const overlay = document.getElementById("sidebar-overlay");

    if (!mobileMenuButton || !sidebar || !overlay) return;

    const toggleSidebar = () => {
      if (sidebar.classList.contains("-translate-x-full")) {
        // Show sidebar
        sidebar.classList.remove("-translate-x-full");
        sidebar.classList.add("translate-x-0");
        document.body.style.overflow = "hidden";

        // Show overlay
        overlay.classList.remove("hidden");
        setTimeout(() => {
          overlay.classList.add("pointer-events-auto", "opacity-100");
        }, 10);
      } else {
        // Hide sidebar
        sidebar.classList.add("-translate-x-full");
        sidebar.classList.remove("translate-x-0");
        document.body.style.overflow = "";

        // Hide overlay
        overlay.classList.remove("pointer-events-auto", "opacity-100");
        setTimeout(() => {
          overlay.classList.add("hidden");
        }, 300);
      }
    };

    const handleClick = () => {
      toggleSidebar();
    };

    mobileMenuButton.addEventListener("click", handleClick);

    // Cleanup
    return () => {
      mobileMenuButton.removeEventListener("click", handleClick);
    };
  }, [pathname]); // Re-run when pathname changes

  return null;
}
