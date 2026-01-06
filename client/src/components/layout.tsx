import { Link, useLocation } from "wouter";
import { Compass, PenTool, LogOut, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide nav on entry page to let the hero image shine through, but keep it accessible
  const isEntryPage = location.startsWith('/entry/');
  
  // Get user initials for avatar fallback
  const userInitials = user?.username 
    ? user.username.substring(0, 2).toUpperCase() 
    : 'U';

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled || !isEntryPage 
            ? "bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-border/40 py-2" 
            : "bg-transparent py-4 border-transparent"
        }`}
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`p-2.5 rounded-xl transition-all duration-300 ${scrolled || !isEntryPage ? "bg-primary/10 text-primary" : "bg-white/20 text-white backdrop-blur-md"}`}>
              <Compass className="h-6 w-6" />
            </div>
            <span className={`font-serif text-2xl font-bold tracking-wide transition-colors ${scrolled || !isEntryPage ? "text-foreground" : "text-white"}`}>
              Wanderlust
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full backdrop-blur-sm border border-white/10">
            <Link href="/" className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location === '/' ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              Journal
            </Link>
            <Link href="/map" className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location === '/map' ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              Map
            </Link>
            <Link href="/create" className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${location === '/create' ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              New Entry
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/create">
                  <Button 
                    size="sm" 
                    className={`hidden sm:flex rounded-full px-6 font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
                        scrolled || !isEntryPage 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "bg-white text-primary hover:bg-white/90"
                    }`}
                  >
                    <PenTool className="mr-2 h-4 w-4" /> Write
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 overflow-hidden border-2 border-white/20 shadow-sm hover:scale-105 transition-transform">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user?.profileImage || "https://github.com/shadcn.png"} alt={user?.username} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2 rounded-2xl glass-card border-none" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal p-3">
                      <div className="flex flex-col space-y-2">
                        <p className="text-base font-bold leading-none">{user?.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          Travel Enthusiast
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem className="rounded-xl p-3 cursor-pointer focus:bg-primary/10 focus:text-primary">
                      <User className="mr-3 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <Link href="/map">
                      <DropdownMenuItem className="rounded-xl p-3 cursor-pointer focus:bg-primary/10 focus:text-primary">
                        <MapPin className="mr-3 h-4 w-4" />
                        <span>My Map</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem 
                      onClick={logout}
                      className="rounded-xl p-3 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Show auth buttons for non-logged-in users */
              <div className="flex items-center gap-3">
                <Link href="/auth">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`rounded-full px-6 font-medium transition-all duration-300 ${
                        scrolled || !isEntryPage 
                        ? "text-foreground hover:bg-primary/10" 
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button 
                    size="sm" 
                    className={`rounded-full px-6 font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
                        scrolled || !isEntryPage 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "bg-white text-primary hover:bg-white/90"
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spacer for fixed header on non-entry pages */}
      {!isEntryPage && <div className="h-24"></div>}

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="border-t border-border/40 py-12 bg-muted/30">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row px-6">
          <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <span className="font-serif font-bold text-lg">Wanderlust</span>
          </div>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ for travelers who cherish every moment.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
