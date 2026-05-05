"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#integrations", label: "Integrations" },
  { href: "/pricing", label: "Pricing", isPage: true },
  { href: "#faq", label: "FAQ" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";

  // Check auth state
  useEffect(() => {
    const supabase = createClient();
    
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setProfileOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    // Check for hash in URL on page load (for navigation from other pages)
    const hash = window.location.hash;
    if (hash && isHomePage) {
      setTimeout(() => {
        const element = document.getElementById(hash.replace("#", ""));
        if (element) {
          const offsetTop = element.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
          setActiveSection(hash);
        }
      }, 100);
    }
  }, [isHomePage]);

  useEffect(() => {
    if (!isHomePage) return;
    
    const handleScroll = () => {
      const sections = navLinks.map((link) => link.href.replace("#", ""));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(`#${section}`);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    if (isHomePage) {
      // On homepage, scroll to section
      const targetId = href.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        const offsetTop = element.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
        setActiveSection(href);
      }
    } else {
      // On other pages, navigate to homepage with hash
      router.push(`/${href}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="@container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Image
              src="/logo.png"
              alt="DataProFlow"
              width={180}
              height={48}
              className="h-14 w-auto md:h-16"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isPage ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors cursor-pointer py-1 ${
                    pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform duration-300 origin-left ${
                      pathname === link.href ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative text-sm font-medium transition-colors cursor-pointer py-1 ${
                    activeSection === link.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform duration-300 origin-left ${
                      activeSection === link.href ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              )
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>
                
                {profileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setProfileOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user.user_metadata?.full_name || user.email?.split("@")[0]}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        {isLoggingOut ? "Signing out..." : "Sign out"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-full hover:bg-foreground transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-primary/25"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-foreground cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link, index) => (
                link.isPage ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-all duration-300 cursor-pointer px-2 py-1 ${
                      pathname === link.href
                        ? "text-primary border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{
                      transitionDelay: mobileMenuOpen ? `${index * 50}ms` : "0ms",
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`text-sm font-medium transition-all duration-300 cursor-pointer px-2 py-1 ${
                      activeSection === link.href
                        ? "text-primary border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{
                      transitionDelay: mobileMenuOpen ? `${index * 50}ms` : "0ms",
                    }}
                  >
                    {link.label}
                  </a>
                )
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer px-2 py-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors cursor-pointer px-2 py-1 text-left"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer px-2 py-1"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-full hover:bg-foreground transition-all duration-200 cursor-pointer"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
