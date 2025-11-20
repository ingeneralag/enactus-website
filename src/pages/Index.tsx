import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Trophy, Lightbulb, Star, DollarSign, GraduationCap, CheckCircle, Clipboard, ArrowLeft, Clock, User, ExternalLink, Sparkles, Globe, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getRegistrationCount, subscribeToRegistrations, getGroups, getRegistrations } from '../lib/api';

const Index = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    // Load initial data
    loadData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToRegistrations(() => {
      // Reload data when registration changes
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Also reload data periodically to ensure sync
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 30000); // Reload every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Countdown timer to today 10 PM
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const today = new Date(now);
      today.setHours(22, 0, 0, 0); // 10 PM = 22:00
      
      // If current time is past 10 PM today, set to tomorrow 10 PM
      if (now.getTime() >= today.getTime()) {
        today.setDate(today.getDate() + 1);
        today.setHours(22, 0, 0, 0);
      }

      const difference = today.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeRemaining(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Get all registrations
      const allRegs = await getRegistrations() || [];
      
      // Set count to ALL students (real + dummy) for display
      setCount(allRegs.length);
      
      // Filter out dummy students for public display (only for showing in list)
      // Only exclude if is_dummy is explicitly true
      // Include all others (false, null, undefined, missing field)
      const realRegs = allRegs.filter((r: any) => {
        // Only exclude if is_dummy is exactly true
        return r.is_dummy !== true;
      });
      
      // عكس الترتيب في الصفحة الرئيسية: الأقدم أولاً
      setRegistrations([...realRegs].reverse());
      
      // Get groups and filter out dummy groups (groups with "🤖 Test" prefix)
      const allGroupsData = await getGroups();
      const realGroupsData = (allGroupsData || [])
        .filter((g: any) => !g.name?.includes('🤖 Test'))
        .map((group: any) => {
          // Filter out dummy members from each group
          const realMembers = (group.members || []).filter((m: any) => m.is_dummy !== true);
          return {
            ...group,
            members: realMembers
          };
        })
        .filter((group: any) => group.members.length > 0); // Only show groups with real members
      
      setGroups(realGroupsData);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set count to 0 on error to avoid showing wrong data
      setCount(0);
      setRegistrations([]);
    }
  };

  const hasGroups = groups.length > 0;
  const displayedParticipants = registrations.slice(0, 19);
  const remainingCount = Math.max(0, registrations.length - 19);
  
  // For group members, show only first 3 members and indicate how many more
  const getDisplayedMembers = (members: any[]) => {
    return members.slice(0, 3);
  };
  
  const getRemainingMembersCount = (members: any[]) => {
    return Math.max(0, members.length - 3);
  };
  
  // Limit displayed participants in "All Participants" section
  const maxDisplayedParticipants = 8;
  const allParticipantsToShow = registrations.slice(0, maxDisplayedParticipants);
  const remainingParticipantsCount = Math.max(0, registrations.length - maxDisplayedParticipants);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorForIndex = (index: number) => {
    const colors = [
      'from-purple-500 to-blue-500',
      'from-blue-500 to-teal-500',
      'from-green-500 to-yellow-500',
      'from-yellow-500 to-orange-500',
      'from-orange-500 to-red-500',
      'from-red-500 to-pink-500',
      'from-pink-500 to-purple-500',
    ];
    return colors[index % colors.length];
  };

  // Animation variants for scroll animations
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth animation
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };

  // Viewport settings optimized for mobile
  const viewportSettings = {
    once: true,
    amount: 0.15, // Trigger when 15% of element is visible (better for mobile)
    margin: "0px 0px -50px 0px" // Trigger slightly before element enters viewport
  };

  // Optimized card variants for better mobile performance
  const cardVariantsMobile = {
    hidden: { 
      opacity: 0, 
      y: 20, // Reduced from 30 for smoother mobile animation
      scale: 0.98 // Reduced from 0.95 for less dramatic effect
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4, // Faster for mobile
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Enhanced Modern Design */}
      <section className="relative pt-16 pb-20 md:pt-20 md:pb-24 px-4 overflow-x-hidden overflow-y-visible min-h-[90vh] md:min-h-[95vh] flex items-center">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/25 to-accent/30 animate-gradient -z-10" />
        
        {/* Glass Morphism Overlay */}
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] -z-10" />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 -z-10" />
        
        {/* Floating Animated Shapes */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-10 right-4 md:top-20 md:right-10 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary to-secondary rounded-full blur-2xl animate-pulse-glow"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-10 left-4 md:bottom-20 md:left-10 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-accent to-secondary rounded-full blur-3xl animate-pulse-glow"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 left-1/4 w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-secondary to-primary rounded-full blur-xl"
        />
        
        <div className="container mx-auto text-center relative z-10 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">فرصة ذهبية للطلاب والخريجين</span>
            </motion.div>
          </motion.div>

          {/* Main Heading with Enhanced Gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.2] md:leading-[1.3]"
          >
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient py-1">
            اشترك واكسب فرص تدريب
            </span>
            <span className="block mt-3 md:mt-4 bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient py-1">
            ودعم لـ 300,000 جنيه
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto font-medium leading-relaxed px-2"
          >
            انضم لمسابقة V7 واحصل على فرصة تدريب في IN General
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-3xl mx-auto px-2"
          >
            أو قدم على برنامج دعم المشاريع بـ 300,000 جنيه
          </motion.p>

          {/* CTA Buttons with Enhanced Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 md:mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
            <Button 
              size="lg" 
                className="text-base sm:text-lg md:text-xl px-8 py-6 md:px-10 md:py-7 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_200%] animate-gradient text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 w-full sm:w-auto"
              onClick={() => {
                const element = document.getElementById('v7-competition');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
                <Trophy className="ml-2 h-5 w-5" />
              شارك في مسابقة التدريب
            </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
            <Button 
              size="lg" 
              variant="outline" 
                className="text-base sm:text-lg md:text-xl px-8 py-6 md:px-10 md:py-7 border-2 border-primary/50 bg-background/80 backdrop-blur-sm hover:bg-primary/10 hover:border-primary transition-all duration-300 font-bold w-full sm:w-auto shadow-md hover:shadow-lg"
              onClick={() => {
                const element = document.getElementById('project-support');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
                <DollarSign className="ml-2 h-5 w-5" />
              قدم على دعم المشاريع
            </Button>
            </motion.div>
          </motion.div>

          {/* Stats or Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-wrap justify-center items-center gap-6 md:gap-8 mt-6 md:mt-8"
          >
            <div className="flex items-center gap-2 text-sm md:text-base">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground font-medium">تسجيل مفتوح</span>
          </div>
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground font-medium">{count}+ طالب مسجل</span>
        </div>
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-muted-foreground font-medium">فرص حصرية</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* V7 Competition Section - Enhanced Modern Design */}
      <section id="v7-competition" className="py-16 md:py-24 px-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 animate-gradient -z-10" />
        <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px] -z-10" />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f620_1px,transparent_1px),linear-gradient(to_bottom,#3b82f620_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 dark:opacity-20 -z-10" />
        
        {/* Floating Decorative Elements */}
        <motion.div
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-20 left-10 w-48 h-48 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl opacity-20"
        />
        
        <div className="container mx-auto relative z-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-16"
          >
            {/* Icon Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-6 shadow-lg shadow-blue-500/30"
            >
              <Trophy className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </motion.div>
            
            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight"
            >
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
                اكسب فرصة Internship
              </span>
              <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
                في IN General
              </span>
            </motion.h2>
            
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-medium"
            >
              مسابقة V7 للطلاب والخريجين
            </motion.p>
          </motion.div>

          {/* Steps Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16"
          >
            {[
              { 
                icon: Users, 
                title: "التسجيل والتقسيم", 
                desc: "سجل وانضم لمجموعة من 5 أفراد عشوائياً", 
                color: "text-blue-600 dark:text-blue-400", 
                bg: "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30",
                border: "border-blue-200 dark:border-blue-800",
                iconBg: "bg-blue-100 dark:bg-blue-900/50",
                number: "01"
              },
              { 
                icon: Trophy, 
                title: "المشاركة", 
                desc: "شارك مع مجموعتك في التحدي المطلوب", 
                color: "text-indigo-600 dark:text-indigo-400", 
                bg: "from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/30",
                border: "border-indigo-200 dark:border-indigo-800",
                iconBg: "bg-indigo-100 dark:bg-indigo-900/50",
                number: "02"
              },
              { 
                icon: Lightbulb, 
                title: "المطلوب", 
                desc: "أرسل الحل عبر WhatsApp خلال 48 ساعة", 
                color: "text-purple-600 dark:text-purple-400", 
                bg: "from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30",
                border: "border-purple-200 dark:border-purple-800",
                iconBg: "bg-purple-100 dark:bg-purple-900/50",
                number: "03"
              },
              { 
                icon: Star, 
                title: "الجائزة", 
                desc: "فرصة تدريب في IN General", 
                color: "text-amber-600 dark:text-amber-400", 
                bg: "from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30",
                border: "border-amber-200 dark:border-amber-800",
                iconBg: "bg-amber-100 dark:bg-amber-900/50",
                number: "04"
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative"
              >
                <Card className={`p-6 md:p-8 bg-gradient-to-br ${step.bg} border-2 ${step.border} hover:shadow-2xl transition-all duration-300 backdrop-blur-sm relative overflow-hidden group`}>
                  {/* Number Badge */}
                  <div className="absolute top-4 left-4 text-6xl font-black text-black/5 dark:text-white/5">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl ${step.iconBg} mb-4 relative z-10`}
                  >
                    <step.icon className={`w-7 h-7 md:w-8 md:h-8 ${step.color}`} />
                  </motion.div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{step.desc}</p>
                  </div>
                  
                  {/* Hover Effect Line */}
                  <div className={`absolute bottom-0 right-0 left-0 h-1 bg-gradient-to-r ${step.bg} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
              </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
            <Link to="/join">
                <Button 
                  size="lg" 
                  className="text-base sm:text-lg md:text-xl px-8 py-6 md:px-12 md:py-7 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-[length:200%_200%] animate-gradient hover:opacity-90 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                >
                  <Trophy className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                شارك في المسابقة
                  <ArrowLeft className="mr-2 h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Project Support Section - Enhanced Modern Design */}
      <section id="project-support" className="py-16 md:py-24 px-4 relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-red-950/40">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 animate-gradient -z-10" />
        <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px] -z-10" />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b20_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b20_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 dark:opacity-20 -z-10" />
        
        {/* Floating Decorative Elements */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-10 w-44 h-44 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            opacity: [0.15, 0.35, 0.15],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
          className="absolute bottom-20 left-10 w-52 h-52 bg-gradient-to-br from-orange-400 to-red-400 rounded-full blur-3xl opacity-20"
        />
        
        <div className="container mx-auto relative z-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-16"
          >
            {/* Icon Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-6 shadow-lg shadow-amber-500/30"
            >
              <DollarSign className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </motion.div>
            
            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight"
            >
              <span className="block bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
              برنامج دعم المشاريع
              </span>
            </motion.h2>
            
            {/* Amount Highlight */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 border-2 border-amber-300 dark:border-amber-700 mb-4"
            >
              <DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <span className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                300,000 جنيه
              </span>
            </motion.div>
            
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-medium"
            >
              دعم شامل لمشروعك من الفكرة للتنفيذ
            </motion.p>
          </motion.div>

          {/* Main Features Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16 max-w-5xl mx-auto"
          >
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="p-6 md:p-8 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/50 dark:to-orange-950/50 border-2 border-amber-200 dark:border-amber-800 backdrop-blur-sm relative overflow-hidden group">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-transparent rounded-full blur-2xl" />
                
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl bg-amber-100 dark:bg-amber-900/50 mb-6 relative z-10"
                >
                  <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-amber-600 dark:text-amber-400" />
                </motion.div>
                
                <h3 className="text-2xl md:text-3xl font-black mb-6 text-foreground relative z-10">الدعم المالي</h3>
                <ul className="space-y-4 text-muted-foreground relative z-10">
                  {[
                    "خدمات ميديا احترافية",
                    "تطوير برمجي متكامل",
                    "خطة نمو وتوسع",
                    "استشارات أسبوعية"
                  ].map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="flex items-start gap-3 group/item"
                    >
                      <CheckCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                      <span className="text-base md:text-lg font-medium">{item}</span>
                    </motion.li>
                  ))}
              </ul>
                
                {/* Hover Effect Line */}
                <div className="absolute bottom-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="p-6 md:p-8 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-orange-50/80 to-red-50/80 dark:from-orange-950/50 dark:to-red-950/50 border-2 border-orange-200 dark:border-orange-800 backdrop-blur-sm relative overflow-hidden group">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-200/20 to-transparent rounded-full blur-2xl" />
                
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-xl bg-orange-100 dark:bg-orange-900/50 mb-6 relative z-10"
                >
                  <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-orange-600 dark:text-orange-400" />
                </motion.div>
                
                <h3 className="text-2xl md:text-3xl font-black mb-6 text-foreground relative z-10">برنامج الإرشاد</h3>
                <ul className="space-y-4 text-muted-foreground relative z-10">
                  {[
                    "ساعتين أسبوعياً",
                    "جلسات فردية 1-to-1",
                    "خبراء ومتخصصين",
                    "مواكبة مستمرة"
                  ].map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="flex items-start gap-3 group/item"
                    >
                      <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                      <span className="text-base md:text-lg font-medium">{item}</span>
                    </motion.li>
                  ))}
              </ul>
                
                {/* Hover Effect Line */}
                <div className="absolute bottom-0 right-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Card>
            </motion.div>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            className="grid md:grid-cols-2 gap-4 md:gap-6 mb-12 md:mb-16 max-w-4xl mx-auto"
          >
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="p-6 md:p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-2 border-green-200 dark:border-green-800 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-200/20 rounded-full blur-2xl" />
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-green-100 dark:bg-green-900/50 mb-4 relative z-10"
                >
                  <CheckCircle className="w-6 h-6 md:w-7 md:h-7 text-green-600 dark:text-green-400" />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-black mb-4 text-foreground relative z-10">الفئات المؤهلة</h3>
                <ul className="text-muted-foreground space-y-2.5 relative z-10">
                  {[
                    "الطلاب الجامعيين",
                    "خريجي الجامعات حديثاً",
                    "أصحاب المشاريع الناشئة",
                    "فرق العمل الطموحة"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm md:text-base">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
              </ul>
            </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="p-6 md:p-8 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 border-2 border-orange-200 dark:border-orange-800 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-24 h-24 bg-orange-200/20 rounded-full blur-2xl" />
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-orange-100 dark:bg-orange-900/50 mb-4 relative z-10"
                >
                  <Clipboard className="w-6 h-6 md:w-7 md:h-7 text-orange-600 dark:text-orange-400" />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-black mb-4 text-foreground relative z-10">الشروط والالتزامات</h3>
                <ul className="text-muted-foreground space-y-2.5 relative z-10">
                  {[
                    "وجود فكرة مشروع واضحة",
                    "الالتزام بخطة التنفيذ",
                    "الحضور المنتظم للجلسات",
                    "تقديم تقارير دورية"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm md:text-base">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
              </ul>
            </Card>
            </motion.div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
            <Link to="/project-support/register">
                <Button 
                  size="lg" 
                  className="text-base sm:text-lg md:text-xl px-8 py-6 md:px-12 md:py-7 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-[length:200%_200%] animate-gradient hover:opacity-90 text-white font-bold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 w-full sm:w-auto"
                >
                  <Lightbulb className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                  قدم وأنشئ مشروعك
                  <ArrowLeft className="mr-2 h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Registrations/Groups Section - Enhanced Modern Design */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 dark:from-slate-950/50 dark:via-gray-950/50 dark:to-slate-950/50">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 animate-gradient -z-10" />
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] -z-10" />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 dark:opacity-20 -z-10" />
        
        <div className="container mx-auto relative z-10">
          {!hasGroups ? (
            <>
              {/* Before Groups Formed */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12 md:mb-16"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                  className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6 shadow-lg shadow-primary/30"
                >
                  <Users className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </motion.div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
                  <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
                  المسجلين حتى الآن
                  </span>
                </h2>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border-2 border-primary/20 mb-4"
                >
                  <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {count}
                  </span>
                  <span className="text-lg md:text-xl text-muted-foreground font-bold">طالب</span>
                </motion.div>
                
                {/* Countdown Timer - Only show when no groups exist */}
                {groups.length === 0 && timeRemaining && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="flex flex-col items-center gap-4 mt-6"
                  >
                    <div className="flex items-center justify-center gap-2 text-warning mb-2">
                      <Clock className="h-5 w-5 md:h-6 md:w-6 animate-pulse" />
                      <p className="text-base md:text-lg font-medium">سيتم تقسيم المجموعات بعد هذا العداد</p>
                </div>
                    
                    <div className="flex items-center gap-3 md:gap-4">
                      {timeRemaining.days > 0 && (
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="flex flex-col items-center px-4 py-3 rounded-xl bg-primary/10 border-2 border-primary/30 min-w-[70px]"
                        >
                          <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {timeRemaining.days}
                          </span>
                          <span className="text-xs md:text-sm text-muted-foreground font-bold">يوم</span>
                        </motion.div>
                      )}
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="flex flex-col items-center px-4 py-3 rounded-xl bg-primary/10 border-2 border-primary/30 min-w-[70px]"
                      >
                        <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {String(timeRemaining.hours).padStart(2, '0')}
                        </span>
                        <span className="text-xs md:text-sm text-muted-foreground font-bold">ساعة</span>
                      </motion.div>
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="flex flex-col items-center px-4 py-3 rounded-xl bg-primary/10 border-2 border-primary/30 min-w-[70px]"
                      >
                        <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {String(timeRemaining.minutes).padStart(2, '0')}
                        </span>
                        <span className="text-xs md:text-sm text-muted-foreground font-bold">دقيقة</span>
                      </motion.div>
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                        className="flex flex-col items-center px-4 py-3 rounded-xl bg-primary/10 border-2 border-primary/30 min-w-[70px]"
                      >
                        <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {String(timeRemaining.seconds).padStart(2, '0')}
                        </span>
                        <span className="text-xs md:text-sm text-muted-foreground font-bold">ثانية</span>
                      </motion.div>
              </div>
                  </motion.div>
                )}
                
                {/* Show waiting message if no countdown (past deadline) and no groups */}
                {groups.length === 0 && !timeRemaining && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="flex items-center justify-center gap-2 text-warning"
                  >
                    <Clock className="h-5 w-5 md:h-6 md:w-6 animate-pulse" />
                    <p className="text-base md:text-lg font-medium">في انتظار التقسيم للمجموعات...</p>
                  </motion.div>
                )}
              </motion.div>

              {registrations.length > 0 && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportSettings}
                  className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                >
                    {displayedParticipants.map((reg, idx) => (
                    <motion.div
                      key={reg.id}
                      variants={cardVariants}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <Card className="p-4 md:p-5 hover:shadow-xl transition-all duration-300 bg-background/80 backdrop-blur-sm border-2 border-border/50 hover:border-primary/50 group relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                        
                        <div className="flex items-center gap-3 mb-3 relative z-10">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg"
                          >
                            {reg.name.charAt(0)}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground truncate text-sm md:text-base">{reg.name}</p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{reg.college || "غير محدد"}</p>
                          </div>
                        </div>
                        <span className={`text-xs md:text-sm px-3 py-1.5 mt-2 inline-block rounded-full font-bold relative z-10 ${
                          reg.interest === 'software' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                          reg.interest === 'marketing' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {
                            reg.interest === 'software' ? 'تطوير' :
                            reg.interest === 'marketing' ? 'تسويق' :
                            'أخرى'
                          }
                        </span>
                      </Card>
                    </motion.div>
                    ))}
                  
                  {/* Remaining Count Card */}
                    {remainingCount > 0 && (
                    <motion.div
                      variants={cardVariants}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Card className="p-4 md:p-5 hover:shadow-xl transition-all duration-300 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 hover:border-primary/50 backdrop-blur-sm">
                        <div className="text-center">
                          <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">+{remainingCount}</p>
                          <p className="text-sm md:text-base text-muted-foreground mt-1 font-bold">طالب</p>
                        </div>
                      </Card>
                    </motion.div>
                    )}
                  </motion.div>
              )}
            </>
          ) : (
            <>
              {/* After Groups Formed */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12 md:mb-16"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                  className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-success to-emerald-600 mb-6 shadow-lg shadow-success/30"
                >
                  <Users className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </motion.div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
                  <span className="block bg-gradient-to-r from-success via-emerald-600 to-teal-600 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
                  المجموعات المكونة
                  </span>
                </h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-medium"
                >
                  {groups.length} مجموعة مشكلة
                </motion.p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12"
              >
                {groups.slice(0, 5).map((group: any, idx: number) => (
                  <motion.div
                    key={group.id}
                    variants={cardVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <Card className="p-6 md:p-8 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-success/10 to-emerald-50 dark:from-success/20 dark:to-emerald-950/50 border-2 border-success/30 dark:border-success/50 backdrop-blur-sm relative overflow-hidden group">
                      {/* Decorative Background */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-3xl" />
                      
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="p-3 bg-success/20 dark:bg-success/30 rounded-xl"
                        >
                          <Users className="h-6 w-6 md:h-7 md:w-7 text-success" />
                        </motion.div>
                      <div>
                          <h3 className="text-xl md:text-2xl font-black text-foreground">{group.name}</h3>
                          <p className="text-sm md:text-base text-muted-foreground font-medium">{group.members.length} أعضاء</p>
                      </div>
                    </div>
                      
                      <div className="space-y-3 relative z-10">
                      {getDisplayedMembers(group.members).map((member: any, mIdx: number) => (
                          <motion.div
                            key={mIdx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 + mIdx * 0.05 }}
                            whileHover={{ x: 5 }}
                            className="flex items-start gap-3 p-3 bg-background/60 dark:bg-background/40 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                          >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getColorForIndex(mIdx)} flex items-center justify-center text-white font-black text-sm md:text-base shadow-md flex-shrink-0`}>
                            {getInitials(member.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="font-bold text-foreground truncate text-sm md:text-base">
                              {member.name}
                            </p>
                            {member.college && (
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {member.college}
                              </p>
                            )}
                              <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block font-bold ${
                                member.interest === 'software' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                member.interest === 'marketing' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {
                                member.interest === 'software' ? 'تطوير' :
                                member.interest === 'marketing' ? 'تسويق' :
                                'أخرى'
                              }
                            </span>
                          </div>
                          </motion.div>
                      ))}
                      {getRemainingMembersCount(group.members) > 0 && (
                          <div className="text-center py-3 bg-muted/30 rounded-xl">
                            <span className="text-sm md:text-base text-muted-foreground font-bold">
                            +{getRemainingMembersCount(group.members)} عضو آخر
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                  </motion.div>
                ))}
              </motion.div>

              {groups.length > 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-center mb-12"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                  <Link to="/all-groups">
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="text-base md:text-lg px-8 py-6 md:px-10 md:py-7 border-2 border-success/50 text-success hover:bg-success/10 font-bold shadow-md hover:shadow-lg transition-all duration-300"
                      >
                      عرض جميع المجموعات ({groups.length})
                      <ArrowLeft className="mr-2 h-5 w-5" />
                    </Button>
                  </Link>
                  </motion.div>
                </motion.div>
              )}

              {/* All Participants - Enhanced Design */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-16 md:mt-20"
              >
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-center mb-10 md:mb-12"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
                    className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg shadow-primary/30"
                  >
                    <Users className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </motion.div>
                  
                  <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
                    <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
                      جميع الطلاب
                    </span>
                  </h3>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border-2 border-primary/20"
                  >
                    <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {count}
                    </span>
                    <span className="text-base md:text-lg text-muted-foreground font-bold">طالب</span>
                  </motion.div>
                </motion.div>
                
                {/* Cards Grid */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportSettings}
                  className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto"
                >
                  {allParticipantsToShow.map((reg, idx) => (
                    <motion.div
                      key={reg.id}
                      variants={cardVariants}
                      whileHover={{ y: -8, scale: 1.03 }}
                      className="relative"
                    >
                      <Card className="p-5 md:p-6 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm border-2 border-border/50 hover:border-primary/50 group relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/15 transition-colors" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/15 transition-colors" />
                        
                        {/* Avatar */}
                        <div className="flex items-center gap-4 mb-4 relative z-10">
                          <motion.div
                            whileHover={{ scale: 1.15, rotate: 10 }}
                            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg shadow-primary/30 flex-shrink-0"
                          >
                          {reg.name.charAt(0)}
                          </motion.div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-foreground truncate text-base md:text-lg mb-1">{reg.name}</p>
                            <p className="text-xs md:text-sm text-muted-foreground truncate font-medium">{reg.college || "غير محدد"}</p>
                        </div>
                      </div>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 relative z-10">
                          <span className={`text-xs md:text-sm px-3 py-1.5 rounded-full font-bold shadow-sm ${
                            reg.interest === 'software' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                            reg.interest === 'marketing' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                      }`}>
                        {
                          reg.interest === 'software' ? 'تطوير' :
                          reg.interest === 'marketing' ? 'تسويق' :
                          'أخرى'
                        }
                      </span>
                      {reg.group && (
                            <span className="text-xs md:text-sm px-3 py-1.5 bg-success/20 text-success rounded-full font-bold border border-success/40 shadow-sm">
                          {groups.find((g: any) => g.id === reg.group)?.name}
                        </span>
                      )}
                        </div>
                        
                        {/* Hover Effect Line */}
                        <div className="absolute bottom-0 right-0 left-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    </Card>
                    </motion.div>
                  ))}
                  
                  {/* Remaining Count Card - Enhanced */}
                  {remainingParticipantsCount > 0 && (
                    <motion.div
                      variants={cardVariants}
                      whileHover={{ scale: 1.08, y: -5 }}
                      className="relative"
                    >
                      <Card className="p-5 md:p-6 hover:shadow-2xl transition-all duration-300 flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 border-2 border-primary/40 hover:border-primary/60 backdrop-blur-sm relative overflow-hidden group">
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 animate-gradient opacity-50" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-colors" />
                        
                        <div className="text-center relative z-10">
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          >
                            <p className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient mb-2">
                              +{remainingParticipantsCount}
                            </p>
                          </motion.div>
                          <p className="text-base md:text-lg text-muted-foreground font-bold">طالب</p>
                          <p className="text-xs md:text-sm text-muted-foreground/70 mt-1">إضافي</p>
                      </div>
                    </Card>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Company Banner - Enhanced Modern Design */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 dark:from-purple-950/30 dark:via-blue-950/30 dark:to-teal-950/30 -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 text-white p-8 md:p-12 lg:p-16 mx-auto max-w-6xl rounded-3xl md:rounded-[2rem] shadow-2xl shadow-purple-500/30">
            {/* Enhanced Animated Background Shapes */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 90, 0],
                opacity: [0.15, 0.3, 0.15],
                x: [0, 60, 0],
                y: [0, 40, 0]
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute -top-24 -left-24 w-72 h-72 md:w-96 md:h-96 bg-white rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                rotate: [0, -90, 0],
                opacity: [0.12, 0.28, 0.12],
                x: [0, -40, 0],
                y: [0, 60, 0]
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2
              }}
              className="absolute -bottom-24 -right-24 w-80 h-80 md:w-[28rem] md:h-[28rem] bg-purple-300 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 0],
                opacity: [0.08, 0.2, 0.08]
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 4
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-teal-300 rounded-full blur-3xl"
            />
            
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />

            <div className="relative z-10 text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-semibold">الراعي الرسمي</span>
              </motion.div>

              {/* Sparkles Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.15, 1],
                  y: [0, -8, 0]
                }}
                transition={{
                  rotate: {
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  },
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  },
                  y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                  }
                }}
                className="inline-block mb-6"
              >
                <Sparkles size={56} className="md:w-16 md:h-16 text-yellow-300 drop-shadow-2xl" />
              </motion.div>

              {/* Title */}
              <motion.h3 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight"
              >
                التحدي برعاية
              </motion.h3>
              
              {/* Company Name with Enhanced Gradient */}
              <motion.h2 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-3 leading-tight"
              >
                <span className="block bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient drop-shadow-2xl">
                IN General
                </span>
              </motion.h2>
              
              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8 tracking-wide"
              >
                <span className="bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-200 bg-clip-text text-transparent">
                Digital Solution
                </span>
              </motion.div>

              {/* Quote */}
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-95 mb-6 font-semibold italic max-w-3xl mx-auto"
              >
                "Your Digital Journey, Our Expertise."
              </motion.p>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed px-4"
              >
                بإبداع والتكنولوجيا، نجعل أفكارك واقعًا. انضم إلينا وشارك في تحويل مشروعك إلى تجربة رقمية استثنائية! 🚀
              </motion.p>

              {/* CTA Button with Enhanced Glow Effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9, duration: 0.6, type: 'spring' }}
              >
                <motion.a
                  href="https://in-general.net/links"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ 
                    scale: 1.08, 
                    y: -5,
                    boxShadow: '0 30px 60px -12px rgba(255, 255, 255, 0.6)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      '0 10px 40px rgba(255, 255, 255, 0.3)',
                      '0 20px 60px rgba(255, 255, 255, 0.5)',
                      '0 10px 40px rgba(255, 255, 255, 0.3)'
                    ]
                  }}
                  transition={{
                    boxShadow: {
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }
                  }}
                  className="inline-flex items-center gap-3 bg-white text-purple-700 px-8 py-4 md:px-12 md:py-6 rounded-full font-bold text-base md:text-lg lg:text-xl shadow-2xl hover:shadow-purple-500/50 transition-all backdrop-blur-sm"
                >
                  <Globe size={20} className="md:w-6 md:h-6" />
                  <span>تواصل معنا عبر السوشيال ميديا</span>
                  <ExternalLink size={18} className="md:w-5 md:h-5" />
                </motion.a>
              </motion.div>

              {/* Decorative Line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-10 h-1 w-40 md:w-48 mx-auto bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full"
              />

              {/* Made with Love */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="mt-8"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="flex items-center justify-center gap-2 text-sm md:text-base opacity-90"
                >
                  <span>صُنع بكل</span>
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <Heart size={18} className="md:w-5 md:h-5 text-red-300 fill-red-300" />
                  </motion.div>
                  <span>من فريق IN General</span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      {/* <footer className="py-8 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            جميع الحقوق محفوظة © 2025 IN General
          </p>
        </div>
      </footer> */}
    </div>
  );
};

export default Index;