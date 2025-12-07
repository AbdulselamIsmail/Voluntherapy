import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Video,
  BookOpen,
  CalendarPlus,
  X,
  CheckCircle2,
  AlertCircle,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Signal,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// --- TYPES (Define the shape of your Real DB Data) ---
interface Therapist {
  id: string;
  name: string;
  specialty: string;
  profilePicture: string;
}

interface Appointment {
  id: string;
  therapistId: string;
  therapist: Therapist;
  dateTime: string; // ISO String from DB
  status: "confirmed" | "pending" | "cancelled" | "completed" | "booked";
  meetingLink?: string; // The REAL link from your DB
}

interface UserProfile {
  name: string;
  email: string;
}

const ClientDashboard = () => {
  // State for Real Data
  const [user, setUser] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [videoLobbyOpen, setVideoLobbyOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // Video Lobby State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  // --- 1. FETCH REAL DATA FROM API (CORRECTED) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Get the token
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Oturum bulunamadı. Lütfen giriş yapın.");
          setLoading(false);
          // window.location.href = "/login"; // Use if navigation is critical
          return;
        }

        // 2. Determine Base URL (THE FIX)
        const BASE_API_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000";

        // 3. Prepare Headers
        const headers = {
          "Content-Type": "application/json",
          token: token, // Authentication token
        };

        // 4. Send Request with ABSOLUTE URLs
        const [userRes, appointmentsRes] = await Promise.all([
          fetch(`${BASE_API_URL}/api/patient/me`, { headers }), // 👈 FIX
          fetch(`${BASE_API_URL}/api/patient/appointments`, { headers }), // 👈 FIX
        ]);

        // 5. Handle 401 specifically (Token expired or invalid)
        if (userRes.status === 401 || appointmentsRes.status === 401) {
          localStorage.removeItem("token");
          // NOTE: In production, redirect the user here.
          // window.location.href = "/login";
          throw new Error("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
        }

        if (!userRes.ok || !appointmentsRes.ok) {
          throw new Error("Veri çekilemedi");
        }

        const userData = await userRes.json();
        const appointmentsData = await appointmentsRes.json();

        setUser(userData);
        setAppointments(appointmentsData);
      } catch (error: any) {
        console.error("API Error:", error);
        toast.error(error.message || "Veriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Logic: Find the first confirmed appointment that hasn't passed yet (Active Session)
  const activeSession = appointments.find(
    (a) =>
      a.status === "confirmed" &&
      new Date(a.dateTime) > new Date(Date.now() - 60 * 60 * 1000) // Shows if within last hour
  );

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      // TODO: Call your real Cancel API here
      // You would need to use the absolute URL here too!
      // const BASE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      // await fetch(`${BASE_API_URL}/api/appointments/${selectedAppointment.id}/cancel`, { method: 'POST' });

      // Optimistic UI update
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? { ...apt, status: "cancelled" }
            : apt
        )
      );

      toast.success("Randevunuz iptal edildi.");
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      toast.error("İptal işlemi başarısız oldu.");
    }
  };

  const handleJoinSession = () => {
    if (!selectedAppointment?.meetingLink) {
      toast.error("Görüşme linki bulunamadı.");
      return;
    }

    toast.info("Görüşme odasına yönlendiriliyorsunuz...");
    setVideoLobbyOpen(false);

    // --- 2. NAVIGATE TO REAL DB LINK ---
    window.open(selectedAppointment.meetingLink, "_blank");
  };

  const openVideoLobby = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setVideoLobbyOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Onaylandı
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-500/15 text-amber-700 border-amber-200"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            Beklemede
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="destructive"
            className="bg-red-500/15 text-red-700 border-red-200"
          >
            <X className="mr-1 h-3 w-3" />
            İptal Edildi
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // --- LOADING SCREEN ---
  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Danışan Paneli - VolunTherapy</title>
      </Helmet>

      <Layout>
        <div className="bg-gradient-to-b from-secondary/30 to-background py-8 md:py-12 min-h-screen">
          <div className="container max-w-6xl mx-auto px-4">
            {/* Header Section */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                  Hoş geldin, {user?.name.split(" ")[0]}! 👋
                </h1>
                <p className="mt-2 text-muted-foreground italic text-sm">
                  "Bugün kendin için harika bir şey yap."
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="default"
                  className="bg-primary hover:bg-primary/90 shadow-md"
                  asChild
                >
                  <Link to="/book">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Yeni Randevu
                  </Link>
                </Button>
              </div>
            </div>

            {/* --- ACTIVE SESSION CARD (Real Data) --- */}
            {activeSession && (
              <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl ring-1 ring-white/20">
                <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <Video className="h-8 w-8 text-white animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white/20 text-white hover:bg-white/30 border-none">
                          <Signal className="mr-1 h-3 w-3" />
                          Canlı Seans
                        </Badge>
                        <span className="text-white/80 text-sm">
                          Şimdi Başlıyor
                        </span>
                      </div>
                      <h3 className="mt-1 text-xl font-bold text-white">
                        {activeSession.therapist?.name} ile Terapi
                      </h3>
                      <p className="text-white/90 text-sm opacity-90">
                        Görüşme odası hazır. Katılmak için lütfen butona
                        tıklayın.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="whitespace-nowrap shadow-lg font-semibold"
                    onClick={() => openVideoLobby(activeSession)}
                  >
                    Görüşmeye Katıl
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Actions Grid */}
            <div className="mb-8 grid gap-4 md:grid-cols-4">
              <Link
                to="/book"
                className="group flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <CalendarPlus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Randevu Al</p>
                  <p className="text-xs text-muted-foreground">Terapist bul</p>
                </div>
              </Link>

              <Link
                to="/appointments"
                className="group flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-secondary/80">
                  <Calendar className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Randevularım</p>
                  <p className="text-xs text-muted-foreground">
                    {appointments.length} aktif randevu
                  </p>
                </div>
              </Link>

              <Link
                to="/blog"
                className="group flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent transition-colors group-hover:bg-accent/80">
                  <BookOpen className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Blog & Kaynak</p>
                  <p className="text-xs text-muted-foreground">
                    Okumalar yapın
                  </p>
                </div>
              </Link>

              <div
                className="group flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer"
                onClick={() =>
                  toast.info("Acil durum hattına yönlendiriliyorsunuz...")
                }
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 transition-colors group-hover:bg-red-200">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Acil Destek</p>
                  <p className="text-xs text-muted-foreground">7/24 Yardım</p>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments List (Real Data) */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Yaklaşan Randevular
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/appointments">Tümünü Gör</Link>
                </Button>
              </div>

              <div className="space-y-4">
                {appointments.length > 0 ? (
                  appointments.slice(0, 5).map((appointment) => {
                    const { date, time } = formatDateTime(appointment.dateTime);

                    // Check if the appointment is active (confirmed/booked) AND has a link
                    const isConfirmed =
                      appointment.status === "confirmed" ||
                      appointment.status === "booked";
                    const hasLink =
                      appointment.meetingLink &&
                      appointment.meetingLink.length > 0;

                    return (
                      <div
                        key={appointment.id}
                        className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50 md:flex-row md:items-center md:justify-between"
                      >
                        {/* Therapist Info Section */}
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              appointment.therapist?.profilePicture ||
                              "/placeholder-avatar.jpg"
                            }
                            alt={appointment.therapist?.name}
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-background"
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              {appointment.therapist?.name}
                            </p>
                            <p className="text-sm text-muted-foreground mb-1">
                              {appointment.therapist?.specialty}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 bg-background px-2 py-1 rounded-md border">
                                <Calendar className="h-3 w-3" /> {date}
                              </span>
                              <span className="flex items-center gap-1 bg-background px-2 py-1 rounded-md border">
                                <Clock className="h-3 w-3" /> {time}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status & Actions Section */}
                        <div className="flex items-center justify-between gap-3 md:justify-end">
                          {getStatusBadge(appointment.status)}

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {/* JOIN BUTTON (Updated) */}
                            {isConfirmed && hasLink && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="hidden md:flex bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                                asChild // Allows the <a> tag to behave like a button
                              >
                                <a
                                  href={appointment.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Video className="mr-2 h-3 w-3" />
                                  Katıl
                                </a>
                              </Button>
                            )}

                            {/* CANCEL BUTTON */}
                            {appointment.status !== "cancelled" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setCancelDialogOpen(true);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Empty State
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Calendar className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">
                      Henüz randevunuz yok
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Uzman terapistlerimizle görüşmek için ilk adımınızı atın.
                    </p>
                    <Button variant="default" asChild>
                      <Link to="/book">Randevu Al</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- VIDEO LOBBY DIALOG (Updated logic) --- */}
        <Dialog open={videoLobbyOpen} onOpenChange={setVideoLobbyOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Görüşme Hazırlığı</DialogTitle>
              <DialogDescription>
                Görüşmeye katılmadan önce kamera ve mikrofon ayarlarınızı
                kontrol edebilirsiniz.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6 py-4">
              {/* Fake Video Preview Area */}
              <div className="relative aspect-video w-full rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center">
                {isCamOn ? (
                  <div className="relative h-full w-full">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
                      alt="Kamera Önizleme"
                      className="h-full w-full object-cover opacity-90"
                    />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-white font-medium shadow-black drop-shadow-md">
                        Kamera Aktif
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <CameraOff className="h-10 w-10" />
                    <span className="text-sm">Kamera Kapalı</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="mic-mode"
                    checked={isMicOn}
                    onCheckedChange={setIsMicOn}
                  />
                  <Label
                    htmlFor="mic-mode"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {isMicOn ? (
                      <Mic className="h-4 w-4 text-green-600" />
                    ) : (
                      <MicOff className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {isMicOn ? "Mikrofon Açık" : "Mikrofon Kapalı"}
                    </span>
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="cam-mode"
                    checked={isCamOn}
                    onCheckedChange={setIsCamOn}
                  />
                  <Label
                    htmlFor="cam-mode"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {isCamOn ? (
                      <Camera className="h-4 w-4 text-green-600" />
                    ) : (
                      <CameraOff className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {isCamOn ? "Kamera Açık" : "Kamera Kapalı"}
                    </span>
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setVideoLobbyOpen(false)}
              >
                Vazgeç
              </Button>
              <Button onClick={handleJoinSession} className="gap-2">
                <Video className="h-4 w-4" />
                Görüşmeye Başla
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Randevuyu İptal Et</DialogTitle>
              <DialogDescription>
                Bu randevuyu iptal etmek istediğinizden emin misiniz? Bu işlem
                geri alınamaz.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setCancelDialogOpen(false)}
              >
                Vazgeç
              </Button>
              <Button variant="destructive" onClick={handleCancelAppointment}>
                İptal Et
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    </>
  );
};

export default ClientDashboard;
