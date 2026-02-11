import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Dumbbell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la ruta de retorno si viene del ProtectedRoute
  const from = location.state?.from || "/";

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de campos vacíos
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo electrónico",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu contraseña",
        variant: "destructive",
      });
      return;
    }

    // Validación de formato de email
    if (!validateEmail(email)) {
      toast({
        title: "Error",
        description: "Por favor ingresa un correo electrónico válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });
      navigate(from);
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: error instanceof Error ? error.message : "Credenciales incorrectas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Power<span className="text-primary">Fit</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Iniciar sesión
          </h1>
          <p className="text-muted-foreground mb-8">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input-field"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-12">
            <h2 className="text-4xl font-bold mb-4">
              Potencia tu <span className="text-primary">rendimiento</span>
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              Accede a tu cuenta y descubre los mejores suplementos para alcanzar tus metas fitness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
