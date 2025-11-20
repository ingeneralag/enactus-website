import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  UserPlus,
  Layers,
  Download,
  RefreshCw,
  Loader,
  ExternalLink,
  LogOut,
  ArrowRight,
  Shuffle,
  Trash2,
  UserCog,
  X,
  FileText,
  Eye,
} from 'lucide-react';
import { getRegistrations, generateGroups, resetGroups, getGroups, reshuffleGroups, addRandomStudent, deleteStudent } from '../lib/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reshuffling, setReshuffling] = useState(false);
  const [addingRandom, setAddingRandom] = useState(false);

  useEffect(() => {
    // Check authentication
    const isAuth = sessionStorage.getItem('admin_authenticated');
    if (!isAuth) {
      navigate('/admin/login');
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [regs, grps] = await Promise.all([
        getRegistrations(),
        getGroups(),
      ]);
      
      // Create a map of group_id to group_name
      const groupMap: any = {};
      grps.forEach((group: any) => {
        groupMap[group.id] = group.name;
      });
      
      // Add group_name to each registration
      const regsWithGroupNames = regs.map((reg: any) => ({
        ...reg,
        group_name: reg.group_id ? groupMap[reg.group_id] : null
      }));
      
      setRegistrations(regsWithGroupNames);
      setGroups(grps);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGroups = async () => {
    // @ts-ignore
    if (!confirm('هل أنت متأكد من تقسيم المجموعات؟')) return;

    setGenerating(true);
    try {
      await generateGroups(5);
      toast({
        title: "تم تقسيم المجموعات بنجاح! 🎉",
        description: "تم تقسيم المجموعات بنجاح",
      });
      await loadData();
      // Navigate to groups view
      setTimeout(() => {
        navigate('/admin/groups');
      }, 1500);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || 'فشل في تقسيم المجموعات',
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = async () => {
    // @ts-ignore
    if (!confirm('هل أنت متأكد من حذف جميع المجموعات؟ سيتم إرجاع جميع الطلاب لحالة غير مقسمة.')) return;

    try {
      await resetGroups();
      toast({
        title: "تم حذف جميع المجموعات بنجاح",
        description: "تم حذف جميع المجموعات",
      });
      await loadData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف المجموعات",
        variant: "destructive",
      });
    }
  };

  const handleReshuffle = async () => {
    // @ts-ignore
    if (!confirm('هل تريد إعادة تقسيم المجموعات بشكل عشوائي جديد؟ سيتم حذف التقسيم الحالي.')) return;

    setReshuffling(true);
    try {
      await reshuffleGroups(5);
      toast({
        title: "تم إعادة تقسيم المجموعات بنجاح! 🎉",
        description: "تم إعادة تقسيم المجموعات",
      });
      await loadData();
      // Navigate to groups view
      setTimeout(() => {
        navigate('/admin/groups');
      }, 1500);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || 'فشل في إعادة التقسيم',
        variant: "destructive",
      });
    } finally {
      setReshuffling(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    navigate('/admin/login');
  };

  const handleAddRandomStudent = async () => {
    setAddingRandom(true);
    try {
      const newStudent = await addRandomStudent();
      toast({
        title: `تم إضافة طالب: ${newStudent.name} 🎉`,
        description: "تم إضافة طالب عشوائي",
      });
      await loadData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إضافة طالب عشوائي",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setAddingRandom(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    // @ts-ignore
    if (!confirm(`هل تريد حذف الطالب "${studentName}"؟\nلا يمكن التراجع عن هذا الإجراء.`)) return;

    try {
      await deleteStudent(studentId);
      toast({
        title: `تم حذف الطالب: ${studentName}`,
        description: "تم حذف الطالب",
      });
      await loadData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الطالب",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const unassignedCount = registrations.filter((r: any) => !r.assigned).length;

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
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              لوحة التحكم
            </h1>
            <p className="text-gray-600 mt-1">
              إدارة المسجلين والمجموعات
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2"
          >
            <LogOut size={20} />
            <span>تسجيل خروج</span>
          </button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-r from-blue-500 to-purple-500 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">إجمالي التسجيلات</p>
                <p className="text-3xl font-bold mt-1">{registrations.length}</p>
              </div>
              <Users size={32} className="opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-r from-green-500 to-teal-500 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">طلاب بدون مجموعة</p>
                <p className="text-3xl font-bold mt-1">{unassignedCount}</p>
              </div>
              <UserPlus size={32} className="opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-r from-orange-500 to-red-500 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">عدد المجموعات</p>
                <p className="text-3xl font-bold mt-1">{groups.length}</p>
              </div>
              <Layers size={32} className="opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="w-5 h-5" />
                تقسيم المجموعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                قسم الطلاب إلى مجموعات من 5 أفراد لكل مجموعة
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleGenerateGroups()}
                  disabled={generating}
                  className="flex items-center gap-2"
                >
                  {generating ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    <Shuffle size={16} />
                  )}
                  <span>{generating ? 'جاري التقسيم...' : 'تقسيم المجموعات'}</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleReshuffle()}
                  disabled={reshuffling}
                  className="flex items-center gap-2"
                >
                  {reshuffling ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  <span>{reshuffling ? 'جاري إعادة التقسيم...' : 'إعادة التقسيم'}</span>
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => handleReset()}
                  className="flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  <span>حذف جميع المجموعات</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                إدارة الطلاب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                إضافة طلاب عشوائيين أو إدارة التسجيلات
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => handleAddRandomStudent()}
                  disabled={addingRandom}
                  className="flex items-center gap-2"
                >
                  {addingRandom ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  <span>{addingRandom ? 'جاري الإضافة...' : 'إضافة طالب عشوائي'}</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/groups')}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  <span>عرض المجموعات</span>
                  <ExternalLink size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Project Applications Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                طلبات دعم المشاريع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                عرض وإدارة طلبات دعم المشاريع المقدمة من المستخدمين
              </p>
              <Button
                onClick={() => navigate('/admin/project-applications')}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 text-white"
              >
                <FileText size={16} />
                <span>عرض طلبات المشاريع</span>
                <ArrowRight size={16} />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                الطلاب المسجلون ({registrations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">الكلية</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">المجال</TableHead>
                      <TableHead className="text-right">المجموعة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((registration: any) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">{registration.name}</TableCell>
                        <TableCell>{registration.college || 'غير محدد'}</TableCell>
                        <TableCell className="font-mono">{registration.phone.replace('+2', '').replace(/(.{4})/g, '$1 ').trim()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            registration.interest === 'software' ? 'bg-blue-100 text-blue-800' :
                            registration.interest === 'marketing' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {registration.interest === 'software' ? 'تطوير البرمجيات' :
                             registration.interest === 'marketing' ? 'التسويق الرقمي' :
                             'أخرى'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {registration.assigned ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              {registration.group_name || 'مُعين'}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              غير مُعين
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStudent(registration.id, registration.name)}
                            title="حذف الطالب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {registrations.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">لا توجد تسجيلات بعد</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
