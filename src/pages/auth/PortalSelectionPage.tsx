import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, GraduationCap, Users, ArrowRight, Sparkles, BookOpen, Compass } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export const PortalSelectionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0D0B12] text-[#F5F3FA] flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden mm-grid-pattern">
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[400px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Side: Brand & Editorial Showcase */}
        <div className="lg:col-span-5 flex flex-col justify-between py-4">
          <div>
            {/* Brand Mark */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-violet-600/30 border border-violet-400/30 select-none">
                M&amp;M
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-[#F5F3FA] block leading-none">
                  M&amp;M
                </span>
                <span className="text-xs text-[#AAA2B8] tracking-wide mt-1 block">
                  Mentor &amp; Mentee
                </span>
              </div>
            </div>

            {/* Subtle Institutional Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191521] border border-[#30263E] text-[11px] font-medium text-[#AAA2B8] mb-6">
              <span className="w-2 h-2 rounded-full bg-violet-400"></span>
              NMAMIT, Nitte &bull; Autonomous
            </div>

            {/* Editorial Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F5F3FA] leading-[1.15]">
              Your academic journey, with the right guidance.
            </h1>

            {/* Supporting Copy */}
            <p className="mt-4 text-sm sm:text-base text-[#AAA2B8] leading-relaxed max-w-lg">
              A dedicated space to track progress, share resources, and build meaningful mentor–mentee connections.
            </p>
          </div>

          {/* Abstract Geometric Graphic & Feature Callouts */}
          <div className="mt-10 pt-8 border-t border-[#30263E]/60 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#191521]/60 border border-[#30263E]/60">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-2.5">
                <Compass className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-[#F5F3FA]">Focused Mentoring</div>
              <p className="text-[11px] text-[#777084] mt-1 leading-snug">
                Personalized guidance and direct academic notes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#191521]/60 border border-[#30263E]/60">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-2.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-[#F5F3FA]">Verified Progress</div>
              <p className="text-[11px] text-[#777084] mt-1 leading-snug">
                Immutable marks audit and curated study materials.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Three Role Selection Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#777084]">
              Select Your Portal
            </span>
            <p className="text-sm text-[#AAA2B8] mt-0.5">
              Choose your institutional role to enter your dedicated environment.
            </p>
          </div>

          {/* 1. Administrator Portal Card */}
          <Link to="/admin/login" className="group block focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded-2xl">
            <Card className="border-[#30263E] bg-[#191521]/90 hover:bg-[#211A2D] hover:border-violet-500/50 hover:shadow-glow-violet-sm transition-all duration-300">
              <CardContent className="p-5 sm:p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-300 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 bg-violet-500/15 px-2 py-0.5 rounded-full border border-violet-500/30">
                        Administration
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-[#F5F3FA] group-hover:text-violet-200 transition-colors">
                      Administrator Portal
                    </h2>
                    <p className="text-xs text-[#AAA2B8] mt-1 leading-relaxed max-w-md">
                      Institutional oversight, mentor assignments, marks audit, access governance, and security audit logs.
                    </p>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-xl bg-[#211A2D] group-hover:bg-violet-600 text-[#AAA2B8] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-all duration-200 self-center">
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 2. Mentor Portal Card */}
          <Link to="/mentor/login" className="group block focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded-2xl">
            <Card className="border-[#30263E] bg-[#191521]/90 hover:bg-[#211A2D] hover:border-indigo-500/50 hover:shadow-glow-violet-sm transition-all duration-300">
              <CardContent className="p-5 sm:p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-500/30">
                        Faculty Mentor
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-[#F5F3FA] group-hover:text-indigo-200 transition-colors">
                      Mentor Portal
                    </h2>
                    <p className="text-xs text-[#AAA2B8] mt-1 leading-relaxed max-w-md">
                      Supervised cohort workspace for Mentor Anusha: student dossiers, progress tracking, study recommendations, and private notes.
                    </p>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-xl bg-[#211A2D] group-hover:bg-indigo-600 text-[#AAA2B8] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-all duration-200 self-center">
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 3. Mentee Portal Card */}
          <Link to="/mentee/login" className="group block focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded-2xl">
            <Card className="border-[#30263E] bg-[#191521]/90 hover:bg-[#211A2D] hover:border-emerald-500/50 hover:shadow-glow-violet-sm transition-all duration-300">
              <CardContent className="p-5 sm:p-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#4ADEA8]/15 border border-[#4ADEA8]/30 text-[#4ADEA8] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4ADEA8] bg-[#4ADEA8]/15 px-2 py-0.5 rounded-full border border-[#4ADEA8]/30">
                        Student Mentee
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-[#F5F3FA] group-hover:text-emerald-200 transition-colors">
                      Student Portal
                    </h2>
                    <p className="text-xs text-[#AAA2B8] mt-1 leading-relaxed max-w-md">
                      Individual mentee dashboard: semester academic records, mentor contact info, curated study notes, and draft submissions.
                    </p>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-xl bg-[#211A2D] group-hover:bg-[#4ADEA8] group-hover:text-black text-[#AAA2B8] flex items-center justify-center flex-shrink-0 transition-all duration-200 self-center">
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Bottom Footer Note */}
          <div className="pt-2 text-center text-xs text-[#777084]">
            NMAM Institute of Technology, Nitte &bull; Autonomous Institution under Nitte University
          </div>
        </div>

      </div>
    </div>
  );
};
