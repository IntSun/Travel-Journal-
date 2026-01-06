import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, Mail, Lock, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Import images for slider
import sliderImg1 from '@assets/stock_images/scenic_mountain_land_0e735cd1.jpg';
import sliderImg2 from '@assets/stock_images/tropical_beach_with__7068561d.jpg';
import sliderImg3 from '@assets/stock_images/cozy_european_street_f6c0c131.jpg';
import sliderImg4 from '@assets/stock_images/cinematic_travel_pho_429fe972.jpg';
import sliderImg5 from '@assets/stock_images/bustling_tokyo_stree_63306352.jpg';
import sliderImg6 from '@assets/stock_images/santorini_greece_whi_92f245b6.jpg';
import sliderImg7 from '@assets/stock_images/safari_jeep_serenget_3157d044.jpg';
import sliderImg8 from '@assets/stock_images/machu_picchu_peru_an_fbda6389.jpg';
import sliderImg9 from '@assets/stock_images/northern_lights_icel_d3999985.jpg';
import sliderImg10 from '@assets/stock_images/venice_canals_gondol_9802187b.jpg';

const column1 = [sliderImg1, sliderImg2, sliderImg3, sliderImg4];
const column2 = [sliderImg5, sliderImg6, sliderImg7];
const column3 = [sliderImg8, sliderImg9, sliderImg10];

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      await login(username, password);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      await register(username, password);
      toast({
        title: "Account created!",
        description: "Welcome to Wanderlust Chronicles.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center lg:grid lg:grid-cols-2">
      
      {/* GLOBAL BACKGROUND SLIDER - Visible on all screens */}
      <div className="absolute inset-0 z-0 bg-background">
        {/* Animated Slider Container */}
        <div className="absolute inset-0 flex gap-4 md:gap-6 justify-center opacity-40 select-none pointer-events-none rotate-6 scale-125 overflow-hidden">
           {/* Column 1 - Going Up */}
           <div className="w-1/3 h-full relative">
              <motion.div 
                animate={{ y: [0, -1000] }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                className="absolute flex flex-col gap-4 md:gap-6 w-full"
              >
                 {[...column1, ...column1, ...column1, ...column1].map((img, i) => (
                     <div key={i} className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-muted">
                         <img src={img} className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700" alt="" />
                     </div>
                 ))}
              </motion.div>
           </div>

           {/* Column 2 - Going Down */}
           <div className="w-1/3 h-full relative pt-12">
              <motion.div 
                animate={{ y: [-1000, 0] }}
                transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                className="absolute flex flex-col gap-4 md:gap-6 w-full -top-[1000px]"
              >
                 {[...column2, ...column2, ...column2, ...column2].map((img, i) => (
                     <div key={i} className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-muted">
                         <img src={img} className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700" alt="" />
                     </div>
                 ))}
              </motion.div>
           </div>

           {/* Column 3 - Going Up */}
           <div className="w-1/3 h-full relative">
              <motion.div 
                animate={{ y: [0, -1000] }}
                transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
                className="absolute flex flex-col gap-4 md:gap-6 w-full"
              >
                 {[...column3, ...column3, ...column3, ...column3].map((img, i) => (
                     <div key={i} className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-muted">
                         <img src={img} className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700" alt="" />
                     </div>
                 ))}
              </motion.div>
           </div>
        </div>

        {/* Colorful Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent mix-blend-overlay opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-orange-500/10 mix-blend-multiply backdrop-blur-[1px]"></div>
      </div>

      {/* Left Side Content - Text (Hidden on small screens, visible on large) */}
      <div className="relative z-10 hidden lg:flex flex-col justify-between p-12 h-full pointer-events-none">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground p-2 rounded-xl shadow-lg backdrop-blur-md">
              <Compass className="h-6 w-6" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-wide text-foreground">Wanderlust</span>
          </div>
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
          >
              <h1 className="font-serif text-6xl font-bold leading-tight text-foreground mb-6 drop-shadow-sm">
                Your journey <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">begins here.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-md font-light leading-relaxed">
                Join thousands of travelers documenting their adventures, discovering new places, and preserving memories that last a lifetime.
              </p>
          </motion.div>
        </div>
        
        <div className="text-sm text-muted-foreground font-medium">
          &copy; 2026 Wanderlust Inc. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form (Visible everywhere) */}
      <div className="relative z-10 w-full flex items-center justify-center p-4 sm:p-8">
        
        {/* Colorful ambient glow behind the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-orange-400/30 blur-3xl opacity-50 pointer-events-none rounded-full animate-pulse"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative"
        >
          <div className="bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 p-6 md:p-8 relative overflow-hidden">
              
              {/* Subtle gradient border effect on top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 opacity-80"></div>

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/40 p-1">
                  <TabsTrigger value="login" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-primary data-[state=active]:shadow-sm">Login</TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-primary data-[state=active]:shadow-sm">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold font-serif mb-2 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">Welcome Back</h2>
                        <p className="text-muted-foreground text-sm">Enter your credentials to access your journal</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <div className="relative group">
                            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input id="username" name="username" type="text" placeholder="johndoe" className="pl-9 bg-white/50 dark:bg-black/50 border-primary/20 focus:border-primary/50 transition-all" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative group">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input id="password" name="password" type="password" className="pl-9 bg-white/50 dark:bg-black/50 border-primary/20 focus:border-primary/50 transition-all" required />
                          </div>
                        </div>
                        <Button type="submit" className="w-full h-11 text-base mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 border-0 transition-all hover:scale-[1.02]" disabled={isLoading}>
                          {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </TabsContent>
                
                <TabsContent value="register">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold font-serif mb-2 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">Start Your Journey</h2>
                        <p className="text-muted-foreground text-sm">Create an account to document your travels</p>
                    </div>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username-register">Username</Label>
                          <div className="relative group">
                            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input id="username-register" name="username" type="text" placeholder="johndoe" className="pl-9 bg-white/50 dark:bg-black/50 border-primary/20 focus:border-primary/50" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password-register">Password</Label>
                          <div className="relative group">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input id="password-register" name="password" type="password" placeholder="Min. 6 characters" className="pl-9 bg-white/50 dark:bg-black/50 border-primary/20 focus:border-primary/50" required minLength={6} />
                          </div>
                        </div>
                        <Button type="submit" className="w-full h-11 text-base mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 border-0 transition-all hover:scale-[1.02]" disabled={isLoading}>
                          {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>
                </TabsContent>
              </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
