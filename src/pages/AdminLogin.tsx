import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check PIN
    const correctPin = import.meta.env.VITE_ADMIN_PIN || '123456';
    
    if (pin === correctPin) {
      // Store in session
      sessionStorage.setItem('admin_authenticated', 'true');
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في لوحة التحكم",
      });
      navigate('/admin');
    } else {
      toast({
        title: "خطأ",
        description: "كلمة المرور غير صحيحة",
        variant: "destructive",
      });
      setPin('');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-4"
          >
            <div className="bg-purple-100 p-4 rounded-full">
              <Lock size={48} className="text-purple-600" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            دخول الأدمن
          </h1>
          <p className="text-gray-600">
            أدخل كلمة المرور للوصول للوحة التحكم
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Label className="block text-gray-700 font-semibold mb-2">
              كلمة المرور
            </Label>
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              className="input-field"
              placeholder="أدخل كلمة المرور"
              autoFocus
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'دخول'}
            </Button>
          </motion.div>
        </form>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <a
            href="/"
            className="text-purple-600 hover:text-purple-700 text-sm font-medium inline-flex items-center gap-2"
          >
            <ArrowRight size={16} />
            <span>العودة للرئيسية</span>
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
