import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Building, Briefcase, Phone } from "lucide-react";
import { getGroups, getRegistrations } from '../lib/api';

export default function AllGroups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupsData, regsData] = await Promise.all([
        getGroups(),
        getRegistrations()
      ]);
      
      setGroups(groupsData);
      // عكس الترتيب: الأحدث أولاً
      setRegistrations([...regsData].reverse());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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

  // For group members, show only first 3 members and indicate how many more
  const getDisplayedMembers = (members: any[]) => {
    return members.slice(0, 3);
  };
  
  const getRemainingMembersCount = (members: any[]) => {
    return Math.max(0, members.length - 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            جميع المجموعات
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-semibold">
            تم تقسيم {groups.reduce((acc: number, g: any) => acc + g.members.length, 0)} طالب إلى {groups.length} مجموعة
          </p>
        </motion.div>

        {/* Groups Section */}
        {groups.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <AnimatePresence>
                {groups.map((group: any, idx: number) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                    className="card hover:shadow-2xl transition-shadow duration-300"
                  >
                    {/* Group Header */}
                    <div className={`bg-gradient-to-r ${getColorForIndex(idx)} text-white p-4 rounded-lg mb-4`}>
                      <h3 className="text-xl font-bold">{group.name}</h3>
                      <p className="text-sm opacity-90">
                        {group.members.length} أعضاء
                      </p>
                    </div>

                    {/* Members List */}
                    <div className="space-y-3">
                      {group.members.map((member: any, memberIdx: number) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (idx * 0.1) + (memberIdx * 0.05) }}
                          className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                        >
                          {/* Avatar */}
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getColorForIndex(memberIdx)} flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}>
                            {getInitials(member.name)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {member.name}
                            </p>
                            {member.college && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                <Building size={10} />
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
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* All Registrations Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-16"
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent mb-2">
                  جميع المشاركين
                </h2>
                <p className="text-gray-600 text-lg">
                  {registrations.length} طالب مسجل في التحدي
                </p>
              </div>

              {/* Limit displayed participants */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {registrations.map((reg: any, idx: number) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.02, duration: 0.3 }}
                    className="card p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getColorForIndex(idx)} flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}>
                        {getInitials(reg.name)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{reg.name}</p>
                        {reg.college && (
                          <p className="text-xs text-muted-foreground truncate">
                            {reg.college}
                          </p>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block font-semibold ${
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
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
            </motion.div>
          </>
        ) : (
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
