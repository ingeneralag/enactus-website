import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Users, UserPlus, X, Link, Video, TrendingUp, HelpCircle, Lightbulb, AlertTriangle, Database, FileText as FileIcon, ArrowRight } from 'lucide-react';
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
        teamMembers: teamMembers
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
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              التقديم على دعم المشاريع
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              قدم مشروعك للحصول على دعم مالي يصل إلى 300,000 جنيه
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Team Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">معلومات الفريق</h2>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="teamName">
                    اسم الفريق <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="teamName"
                    value={formData.teamName}
                    onChange={(e) => handleInputChange('teamName', e.target.value)}
                    placeholder="أدخل اسم فريقكم"
                    required
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
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`memberName-${index}`}>
                                الاسم <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`memberName-${index}`}
                                placeholder="الاسم الكامل"
                                value={member.name}
                                onChange={(e) =>
                                  updateTeamMember(member.id, "name", e.target.value)
                                }
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`memberPhone-${index}`}>
                                رقم الهاتف <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`memberPhone-${index}`}
                                placeholder="01xxxxxxxxx"
                                value={member.phone}
                                onChange={(e) =>
                                  updateTeamMember(member.id, "phone", e.target.value)
                                }
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`memberEmail-${index}`}>
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
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`memberRole-${index}`}>
                                الدور في الفريق
                              </Label>
                              <Input
                                id={`memberRole-${index}`}
                                placeholder="المطور، المدير، إلخ"
                                value={member.role}
                                onChange={(e) =>
                                  updateTeamMember(member.id, "role", e.target.value)
                                }
                              />
                            </div>
                          </div>
                          
                          {teamMembers.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTeamMember(member.id)}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Project Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">معلومات المشروع</h2>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectName">
                    اسم المشروع <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    placeholder="ما هو اسم مشروعكم؟"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectDescription">
                    وصف المشروع <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="projectDescription"
                    value={formData.projectDescription}
                    onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                    placeholder="صفوا مشروعكم بتفصيل..."
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="problemStatement">
                    المشكلة التي يحلها المشروع <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="problemStatement"
                    value={formData.problemStatement}
                    onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                    placeholder="ما هي المشكلة التي يعالجها مشروعكم؟"
                    rows={3}
                    required
                  />
                </div>
              </div>
              
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
              
              {/* Submit Button */}
              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  className="w-full md:w-1/2" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      تقديم الطلب
                      <ArrowRight size={16} className="mr-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
              1. يجب أن يكون المشروع في مرحلة مبكرة (Idea, MVP, أو Scale).
            </p>
            <p>
              2. يجب أن يكون لدى الفريق خبرة تقنية و Entrepreneurship.
            </p>
            <p>
              3. سيتم تقييم الطلبات بناءً على الابتكار، التنفيذ، وال traction.
            </p>
            <p>
              4. الدعم المالي يشمل تمويل حتى 300,000 جنيه مصري.
            </p>
            <p>
              5. قد يتم طلب مقابل من الأسهم أو حقوق الملكية الفكرية.
            </p>
            <p>
              6. سيتم الاحتفاظ بجميع المعلومات المقدمة بشكل سري.
            </p>
            <p>
              7. يحق للشركة رفض أي طلب دون إبداء الأسباب.
            </p>
            <p>
              8. يجب استخدام الأموال الممنوحة في تطوير المشروع فقط.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
