import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { userAuth } from "@/lib/userAuth";
import { ThemeToggle } from "./ThemeToggle";

const Header = async () => {
  await userAuth();
  return (
    <div className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/10 bg-white/60 dark:bg-black/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform">
            B
          </div>
          <span className="hidden sm:inline text-xl font-bold text-foreground font-heading tracking-tight group-hover:text-primary transition-colors">
            BalanceBoard
          </span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <SignedIn>
            <Link href="/dashboard">
              <Button variant={"ghost"} className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary text-muted-foreground font-medium">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/transaction/create">
              <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all rounded-full px-6">
                <PenBox size={18} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>

          <ThemeToggle />

          <SignedOut>
            <SignInButton forceRedirectUrl={"/dashboard"}>
              <Button variant={"outline"} className="rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all">Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton appearance={{
              elements: {
                avatarBox: "w-10 h-10 ring-2 ring-primary/10 hover:ring-primary/30 transition-all",
              }
            }} />
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

export default Header;
