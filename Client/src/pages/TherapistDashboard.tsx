import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Video,
  User,
  Settings,
  CheckCircle2,
  AlertCircle,
  Filter,
  Users,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// NOTE: api is not imported, but its functionality is included below via fetch

// Define Types for our Data
interface Therapist {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  profilePicture?: string;
  school?: string;
}

interface Appointment {
  _id: string;
  date: string;
  status: "available" | "booked" | "completed";
  patientId?: {
    _id: string;
    name: string;
    email: string;
  };
}

const TherapistDashboard = () => {
  const [dateFilter, setDateFilter] = useState("all");
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH REAL DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 1. Get Token
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          // Navigate to login if needed
          return;
        }

        // 2. Define Headers (Authentication)
        const headers = {
          "Content-Type": "application/json",
          token: token,
        };

        // 3. Determine Base URL (The Fix for Deployment)
        // This relies on VITE_API_URL being set in Render
        const BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000";

        // 4. Fetch Doctor Profile & Slots
        // We prepend the absolute BASE_URL to the relative paths
        const [userRes, slotsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/doctor/me`, { headers }),
          fetch(`${BASE_URL}/api/doctor/my-slots`, { headers }),
        ]);

        if (userRes.status === 401 || slotsRes.status === 401) {
          localStorage.removeItem("token");
          // window.location.href = "/login"; // Use navigate if possible, or force reload
          window.location.reload();
          return;
        }

        if (!userRes.ok || !slotsRes.ok) {
          throw new Error("Veri çekilemedi");
        }

        const userData = await userRes.json();
        const slotsData = await slotsRes.json();

        setTherapist(userData);
        setAppointments(slotsData);
      } catch (error) {
        console.error("Dashboard Data Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- FILTERING LOGIC ---
  // Only show appointments that are BOOKED (waiting for the doctor)
  // We filter out 'available' (empty slots) and 'completed' (past history) for the main list
  const incomingAppointments = appointments.filter(
    (apt) => apt.status === "booked" && apt.patientId
  );

  // --- CALCULATE STATS ---
  const totalPatients = new Set(
    appointments.filter((a) => a.patientId).map((a) => a.patientId?._id)
  ).size;

  const pendingCount = incomingAppointments.length;
  const completedCount = appointments.filter(
    (a) => a.status === "completed"
  ).length;

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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!therapist) return null;

  return (
    <>
      <Helmet>
        <title>Terapist Paneli - VolunTherapy</title>
      </Helmet>

      <Layout>
        <div className="bg-gradient-to-b from-secondary/30 to-background py-8 md:py-12">
          <div className="container-therapeutic">
            {/* --- WELCOME SECTION --- */}
            <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary to-accent/30 p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  {/* Profile Picture */}
                  <img
                    src={
                      therapist.profilePicture ||
                      "https://i.pravatar.cc/150?img=11"
                    } // Fallback image
                    alt={therapist.name}
                    className="h-16 w-16 rounded-xl object-cover shadow-medium bg-white"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                      Hoş geldin, {therapist.name.split(" ")[0]}! 👋
                    </h1>
                    <div className="mt-1 flex items-center gap-2">
                      {therapist.isVerified ? (
                        <Badge className="bg-accent text-accent-foreground">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Doğrulanmış Terapist
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        >
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Doğrulama Bekliyor
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="therapeutic-secondary" asChild>
                    <Link to="/settings/availability">
                      <Settings className="mr-2 h-4 w-4" />
                      Müsaitlik Ayarla
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* --- STATS SECTION --- */}
            <div className="mb-8 grid gap-4 md:grid-cols-4">
              {/* Total Patients */}
              <div className="card-therapeutic p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {totalPatients}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Toplam Danışan
                    </p>
                  </div>
                </div>
              </div>

              {/* Pending Appointments */}
              <div className="card-therapeutic p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                    <Calendar className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {pendingCount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Bekleyen Randevu
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Sessions (Completed) */}
              <div className="card-therapeutic p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                    <Video className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {completedCount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tamamlanan Seans
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating (Hardcoded for Hackathon as backend doesn't support it yet) */}
              <div className="card-therapeutic p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">5.0</p>
                    <p className="text-sm text-muted-foreground">
                      Ortalama Puan
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- APPOINTMENTS LIST --- */}
            <div className="card-therapeutic p-6">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Gelen Randevular
                </h2>
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Tarih Filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="today">Bugün</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                {incomingAppointments.length > 0 ? (
                  incomingAppointments.map((appointment) => {
                    const { date, time } = formatDateTime(appointment.date);
                    return (
                      <div
                        key={appointment._id}
                        className="flex flex-col gap-4 rounded-xl bg-muted/30 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                            <User className="h-6 w-6 text-secondary-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {appointment.patientId?.name || "İsimsiz Danışan"}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {time}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Since status is 'booked', we show Start Call button directly */}
                          <Button variant="therapeutic" size="sm" asChild>
                            <Link to={`/video-call/${appointment._id}`}>
                              <Video className="mr-1 h-4 w-4" />
                              Görüşmeye Başla
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center">
                    <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      Şu an bekleyen randevunuz bulunmuyor.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      (Müsaitlik ekleyerek danışanların sizi görmesini sağlayın)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* --- VERIFICATION NOTICE --- */}
            {!therapist.isVerified && (
              <div className="mt-6 rounded-xl bg-yellow-50 border border-yellow-200 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">
                      Doğrulama Bekliyor
                    </p>
                    <p className="mt-1 text-sm text-yellow-700">
                      Hesabınız şu an inceleniyor. Doğrulama tamamlandığında tüm
                      özelliklere erişebileceksiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default TherapistDashboard;
