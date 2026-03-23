import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  CheckCircle,
  Clock
} from "lucide-react";
import { 
  format, 
  startOfMonth,
  endOfMonth,
  parseISO,
  addMonths,
  subMonths
} from "date-fns";
import { he } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TaxApprovedJournal() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentTherapist, setCurrentTherapist] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        if (currentUser?.email) {
          const therapists = await base44.entities.Therapist.filter({ email: currentUser.email });
          if (therapists.length > 0) {
            setCurrentTherapist(therapists[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching therapist:", error);
      }
    };
    if (currentUser) {
      fetchTherapist();
    }
  }, [currentUser]);

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', currentTherapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: currentTherapist.id }, '-appointment_date'),
    enabled: !!currentTherapist,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-payment_date'),
  });

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  // Filter appointments for selected month
  const monthAppointments = appointments.filter(apt => {
    if (!apt.appointment_date) return false;
    const aptDate = parseISO(apt.appointment_date);
    return aptDate >= monthStart && aptDate <= monthEnd;
  });

  // Filter by search and status
  const filteredAppointments = monthAppointments.filter(apt => {
    const patient = patients.find(p => p.id === apt.patient_id);
    const matchesSearch = !searchTerm || 
      patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.id_number?.includes(searchTerm) ||
      apt.appointment_date?.includes(searchTerm);
    
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalRevenue = payments
    .filter(p => {
      if (!p.payment_date || p.status !== "שולם") return false;
      const payDate = parseISO(p.payment_date);
      return payDate >= monthStart && payDate <= monthEnd;
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const completedCount = monthAppointments.filter(a => a.status === "הושלם").length;
  const cancelledCount = monthAppointments.filter(a => a.status === "בוטל").length;

  const handleExportToExcel = async () => {
    try {
      // Prepare data for export
      const exportData = filteredAppointments.map(apt => {
        const patient = patients.find(p => p.id === apt.patient_id);
        const payment = payments.find(p => p.appointment_id === apt.id);
        
        return {
          'תאריך': apt.appointment_date,
          'שעה': apt.appointment_time,
          'שם מטופל': patient?.full_name || '',
          'תעודת זהות': patient?.id_number || '',
          'סוג טיפול': apt.type || '',
          'חדר': apt.room_number || '',
          'סטטוס': apt.status,
          'מחיר': apt.price || 0,
          'שולם': payment?.status === "שולם" ? "כן" : "לא",
          'אמצעי תשלום': payment?.payment_method || ''
        };
      });

      // Create CSV content
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => headers.map(h => row[h]).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `יומן_רופא_${format(selectedMonth, 'MM-yyyy')}.csv`;
      link.click();

      if (window.showToast) {
        window.showToast('הקובץ יוצא בהצלחה', 'success');
      }
    } catch (error) {
      console.error('Export error:', error);
      if (window.showToast) {
        window.showToast('שגיאה בייצוא הקובץ', 'error');
      }
    }
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">יומן רופא מאושר</h1>
              <p className="text-sm text-gray-500">מערכת מאושרת לרשות המיסים</p>
            </div>
          </div>
          <Button
            onClick={handleExportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 ml-2" />
            ייצא לאקסל
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">סה"כ טיפולים</p>
                <p className="text-2xl font-bold text-gray-900">{monthAppointments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">הושלמו</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">בוטלו</p>
                <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
              </div>
              <Clock className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">הכנסות</p>
                <p className="text-2xl font-bold text-gray-900">₪{totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <span className="text-base font-bold text-gray-800 min-w-[120px] text-center">
              {format(selectedMonth, 'MMMM yyyy', { locale: he })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(new Date())}
              className="text-sm h-9 mr-2"
            >
              חודש נוכחי
            </Button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="חיפוש לפי שם, ת.ז או תאריך..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="סינון סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="מאושר">מאושר</SelectItem>
              <SelectItem value="הושלם">הושלם</SelectItem>
              <SelectItem value="בוטל">בוטל</SelectItem>
              <SelectItem value="בהמתנה">בהמתנה</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">תאריך</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">שעה</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">שם מטופל</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">תעודת זהות</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">סוג טיפול</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">חדר</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">מחיר</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">תשלום</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">סטטוס</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAppointments.map((apt) => {
                    const patient = patients.find(p => p.id === apt.patient_id);
                    const payment = payments.find(p => p.appointment_id === apt.id);
                    
                    return (
                      <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {apt.appointment_date && format(parseISO(apt.appointment_date), 'dd/MM/yyyy', { locale: he })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{apt.appointment_time}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient?.full_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{patient?.id_number || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{apt.type || 'טיפול'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{apt.room_number || '-'}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {apt.price ? `₪${apt.price.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {payment?.status === "שולם" ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              {payment.payment_method}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              לא שולם
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge
                            className={
                              apt.status === "הושלם"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : apt.status === "בוטל"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : apt.status === "מאושר"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            }
                          >
                            {apt.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredAppointments.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">אין טיפולים בחודש זה</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}