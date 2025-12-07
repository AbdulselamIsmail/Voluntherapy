import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api"; // <--- 1. IMPORT THIS

const ClientLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 2. Use 'api.post' instead of 'fetch'
      // This automatically uses the VITE_API_URL defined in api.js
      const response = await api.post("/auth/login", { email, password });

      // 3. Get data (Axios puts the response body in .data)
      const data = response.data;

      // 4. Save Token AND Role
      localStorage.setItem("token", data.token);

      // Force role to 'patient' for client login to ensure correct routing
      localStorage.setItem("role", "patient");

      // 5. Success Feedback
      toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");

      // 6. Redirect to Client Dashboard
      setTimeout(() => {
        navigate("/dashboard/client");
      }, 500);
    } catch (error: any) {
      console.error(error);
      // Handle Axios error message (error.response.data.msg is where backend sends errors)
      const errorMessage =
        error.response?.data?.msg ||
        "Giriş başarısız. Bilgilerinizi kontrol edin.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Danışan Girişi - VolunTherapy</title>
        <meta
          name="description"
          content="VolunTherapy'ye danışan olarak giriş yapın."
        />
      </Helmet>

      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfaya Dön
            </Link>

            <div className="mb-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-soft">
                  <Heart className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  Volun<span className="text-primary">Therapy</span>
                </span>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">
                Danışan Girişi
              </h1>
              <p className="mt-2 text-muted-foreground">
                Hesabınıza giriş yaparak randevularınızı yönetin.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">E-posta Adresi</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    className="pl-10"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Şifre</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Beni hatırla
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Şifremi Unuttum
                </Link>
              </div>

              <Button
                type="submit"
                variant="therapeutic"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  veya
                </span>
              </div>
            </div>

            <Button variant="edevlet" className="w-full" size="lg" asChild>
              <Link to="/login/edevlet">
                <img
                  src="https://www.turkiye.gov.tr/images/logo-tr.png"
                  alt=""
                  className="h-5 w-5 rounded bg-white p-0.5"
                />
                e-Devlet ile Giriş
              </Link>
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              * e-Devlet entegrasyonu backend gerektirir
            </p>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Hesabınız yok mu?{" "}
              <Link
                to="/register/client"
                className="text-primary hover:underline font-medium"
              >
                Kayıt Olun
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Decorative */}
        <div className="hidden bg-gradient-to-br from-secondary via-accent/50 to-primary/10 lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:p-12">
          <div className="max-w-md text-center">
            <div className="mb-8 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 animate-float">
                <Heart className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Hoş Geldiniz
            </h2>
            <p className="text-muted-foreground">
              Profesyonel psikolojik destek için ilk adımı attınız. Giriş
              yaparak randevularınızı yönetebilir, terapistlerinizle iletişim
              kurabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientLogin;
