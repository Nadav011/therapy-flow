import React, { useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera,
  Upload,
  X,
  Check,
  RotateCcw,
  Loader2,
  Eye,
  Footprints,
  User,
  Activity,
  Smile,
  Mail,
  Send
} from "lucide-react";

const IMAGE_TYPES = {
  face: { label: "פנים", icon: User, color: "from-pink-500 to-rose-500" },
  body: { label: "גוף", icon: Activity, color: "from-blue-500 to-cyan-500" },
  eyes: { label: "עיניים", icon: Eye, color: "from-purple-500 to-indigo-500" },
  tongue: { label: "לשון", icon: Smile, color: "from-red-500 to-orange-500" },
  foot_left: { label: "כף רגל שמאל", icon: Footprints, color: "from-green-500 to-teal-500" },
  foot_right: { label: "כף רגל ימין", icon: Footprints, color: "from-green-500 to-teal-500" },
  teeth: { label: "שיניים", icon: Smile, color: "from-cyan-500 to-blue-500" },
  custom: { label: "תמונה נוספת", icon: Camera, color: "from-gray-500 to-gray-600" }
};

export default function ImageCaptureDialog({ 
  open, 
  onClose, 
  imageType = "custom",
  onCapture,
  showEmailOption = false,
  patientName = ""
}) {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const typeInfo = IMAGE_TYPES[imageType] || IMAGE_TYPES.custom;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setIsCameraActive(true); // This will render the video element
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("לא ניתן לגשת למצלמה. נא לאשר גישה למצלמה.");
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Effect to attach stream to video element once it's rendered and active
  React.useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = async () => {
    if (!capturedImage) return;

    setIsUploading(true);
    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `${imageType}_${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Upload to server
      const result = await base44.integrations.Core.UploadFile({ file });
      
      onCapture(imageType, result.file_url);
      handleClose();
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("שגיאה בהעלאת התמונה");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setShowEmailInput(false);
    setEmailAddress("");
    onClose();
  };

  const handleSendEmail = async () => {
    if (!emailAddress || !capturedImage) return;

    setIsSendingEmail(true);
    try {
      // First upload the image
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `${imageType}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const result = await base44.integrations.Core.UploadFile({ file });

      // Send email with the image
      await base44.integrations.Core.SendEmail({
        to: emailAddress,
        subject: `סריקת ${typeInfo.label} - ${patientName || 'מטופל'}`,
        body: `
שלום,

מצורפת סריקת ${typeInfo.label} של ${patientName || 'המטופל'}.

קישור לתמונה: ${result.file_url}

בברכה,
מערכת ניהול מטפלים
        `
      });

      alert('הסריקה נשלחה בהצלחה לאימייל!');
      setShowEmailInput(false);
      setEmailAddress("");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("שגיאה בשליחת האימייל");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${typeInfo.color} flex items-center justify-center text-white`}>
              <typeInfo.icon className="w-5 h-5" />
            </div>
            צילום {typeInfo.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!capturedImage && !isCameraActive && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={startCamera}
                className={`h-32 bg-gradient-to-br ${typeInfo.color} text-white flex-col gap-2`}
              >
                <Camera className="w-10 h-10" />
                <span className="font-bold">צלם תמונה</span>
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="h-32 border-2 border-dashed flex-col gap-2"
              >
                <Upload className="w-10 h-10 text-gray-400" />
                <span className="font-bold text-gray-600">העלה מהגלריה</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {isCameraActive && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
              />
              
              {/* Overlay guides for foot scanning */}
              {(imageType === "foot_left" || imageType === "foot_right") && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-4 border-dashed border-white/50 rounded-3xl w-48 h-80 flex items-center justify-center">
                    <Footprints className="w-20 h-20 text-white/50" />
                  </div>
                </div>
              )}

              {/* Overlay guide for face */}
              {imageType === "face" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-4 border-dashed border-white/50 rounded-full w-64 h-80" />
                </div>
              )}

              {/* Overlay guide for eyes */}
              {imageType === "eyes" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex gap-8">
                    <div className="border-4 border-dashed border-white/50 rounded-full w-24 h-16" />
                    <div className="border-4 border-dashed border-white/50 rounded-full w-24 h-16" />
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="bg-white/80"
                >
                  <X className="w-5 h-5" />
                </Button>
                <Button
                  onClick={capturePhoto}
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${typeInfo.color}`}
                >
                  <Camera className="w-8 h-8" />
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleRetake}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="w-5 h-5 ml-2" />
                  צלם מחדש
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isUploading}
                  className={`flex-1 bg-gradient-to-br ${typeInfo.color}`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      מעלה...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 ml-2" />
                      אשר תמונה
                    </>
                  )}
                </Button>
              </div>

              {/* Email option for foot scans (insoles) */}
              {(imageType === "foot_left" || imageType === "foot_right") && (
                <Card className="border-2 border-green-300 bg-green-50">
                  <CardContent className="p-4">
                    {!showEmailInput ? (
                      <Button
                        onClick={() => setShowEmailInput(true)}
                        className="w-full bg-gradient-to-br from-green-500 to-teal-500"
                      >
                        <Mail className="w-5 h-5 ml-2" />
                        שלח לייצור מדרס
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-green-800">שלח סריקה לייצור מדרס:</p>
                        <input
                          type="email"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          placeholder="הזן כתובת אימייל..."
                          className="w-full border rounded-lg p-2"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowEmailInput(false)}
                            variant="outline"
                            size="sm"
                          >
                            ביטול
                          </Button>
                          <Button
                            onClick={handleSendEmail}
                            disabled={!emailAddress || isSendingEmail}
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {isSendingEmail ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-4 h-4 ml-1" />
                                שלח
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-bold text-blue-800 mb-2">טיפים לצילום {typeInfo.label}:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {imageType === "foot_left" || imageType === "foot_right" ? (
                  <>
                    <li>• הנח את כף הרגל על משטח ישר ובהיר</li>
                    <li>• צלם מלמעלה בזווית ישרה</li>
                    <li>• ודא תאורה טובה ללא צללים</li>
                    <li>• הקפד שכל כף הרגל נראית בתמונה</li>
                  </>
                ) : imageType === "face" ? (
                  <>
                    <li>• צלם בתאורה טבעית</li>
                    <li>• הסתכל ישירות למצלמה</li>
                    <li>• הקפד על רקע נקי</li>
                  </>
                ) : imageType === "eyes" ? (
                  <>
                    <li>• התקרב לאזור העיניים</li>
                    <li>• פקח עיניים לרווחה</li>
                    <li>• ודא תאורה טובה</li>
                  </>
                ) : imageType === "tongue" ? (
                  <>
                    <li>• הוצא לשון בצורה טבעית</li>
                    <li>• צלם באור טבעי</li>
                    <li>• הקפד על פוקוס חד</li>
                  </>
                ) : (
                  <>
                    <li>• ודא תאורה טובה</li>
                    <li>• הקפד על פוקוס חד</li>
                    <li>• צלם מזווית מתאימה</li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}