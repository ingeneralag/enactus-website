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

  useEffect(() => {
    // Load initial data
    loadData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToRegistrations(() => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      const newCount = await getRegistrationCount();
      setCount(newCount);
      
      const groupsData = await getGroups();
      setGroups(groupsData);
      
      const regsData = await getRegistrations();
      // عكس الترتيب في الصفحة الرئيسية: الأقدم أولاً
      setRegistrations([...regsData].reverse());
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const hasGroups = groups.length > 0;
  const displayedParticipants = registrations.slice(0, 23);
  const remainingCount = Math.max(0, registrations.length - 23);
  
  // For group members, show only first 3 members and indicate how many more
  const getDisplayedMembers = (members: any[]) => {
    return members.slice(0, 3);
  };
  
  const getRemainingMembersCount = (members: any[]) => {
    return Math.max(0, members.length - 3);
  };
  
  // Limit displayed participants in "All Participants" section
  const maxDisplayedParticipants = 20;
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 -z-10" />
        <div className="container mx-auto text-center animate-fade-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            اشترك واكسب فرص تدريب
            <br />
            ودعم لـ 300,000 جنيه
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            انضم لمسابقة V7 واحصل على فرصة تدريب في IN General
            <br />
            أو قدم على برنامج دعم المشاريع بـ 300,000 جنيه
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/project-support/register">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                قدم على دعم المشاريع
              </Button>
            </Link>
            <Link to="/join">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                شارك في مسابقة التدريب
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Floating shapes */}
        <div className="absolute top-20 right-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-secondary/20 rounded-full blur-xl animate-float" style={{ animationDelay: "1s" }} />
      </section>

      {/* V7 Competition Section */}
      <section id="v7-competition" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              اكسب فرصة Internship في IN General
            </h2>
            <p className="text-xl text-muted-foreground">مسابقة V7 للطلاب والخريجين</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Users, title: "التسجيل والتقسيم", desc: "سجل وانضم لمجموعة من 5 أفراد عشوائياً", color: "text-primary" },
              { icon: Trophy, title: "المشاركة", desc: "شارك مع مجموعتك في التحدي المطلوب", color: "text-secondary" },
              { icon: Lightbulb, title: "المطلوب", desc: "أرسل الحل عبر WhatsApp خلال 48 ساعة", color: "text-accent" },
              { icon: Star, title: "الجائزة", desc: "فرصة تدريب في IN General", color: "text-success" },
            ].map((step, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <step.icon className={`w-12 h-12 mb-4 ${step.color}`} />
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to="/join">
              <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                شارك في المسابقة
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Project Support Section */}
      <section id="project-support" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              برنامج دعم المشاريع
            </h2>
            <p className="text-3xl font-bold text-accent mb-4">300,000 جنيه</p>
            <p className="text-xl text-muted-foreground">دعم شامل لمشروعك من الفكرة للتنفيذ</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
            <Card className="p-8 hover:shadow-xl transition-shadow">
              <DollarSign className="w-12 h-12 text-secondary mb-4" />
              <h3 className="text-2xl font-bold mb-4">الدعم المالي</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>خدمات ميديا احترافية</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>تطوير برمجي متكامل</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>خطة نمو وتوسع</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>استشارات أسبوعية</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <GraduationCap className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4">برنامج الإرشاد</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>ساعتين أسبوعياً</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>جلسات فردية 1-to-1</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>خبراء ومتخصصين</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>متابعة مستمرة</span>
                </li>
              </ul>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
            <Card className="p-6 bg-success/5 border-success/20">
              <CheckCircle className="w-10 h-10 text-success mb-3" />
              <h3 className="text-xl font-bold mb-3">الفئات المؤهلة</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• الطلاب الجامعيين</li>
                <li>• خريجي الجامعات حديثاً</li>
                <li>• أصحاب المشاريع الناشئة</li>
                <li>• فرق العمل الطموحة</li>
              </ul>
            </Card>

            <Card className="p-6 bg-secondary/5 border-secondary/20">
              <Clipboard className="w-10 h-10 text-secondary mb-3" />
              <h3 className="text-xl font-bold mb-3">الشروط والالتزامات</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• وجود فكرة مشروع واضحة</li>
                <li>• الالتزام بخطة التنفيذ</li>
                <li>• الحضور المنتظم للجلسات</li>
                <li>• تقديم تقارير دورية</li>
              </ul>
            </Card>
          </div>

          <div className="text-center flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/project-support/register">
              <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                قدم كمجموعة
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/project-support/register">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2">
                قدم كفرد
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Registrations/Groups Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          {!hasGroups ? (
            <>
              {/* Before Groups Formed */}
              <div className="text-center mb-12 animate-fade-up">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  المسجلين حتى الآن
                </h2>
                <p className="text-xl text-muted-foreground mb-4">{count} مشارك</p>
                <div className="flex items-center justify-center gap-2 text-warning">
                  <Clock className="h-5 w-5 animate-pulse" />
                  <p className="text-lg">في انتظار التقسيم للمجموعات...</p>
                </div>
              </div>

              {registrations.length > 0 && (
                <>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    {displayedParticipants.map((reg, idx) => (
                      <Card key={reg.id} className="p-4 hover:shadow-lg transition-shadow animate-fade-up" style={{ animationDelay: `${idx * 0.02}s` }}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                            {reg.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{reg.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{reg.college || "غير محدد"}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 mt-2 inline-block rounded-full font-semibold ${
                          reg.interest === 'software' ? 'bg-blue-100 text-blue-700' :
                          reg.interest === 'marketing' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {
                            reg.interest === 'software' ? 'تطوير' :
                            reg.interest === 'marketing' ? 'تسويق' :
                            'أخرى'
                          }
                        </span>
                      </Card>
                    ))}
                  </div>
                  
                  {remainingCount > 0 && (
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">و {remainingCount} مشارك آخر</p>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {/* After Groups Formed */}
              <div className="text-center mb-12 animate-fade-up">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  المجموعات المكونة
                </h2>
                <p className="text-xl text-muted-foreground">{groups.length} مجموعة مشكلة</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {groups.slice(0, 5).map((group: any, idx: number) => (
                  <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-success/10 rounded-full">
                        <Users className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">{group.members.length} أعضاء</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {getDisplayedMembers(group.members).map((member: any, mIdx: number) => (
                        <div key={mIdx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getColorForIndex(mIdx)} flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}>
                            {getInitials(member.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {member.name}
                            </p>
                            {member.college && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                <span>{member.college}</span>
                              </p>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block font-semibold ${
                              member.interest === 'software' ? 'bg-blue-100 text-blue-700' :
                              member.interest === 'marketing' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {
                                member.interest === 'software' ? 'تطوير' :
                                member.interest === 'marketing' ? 'تسويق' :
                                'أخرى'
                              }
                            </span>
                          </div>
                        </div>
                      ))}
                      {getRemainingMembersCount(group.members) > 0 && (
                        <div className="text-center py-2">
                          <span className="text-sm text-muted-foreground font-medium">
                            +{getRemainingMembersCount(group.members)} عضو آخر
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {groups.length > 5 && (
                <div className="text-center mb-12">
                  <Link to="/all-groups">
                    <Button size="lg" variant="outline">
                      عرض جميع المجموعات ({groups.length})
                      <ArrowLeft className="mr-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              )}

              {/* All Participants */}
              <div className="mt-16">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-2">جميع المشاركين</h3>
                  <p className="text-muted-foreground">{count} مشارك</p>
                </div>
                
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allParticipantsToShow.map((reg, idx) => (
                    <Card key={reg.id} className="p-4 hover:shadow-lg transition-shadow animate-fade-up" style={{ animationDelay: `${idx * 0.01}s` }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                          {reg.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{reg.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{reg.college || "غير محدد"}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 mt-2 inline-block rounded-full font-semibold ${
                        reg.interest === 'software' ? 'bg-blue-100 text-blue-700' :
                        reg.interest === 'marketing' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {
                          reg.interest === 'software' ? 'تطوير' :
                          reg.interest === 'marketing' ? 'تسويق' :
                          'أخرى'
                        }
                      </span>
                      {reg.group && (
                        <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full mt-2 inline-block">
                          {groups.find((g: any) => g.id === reg.group)?.name}
                        </span>
                      )}
                    </Card>
                  ))}
                </div>
                
                {remainingParticipantsCount > 0 && (
                  <div className="text-center mt-6">
                    <Link to="/all-groups">
                      <Button variant="outline" className="text-muted-foreground">
                        +{remainingParticipantsCount} مشارك آخر
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Company Banner */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="w-full"
        >
          <div className="card relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 text-white p-8 md:p-12 mx-auto max-w-6xl rounded-2xl">
            {/* Animated Background Shapes */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.1, 0.2, 0.1],
                x: [0, 50, 0],
                y: [0, 30, 0]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute -top-20 -left-20 w-60 h-60 bg-white rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, -90, 0],
                opacity: [0.1, 0.2, 0.1],
                x: [0, -30, 0],
                y: [0, 50, 0]
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2
              }}
              className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-300 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 180, 0],
                opacity: [0.05, 0.15, 0.05]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 4
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-300 rounded-full blur-3xl"
            />

            <div className="relative z-10">
              {/* Sparkles Icon */}
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1],
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="inline-block mb-4"
              >
                <Sparkles size={48} className="text-yellow-300 drop-shadow-lg" />
              </motion.div>

              {/* Title with Wave Animation */}
              <motion.h3 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="text-3xl md:text-4xl font-black mb-2"
              >
                التحدي برعاية
              </motion.h3>
              
              <motion.h2 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.6, type: 'spring' }}
                className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent"
              >
                IN General
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="text-2xl md:text-3xl font-bold mb-6"
              >
                Digital Solution
              </motion.div>

              {/* Subtitle with Typewriter Effect */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.8 }}
                className="text-lg md:text-xl opacity-90 mb-6 font-semibold italic"
              >
                "Your Digital Journey, Our Expertise."
              </motion.p>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.6 }}
                className="text-base md:text-lg opacity-80 mb-8 max-w-2xl mx-auto leading-relaxed"
              >
                بالإبداع والتكنولوجيا، نجعل أفكارك واقعًا. انضم إلينا وشارك في تحويل مشروعك إلى تجربة رقمية استثنائية! 🚀
              </motion.p>

              {/* CTA Button with Glow Effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.2, duration: 0.5, type: 'spring' }}
              >
                <motion.a
                  href="https://linktr.ee/ingeneralag"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ 
                    scale: 1.08, 
                    y: -5,
                    boxShadow: '0 25px 50px -12px rgba(255, 255, 255, 0.5)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      '0 10px 30px rgba(255, 255, 255, 0.2)',
                      '0 15px 40px rgba(255, 255, 255, 0.4)',
                      '0 10px 30px rgba(255, 255, 255, 0.2)'
                    ]
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }
                  }}
                  className="inline-flex items-center gap-3 bg-white text-purple-700 px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all"
                >
                  <Globe size={24} />
                  <span>تواصل معنا عبر السوشيال ميديا</span>
                  <ExternalLink size={20} />
                </motion.a>
              </motion.div>

              {/* Decorative Line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 2.4, duration: 0.8 }}
                className="mt-8 h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-white to-transparent rounded-full"
              />

              {/* Made with Love */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.6, duration: 0.6 }}
                className="mt-6"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="flex items-center justify-center gap-2 text-sm opacity-80"
                >
                  <span>صُنع بكل</span>
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <Heart size={16} className="text-red-300 fill-red-300" />
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