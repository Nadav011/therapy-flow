import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  Loader2, 
  CheckCircle2, 
  File,
  X,
  FileText,
  Image as ImageIcon
} from "lucide-react";

export default function FileUploadDialog({ patientId, patientName, therapistId, therapistName, onClose, onSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("נא לבחור לפחות קובץ אחד");
      return;
    }

    setIsUploading(true);

    const uploadedFiles = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      setUploadProgress(prev => ({
        ...prev,
        [i]: { status: 'uploading', name: file.name }
      }));

      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      uploadedFiles.push({ name: file.name, url: file_url });

      setUploadProgress(prev => ({
        ...prev,
        [i]: { status: 'done', name: file.name, url: file_url }
      }));
    }

    // Get current user for the therapist email lookup
    const currentUser = await base44.auth.me();
    
    // Find therapist to get their email, or use a default
    const therapists = await base44.entities.Therapist.list();
    const therapist = therapists.find(t => t.id === therapistId) || therapists[0];
    
    // Create notification for the therapist
    if (therapist?.email) {
      await base44.entities.Notification.create({
        recipient_email: therapist.email,
        type: "מסמך חדש",
        title: `קבצים חדשים מ-${patientName}`,
        message: `${patientName} העלה/ה ${selectedFiles.length} קבצים:\n${uploadedFiles.map(f => `• ${f.name}`).join('\n')}\n\n${notes ? `הערות: ${notes}` : ''}`,
        priority: "בינונית",
        related_entity_type: "Patient",
        related_entity_id: patientId
      });
    }

    setIsUploading(false);
    
    if (onSuccess) {
      onSuccess();
    }
    
    alert(`${selectedFiles.length} קבצים הועלו בהצלחה! ✅`);
    onClose();
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <ImageIcon className="w-6 h-6 text-blue-500" />;
    }
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-teal-800 flex items-center gap-2">
            <Upload className="w-7 h-7" />
            העלאת קבצים למטפל
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4">
            <p className="text-sm text-teal-900">
              <File className="w-4 h-4 inline ml-1" />
              העלה תמונות, מסמכים רפואיים, תוצאות בדיקות וכל מידע רלוונטי נוסף
            </p>
          </div>

          <div>
            <Label htmlFor="file_upload" className="text-lg font-semibold mb-2 block">
              בחר קבצים
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
              <Input
                id="file_upload"
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <label htmlFor="file_upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">לחץ לבחירת קבצים</p>
                <p className="text-sm text-gray-500 mt-1">תמונות, PDF, Word</p>
              </label>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div>
              <Label className="mb-2 block">קבצים שנבחרו ({selectedFiles.length})</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <Card key={index} className="border-2 border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.name)}
                          <div>
                            <p className="font-semibold text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {uploadProgress[index]?.status === 'uploading' && (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          )}
                          {uploadProgress[index]?.status === 'done' && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                          {!isUploading && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes">הערות (אופציונלי)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הוסף הערות או הסברים על הקבצים"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isUploading}
            >
              ביטול
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              className="flex-1 bg-gradient-to-l from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
              disabled={isUploading || selectedFiles.length === 0}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  מעלה {Object.values(uploadProgress).filter(p => p.status === 'done').length}/{selectedFiles.length}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 ml-2" />
                  העלה {selectedFiles.length} קבצים
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}