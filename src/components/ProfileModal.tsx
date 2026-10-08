import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, User, Building2, Save, RefreshCw } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

const AVATAR_PRESETS = [
  { color: '#10b981', label: 'Verde' },
  { color: '#3b82f6', label: 'Azul' },
  { color: '#a855f7', label: 'Morado' },
  { color: '#f59e0b', label: 'Ámbar' },
  { color: '#ef4444', label: 'Rojo' },
];

function iconAvatarDataUrl(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
    <rect width="150" height="150" rx="75" fill="${color}22"/>
    <circle cx="75" cy="58" r="28" fill="${color}"/>
    <path d="M25 135c0-30 22-50 50-50s50 20 50 50" fill="${color}"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone, avatarUrl: avatarUrl || null })
      });
      const data = await res.json();
      if (data.success) {
        onProfileUpdated(data.user);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
      } else {
        setError(data.error || 'No se pudo actualizar el perfil');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <span>Mi Perfil</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {success && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-semibold">
              Perfil actualizado correctamente.
            </div>
          )}
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg font-semibold">
              {error}
            </div>
          )}

          {/* Avatar preview + presets */}
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl || iconAvatarDataUrl('#10b981')}
              alt="avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
            />
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 block mb-1">Ícono de perfil</label>
              <div className="flex gap-1.5">
                {AVATAR_PRESETS.map(p => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => setAvatarUrl(iconAvatarDataUrl(p.color))}
                    className="w-7 h-7 rounded-full border-2 border-white shadow ring-1 ring-slate-200 cursor-pointer"
                    style={{ backgroundColor: p.color }}
                    title={p.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nombre</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Apellido</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {user.company && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Empresa (solo lectura)
              </span>
              {user.company} · NIT/CC: {user.documentId} · {user.city}
            </div>
          )}

          <div className="text-[11px] text-slate-400">
            Correo: {user.email} (no se puede cambiar aquí)
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};