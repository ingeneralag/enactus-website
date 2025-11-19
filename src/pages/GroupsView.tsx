import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Trash2, Loader, Users, Phone } from "lucide-react";
import { getGroups, exportToCSV, deleteGroup } from '../lib/api';
import { downloadCSV } from '../utils/csv';

export default function GroupsView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    // Check authentication
    const isAuth = sessionStorage.getItem('admin_authenticated');
    if (!isAuth) {
      navigate('/admin/login');
      return;
    }

    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await getGroups();
      setGroups(data);
      
      // Stop animation after 3 seconds
      setTimeout(() => {
        setAnimating(false);
      }, 3000);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل المجموعات",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const data = await exportToCSV();
      downloadCSV(data, `teamup-groups-${new Date().toISOString().split('T')[0]}.csv`);
      toast({
        title: "تم التنزيل",
        description: "تم تنزيل CSV بنجاح!",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تنزيل CSV",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    // @ts-ignore
    if (!confirm(`هل تريد حذف مجموعة "${groupName}"؟\nسيتم إرجاع أعضاء هذه المجموعة لحالة غير مقسمة.`)) return;

    try {
      await deleteGroup(groupId);
      toast({
        title: "تم الحذف",
        description: `تم حذف مجموعة "${groupName}" بنجاح`,
      });
      await loadGroups();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف المجموعة",
        variant: "destructive",
      });
      console.error(error);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              المجموعات
            </h1>
            <p className="text-gray-600 mt-1">
              تم تقسيم {groups.reduce((acc: number, g: any) => acc + g.members.length, 0)} طالب إلى {groups.length} مجموعة
            </p>
          </div>
          <Button onClick={handleExportCSV} className="flex items-center gap-2">
            <Download size={20} />
            <span>تنزيل CSV</span>
          </Button>
        </motion.div>

        {/* Confetti Animation */}
        {animating && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 2.5, duration: 0.5 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)],
                }}
                animate={{
                  y: '100vh',
                  x: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200],
                  rotate: 360,
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AnimatePresence>
            {groups.map((group: any, idx: number) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  delay: idx * 0.1,
                  duration: 0.5,
                  type: 'spring',
                  stiffness: 200,
                }}
                className="card hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Group Header */}
                <div className={`bg-gradient-to-r ${getColorForIndex(idx)} text-white p-4 rounded-lg mb-4 relative`}>
                  <h3 className="text-xl font-bold pr-8">{group.name}</h3>
                  <p className="text-sm opacity-90">
                    {group.members.length} أعضاء
                  </p>
                  
                  {/* Delete Button */}
                  <Button
                    onClick={() => handleDeleteGroup(group.id, group.name)}
                    className="absolute top-3 left-3 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="حذف المجموعة"
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 size={16} className="text-white" />
                  </Button>
                </div>
                
                {/* Members */}
                <div className="space-y-3">
                  {group.members.map((member: any, memberIdx: number) => (
                    <div key={memberIdx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(member.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{member.name}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full truncate">
                            {member.college || 'غير محدد'}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full truncate">
                            {member.interest === 'software' ? 'تطوير البرمجيات' : 
                             member.interest === 'marketing' ? 'التسويق الرقمي' : 
                             'أخرى'}
                          </span>
                        </div>
                      </div>
                      <div className="text-gray-500">
                        <Phone size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {groups.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">لا توجد مجموعات</h3>
            <p className="text-gray-500">لم يتم تكوين أي مجموعات بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
