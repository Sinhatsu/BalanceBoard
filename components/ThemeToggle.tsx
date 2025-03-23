"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 transition-all hover:rotate-180 duration-500"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-500 rotate-0 transition-all" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700 rotate-0 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

