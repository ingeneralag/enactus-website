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
            تم التسجيل!
          </h2>
          <p className="text-gray-600 mb-6">
            استنى لما المدير يقسّم المجموعات
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card max-w-lg w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            انضم لمسابقة التدريب
          </h1>
          <p className="text-gray-600">
            املأ البيانات للتسجيل في TeamUp Challenge
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label className="block text-gray-700 font-semibold mb-2">
              <User size={20} className="inline ml-2" />
              الاسم *
            </Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="محمد أحمد"
            />
          </motion.div>

          {/* College */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Label className="block text-gray-700 font-semibold mb-2">
              <Building size={20} className="inline ml-2" />
              الكلية
            </Label>
            <Input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              className="input-field"
              placeholder="كلية الهندسة"
            />
          </motion.div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Label className="block text-gray-700 font-semibold mb-2">
              <Phone size={20} className="inline ml-2" />
              رقم الموبايل *
            </Label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="+201001234567 أو 01001234567"
              dir="ltr"
            />
            <p className="text-sm text-gray-500 mt-1">
              يجب أن يبدأ الرقم بـ 01 أو +201
            </p>
          </motion.div>

          {/* Interest */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Label className="block text-gray-700 font-semibold mb-2">
              <Briefcase size={20} className="inline ml-2" />
              المجال المهتم بيه *
            </Label>
            <Select
              name="interest"
              value={formData.interest}
              onValueChange={(value) =>
                setFormData({ ...formData, interest: value })
              }
              required
            >
              <SelectTrigger className="input-field">
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
            transition={{ delay: 0.6 }}
          >
            <Button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'جاري التسجيل...' : 'تسجيل'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
