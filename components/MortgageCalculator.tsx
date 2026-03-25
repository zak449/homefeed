"use client";

import { useState, useMemo, useEffect, useRef } from "react";

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;
    if (from === to) return;

    const duration = 400;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayed(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return <span>{prefix}{displayed.toLocaleString()}{suffix}</span>;
}

export default function MortgageCalculator({ price }: { price: number }) {
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState<30 | 15>(30);
  const [isOpen, setIsOpen] = useState(false);

  const calc = useMemo(() => {
    const downPayment = price * (downPaymentPct / 100);
    const loanAmount = price - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;

    // Principal & Interest (amortization formula)
    let monthlyPI: number;
    if (monthlyRate === 0) {
      monthlyPI = loanAmount / numPayments;
    } else {
      monthlyPI =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    // Property tax estimate: ~1.1% of price / 12
    const monthlyTax = (price * 0.011) / 12;

    // Insurance estimate: ~$150/mo
    const monthlyInsurance = 150;

    // PMI: if down payment < 20%, estimate 0.5% of loan / 12
    const monthlyPMI = downPaymentPct < 20 ? (loanAmount * 0.005) / 12 : 0;

    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI;
    const totalCost = totalMonthly * numPayments;
    const totalInterest = monthlyPI * numPayments - loanAmount;

    return {
      downPayment,
      loanAmount,
      monthlyPI: Math.round(monthlyPI),
      monthlyTax: Math.round(monthlyTax),
      monthlyInsurance: Math.round(monthlyInsurance),
      monthlyPMI: Math.round(monthlyPMI),
      totalMonthly: Math.round(totalMonthly),
      totalCost: Math.round(totalCost),
      totalInterest: Math.round(totalInterest),
    };
  }, [price, downPaymentPct, interestRate, loanTerm]);

  // Pie chart segments (CSS conic gradient)
  const piTotal = calc.monthlyPI + calc.monthlyTax + calc.monthlyInsurance + calc.monthlyPMI;
  const piPct = piTotal > 0 ? (calc.monthlyPI / piTotal) * 100 : 0;
  const taxPct = piTotal > 0 ? (calc.monthlyTax / piTotal) * 100 : 0;
  const insPct = piTotal > 0 ? (calc.monthlyInsurance / piTotal) * 100 : 0;
  const pmiPct = piTotal > 0 ? (calc.monthlyPMI / piTotal) * 100 : 0;

  const conicGradient = `conic-gradient(
    #0F0F0F 0% ${piPct}%,
    #FF6B2C ${piPct}% ${piPct + taxPct}%,
    #3B82F6 ${piPct + taxPct}% ${piPct + taxPct + insPct}%
    ${pmiPct > 0 ? `, #EF4444 ${piPct + taxPct + insPct}% 100%` : ""}
  )`;

  // Affordability hook: 28% rule (housing should be < 28% of gross income)
  const incomeNeeded = Math.round((calc.totalMonthly / 0.28) * 12);

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden animate-fade-in">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-tag/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-tag flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="12" y2="14" />
            </svg>
          </div>
          <div className="text-left">
            <p className="font-display font-semibold text-sm text-ink">Mortgage Calculator</p>
            <p className="text-xs text-muted">
              Est. <span className="font-semibold text-ink">${calc.totalMonthly.toLocaleString()}/mo</span>
            </p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Calculator body */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 border-t border-border">
          {/* Controls */}
          <div className="space-y-5 pt-5">
            {/* Down payment slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted">Down Payment</label>
                <span className="text-sm font-semibold text-ink">
                  {downPaymentPct}% &middot; ${Math.round(price * downPaymentPct / 100).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={50}
                step={1}
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                className="mortgage-slider w-full"
              />
              <div className="flex justify-between text-[10px] text-muted/50 mt-1">
                <span>3%</span>
                <span>50%</span>
              </div>
              {downPaymentPct < 20 && (
                <p className="text-[11px] text-social font-medium mt-1 animate-fade-in">
                  PMI required below 20% down
                </p>
              )}
            </div>

            {/* Interest rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted">Interest Rate</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setInterestRate(Math.max(0.5, +(interestRate - 0.25).toFixed(2)))}
                    className="w-6 h-6 rounded-md bg-tag text-ink text-xs font-bold hover:bg-border transition-colors flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold text-ink w-14 text-center">{interestRate}%</span>
                  <button
                    type="button"
                    onClick={() => setInterestRate(Math.min(12, +(interestRate + 0.25).toFixed(2)))}
                    className="w-6 h-6 rounded-md bg-tag text-ink text-xs font-bold hover:bg-border transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Loan term toggle */}
            <div>
              <label className="text-xs font-medium text-muted block mb-2">Loan Term</label>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setLoanTerm(30)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    loanTerm === 30
                      ? "bg-[#F5F5F5] text-[#0E0E0E]"
                      : "bg-white text-muted hover:text-ink hover:bg-tag"
                  }`}
                >
                  30 years
                </button>
                <button
                  type="button"
                  onClick={() => setLoanTerm(15)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    loanTerm === 15
                      ? "bg-[#F5F5F5] text-[#0E0E0E]"
                      : "bg-white text-muted hover:text-ink hover:bg-tag"
                  }`}
                >
                  15 years
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mt-6 pt-5 border-t border-border">
            {/* Big monthly number */}
            <div className="text-center mb-5">
              <p className="text-xs text-muted mb-1">Estimated Monthly Payment</p>
              <p className="font-display text-3xl font-bold text-ink tracking-tighter">
                $<AnimatedNumber value={calc.totalMonthly} />
                <span className="text-base font-normal text-muted">/mo</span>
              </p>
            </div>

            {/* Pie chart + breakdown */}
            <div className="flex gap-5 items-center">
              {/* CSS pie chart */}
              <div className="shrink-0">
                <div
                  className="w-20 h-20 rounded-full transition-all duration-500"
                  style={{ background: conicGradient }}
                />
              </div>

              {/* Breakdown list */}
              <div className="flex-1 space-y-2">
                <BreakdownRow color="#0F0F0F" label="Principal & Interest" value={calc.monthlyPI} />
                <BreakdownRow color="#FF6B2C" label="Property Tax" value={calc.monthlyTax} />
                <BreakdownRow color="#3B82F6" label="Insurance" value={calc.monthlyInsurance} />
                {calc.monthlyPMI > 0 && (
                  <BreakdownRow color="#EF4444" label="PMI" value={calc.monthlyPMI} />
                )}
              </div>
            </div>

            {/* Total cost */}
            <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-3">
              <div className="bg-tag rounded-lg px-3 py-2.5">
                <p className="text-[10px] text-muted uppercase tracking-wider">Total over {loanTerm}yr</p>
                <p className="text-sm font-bold text-ink mt-0.5">
                  $<AnimatedNumber value={calc.totalCost} />
                </p>
              </div>
              <div className="bg-tag rounded-lg px-3 py-2.5">
                <p className="text-[10px] text-muted uppercase tracking-wider">Total Interest</p>
                <p className="text-sm font-bold text-social mt-0.5">
                  $<AnimatedNumber value={calc.totalInterest} />
                </p>
              </div>
            </div>

            {/* Affordability hook */}
            <div className="mt-4 bg-social-light rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <span>💰</span> Can you afford this?
              </p>
              <p className="text-[11px] text-muted mt-1 leading-relaxed">
                To keep housing at 28% of income, you&apos;d need a household income of{" "}
                <span className="font-semibold text-ink">${incomeNeeded.toLocaleString()}/yr</span>{" "}
                (${Math.round(incomeNeeded / 12).toLocaleString()}/mo gross).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs text-muted">{label}</span>
      </div>
      <span className="text-xs font-semibold text-ink">${value.toLocaleString()}</span>
    </div>
  );
}
