import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, useAnimation } from "framer-motion";
import { Search, MapPin, Calendar, ArrowRight, Compass, Sparkles, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import type { Entry } from "@shared/schema";
import emptyStateImg from '@assets/generated_images/minimalist_line_art_illustration_of_a_traveler_with_a_backpack_looking_at_a_map,_empty_state_concept.png';
import communityImg from '@assets/generated_images/travelers_sharing_stories_illustration.png';

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

export default function Home() {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [communityEntries, setCommunityEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        
        if (user) {
          // If user is logged in, fetch ALL entries (user's + community)
          const response = await fetch(`/api/entries?limit=50`);
          if (!response.ok) {
            console.error('Failed to fetch entries:', response.status);
            throw new Error('Failed to fetch entries');
          }
          const data = await response.json();
          console.log('Fetched all entries (logged in):', data.length, data);
          
          // Separate user's entries from community entries
          const userEntries = data.filter((entry: any) => entry.userId === user.id);
          const otherEntries = data.filter((entry: any) => entry.userId !== user.id);
          
          console.log('User entries:', userEntries.length, 'Community entries:', otherEntries.length);
          setEntries(userEntries);
          setCommunityEntries(otherEntries);
        } else {
          // Not logged in - fetch all entries from database to show on landing page
          const communityResponse = await fetch(`/api/entries?limit=50`);
          if (communityResponse.ok) {
            const communityData = await communityResponse.json();
            console.log('Fetched entries:', communityData.length, communityData);
            setCommunityEntries(communityData || []);
          } else {
            const errorData = await communityResponse.json().catch(() => ({}));
            console.error('Failed to fetch entries:', communityResponse.status, errorData);
          }
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [user]);

  // Show all entries: user's entries first, then community entries
  // When logged out, show all community entries
  const displayEntries = user 
    ? [...entries, ...communityEntries]
    : communityEntries;
  
  const filteredEntries = displayEntries.filter((entry) =>
    entry.title.toLowerCase().includes(search.toLowerCase()) ||
    entry.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-24 pb-20">
        {/* Hero Section with Infinite Slider Background */}
        <section className="relative rounded-3xl overflow-hidden h-[500px] md:h-[600px] flex items-center justify-center text-center shadow-xl mx-4 md:mx-0 mt-4 md:mt-0 bg-background/50">
           
           {/* Animated Background Slider */}
           <div className="absolute inset-0 z-0 flex gap-4 md:gap-8 justify-center opacity-30 select-none pointer-events-none rotate-6 scale-110">
              {/* Column 1 - Going Up */}
              <div className="w-1/3 md:w-1/4 h-full relative overflow-hidden">
                 <motion.div 
                   animate={{ y: [0, -1000] }}
                   transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                   className="absolute flex flex-col gap-4 md:gap-8 w-full"
                 >
                    {[...column1, ...column1, ...column1].map((img, i) => (
                        <div key={i} className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                            <img src={img} className="w-full h-full object-cover" alt="" />
                        </div>
                    ))}
                 </motion.div>
              </div>

              {/* Column 2 - Going Down */}
              <div className="w-1/3 md:w-1/4 h-full relative overflow-hidden pt-12">
                 <motion.div 
                   animate={{ y: [-1000, 0] }}
                   transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                   className="absolute flex flex-col gap-4 md:gap-8 w-full -top-[1000px]"
                 >
                    {[...column2, ...column2, ...column2].map((img, i) => (
                        <div key={i} className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                            <img src={img} className="w-full h-full object-cover" alt="" />
                        </div>
                    ))}
                 </motion.div>
              </div>

              {/* Column 3 - Going Up */}
              <div className="w-1/3 md:w-1/4 h-full relative overflow-hidden hidden sm:block">
                 <motion.div 
                   animate={{ y: [0, -1000] }}
                   transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
                   className="absolute flex flex-col gap-4 md:gap-8 w-full"
                 >
                    {[...column3, ...column3, ...column3].map((img, i) => (
                        <div key={i} className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                            <img src={img} className="w-full h-full object-cover" alt="" />
                        </div>
                    ))}
                 </motion.div>
              </div>
           </div>

           {/* Gradient Overlay for Readability */}
           <div className="absolute right-0 bottom-0 w-full h-full bg-gradient-to-b from-background/80 via-background/60 to-background/90 z-0"></div>
           
           <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-block"
            >
               <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 text-primary text-sm font-medium mb-6 shadow-sm">
                <Compass className="w-4 h-4" /> Discover the World
               </span>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    delayChildren: 0.1,
                    staggerChildren: 0.1
                  }
                }
              }}
            >
                <h1 className="font-serif text-6xl md:text-8xl font-bold text-foreground leading-tight drop-shadow-sm">
                    <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-block">Wanderlust</motion.span>{' '}
                    <motion.span variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-primary italic inline-block">Chronicles</motion.span>
                </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light drop-shadow-sm"
            >
              Capture the essence of your journeys. A sanctuary for your most cherished travel memories and stories.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative max-w-lg mx-auto mt-8"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/70 dark:text-foreground/60 h-6 w-6 group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                <Input
                  placeholder="Search for adventures..."
                  className="pl-12 h-14 rounded-full border-2 border-primary/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-lg focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all text-lg relative z-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </motion.div>
           </div>
        </section>

        {/* Masonry-style Grid */}
        <div className="container mx-auto px-4">
           {user ? (
             <>
               <div className="flex items-center justify-between mb-8">
                 <div>
                   <h2 className="font-serif text-3xl font-bold text-foreground">
                     {entries.length > 0 ? 'Travel Stories' : 'Community Inspiration'}
                   </h2>
                   <p className="text-sm text-muted-foreground mt-1">
                     {entries.length > 0 
                       ? `${entries.length} ${entries.length === 1 ? 'story' : 'stories'} from you, ${communityEntries.length} from the community`
                       : 'Get inspired by other travelers while you create your first entry'}
                   </p>
                 </div>
                 <div className="hidden md:flex gap-2">
                     <Button variant="ghost" size="sm" className="text-primary font-medium bg-primary/5 hover:bg-primary/10">All</Button>
                     <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/5">Europe</Button>
                     <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/5">Asia</Button>
                 </div>
               </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                className={index === 0 ? "md:col-span-2 lg:col-span-2 row-span-2" : ""}
              >
                <Link href={`/entry/${entry.id}`} className="block h-full group perspective-1000">
                    <Card className={`h-full overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-card group-hover:-translate-y-2 group-hover:bg-white dark:group-hover:bg-zinc-900 ${index === 0 ? "flex flex-col md:flex-row" : "flex flex-col"}`}>
                      <div className={`relative overflow-hidden ${index === 0 ? "md:w-2/3 h-64 md:h-auto" : "h-72"}`}>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10 duration-500" />
                        <img
                          src={entry.images[0]}
                          alt={entry.title}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <Badge className="absolute top-4 right-4 z-20 bg-white/90 text-foreground hover:bg-white backdrop-blur-md shadow-sm font-medium px-3 py-1">
                          <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
                          {new Date(entry.date).toLocaleDateString()}
                        </Badge>
                      </div>
                      
                      <div className={`relative flex flex-col ${index === 0 ? "md:w-1/3 p-8 justify-center" : "p-6"}`}>
                        <CardHeader className="p-0 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center text-primary text-sm font-bold tracking-wider uppercase">
                              <MapPin className="w-3.5 h-3.5 mr-1.5" />
                              {entry.location}
                            </div>
                            {entries.length === 0 && communityEntries.length > 0 && (
                              <span className="text-xs text-muted-foreground italic">by janedoe</span>
                            )}
                          </div>
                          <h3 className={`font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-tight ${index === 0 ? "text-4xl" : "text-2xl"}`}>
                            {entry.title}
                          </h3>
                        </CardHeader>
                        <CardContent className="p-0 mb-6 flex-grow">
                          <p className="text-muted-foreground line-clamp-3 leading-relaxed text-base font-light">
                            {entry.description}
                          </p>
                        </CardContent>
                        <CardFooter className="p-0 mt-auto">
                          <div className="flex items-center text-sm font-bold text-primary group-hover:translate-x-2 transition-transform duration-300">
                            Read Story <ArrowRight className="w-4 h-4 ml-2" />
                          </div>
                        </CardFooter>
                      </div>
                    </Card>
                </Link>
              </motion.div>
            ))}
              </div>
              )}

              {!isLoading && filteredEntries.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-24 bg-muted/20 rounded-3xl border border-dashed border-muted-foreground/10"
                >
                  <div className="w-64 h-64 mb-6 opacity-80 mix-blend-multiply dark:mix-blend-normal">
                      <img src={emptyStateImg} alt="No results" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                    {search ? 'Uncharted Territory' : 'No Entries Yet'}
                  </h3>
                  <p className="text-muted-foreground max-w-md text-center mb-6">
                    {search 
                      ? `We couldn't find any adventures matching "${search}". Perhaps it's time to start a new journey?`
                      : "You haven't documented any travels yet. Start your first journal entry!"}
                  </p>
                  <div className="flex gap-4">
                      {search && <Button variant="outline" onClick={() => setSearch("")}>Clear Search</Button>}
                      <Link href="/create">
                        <Button>Create Entry</Button>
                      </Link>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            /* Landing page for non-logged-in users - Show real entries from database */
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-foreground">Explore Travel Stories</h2>
                  <p className="text-muted-foreground mt-2">Discover inspiring journeys from travelers around the world</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/auth">
                    <Button size="lg" className="hidden md:flex">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Show real entries from database for non-logged-in users */}
                  {communityEntries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredEntries.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 40 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                          className={index === 0 ? "md:col-span-2 lg:col-span-2 row-span-2" : ""}
                        >
                          <Link href={`/entry/${entry.id}`}>
                            <a className="block h-full group perspective-1000">
                              <Card className={`h-full overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-card group-hover:-translate-y-2 group-hover:bg-white dark:group-hover:bg-zinc-900 ${index === 0 ? "flex flex-col md:flex-row" : "flex flex-col"}`}>
                                <div className={`relative overflow-hidden ${index === 0 ? "md:w-2/3 h-64 md:h-auto" : "h-72"}`}>
                                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10 duration-500" />
                                  <img
                                    src={entry.images[0]}
                                    alt={entry.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                  />
                                  <Badge className="absolute top-4 right-4 z-20 bg-white/90 text-foreground hover:bg-white backdrop-blur-md shadow-sm font-medium px-3 py-1">
                                    <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
                                    {new Date(entry.date).toLocaleDateString()}
                                  </Badge>
                                </div>
                                
                                <div className={`relative flex flex-col ${index === 0 ? "md:w-1/3 p-8 justify-center" : "p-6"}`}>
                                  <CardHeader className="p-0 mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center text-primary text-sm font-bold tracking-wider uppercase">
                                        <MapPin className="w-3.5 h-3.5 mr-1.5" />
                                        {entry.location}
                                      </div>
                                      <span className="text-xs text-muted-foreground italic">by janedoe</span>
                                    </div>
                                    <h3 className={`font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-tight ${index === 0 ? "text-4xl" : "text-2xl"}`}>
                                      {entry.title}
                                    </h3>
                                  </CardHeader>
                                  <CardContent className="p-0 mb-6 flex-grow">
                                    <p className="text-muted-foreground line-clamp-3 leading-relaxed text-base font-light">
                                      {entry.description}
                                    </p>
                                  </CardContent>
                                  <CardFooter className="p-0 mt-auto">
                                    <div className="flex items-center text-sm font-bold text-primary group-hover:translate-x-2 transition-transform duration-300">
                                      Read Story <ArrowRight className="w-4 h-4 ml-2" />
                                    </div>
                                  </CardFooter>
                                </div>
                              </Card>
                            </a>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-24 bg-muted/20 rounded-3xl border border-dashed border-muted-foreground/10"
                    >
                      <div className="w-64 h-64 mb-6 opacity-80 mix-blend-multiply dark:mix-blend-normal">
                        <img src={emptyStateImg} alt="No entries" className="w-full h-full object-contain" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                        No Stories Yet
                      </h3>
                      <p className="text-muted-foreground max-w-md text-center mb-6">
                        Be the first to share your travel adventures with the world!
                      </p>
                      <Link href="/auth">
                        <Button size="lg">Create Account</Button>
                      </Link>
                    </motion.div>
                  )}
                </>
              )}

              {/* Call to action after sample entries */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center justify-center py-16 mt-12 space-y-6 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-3xl"
              >
                <div className="text-center space-y-4 max-w-2xl px-4">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                    Ready to Start Your Journey?
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Join our community and start documenting your own adventures today.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Link href="/auth">
                    <Button size="lg" className="h-14 px-8 text-lg">
                      Create Account
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Community/Newsletter Section */}
        <section className="container mx-auto px-4">
           <div className="bg-secondary/30 rounded-3xl overflow-hidden p-8 md:p-12 relative flex flex-col md:flex-row items-center gap-12">
               <div className="flex-1 space-y-6 relative z-10">
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 backdrop-blur-sm text-sm font-medium text-foreground">
                       <Sparkles className="w-4 h-4 text-accent" /> Join our Community
                   </div>
                   <h2 className="font-serif text-4xl md:text-5xl font-bold">Share Your Stories With The World</h2>
                   <p className="text-lg text-muted-foreground leading-relaxed">
                       Connect with thousands of fellow travelers, share your hidden gems, and get inspired for your next adventure.
                   </p>
                   <div className="flex gap-4 pt-4">
                       <Input placeholder="Enter your email" className="h-12 bg-background border-none max-w-xs" />
                       <Button size="lg" className="h-12 px-8">Subscribe</Button>
                   </div>
               </div>
               
               <div className="flex-1 relative h-64 md:h-96 w-full flex items-center justify-center">
                   <img 
                      src={communityImg} 
                      alt="Community" 
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal opacity-90" 
                   />
               </div>
           </div>
        </section>
      </div>
    </Layout>
  );
}
