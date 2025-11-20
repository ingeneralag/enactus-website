import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Users, UserPlus, X, Link, Video, TrendingUp, HelpCircle, Lightbulb, AlertTriangle, Database, FileText as FileIcon, ArrowRight, User, DollarSign } from 'lucide-react';
import { registerProjectApplication } from '../lib/projectSupportApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TeamMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
}

export default function ProjectSupportForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [applicationType, setApplicationType] = useState<'individual' | 'group'>('individual');
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: "1", name: "", phone: "", email: "", role: "" },
  ]);
  
  const [formData, setFormData] = useState({
    // Team Info
    teamName: '',
    
    // Project Info
    projectName: '',
    projectDescription: '',
    problemStatement: '',
    
    // Traction
    tractionMVP: false,
    tractionPilot: false,
    tractionSales: false,
    tractionLinks: '',
    tractionDetails: {
      mvp: '',
      pilot: '',
      sales: '',
      other: ''
    },
    
    // Media
    videoPitch: '',
    demoLink: '',
    
    // Support Needs
    supportNeeds: '',
    expectedGrowth: ''
  });

  // Reset team members when switching to individual
  useEffect(() => {
    if (applicationType === 'individual') {
      setTeamMembers([{ id: "1", name: "", phone: "", email: "", role: "" }]);
    } else if (applicationType === 'group' && teamMembers.length === 0) {
      setTeamMembers([{ id: "1", name: "", phone: "", email: "", role: "" }]);
    }
  }, [applicationType]);

  const addTeamMember = () => {
    if (teamMembers.length < 5) {
      setTeamMembers([
        ...teamMembers,
        { id: Date.now().toString(), name: "", phone: "", email: "", role: "" },
      ]);
    }
  };

  const removeTeamMember = (id: string) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((m) => m.id !== id));
    }
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string) => {
    setTeamMembers(
      teamMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleInputChange = (field: string, value: any) => {
    // Handle nested tractionDetails object
    if (field === 'tractionDetails' && typeof value === 'object') {
      setFormData({
        ...formData,
        tractionDetails: {
          ...formData.tractionDetails,
          ...value
        }
      });
    } else if (field.startsWith('tractionDetails.')) {
      // For individual traction detail fields (mvp, pilot, sales, other)
      const key = field.split('.')[1];
      setFormData({
        ...formData,
        tractionDetails: {
          ...formData.tractionDetails,
          [key]: value
        }
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if terms are accepted
    if (!acceptedTerms) {
      toast({
        title: "خطأ",
        description: "يجب الموافقة على الشروط والأحكام",
        variant: "destructive",
      });
      return;
    }

    // Validation based on application type
    if (applicationType === 'group') {
      if (!formData.teamName || formData.teamName.trim() === '') {
        toast({
          title: "خطأ",
          description: "يجب إدخال اسم الفريق",
          variant: "destructive",
        });
        return;
      }
      // Validate team members
      const hasEmptyMembers = teamMembers.some(m => !m.name || !m.phone);
      if (hasEmptyMembers) {
        toast({
          title: "خطأ",
          description: "يجب ملء جميع بيانات الأعضاء المطلوبة",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!formData.teamName || formData.teamName.trim() === '') {
        toast({
          title: "خطأ",
          description: "يجب إدخال الاسم الكامل",
          variant: "destructive",
        });
        return;
      }
    }
    
    setLoading(true);

    try {
      // Prepare data for API
      const applicationData = {
        team_name: formData.teamName,
        project_name: formData.projectName,
        project_description: formData.projectDescription,
        problem_statement: formData.problemStatement,
        traction_mvp: formData.tractionMVP,
        traction_pilot: formData.tractionPilot,
        traction_sales: formData.tractionSales,
        traction_links: formData.tractionLinks,
        traction_details: JSON.stringify(formData.tractionDetails), // Convert object to JSON string
        video_pitch: formData.videoPitch,
        demo_link: formData.demoLink,
        support_needs: formData.supportNeeds,
        expected_growth: formData.expectedGrowth,
        // Note: application_type column doesn't exist in DB yet, so we determine it by teamMembers
        teamMembers: applicationType === 'group' ? teamMembers : [] // Only send team members for groups
      };

      await registerProjectApplication(applicationData);
      
      setSubmitted(true);
      toast({
        title: "تم تقديم الطلب بنجاح! 🎉",
        description: "سيتم مراجعة طلبك والرد عليك قريباً",
      });
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      // Check if it's a database table error
      if (error.message.includes('جدول قاعدة البيانات غير موجود')) {
        setDbError(true);
        toast({
          title: "جدول قاعدة البيانات غير موجود!",
          description: "يرجى إنشاء الجداول المطلوبة أولاً",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ",
          description: error.message || 'حدث خطأ في تقديم الطلب',
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="card max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-4"
          >
            <CheckCircle size={64} className="text-green-500" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            تم تقديم الطلب!
          </h2>
          <p className="text-gray-600 mb-6">
            شكراً لتقديم مشروعكم. سيتم مراجعة الطلب والتواصل معكم قريباً.
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <a href="/" className="btn-primary">
              العودة للرئيسية
            </a>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card max-w-2xl w-full text-center"
        >
          <div className="text-red-500 mb-4">
            <Database size={48} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            جدول قاعدة البيانات غير موجود!
          </h2>
          <p className="text-gray-600 mb-6">
            يرجى إنشاء الجداول المطلوبة أولاً قبل تقديم الطلبات.
          </p>
          <Button onClick={() => navigate('/')}>
            العودة للرئيسية
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-red-500/5 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 -z-10" />
      
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="relative overflow-hidden border-2 border-border/50 bg-background/95 backdrop-blur-sm shadow-2xl">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl -z-10" />
            
            <CardHeader className="text-center pb-6 relative z-10">
              {/* Icon Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4 shadow-lg shadow-amber-500/30"
              >
                <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 leading-tight"
              >
                <span className="block bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
              التقديم على دعم المشاريع
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-base md:text-lg text-muted-foreground font-medium"
              >
              قدم مشروعك للحصول على دعم مالي يصل إلى 300,000 جنيه
              </motion.p>
          </CardHeader>
            
            <CardContent className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                {/* Application Type Selection - Enhanced */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="space-y-4"
                >
                  <Label className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <span>نوع التقديم</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        type="button"
                        onClick={() => setApplicationType('individual')}
                        className={`w-full p-6 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group ${
                          applicationType === 'individual'
                            ? 'border-primary bg-primary/15 shadow-lg shadow-primary/20'
                            : 'border-border hover:border-primary/50 bg-muted/30 hover:bg-primary/5'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col items-center gap-3">
                          <div className={`p-3 rounded-xl transition-all ${
                            applicationType === 'individual'
                              ? 'bg-primary/20'
                              : 'bg-muted/50 group-hover:bg-primary/10'
                          }`}>
                            <User className={`w-7 h-7 md:w-8 md:h-8 transition-colors ${
                              applicationType === 'individual' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                            }`} />
                          </div>
                          <span className={`text-base md:text-lg font-bold transition-colors ${
                            applicationType === 'individual' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                          }`}>
                            فردي
                          </span>
                        </div>
                        {applicationType === 'individual' && (
                          <motion.div
                            layoutId="applicationType"
                            className="absolute inset-0 border-2 border-primary/30 rounded-xl"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        type="button"
                        onClick={() => setApplicationType('group')}
                        className={`w-full p-6 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group ${
                          applicationType === 'group'
                            ? 'border-primary bg-primary/15 shadow-lg shadow-primary/20'
                            : 'border-border hover:border-primary/50 bg-muted/30 hover:bg-primary/5'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex flex-col items-center gap-3">
                          <div className={`p-3 rounded-xl transition-all ${
                            applicationType === 'group'
                              ? 'bg-primary/20'
                              : 'bg-muted/50 group-hover:bg-primary/10'
                          }`}>
                            <Users className={`w-7 h-7 md:w-8 md:h-8 transition-colors ${
                              applicationType === 'group' ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                            }`} />
                          </div>
                          <span className={`text-base md:text-lg font-bold transition-colors ${
                            applicationType === 'group' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                          }`}>
                            مجموعة
                          </span>
                        </div>
                        {applicationType === 'group' && (
                          <motion.div
                            layoutId="applicationType"
                            className="absolute inset-0 border-2 border-primary/30 rounded-xl"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </button>
                    </motion.div>
                  </div>
                </motion.div>

              {/* Team Info - Only show for groups */}
              {applicationType === 'group' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 p-6 rounded-xl bg-muted/20 border border-border/50"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">معلومات الفريق</h2>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="teamName" className="text-base font-semibold">
                    اسم الفريق <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="teamName"
                    value={formData.teamName}
                    onChange={(e) => handleInputChange('teamName', e.target.value)}
                    placeholder="أدخل اسم فريقكم"
                      required={applicationType === 'group'}
                      className="h-12 border-2 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg">أعضاء الفريق</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTeamMember}
                      disabled={teamMembers.length >= 5}
                    >
                      <UserPlus size={16} className="mr-2" />
                      إضافة عضو
                    </Button>
                  </div>
                  
                  {teamMembers.map((member, index) => (
                      <Card key={member.id} className="border-2 border-border/50 bg-background/50 backdrop-blur-sm">
                        <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`memberName-${index}`} className="text-sm font-semibold">
                                الاسم <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`memberName-${index}`}
                                placeholder="الاسم الكامل"
                                value={member.name}
                                onChange={(e) =>
                                  updateTeamMember(member.id, "name", e.target.value)
                                }
                                  required={applicationType === 'group'}
                                  className="h-11 border-2 focus:border-primary/50 transition-all duration-300"
                              />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor={`memberPhone-${index}`} className="text-sm font-semibold">
                                رقم الهاتف <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`memberPhone-${index}`}
                                placeholder="01xxxxxxxxx"
                                value={member.phone}
                                onChange={(e) =>
                                  updateTeamMember(member.id, "phone", e.target.value)
                                }
                                  required={applicationType === 'group'}
                                  className="h-11 border-2 focus:border-primary/50 transition-all duration-300"
                                  dir="ltr"
                              />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor={`memberEmail-${index}`} className="text-sm font-semibold">
                                البريد الإلكتروني
                              </Label>
                              <Input
                                id={`memberEmail-${index}`}
                                type="email"
                                placeholder="email@example.com"
                                value={member.email}
                                onChange={(e) =>
                                  updateTeamMember(member.id, "email", e.target.value)
                                }
                                  className="h-11 border-2 focus:border-primary/50 transition-all duration-300"
                                  dir="ltr"
                              />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor={`memberRole-${index}`} className="text-sm font-semibold">
                                الدور في الفريق
                              </Label>
                              <Input
                                id={`memberRole-${index}`}
                                placeholder="المطور، المدير، إلخ"
                                value={member.role}
                                onChange={(e) =>
                                  updateTeamMember(member.id, "role", e.target.value)
                                }
                                  className="h-11 border-2 focus:border-primary/50 transition-all duration-300"
                              />
                            </div>
                          </div>
                          
                          {teamMembers.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTeamMember(member.id)}
                                className="rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                                <X size={18} />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                </motion.div>
              )}

              {/* Individual Info - Only show for individual */}
              {applicationType === 'individual' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 p-6 rounded-xl bg-muted/20 border border-border/50"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">معلوماتك الشخصية</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamName" className="text-base font-semibold">
                        الاسم الكامل <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="teamName"
                        value={formData.teamName}
                        onChange={(e) => handleInputChange('teamName', e.target.value)}
                        placeholder="أدخل اسمك الكامل"
                        required={applicationType === 'individual'}
                        className="h-12 border-2 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="individualPhone" className="text-base font-semibold">
                        رقم الهاتف <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="individualPhone"
                        value={teamMembers[0]?.phone || ''}
                        onChange={(e) => updateTeamMember(teamMembers[0].id, "phone", e.target.value)}
                        placeholder="01xxxxxxxxx"
                        required={applicationType === 'individual'}
                        className="h-12 border-2 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="individualEmail" className="text-base font-semibold">
                        البريد الإلكتروني
                      </Label>
                      <Input
                        id="individualEmail"
                        type="email"
                        value={teamMembers[0]?.email || ''}
                        onChange={(e) => updateTeamMember(teamMembers[0].id, "email", e.target.value)}
                        placeholder="email@example.com"
                        className="h-12 border-2 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="individualRole" className="text-base font-semibold">
                        الدور (اختياري)
                      </Label>
                      <Input
                        id="individualRole"
                        value={teamMembers[0]?.role || ''}
                        onChange={(e) => updateTeamMember(teamMembers[0].id, "role", e.target.value)}
                        placeholder="مثال: مؤسس، مطور"
                        className="h-12 border-2 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                      />
                </div>
              </div>
                </motion.div>
              )}
              
              {/* Project Info - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-6 p-6 rounded-xl bg-muted/20 border border-border/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">معلومات المشروع</h2>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-base font-semibold">
                    اسم المشروع <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    placeholder="ما هو اسم مشروعكم؟"
                    required
                    className="h-12 border-2 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectDescription" className="text-base font-semibold">
                    وصف المشروع <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="projectDescription"
                    value={formData.projectDescription}
                    onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                    placeholder="صفوا مشروعكم بتفصيل..."
                    rows={4}
                    required
                    className="border-2 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="problemStatement" className="text-base font-semibold">
                    المشكلة التي يحلها المشروع <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="problemStatement"
                    value={formData.problemStatement}
                    onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                    placeholder="ما هي المشكلة التي يعالجها مشروعكم؟"
                    rows={3}
                    required
                    className="border-2 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm resize-none"
                  />
                </div>
              </motion.div>
              
              {/* Traction */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">ال traction</h2>
                </div>
                
                <p className="text-muted-foreground">
                  هل لديكم أي traction أو مؤشرات نمو؟ (اختياري)
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tractionMVP"
                      checked={formData.tractionMVP}
                      onCheckedChange={(checked) => handleInputChange('tractionMVP', checked)}
                    />
                    <Label htmlFor="tractionMVP">لدينا MVP</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tractionPilot"
                      checked={formData.tractionPilot}
                      onCheckedChange={(checked) => handleInputChange('tractionPilot', checked)}
                    />
                    <Label htmlFor="tractionPilot">لدينا اختبار مع عملاء</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tractionSales"
                      checked={formData.tractionSales}
                      onCheckedChange={(checked) => handleInputChange('tractionSales', checked)}
                    />
                    <Label htmlFor="tractionSales">لدينا مبيعات</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tractionLinks">
                    روابط توضيحية (Pitch Deck, Demo, إلخ)
                  </Label>
                  <Input
                    id="tractionLinks"
                    value={formData.tractionLinks}
                    onChange={(e) => handleInputChange('tractionLinks', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                
                <div className="space-y-4">
                  <Label>تفاصيل ال traction</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.tractionMVP && (
                      <div className="space-y-2">
                        <Label htmlFor="tractionDetailsMVP">تفاصيل MVP</Label>
                        <Textarea
                          id="tractionDetailsMVP"
                          value={formData.tractionDetails.mvp}
                          onChange={(e) => handleInputChange('tractionDetails.mvp', e.target.value)}
                          placeholder="صفوا MVP الخاص بكم..."
                          rows={2}
                        />
                      </div>
                    )}
                    
                    {formData.tractionPilot && (
                      <div className="space-y-2">
                        <Label htmlFor="tractionDetailsPilot">تفاصيل اختبار العملاء</Label>
                        <Textarea
                          id="tractionDetailsPilot"
                          value={formData.tractionDetails.pilot}
                          onChange={(e) => handleInputChange('tractionDetails.pilot', e.target.value)}
                          placeholder="كم عدد المستخدمين؟ ما هو التفاعل؟"
                          rows={2}
                        />
                      </div>
                    )}
                    
                    {formData.tractionSales && (
                      <div className="space-y-2">
                        <Label htmlFor="tractionDetailsSales">تفاصيل المبيعات</Label>
                        <Textarea
                          id="tractionDetailsSales"
                          value={formData.tractionDetails.sales}
                          onChange={(e) => handleInputChange('tractionDetails.sales', e.target.value)}
                          placeholder="ما هي الإيرادات؟ كم عدد العملاء؟"
                          rows={2}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="tractionDetailsOther">أي تفاصيل أخرى</Label>
                      <Textarea
                        id="tractionDetailsOther"
                        value={formData.tractionDetails.other}
                        onChange={(e) => handleInputChange('tractionDetails.other', e.target.value)}
                        placeholder="أي مؤشرات نمو أخرى..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Media */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">الوسائط</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="videoPitch">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        رابط فيديو Pitch
                      </div>
                    </Label>
                    <Input
                      id="videoPitch"
                      value={formData.videoPitch}
                      onChange={(e) => handleInputChange('videoPitch', e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="demoLink">
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        رابط Demo
                      </div>
                    </Label>
                    <Input
                      id="demoLink"
                      value={formData.demoLink}
                      onChange={(e) => handleInputChange('demoLink', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
              
              {/* Support Needs */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">احتياجات الدعم</h2>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportNeeds">
                    ما نوع الدعم الذي تبحثون عنه؟ <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="supportNeeds"
                    value={formData.supportNeeds}
                    onChange={(e) => handleInputChange('supportNeeds', e.target.value)}
                    placeholder="تمويل، إرشاد، تسويق، تطوير..."
                    rows={3}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expectedGrowth">
                    ما هي التوقعات المستقبلية للمشروع؟ <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="expectedGrowth"
                    value={formData.expectedGrowth}
                    onChange={(e) => handleInputChange('expectedGrowth', e.target.value)}
                    placeholder="التوقعات المالية، نمو المستخدمين، التوسع..."
                    rows={3}
                    required
                  />
                </div>
              </div>
              
              {/* Terms */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    أوافق على{" "}
                    <button
                      type="button"
                      className="text-primary underline"
                      onClick={() => setShowTerms(true)}
                    >
                      الشروط والأحكام
                    </button>{" "}
                    لتقديم الطلب
                  </Label>
                </div>
              </div>
              
              {/* Submit Button - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex justify-center pt-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full md:w-2/3"
                >
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={loading}
                    className="w-full h-12 md:h-14 text-base md:text-lg font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-[length:200%_200%] animate-gradient hover:opacity-90 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300"
                >
                  {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      تقديم الطلب
                        <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </Button>
                </motion.div>
              </motion.div>
            </form>
          </CardContent>
        </Card>
        </motion.div>
      </div>
      
      {/* Terms Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>الشروط والأحكام</DialogTitle>
            <DialogDescription>
              الشروط والأحكام لتقديم طلب دعم المشاريع
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p>
              1- A compensation in the form of shares or intellectual property rights may be requested.
            </p>
            <p>
              2- All information provided will be kept strictly confidential.
            </p>
            <p>
              3- The company reserves the right to decline any request without providing a reason.
            </p>
            <p>
              By submitting your project or idea through this form, you acknowledge that all information is provided voluntarily and at your own discretion. INGeneral is not responsible for any similarity between your submission and any existing, planned, or future projects developed by our team or our partners.
            </p>
            <p>
              By submitting, you confirm that you understand this and that you waive any claim of ownership, copying, or idea appropriation.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
