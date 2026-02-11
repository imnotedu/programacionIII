import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Dumbbell, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/schemas/authSchemas";
import { RegisterData, UserLevel } from "@/types/auth";
import { z } from "zod";

// Tipo para el formulario que incluye confirmPassword
type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  // Configurar react-hook-form con Zod schema
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange" // Validación en tiempo real
  });

  // Observar el valor de password para mostrar indicadores de fortaleza
  const password = watch("password", "");

  // Validación de fortaleza de contraseña para UI (solo informativa)
  const validatePasswordStrength = (password: string): {
    isValid: boolean;
    checks: {
      length: boolean;
      uppercase: boolean;
      lowercase: boolean;
      number: boolean;
    };
  } => {
    const checks = {
      length: password.length >= 6, // Requisito mínimo: 6 caracteres
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };

    // Solo el requisito de longitud es obligatorio
    const isValid = checks.length;

    return { isValid, checks };
  };

  const passwordStrength = validatePasswordStrength(password);

  // Manejador de envío del formulario
  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Todos los usuarios registrados son de nivel "usuario"
      const registerData: RegisterData = {
        email: data.email,
        password: data.password,
        name: data.name,
        level: 'usuario' // Siempre usuario para registros normales
      };
      
      await registerUser(registerData);
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la cuenta",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-12">
            <h2 className="text-4xl font-bold mb-4">
              Únete a <span className="text-primary">PowerFit</span>
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              Crea tu cuenta y comienza tu camino hacia un mejor rendimiento deportivo.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
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
            Crear cuenta
          </h1>
          <p className="text-muted-foreground mb-8">
            Completa el formulario para registrarte
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Campo de Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                placeholder="Tu nombre"
                className="input-field"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Campo de Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="tu@email.com"
                className="input-field"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  disabled={isSubmitting}
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
              
              {/* Indicadores de fortaleza de contraseña */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.checks.length ? (
                      <Check className="w-3 h-3 text-success" />
                    ) : (
                      <X className="w-3 h-3 text-destructive" />
                    )}
                    <span className={passwordStrength.checks.length ? "text-success" : "text-muted-foreground"}>
                      Mínimo 6 caracteres (requerido)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Recomendado para mayor seguridad:</p>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.checks.uppercase ? (
                      <Check className="w-3 h-3 text-success" />
                    ) : (
                      <X className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className={passwordStrength.checks.uppercase ? "text-success" : "text-muted-foreground"}>
                      Una letra mayúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.checks.lowercase ? (
                      <Check className="w-3 h-3 text-success" />
                    ) : (
                      <X className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className={passwordStrength.checks.lowercase ? "text-success" : "text-muted-foreground"}>
                      Una letra minúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.checks.number ? (
                      <Check className="w-3 h-3 text-success" />
                    ) : (
                      <X className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className={passwordStrength.checks.number ? "text-success" : "text-muted-foreground"}>
                      Un número
                    </span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-xs text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Campo de Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
