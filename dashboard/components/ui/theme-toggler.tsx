"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Sun03Icon, Moon02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function ThemeToggler() {
  const { setTheme, theme } = useTheme();

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
    };
  }, [theme, setTheme]);

  const themeToggle = () => setTheme(theme === 'light' ? 'dark': 'light');

  return (
    <div className="flex item">
      <button className={cn("p-1.5 lg:p-2 rounded-full outline-none bg-secondary-blue text-white",)} onClick={themeToggle}>
        <HugeiconsIcon icon={Sun03Icon} className="lg:size-[1.2rem] size-[1rem] hidden dark:block" />
        <HugeiconsIcon icon={Moon02Icon} className="lg:size-[1.2rem] size-[1rem] dark:hidden" />
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  )
}