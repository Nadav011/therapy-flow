import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, CheckCircle2, LogOut, Users, FileText, Download, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";

export default function AttendanceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [status, setStatus] = useState("out");
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Management State
  const [records, setRecords] = useState([]);
  const [startDate, setStartDate] = useState(format(new Date().setDate(1), 'yyyy-MM-dd')); // First day of month
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedEmployeeId) {
      checkStatus(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const fetchEmployees = async () => {
    // Assuming therapists are employees for now
    const data = await base44.entities.Therapist.list();
    setEmployees(data);
    // Try to select current user if possible
    const user = await base44.auth.me();
    const found = data.find(e => e.email === user.email);
    if (found) setSelectedEmployeeId(found.id);
    else if (data.length > 0) setSelectedEmployeeId(data[0].id);
  };

  const checkStatus = async (employeeId) => {
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const activeRecords = await base44.entities.Attendance.filter({ 
        user_id: employeeId,
        date: today,
        status: "active"
      });
      
      if (activeRecords.length > 0) {
        setStatus("active");
        setCurrentRecord(activeRecords[0]);
      } else {
        setStatus("out");
        setCurrentRecord(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClockAction = async () => {
    if (!selectedEmployeeId) return;
    setLoading(true);
    try {
      const now = format(new Date(), 'HH:mm');
      const today = format(new Date(), 'yyyy-MM-dd');

      if (status === "out") {
        const record = await base44.entities.Attendance.create({
          user_id: selectedEmployeeId,
          date: today,
          check_in: now,
          status: "active"
        });
        setCurrentRecord(record);
        setStatus("active");
        if(window.showToast) window.showToast("נכנסת למשמרת בהצלחה! ✅", "success");
      } else {
        if (currentRecord) {
          await base44.entities.Attendance.update(currentRecord.id, {
            check_out: now,
            status: "completed"
          });
          setStatus("out");
          setCurrentRecord(null);
          if(window.showToast) window.showToast("יצאת מהמשמרת! 👋", "success");
        }
      }
    } catch (error) {
      console.error(error);
      alert("שגיאה בביצוע הפעולה");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Fetch all records (filtering by date in client for simplicity or improved query if supported)
      // Ideally filter by date range in query, but simple filter here:
      const allRecords = await base44.entities.Attendance.list('-date', 100);
      setRecords(allRecords);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (records.length === 0) return;
    
    const headers = ["שם עובד", "תאריך", "כניסה", "יציאה", "סטטוס"];
    const csvContent = [
      headers.join(","),
      ...records.map(r => {
        const emp = employees.find(e => e.id === r.user_id);
        return [
          emp ? emp.full_name : r.user_id,
          r.date,
          r.check_in,
          r.check_out || "",
          r.status === "active" ? "פעיל" : "הושלם"
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  const employee = employees.find(e => e.id === selectedEmployeeId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md gap-2">
          <Clock className="w-4 h-4" />
          שעון נוכחות
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            ניהול נוכחות
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="clock" onValueChange={(val) => val === 'manage' && fetchRecords()}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="clock">שעון נוכחות</TabsTrigger>
            <TabsTrigger value="manage">ניהול ודוחות</TabsTrigger>
          </TabsList>

          <TabsContent value="clock" className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-6">
              <div className="w-full max-w-xs space-y-2">
                <label className="text-sm font-medium">בחר עובד:</label>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר שם..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEmployeeId && (
                <Card className={`w-full max-w-xs border-2 transition-colors ${status === 'active' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Clock className="w-12 h-12" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{employee?.full_name}</h3>
                      <p className="text-gray-500">
                        {status === 'active' ? `במשמרת משעה ${currentRecord?.check_in}` : 'אינו במשמרת'}
                      </p>
                    </div>
                    <Button 
                      onClick={handleClockAction} 
                      disabled={loading}
                      className={`w-full h-12 text-lg ${status === 'out' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {loading ? <Clock className="animate-spin" /> : status === 'out' ? 'כניסה למשמרת' : 'יציאה ממשמרת'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manage">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">דו"ח שעות</h3>
                <Button variant="outline" onClick={exportCSV} className="gap-2">
                  <Download className="w-4 h-4" />
                  ייצוא לאקסל
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">עובד</TableHead>
                      <TableHead className="text-right">תאריך</TableHead>
                      <TableHead className="text-right">כניסה</TableHead>
                      <TableHead className="text-right">יציאה</TableHead>
                      <TableHead className="text-right">סטטוס</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => {
                      const emp = employees.find(e => e.id === record.user_id);
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{emp?.full_name || "לא ידוע"}</TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.check_in}</TableCell>
                          <TableCell>{record.check_out || "-"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${record.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {record.status === 'active' ? 'פעיל' : 'הושלם'}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}