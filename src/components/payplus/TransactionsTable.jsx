import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Calendar, DollarSign, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function TransactionsTable({ transactions, isLoading }) {
  if (isLoading) {
    return <div className="text-center p-8">טוען נתונים...</div>;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center p-12 border-2 border-dashed rounded-xl bg-gray-50">
        <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">לא נמצאו עסקאות בטווח התאריכים שנבחר</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    // PayPlus statuses mapping (simplified)
    const s = String(status).toLowerCase();
    if (s === "success" || s === "approved") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1"/> אושר</Badge>;
    if (s === "failed" || s === "rejected") return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1"/> נכשל</Badge>;
    return <Badge variant="outline" className="bg-yellow-50 text-yellow-800"><Clock className="w-3 h-3 mr-1"/> {status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white shadow-sm border-l-4 border-green-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">סה"כ עסקאות</p>
                <h3 className="text-2xl font-bold">{transactions.length}</h3>
              </div>
              <CreditCard className="w-8 h-8 text-green-100" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-l-4 border-blue-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">מחזור כולל</p>
                <h3 className="text-2xl font-bold">
                  ₪{transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}
                </h3>
              </div>
              <DollarSign className="w-8 h-8 text-blue-100" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-l-4 border-purple-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">עסקה אחרונה</p>
                <h3 className="text-lg font-bold truncate">
                  {transactions[0]?.date || "-"}
                </h3>
              </div>
              <Calendar className="w-8 h-8 text-purple-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="shadow-md overflow-hidden">
        <CardHeader className="bg-gray-50 border-b py-4">
          <CardTitle className="text-lg">היסטוריית עסקאות</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">תאריך</TableHead>
                <TableHead className="text-right">שם לקוח</TableHead>
                <TableHead className="text-right">סכום</TableHead>
                <TableHead className="text-right">אמצעי תשלום</TableHead>
                <TableHead className="text-right">מס' אסמכתא</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx, idx) => (
                <TableRow key={idx} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{tx.date}</TableCell>
                  <TableCell>{tx.customer_name || "לקוח מזדמן"}</TableCell>
                  <TableCell className="font-bold">₪{tx.amount?.toLocaleString()}</TableCell>
                  <TableCell>{tx.card_brand || "אשראי"} {tx.last_4_digits ? `(*${tx.last_4_digits})` : ''}</TableCell>
                  <TableCell className="font-mono text-xs">{tx.ref_number}</TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}