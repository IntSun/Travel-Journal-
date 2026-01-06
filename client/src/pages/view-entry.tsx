import { Link, useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Trash2, Heart, Share2, MessageCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Entry } from "@shared/schema";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import stockHero from '@assets/stock_images/cinematic_travel_pho_429fe972.jpg';
import { Badge } from "@/components/ui/badge";

export default function ViewEntry() {
  const [, params] = useRoute("/entry/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(124);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [relatedEntries, setRelatedEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!user) {
      setLocation('/auth');
      return;
    }

    // Fetch the specific entry
    const fetchEntry = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/entries/${params?.id}`);
        if (!response.ok) {
          throw new Error('Entry not found');
        }
        const data = await response.json();
        setEntry(data);

        // Fetch related entries (other entries by the same user)
        const relatedResponse = await fetch(`/api/entries/user/${user.id}`);
        if (relatedResponse.ok) {
          const allEntries = await relatedResponse.json();
          const filtered = allEntries.filter((e: Entry) => e.id !== params?.id).slice(0, 2);
          setRelatedEntries(filtered);
        }
      } catch (error) {
        console.error('Error fetching entry:', error);
        toast({
          title: "Error",
          description: "Failed to load entry",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.id) {
      fetchEntry();
    }
  }, [params?.id, user, setLocation, toast]);

  const handleDelete = async () => {
    if (!entry || !user) return;
    
    try {
      const response = await fetch(`/api/entries/${entry.id}?userId=${user.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }
      
      toast({
        title: "Entry Deleted",
        description: "The journal entry has been removed.",
        variant: "destructive",
      });
      setTimeout(() => setLocation("/"), 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!entry) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <h2 className="text-2xl font-bold">Entry not found</h2>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const toggleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
      toast({
        title: "Added to favorites",
        description: "You liked this story!",
        duration: 2000,
      });
    }
    setIsLiked(!isLiked);
  };

  return (
    <Layout>
      <div className="pb-20">
        {/* Floating Engagement Bar (Desktop) */}
        <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 z-40"
        >
            <Button 
                variant="outline" 
                size="icon" 
                className={`h-12 w-12 rounded-full shadow-md border-border/50 backdrop-blur-sm transition-all hover:scale-110 ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-background/80'}`}
                onClick={toggleLike}
            >
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                </motion.div>
            </Button>
            <div className="text-center text-xs font-medium text-muted-foreground">{likeCount}</div>
            
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-background/80 shadow-md border-border/50 backdrop-blur-sm hover:scale-110 transition-transform">
                <MessageCircle className="h-5 w-5" />
            </Button>
            
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-background/80 shadow-md border-border/50 backdrop-blur-sm hover:scale-110 transition-transform">
                <Share2 className="h-5 w-5" />
            </Button>
        </motion.div>

        {/* Immersive Header */}
        <div className="relative h-[70vh] w-full -mt-24 mb-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-background/90 z-10" />
            <motion.div 
               initial={{ scale: 1.1 }}
               animate={{ scale: 1 }}
               transition={{ duration: 10, ease: "linear" }}
               className="absolute inset-0"
            >
                <img src={entry.images[0] || stockHero} className="w-full h-full object-cover" alt="Hero" />
            </motion.div>
            
            <div className="absolute inset-0 z-20 container mx-auto px-4 flex flex-col justify-end pb-24">
                 <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center"
                 >
                    <div className="flex flex-wrap justify-center items-center gap-4 text-white/90 font-medium mb-8 text-sm md:text-base tracking-wider uppercase">
                        <span className="flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                            <MapPin className="w-4 h-4 mr-2" /> {entry.location}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
                        <span className="flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                            <Calendar className="w-4 h-4 mr-2" /> {new Date(entry.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </span>
                    </div>

                    <h1 className="font-serif text-6xl md:text-8xl font-bold text-white drop-shadow-xl leading-none mb-8 tracking-tight">
                        {entry.title}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-3 text-white/80">
                        <div className="h-10 w-10 rounded-full bg-white/20 border border-white/30 overflow-hidden">
                             <img src="https://github.com/shadcn.png" className="h-full w-full object-cover" alt="Author" />
                        </div>
                        <span className="font-medium">By Jane Doe</span>
                    </div>
                 </motion.div>
            </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="container mx-auto px-4 max-w-4xl relative z-20 -mt-12"
        >
            <div className="bg-background rounded-t-3xl p-8 md:p-12 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] border-t border-border/50">
                 <div className="prose prose-lg md:prose-xl prose-stone dark:prose-invert max-w-none font-serif-headings">
                     <p className="lead text-2xl md:text-3xl font-light leading-relaxed text-foreground/90 mb-12 first-letter:text-6xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:text-primary first-letter:leading-[0.8]">
                         {entry.description}
                     </p>
                     
                     <motion.blockquote 
                       whileInView={{ opacity: 1, x: 0 }}
                       initial={{ opacity: 0, x: -20 }}
                       viewport={{ once: true }}
                       transition={{ duration: 0.6 }}
                       className="border-l-4 border-primary/40 pl-6 italic text-2xl text-foreground/80 my-12 bg-muted/20 py-6 pr-4 rounded-r-xl"
                     >
                         "Travel is not just about seeing new places, it's about feeling the rhythm of the world in your heartbeat."
                     </motion.blockquote>
                     
                     <motion.p 
                       whileInView={{ opacity: 1, y: 0 }}
                       initial={{ opacity: 0, y: 20 }}
                       viewport={{ once: true }}
                       transition={{ duration: 0.6, delay: 0.1 }}
                       className="text-lg leading-loose text-muted-foreground font-light mb-8"
                     >
                         The journey began with a sense of anticipation that had been building for months. As we arrived, the local atmosphere immediately wrapped around us—a blend of unfamiliar scents, vibrant sounds, and the welcoming smiles of strangers who would soon become friends. Every corner turned revealed a new surprise, a hidden alleyway, or a breathtaking vista that demanded to be admired.
                     </motion.p>
                     <motion.p 
                       whileInView={{ opacity: 1, y: 0 }}
                       initial={{ opacity: 0, y: 20 }}
                       viewport={{ once: true }}
                       transition={{ duration: 0.6, delay: 0.2 }}
                       className="text-lg leading-loose text-muted-foreground font-light mb-12"
                     >
                         Evenings were spent reflecting on the day's discoveries, sharing stories over local delicacies that delighted our palates in ways we hadn't imagined. It wasn't just about seeing new places; it was about feeling them, letting the rhythm of the location seep into our bones. This trip wasn't just a vacation; it was a chapter in our lives we will revisit fondly for years to come.
                     </motion.p>
                 </div>

                 {/* Visual Gallery */}
                 <div className="my-16 space-y-8">
                    <div className="flex items-center justify-between">
                         <h3 className="font-serif text-3xl font-bold">Visual Memories</h3>
                         <span className="text-sm text-muted-foreground">{entry.images.length} Photos</span>
                    </div>
                    
                    <Carousel className="w-full">
                        <CarouselContent>
                        {entry.images.map((img, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-2/3 pl-4">
                                <motion.div 
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg group cursor-zoom-in"
                                >
                                <img 
                                    src={img} 
                                    alt={`${entry.title} - ${index + 1}`} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </motion.div>
                            </CarouselItem>
                        ))}
                        </CarouselContent>
                        <div className="flex justify-end gap-2 mt-4 pr-4">
                            <CarouselPrevious className="static translate-y-0 border-border" />
                            <CarouselNext className="static translate-y-0 border-border" />
                        </div>
                    </Carousel>
                 </div>

                 <div className="border-t border-border pt-8 flex items-center justify-between">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-full" onClick={toggleLike}>
                            <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} /> {likeCount} Likes
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full">
                            <Share2 className="mr-2 h-4 w-4" /> Share
                        </Button>
                    </div>
                    
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This will permanently remove "<strong>{entry.title}</strong>" from your journal.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Keep it</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Forever</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 </div>
            </div>
        </motion.div>

        {/* Related Entries */}
        <div className="container mx-auto px-4 max-w-5xl mt-16">
            <h3 className="font-serif text-2xl font-bold mb-6 pl-2 border-l-4 border-accent">More Adventures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedEntries.map((related, idx) => (
                    <motion.div
                        key={related.id}
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                    >
                        <Link href={`/entry/${related.id}`} className="group block bg-card hover:bg-muted/30 rounded-2xl p-4 transition-colors border border-border/50 hover:border-primary/20">
                            <div className="flex gap-4">
                                <div className="h-24 w-24 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={related.images[0]} alt={related.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h4 className="font-serif text-xl font-bold group-hover:text-primary transition-colors">{related.title}</h4>
                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                        <MapPin className="w-3 h-3 mr-1" /> {related.location}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
      </div>
    </Layout>
  );
}
