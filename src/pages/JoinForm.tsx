import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, User, Phone, Building, Briefcase, ArrowRight } from "lucide-react";
import { registerStudent } from '../lib/api';

export default function JoinForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    phone: '',
    interest: 'software',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Individual registration only
      await registerStudent(formData);
      setSubmitted(true);
      toast({
        title: "تم التسجيل بنجاح! 🎉",
        description: "شكراً لانضمامك إلى المسابقة",
      });
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || 'حدث خطأ في التسجيل',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 py-12 md:py-16 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-green-500/5 to-emerald-500/5 -z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 -z-10" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-full max-w-md"
        >
          <Card className="relative overflow-hidden border-2 border-success/30 bg-background/95 backdrop-blur-sm shadow-2xl text-center">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-success/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-500/10 rounded-full blur-3xl -z-10" />
            
            <CardContent className="p-8 md:p-12">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-success/20 mb-6"
              >
                <CheckCircle size={48} className="md:w-16 md:h-16 text-success" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-success to-emerald-600 bg-clip-text text-transparent"
              >
                تم التسجيل بنجاح! 🎉
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-base md:text-lg text-muted-foreground mb-8 font-medium"
              >
                استنى لما المدير يقسّم المجموعات
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => navigate('/')}
                    size="lg"
                    className="w-full h-12 md:h-14 text-base md:text-lg font-bold bg-gradient-to-r from-success to-emerald-600 hover:opacity-90 text-white shadow-lg shadow-success/30 hover:shadow-xl hover:shadow-success/40 transition-all duration-300"
                  >
                    العودة للرئيسية
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 md:py-16 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <Card className="relative overflow-hidden border-2 border-border/50 bg-background/95 backdrop-blur-sm shadow-2xl">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -z-10" />
          
          <CardHeader className="text-center pb-6 relative z-10">
            {/* Icon Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
              className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg shadow-primary/30"
            >
              <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 leading-tight"
            >
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
                انضم لمسابقة التدريب
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base md:text-lg text-muted-foreground font-medium"
            >
              املأ البيانات للتسجيل في TeamUp Challenge
            </motion.p>
          </CardHeader>

          <CardContent className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              {/* Name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="name" className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <User size={18} className="text-primary" />
                  </div>
                  <span>الاسم <span className="text-destructive">*</span></span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-12 md:h-14 text-base border-2 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                  placeholder="محمد أحمد"
                />
              </motion.div>

              {/* College */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="college" className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-secondary/10">
                    <Building size={18} className="text-secondary" />
                  </div>
                  <span>الكلية</span>
                </Label>
                <Input
                  id="college"
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="h-12 md:h-14 text-base border-2 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                  placeholder="كلية الهندسة"
                />
              </motion.div>

              {/* Phone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="phone" className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-accent/10">
                    <Phone size={18} className="text-accent" />
                  </div>
                  <span>رقم الموبايل <span className="text-destructive">*</span></span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="h-12 md:h-14 text-base border-2 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                  placeholder="+201001234567 أو 01001234567"
                  dir="ltr"
                />
                <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1.5 px-1">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  يجب أن يبدأ الرقم بـ 01 أو +201
                </p>
              </motion.div>

              {/* Interest */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="interest" className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10">
                    <Briefcase size={18} className="text-purple-500" />
                  </div>
                  <span>المجال المهتم بيه <span className="text-destructive">*</span></span>
                </Label>
                <Select
                  name="interest"
                  value={formData.interest}
                  onValueChange={(value) =>
                    setFormData({ ...formData, interest: value })
                  }
                  required
                >
                  <SelectTrigger className="h-12 md:h-14 text-base border-2 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm">
                    <SelectValue placeholder="اختر المجال" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software">Software Development</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="pt-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 md:h-14 text-base md:text-lg font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_200%] animate-gradient hover:opacity-90 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2" />
                        جاري التسجيل...
                      </>
                    ) : (
                      <>
                        تسجيل
                        <ArrowRight className="ml-2 h-5 w-5" />
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
  );
}
