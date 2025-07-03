"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle } from "lucide-react";

export function Header() {
  const { data: session, status } = useSession();
  
  const isAdmin = session?.user?.email === "koushikchodraju008@gmail.com";
  const isAuthenticated = status === "authenticated";
  const isGuest = status === "unauthenticated";
  const isLoading = status === "loading";

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight text-primary">IMED</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            About
          </Link>
          <Link
            href="/hono"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Hono API
          </Link>
          <Link
            href="/contact"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted"></div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      className="h-9 w-9 rounded-full object-cover" 
                    />
                  ) : (
                    <UserCircle className="h-5 w-5" />
                  )}
                  {isAdmin && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-primary"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {session.user?.name || "User"}
                  {isAdmin && (
                    <span className="ml-2 bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground rounded-sm">
                      ADMIN
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/#medicine-form">Get Started</Link>
              </Button>
            </>
          )}
          {isGuest && (
            <div className="text-xs text-muted-foreground ml-2">
              Guest Mode
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 