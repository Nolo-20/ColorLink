import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, Circle, RefreshCw, KeyRound, HelpCircle } from 'lucide-react';

interface ResetPasswordScreenProps {
  token: string;
  onGoToLogin: () => void;
  onBackToStore: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  token,
  onGoToLogin,
  onBackToStore
}) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [done, setDone] = useState(false);

  // Política de seguridad: se evalúa en vivo mientras el cliente escribe
  const rules = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Al menos una letra mayúscula', ok: /[A-Z]/.test(password) },
    { label: 'Al menos un número', ok: /[0-9]/.test(password) },
    { label: 'Al menos un carácter especial (! @ # $ % ...)', ok: /[^A-Za-z0-9]/.test(password) }
  ];
  const allRulesOk = rules.every(r => r.ok);
  const matches = password.length > 0 && password === confirm;
  const canSubmit = allRulesOk && matches && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
      } else {
        setErrorMessage(data.error || 'No se pudo restablecer la contraseña.');
      }
    } catch {
      setErrorMessage('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 sm:p-10">

        {done ? (
          <div className="text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-[#002855] uppercase tracking-tight">¡Contraseña actualizada!</h2>
              <p className="text-sm text-slate-600">
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
            </div>
            <button
              type="button"
              onClick={onGoToLogin}
              className="w-full py-3.5 px-4 bg-[#002855] hover:bg-[#001D3D] text-white font-black text-sm rounded-lg shadow-md uppercase tracking-wider cursor-pointer"
            >
              Iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center text-center mb-2">
              <div className="w-12 h-12 rounded-full border-2 border-[#002855] text-[#002855] flex items-center justify-center mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-[#002855] uppercase tracking-tight">Nueva contraseña</h2>
              <p className="text-sm text-slate-600 mt-1">Crea una contraseña segura para tu cuenta</p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
                <HelpCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
                autoComplete="new-password"
                className="w-full px-3.5 py-3 bg-white text-slate-800 placeholder-slate-400 rounded-lg text-sm border border-slate-300 focus:outline-none focus:border-[#002855] focus:ring-1 focus:ring-[#002855] pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirmar contraseña"
              autoComplete="new-password"
              className="w-full px-3.5 py-3 bg-white text-slate-800 placeholder-slate-400 rounded-lg text-sm border border-slate-300 focus:outline-none focus:border-[#002855] focus:ring-1 focus:ring-[#002855]"
              required
            />

            {confirm.length > 0 && !matches && (
              <p className="text-xs text-red-600 font-semibold">Las contraseñas no coinciden.</p>
            )}

            <ul className="space-y-1.5 bg-slate-50 border border-slate-200 rounded-xl p-3">
              {rules.map(rule => (
                <li
                  key={rule.label}
                  className={`flex items-center gap-2 text-xs font-semibold ${rule.ok ? 'text-emerald-700' : 'text-slate-500'}`}
                >
                  {rule.ok
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    : <Circle className="w-4 h-4 text-slate-300 shrink-0" />}
                  <span>{rule.label}</span>
                </li>
              ))}
            </ul>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3.5 px-4 bg-[#002855] hover:bg-[#001D3D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-lg shadow-md uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Guardar contraseña</span>}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onBackToStore}
                className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
              >
                Volver a la tienda
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
