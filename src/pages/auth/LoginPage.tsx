import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Users
} from 'lucide-react';
import { dbStore } from '../../services/dbStore';
import { INITIAL_ADMIN_ID, INITIAL_MENTOR_ID } from '../../lib/mockData';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your NMAMIT email address');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await login(email, password);
      success('Logged in successfully', 'Welcome back');
      
      const user = dbStore.getProfiles().find(p => p.email.toLowerCase() === email.trim().toLowerCase());
      if (from) {
        navigate(from, { replace: true });
      } else if (user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user?.role === 'mentor') {
        navigate('/mentor/dashboard', { replace: true });
      } else {
        navigate('/mentee/dashboard', { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials. Please verify your email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword('NmamitDemo#2026');
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await login(demoEmail, 'NmamitDemo#2026');
      success(`Logged in as ${demoRole}`, 'Demonstration Persona Active');
      if (demoRole === 'Admin') navigate('/admin/dashboard');
      else if (demoRole === 'Mentor') navigate('/mentor/dashboard');
      else navigate('/mentee/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const mentees = dbStore.getAllMentees().slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-nmam-navy-950 to-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* College Logo Badge */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-nmam-navy-800 border border-nmam-teal-500/30 text-white flex items-center justify-center shadow-lg shadow-nmam-teal-500/10">
          <Building2 className="w-8 h-8 text-nmam-teal-400" />
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          NMAMIT, Nitte
        </h1>
        <p className="mt-1 text-sm font-medium text-nmam-teal-300">
          Mentor–Mentee Management Portal
        </p>
        <p className="text-xs text-slate-400 mt-1">
          NMAM Institute of Technology &bull; Autonomous Institution
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-800/80 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-md">
          <CardContent className="p-6 sm:p-8">
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  NMAMIT Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. anusha.mentor@nmamit.nitte.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nmam-teal-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-nmam-teal-400 hover:text-nmam-teal-300 transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-nmam-teal-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="teal"
                className="w-full py-2.5 font-semibold text-sm shadow-md"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Portal
              </Button>
            </form>

            {/* Quick Demo Personas (No guessing required for evaluators) */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-nmam-teal-400" />
                  Quick Demo Access
                </span>
                <span className="text-[10px] text-slate-500">1-click login</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {/* Admin button */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin@nmamit.nitte.edu', 'Admin')}
                  className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs transition text-left"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-semibold text-slate-200">Administrator</div>
                      <div className="text-[11px] text-slate-400">admin@nmamit.nitte.edu</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-purple-300 font-medium bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50">
                    Admin Role
                  </span>
                </button>

                {/* Mentor Anusha */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('anusha.mentor@nmamit.nitte.edu', 'Mentor')}
                  className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs transition text-left"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-sky-400" />
                    <div>
                      <div className="font-semibold text-slate-200">Mentor — Anusha</div>
                      <div className="text-[11px] text-slate-400">anusha.mentor@nmamit.nitte.edu</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-sky-300 font-medium bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
                    Mentor Role
                  </span>
                </button>

                {/* Mentee (Riya Ann) */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('riya.ann.demo@nmamit.nitte.edu', 'Mentee')}
                  className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs transition text-left"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-slate-200">Mentee — Riya Ann</div>
                      <div className="text-[11px] text-slate-400">Assigned to Anusha &bull; Sem 5</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                    Mentee Role
                  </span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500">
          NMAMIT Autonomous &bull; Affiliated to Nitte (Deemed to be University)
        </p>
      </div>
    </div>
  );
};
