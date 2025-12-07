import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  User as UserIcon,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Types matching your Backend Response
interface Doctor {
  _id: string;
  name: string;
  email: string;
  sex: string;
  profilePicture?: string;
  specialty?: string;
}

interface Slot {
  _id: string;
  date: string; // ISO String
  status: string;
  doctorId: Doctor;
}

const BookAppointment = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSex, setSelectedSex] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Real Data State
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Booking State
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingStep, setBookingStep] = useState<
    "list" | "confirm" | "success"
  >("list");
  const [isBooking, setIsBooking] = useState(false);

  // --- 1. FETCH REAL SLOTS (CORRECTED) ---
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        // 1. Get Token and Base URL
        const token = localStorage.getItem("token");
        const BASE_API_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000"; // FIX

        if (!token) {
          toast.error("Randevu almak için giriş yapmalısınız.");
          navigate("/login/client");
          return;
        }

        // 2. Fetch with Headers
        const res = await fetch(`${BASE_API_URL}/api/patient/available-slots`, {
          // 👈 FIX: ABSOLUTE URL
          headers: {
            "Content-Type": "application/json",
            token: token, // <--- FIX: Send token manually
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          toast.error("Oturum süreniz doldu.");
          navigate("/login/client");
          return;
        }

        if (!res.ok) throw new Error("Veri çekilemedi");

        const data = await res.json();
        setSlots(data);
      } catch (error) {
        console.error("Error fetching slots:", error);
        toast.error("Randevu saatleri yüklenirken hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlots();
  }, [navigate]);

  // --- 2. FILTER LOGIC ---
  const filteredSlots = slots.filter((slot) => {
    // Safety check in case doctorId is null (deleted doctor)
    if (!slot.doctorId) return false;

    const docName = slot.doctorId.name?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    // 1. Filter by Search (Doctor Name)
    const matchesSearch = docName.includes(searchLower);

    // 2. Filter by Sex
    const matchesSex =
      selectedSex === "all" || slot.doctorId.sex === selectedSex;

    // 3. Filter by Date
    let matchesDate = true;
    if (selectedDate) {
      const slotDateString = new Date(slot.date).toISOString().split("T")[0];
      matchesDate = slotDateString === selectedDate;
    }

    return matchesSearch && matchesSex && matchesDate;
  });

  // --- 3. BOOKING HANDLERS (CORRECTED) ---
  const handleSelectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    setBookingStep("confirm");
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setIsBooking(true);

    try {
      const token = localStorage.getItem("token");
      const BASE_API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000"; // FIX

      if (!token) {
        navigate("/login/client");
        return;
      }

      // Send Request with Token
      const res = await fetch(`${BASE_API_URL}/api/patient/book`, {
        // 👈 FIX: ABSOLUTE URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token, // <--- FIX: Send token manually
        },
        body: JSON.stringify({
          slotId: selectedSlot._id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Randevu alınamadı.");
      }

      setBookingStep("success");
      toast.success("Randevu başarıyla alındı!");
    } catch (error: any) {
      toast.error(error.message || "Randevu alınamadı.");
      setBookingStep("list");
    } finally {
      setIsBooking(false);
    }
  };

  const handleReset = () => {
    setSelectedSlot(null);
    setBookingStep("list");
    // Refresh to remove the booked slot from the list
    window.location.reload();
  };

  const formatDateTime = (isoDate: string) => {
    const d = new Date(isoDate);
    return {
      date: d.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      dayName: d.toLocaleDateString("tr-TR", { weekday: "long" }),
    };
  };

  return (
    <>
      <Helmet>
        <title>Randevu Al - VolunTherapy</title>
      </Helmet>

      <Layout>
        <div className="bg-gradient-to-b from-secondary/50 to-background py-12 md:py-16 min-h-screen">
          <div className="container-therapeutic">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="section-title mb-4">Randevu Al</h1>
              <p className="section-subtitle mx-auto">
                Müsait terapistleri görüntüleyin ve size uygun saati seçin.
              </p>
            </div>

            {/* Filters */}
            <div className="mb-8 rounded-xl bg-card p-4 shadow-soft md:p-6 border border-border/50">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                {/* Search Bar */}
                <div className="flex-1">
                  <Label htmlFor="search" className="mb-1.5 block text-sm">
                    Doktor Ara
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Dr. İsim Soyisim..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Date Filter */}
                <div className="w-full md:w-48">
                  <Label htmlFor="date" className="mb-1.5 block text-sm">
                    Tarih
                  </Label>
                  <div className="relative">
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full cursor-pointer"
                    />
                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate("")}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sex Filter */}
                <div className="w-full md:w-40">
                  <Label htmlFor="sex" className="mb-1.5 block text-sm">
                    Cinsiyet
                  </Label>
                  <Select value={selectedSex} onValueChange={setSelectedSex}>
                    <SelectTrigger id="sex">
                      <SelectValue placeholder="Cinsiyet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="female">Kadın</SelectItem>
                      <SelectItem value="male">Erkek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : filteredSlots.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl p-8 border border-border/50">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p>Aradığınız kriterlere uygun randevu bulunamadı.</p>
                {selectedDate && (
                  <p className="text-sm mt-2">Seçilen tarihte müsaitlik yok.</p>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSlots.map((slot) => {
                  const { date, time, dayName } = formatDateTime(slot.date);

                  return (
                    <div
                      key={slot._id}
                      className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-medium border border-border/50"
                    >
                      {/* Doctor Info */}
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={
                            slot.doctorId.profilePicture ||
                            "https://github.com/shadcn.png"
                          }
                          alt={slot.doctorId.name}
                          className="h-16 w-16 rounded-xl object-cover shadow-sm bg-gray-100"
                        />
                        <div>
                          <h3 className="font-bold text-lg text-foreground leading-tight">
                            {slot.doctorId.name}
                          </h3>
                          <p className="text-sm text-primary font-medium mt-1">
                            {slot.doctorId.specialty || "Gönüllü Terapist"}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <UserIcon className="h-3 w-3" />
                            {slot.doctorId.sex === "male" ? "Erkek" : "Kadın"}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/50 my-4" />

                      {/* Date/Time Info */}
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">
                            {date}
                          </span>
                          <span className="text-xs">({dayName})</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground">
                            {time}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleSelectSlot(slot)}
                        className="w-full"
                        variant="therapeutic"
                      >
                        Randevu Al
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* --- CONFIRMATION MODAL --- */}
            <Dialog
              open={bookingStep === "confirm"}
              onOpenChange={() => setBookingStep("list")}
            >
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Randevuyu Onayla</DialogTitle>
                  <DialogDescription>
                    Aşağıdaki randevuyu almak üzeresiniz.
                  </DialogDescription>
                </DialogHeader>

                {selectedSlot && (
                  <div className="space-y-4 py-4">
                    <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4 border border-border/50">
                      <img
                        src={
                          selectedSlot.doctorId.profilePicture ||
                          "https://github.com/shadcn.png"
                        }
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold">
                          {selectedSlot.doctorId.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(selectedSlot.date).date} -{" "}
                          {formatDateTime(selectedSlot.date).time}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setBookingStep("list")}
                  >
                    İptal
                  </Button>
                  <Button
                    variant="therapeutic"
                    onClick={handleConfirmBooking}
                    disabled={isBooking}
                  >
                    {isBooking ? "İşleniyor..." : "Onayla ve Bitir"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* --- SUCCESS MODAL --- */}
            <Dialog open={bookingStep === "success"} onOpenChange={handleReset}>
              <DialogContent className="sm:max-w-md text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-center text-xl">
                    Harika!
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    Randevunuz başarıyla oluşturuldu. <br />
                    Görüşme saati geldiğinde panelinizden bağlanabilirsiniz.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6 flex justify-center gap-3">
                  <Button variant="outline" onClick={handleReset}>
                    Kapat
                  </Button>
                  <Button
                    variant="therapeutic"
                    onClick={() => navigate("/dashboard/client")}
                  >
                    Panele Git
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default BookAppointment;
