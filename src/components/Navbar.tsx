import { Moon, Sun, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "الرئيسية" },
    { to: "/join", label: "التسجيل في المسابقة" },
    { to: "/project-support/register", label: "دعم المشاريع" },
    { to: "/all-groups", label: "المجموعات" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b border-border/50 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ width: "100%", maxWidth: "1400px" }}>
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Enhanced */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Link to="/" className="flex items-center gap-2 md:gap-3 group">
              <motion.div
                whileHover={{ rotate: 5 }}
                className="relative"
              >
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="h-9 w-9 md:h-12 md:w-12 rounded-xl object-contain shadow-lg group-hover:shadow-primary/30 transition-shadow"
                />
                <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              </motion.div>
              <span className="text-lg md:text-2xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
                IN General
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center gap-2 lg:gap-4 flex-1">
            {navLinks.map((link, idx) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  to={link.to}
                  className={`relative px-4 py-2 text-sm lg:text-base font-semibold transition-all duration-300 rounded-lg group ${
                    location.pathname === link.to
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {location.pathname === link.to && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                </Link>
              </motion.div>
            ))}
          </div>
          
          {/* Theme Toggle - Right Side */}
          <div className="hidden md:flex items-center flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full w-10 h-10 hover:bg-primary/10 transition-colors"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-500 hover:text-yellow-400 transition-colors" />
                )}
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full w-10 h-10 hover:bg-primary/10 transition-colors"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-500" />
                )}
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 rounded-lg hover:bg-primary/10 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-foreground" />
                ) : (
                  <Menu className="h-5 w-5 text-foreground" />
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Menu - Outside nav for proper z-index */}
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-background border-l border-border/50 shadow-2xl z-[70] md:hidden overflow-y-auto"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="h-10 w-10 rounded-xl object-contain"
                />
                <span className="text-lg font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  IN General
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2 pb-20">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block relative px-4 py-4 rounded-xl font-semibold text-base transition-all duration-300 group ${
                      location.pathname === link.to
                        ? "text-primary bg-primary/15 border-2 border-primary/30 shadow-lg shadow-primary/10"
                        : "text-foreground bg-muted/30 hover:bg-primary/10 hover:text-primary border-2 border-transparent hover:border-primary/20"
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-between">
                      <span>{link.label}</span>
                      {location.pathname === link.to && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-primary"
                        />
                      )}
                    </span>
                    {location.pathname === link.to && (
                      <motion.div
                        layoutId="mobileActiveTab"
                        className="absolute inset-0 bg-primary/5 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <div className="absolute bottom-0 right-0 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 right-0 left-0 p-4 border-t border-border/50 bg-background/95 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>© 2025 IN General</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
