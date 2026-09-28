import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { BarChart3, CheckCircle, ShieldAlert, Award } from 'lucide-react';
import { DataModeBadge } from '../components/common/DataModeBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { CategoricalVerification } from '../types';

export const EvaluationLabView: React.FC = () => {
  const {
    data: evaluation,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['latest-evaluation'],
    queryFn: () => api.getLatestEvaluation(),
  });

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F5FAFF] flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#42D9F5]" />
            <span>Independent Scientific Evaluation Lab</span>
          </h1>
          <p className="text-xs text-[#A6BACD] mt-1">
            Rigorous held-out test partition backtesting with continuous and categorical verification metrics.
          </p>
        </div>
        {evaluation && <DataModeBadge mode={evaluation.data_mode} />}
      </div>

      {isError && (
        <ErrorAlert
          title="Failed to Retrieve Verification Benchmark"
          message={(error as Error)?.message}
          onRetry={() => refetch()}
        />
      )}

      {isLoading ? (
        <LoadingSpinner message="Evaluating held-out monsoon test partition metrics..." />
      ) : !evaluation ? (
        <EmptyState
          title="No Evaluation Run Available"
          message="Trigger an independent evaluation backtest to generate verification benchmarks."
          action={
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 rounded bg-[#42D9F5] text-[#071522] text-xs font-bold"
            >
              Run Evaluation Benchmark
            </button>
          }
        />
      ) : (
        <>
          {/* Primary Verification Metrics Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Raw NWP */}
            <div className="bg-[#0D2233] p-4 rounded-xl border border-[#28475C] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#A6BACD]">RAW NWP BASELINE</span>
                <span className="text-[10px] text-[#A6BACD]">Uncorrected</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#A6BACD]">RMSE:</span>
                  <span className="text-white font-bold">{evaluation.raw_nwp_metrics.rmse_mm.toFixed(2)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A6BACD]">MAE:</span>
                  <span className="text-white">{evaluation.raw_nwp_metrics.mae_mm.toFixed(2)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A6BACD]">Bias:</span>
                  <span className="text-white">{evaluation.raw_nwp_metrics.bias_mm.toFixed(2)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A6BACD]">Brier Score (&gt;35mm):</span>
                  <span className="text-white">{evaluation.raw_nwp_metrics.brier_score_gt35mm.toFixed(3)}</span>
                </div>
              </div>
            </div>

            {/* Global XGBoost */}
            <div className="bg-[#0D2233] p-4 rounded-xl border border-[#28475C] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#A6BACD]">GLOBAL ML BASELINE</span>
                <span className="text-[10px] text-[#A6BACD]">Single Model</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#A6BACD]">RMSE:</span>
                  <span className="text-white font-bold">{evaluation.global_ml_metrics.rmse_mm.toFixed(2)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A6BACD]">MAE:</span>
                  <span className="text-white">{evaluation.global_ml_metrics.mae_mm.toFixed(2)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A6BACD]">Bias:</span>
                  <span className="text-white">{evaluation.global_ml_metrics.bias_mm.toFixed(2)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A6BACD]">Brier Score (&gt;35mm):</span>
                  <span className="text-white">{evaluation.global_ml_metrics.brier_score_gt35mm.toFixed(3)}</span>
                </div>
              </div>
            </div>

            {/* REGNOVA AI */}
            <div className="bg-[#0D2233] p-4 rounded-xl border-2 border-[#42D9F5]/40 space-y-3 shadow-lg shadow-[#42D9F5]/5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#42D9F5] flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>REGNOVA (EXPERT-MIX)</span>
                </span>
                <span className="text-[10px] bg-[#42D9F5]/10 text-[#42D9F5] px-1.5 py-0.5 rounded font-bold">Proposed</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#A6BACD]">RMSE:</span>
                  <span className="text-[#42D9F5] font-bold">{evaluation.regnova_metrics.rmse_mm.toFixed(2)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A6BACD]">MAE:</span>
                  <span className="text-[#17B897] font-bold">{evaluation.regnova_metrics.mae_mm.toFixed(2)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A6BACD]">Bias:</span>
                  <span className="text-white">{evaluation.regnova_metrics.bias_mm.toFixed(2)} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#17B897] font-bold">Brier Score (&gt;35mm):</span>
                  <span className="text-[#17B897] font-bold">{evaluation.regnova_metrics.brier_score_gt35mm.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Categorical Scores (CSI, ETS, POD, FAR) */}
          <div className="bg-[#0D2233] p-5 rounded-xl border border-[#28475C] space-y-4">
            <h2 className="text-sm font-semibold text-[#F5FAFF]">Heavy Rainfall Event Verification (CSI & ETS)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#12304A] text-[#A6BACD] uppercase text-[10px] tracking-wider border-b border-[#28475C]">
                  <tr>
                    <th className="p-3">Rainfall Threshold</th>
                    <th className="p-3 text-right">Raw NWP CSI</th>
                    <th className="p-3 text-right text-[#42D9F5]">REGNOVA CSI</th>
                    <th className="p-3 text-right">Raw NWP ETS</th>
                    <th className="p-3 text-right text-[#17B897]">REGNOVA ETS</th>
                    <th className="p-3 text-right">Sample Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#28475C] font-mono">
                  {evaluation.regnova_metrics.categorical_metrics.map((cat: CategoricalVerification, i: number) => {
                    const rawCat = evaluation.raw_nwp_metrics.categorical_metrics[i];
                    return (
                      <tr key={cat.threshold_mm} className="hover:bg-[#12304A]/50">
                        <td className="p-3 font-sans font-medium text-white">≥ {cat.threshold_mm} mm / 24h</td>
                        <td className="p-3 text-right text-[#A6BACD]">{rawCat?.csi.toFixed(3)}</td>
                        <td className="p-3 text-right font-bold text-[#42D9F5]">{cat.csi.toFixed(3)}</td>
                        <td className="p-3 text-right text-[#A6BACD]">{rawCat?.ets.toFixed(3)}</td>
                        <td className="p-3 text-right font-bold text-[#17B897]">{cat.ets.toFixed(3)}</td>
                        <td className="p-3 text-right text-[#A6BACD]">{cat.sample_count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Honest Case Auditing (Improvements vs Degradations) */}
          <div className="p-4 rounded-xl bg-[#12304A]/60 border border-[#28475C] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2 text-[#17B897]">
              <CheckCircle className="w-4 h-4" />
              <span>Cases Improved: <strong className="font-mono text-white">{evaluation.cases_regnova_improved_count}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-[#F2BC63]">
              <ShieldAlert className="w-4 h-4" />
              <span>Cases Degraded: <strong className="font-mono text-white">{evaluation.cases_regnova_degraded_count}</strong></span>
            </div>
            <div className="text-[#A6BACD]">
              Total Test Samples: <strong className="font-mono text-white">{evaluation.total_evaluation_samples}</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
