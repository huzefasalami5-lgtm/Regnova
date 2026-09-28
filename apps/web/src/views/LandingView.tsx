import React from 'react';
import { Link } from 'react-router-dom';
import { CloudRain, ShieldCheck, Cpu, Database, Compass, ArrowRight, Play, CheckCircle2 } from 'lucide-react';

export const LandingView: React.FC = () => {
  const steps = [
    { num: '01', title: 'Raw NWP Ingestion', desc: 'Ingests numerical weather prediction grids and synoptic predictors.', icon: Database },
    { num: '02', title: 'R-GATE Regime AI', desc: 'Estimates Active, Break, Depression, and Coast/Terrain probabilities.', icon: Compass },
    { num: '03', title: 'EXPERT-MIX Fusion', desc: 'Applies specialized regime correction experts with smooth soft gating.', icon: Cpu },
    { num: '04', title: 'RAIN-CAL Calibration', desc: 'Calibrates heavy rainfall probabilities against held-out validation.', icon: CloudRain },
    { num: '05', title: 'District Guidance', desc: 'Delivers high-resolution district aggregations, reports, and audit trails.', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#071522] text-[#F5FAFF] flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-6 border-b border-[#28475C] bg-gradient-to-b from-[#0D2233] to-[#071522]">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#12304A] border border-[#42D9F5]/40 text-[#42D9F5] text-xs font-mono">
            <span>SMART INDIA HACKATHON 2026</span>
            <span>•</span>
            <span>PROBLEM SIH26080</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            REGNOVA <span className="bg-gradient-to-r from-[#42D9F5] to-[#17B897] bg-clip-text text-transparent">Monsoon AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#A6BACD] max-w-3xl mx-auto leading-relaxed">
            Regime-Adaptive AI Post-Processing of Numerical Weather Prediction Rainfall Forecasts across Indian Districts.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/command-center"
              className="px-6 py-3 rounded-lg bg-[#42D9F5] text-[#071522] font-bold text-sm hover:bg-[#38bdf8] transition-all flex items-center space-x-2 shadow-lg shadow-[#42D9F5]/20"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/sih-demo"
              className="px-6 py-3 rounded-lg bg-[#12304A] hover:bg-[#19384B] border border-[#28475C] text-[#F5FAFF] font-semibold text-sm transition-all flex items-center space-x-2"
            >
              <Play className="w-4 h-4 text-[#17B897] fill-current" />
              <span>5-Minute SIH Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Scientific Workflow Architecture */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full flex-1">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-[#F5FAFF]">End-to-End Scientific Post-Processing Pipeline</h2>
          <p className="text-sm text-[#A6BACD] mt-2">
            Non-destructive post-processing layer that enhances numerical forecasts without replacing core operational physics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-[#0D2233] border border-[#28475C] hover:border-[#42D9F5]/50 transition-all p-5 rounded-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-[#42D9F5] font-bold">{step.num}</span>
                    <div className="p-2 rounded-lg bg-[#12304A] text-[#17B897] group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-[#F5FAFF] text-sm mb-1.5">{step.title}</h3>
                  <p className="text-xs text-[#A6BACD] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scientific Compliance Notice */}
        <div className="mt-12 p-4 rounded-lg bg-[#12304A]/60 border border-[#28475C] flex items-start space-x-3 text-xs text-[#A6BACD]">
          <CheckCircle2 className="w-5 h-5 text-[#17B897] flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-[#F5FAFF]">Scientifically Honest Architecture:</span> In compliance with SIH26080 guidelines, REGNOVA uses strictly issue-time predictors (zero temporal leakage), separates validation calibration from evaluation test sets, discloses sample sizes, and clearly tags all synthetic benchmark datasets with explicit data mode badges.
          </div>
        </div>
      </section>
    </div>
  );
};
