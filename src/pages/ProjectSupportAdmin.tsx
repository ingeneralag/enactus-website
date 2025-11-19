import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, FileText, Video, Link, CheckCircle, XCircle, Clock, Eye, Download, Filter, ArrowLeft, XCircle as XCircleIcon, TrendingUp, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getProjectApplications, getProjectApplicationWithMembers, updateApplicationStatus } from '../lib/projectSupportApi';

type ApplicationStatus = "pending" | "accepted" | "rejected";

export default function ProjectSupportAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");

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
      const data = await getProjectApplications();
      setApplications(data);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل الطلبات",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = async (applicationId: string) => {
    try {
      const application = await getProjectApplicationWithMembers(applicationId);
      setSelectedApplication(application);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل تفاصيل الطلب",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const handleStatusChange = async (applicationId: string, status: ApplicationStatus) => {
    try {
      await updateApplicationStatus(applicationId, status);
      toast({
        title: "نجاح",
        description: `تم تحديث حالة الطلب إلى ${status}`,
      });
      loadData(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الطلب",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const handleDownloadCSV = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    csvContent += "ID,Project Name,Team Name,Status,Created At\n";
    
    // Data
    applications.forEach((app: any) => {
      csvContent += `"${app.id}","${app.project_name}","${app.team_name || ''}","${app.status}","${app.created_at}"\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "project_applications.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    navigate('/admin/login');
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter((app: any) => app.status === filter);

  const stats = {
    total: applications.length,
    pending: applications.filter((a: any) => a.status === "pending").length,
    accepted: applications.filter((a: any) => a.status === "accepted").length,
    rejected: applications.filter((a: any) => a.status === "rejected").length,
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const variants: any = {
      pending: "default",
      accepted: "default",
      rejected: "destructive",
    };

    const labels: any = {
      pending: "قيد المراجعة",
      accepted: "مقبول",
      rejected: "مرفوض",
    };

    const colors: any = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
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
              إدارة طلبات دعم المشاريع
            </h1>
            <p className="text-gray-600 mt-1">
              مراجعة الطلبات والتحكم في الحالة
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2"
          >
            <XCircleIcon size={20} />
            <span>تسجيل خروج</span>
          </button>
        </motion.div>

        {/* Stats and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <div className="card bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">إجمالي الطلبات</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <FileText size={48} className="opacity-75" />
            </div>
          </div>
          
          <div className="card bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">قيد المراجعة</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <Clock size={48} className="opacity-75" />
            </div>
          </div>
          
          <div className="card bg-gradient-to-r from-green-500 to-teal-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">مقبولة</p>
                <p className="text-3xl font-bold">{stats.accepted}</p>
              </div>
              <CheckCircle size={48} className="opacity-75" />
            </div>
          </div>
          
          <div className="card bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">مرفوضة</p>
                <p className="text-3xl font-bold">{stats.rejected}</p>
              </div>
              <XCircleIcon size={48} className="opacity-75" />
            </div>
          </div>
        </motion.div>

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الطلبات</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="accepted">مقبولة</SelectItem>
                  <SelectItem value="rejected">مرفوضة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleDownloadCSV}
                className="btn-secondary flex items-center gap-2"
              >
                <Download size={20} />
                <span>تصدير إلى CSV</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-gray-600 font-medium">اسم المشروع</th>
                  <th className="pb-3 text-gray-600 font-medium">اسم الفريق</th>
                  <th className="pb-3 text-gray-600 font-medium">الحالة</th>
                  <th className="pb-3 text-gray-600 font-medium">تاريخ التقديم</th>
                  <th className="pb-3 text-gray-600 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app: any) => (
                  <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 font-medium text-gray-800">{app.project_name}</td>
                    <td className="py-4 text-gray-600">{app.team_name || 'غير محدد'}</td>
                    <td className="py-4">{getStatusBadge(app.status)}</td>
                    <td className="py-4 text-gray-600">
                      {new Date(app.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewApplication(app.id)}
                        >
                          <Eye size={16} className="ml-1" />
                          عرض
                        </Button>
                        {app.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(app.id, 'accepted')}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              قبول
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(app.id, 'rejected')}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              رفض
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
                <p className="text-gray-500">لا توجد طلبات تطابق الفلتر المحدد</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedApplication.project_name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Team Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users size={20} />
                    معلومات الفريق
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">اسم الفريق</p>
                      <p className="font-medium">{selectedApplication.team_name || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">عدد الأعضاء</p>
                      <p className="font-medium">{selectedApplication.team_members?.length || 0}</p>
                    </div>
                  </div>
                  
                  {selectedApplication.team_members && selectedApplication.team_members.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">أعضاء الفريق</p>
                      <div className="space-y-2">
                        {selectedApplication.team_members.map((member: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {member.name?.charAt(0) || '؟'}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{member.name}</p>
                              <p className="text-xs text-gray-600">{member.role || 'غير محدد'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Project Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText size={20} />
                    معلومات المشروع
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">وصف المشروع</p>
                      <p className="font-medium">{selectedApplication.project_description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">مشكلة المشروع</p>
                      <p className="font-medium">{selectedApplication.problem_statement}</p>
                    </div>
                  </div>
                </div>
                
                {/* Traction */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp size={20} />
                    ال traction
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={selectedApplication.traction_mvp ? "text-green-500" : "text-gray-300"} size={20} />
                      <span>لدينا MVP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={selectedApplication.traction_pilot ? "text-green-500" : "text-gray-300"} size={20} />
                      <span>اختبار مع عملاء</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={selectedApplication.traction_sales ? "text-green-500" : "text-gray-300"} size={20} />
                      <span>لدينا مبيعات</span>
                    </div>
                  </div>
                  
                  {selectedApplication.traction_details && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">تفاصيل ال traction</p>
                      <p className="font-medium">{selectedApplication.traction_details}</p>
                    </div>
                  )}
                </div>
                
                {/* Media */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Video size={20} />
                    الوسائط
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedApplication.video_pitch && (
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Video size={16} />
                          رابط فيديو Pitch
                        </p>
                        <a 
                          href={selectedApplication.video_pitch} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline break-all"
                        >
                          {selectedApplication.video_pitch}
                        </a>
                      </div>
                    )}
                    {selectedApplication.demo_link && (
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Link size={16} />
                          رابط Demo
                        </p>
                        <a 
                          href={selectedApplication.demo_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline break-all"
                        >
                          {selectedApplication.demo_link}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Support Needs */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <HelpCircle size={20} />
                    احتياجات الدعم
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">نوع الدعم المطلوب</p>
                      <p className="font-medium">{selectedApplication.support_needs}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">التوقعات المستقبلية</p>
                      <p className="font-medium">{selectedApplication.expected_growth}</p>
                    </div>
                  </div>
                </div>
                
                {/* Status and Actions */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {selectedApplication.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatusChange(selectedApplication.id, 'accepted')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        قبول الطلب
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        رفض الطلب
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedApplication(null)}
                  >
                    إغلاق
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}