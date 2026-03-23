import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { FileText, Calendar, User, DollarSign } from "lucide-react";

const COLUMNS = [
  { id: "טיוטה", title: "טיוטה", color: "bg-gray-100 border-gray-300" },
  { id: "הופק", title: "הופק", color: "bg-blue-100 border-blue-300" },
  { id: "נשלח לרו״ח", title: "נשלח לרו״ח", color: "bg-green-100 border-green-300" },
  { id: "סגור", title: "סגור", color: "bg-purple-100 border-purple-300" }
];

export default function InvoiceKanbanBoard({ invoices, onStatusChange }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const invoiceId = result.draggableId;
    const newStatus = result.destination.droppableId;

    onStatusChange(invoiceId, newStatus);
  };

  const getInvoicesByStatus = (status) => {
    return invoices.filter(inv => inv.status === status);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(column => {
          const columnInvoices = getInvoicesByStatus(column.id);
          const totalAmount = columnInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

          return (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.color} border-2 rounded-t-lg p-4`}>
                <h3 className="font-bold text-lg mb-1">{column.title}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{columnInvoices.length} חשבוניות</span>
                  <span className="font-semibold">₪{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 border-2 border-t-0 rounded-b-lg p-2 space-y-2 min-h-[400px] ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    {columnInvoices.map((invoice, index) => (
                      <Draggable
                        key={invoice.id}
                        draggableId={invoice.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`border-2 hover:shadow-lg transition-all cursor-move ${
                              snapshot.isDragging ? 'shadow-2xl rotate-2' : ''
                            }`}
                          >
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-indigo-600" />
                                  <span className="font-bold text-sm">{invoice.invoice_number}</span>
                                </div>
                                <Badge className="text-xs bg-indigo-100 text-indigo-800">
                                  ₪{invoice.total_amount?.toLocaleString()}
                                </Badge>
                              </div>

                              <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span className="truncate">{invoice.patient_name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{format(parseISO(invoice.invoice_date), 'dd/MM/yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  <span>{invoice.payment_method}</span>
                                </div>
                              </div>

                              {invoice.description && (
                                <p className="text-xs text-gray-500 truncate">{invoice.description}</p>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}