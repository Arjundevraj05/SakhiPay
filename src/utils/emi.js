// Returns monthly EMI amount using standard formula
export function calculateMonthlyEmi({ principal, annualRatePercent, tenureMonths }) {
  const principalAmount = Number(principal) || 0;
  const monthlyRate = (Number(annualRatePercent) || 0) / 12 / 100;
  const n = Number(tenureMonths) || 0;
  if (principalAmount <= 0 || n <= 0) return 0;
  if (monthlyRate === 0) return +(principalAmount / n).toFixed(2);
  const factor = Math.pow(1 + monthlyRate, n);
  const emi = (principalAmount * monthlyRate * factor) / (factor - 1);
  return +emi.toFixed(2);
}

// Builds a detailed amortization schedule
export function buildAmortizationSchedule({ principal, annualRatePercent, tenureMonths, startDate }) {
  const monthlyEmi = calculateMonthlyEmi({ principal, annualRatePercent, tenureMonths });
  let outstanding = Number(principal) || 0;
  const monthlyRate = (Number(annualRatePercent) || 0) / 12 / 100;
  const schedule = [];
  const start = startDate ? new Date(startDate) : new Date();

  for (let i = 1; i <= tenureMonths; i++) {
    const interest = +(outstanding * monthlyRate).toFixed(2);
    let principalComponent = +(monthlyEmi - interest).toFixed(2);
    if (i === tenureMonths) {
      // Final adjustment to clear rounding residue
      principalComponent = +Math.min(outstanding, principalComponent).toFixed(2);
    }
    outstanding = +(outstanding - principalComponent).toFixed(2);

    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));

    schedule.push({
      installmentNumber: i,
      dueDate: dueDate.toISOString(),
      emiAmount: monthlyEmi,
      principalComponent,
      interestComponent: interest,
      outstandingAfterPayment: Math.max(0, outstanding),
      status: "UPCOMING", // UPCOMING | PAID | OVERDUE
    });
  }
  return schedule;
}

// Simple helpers for local persistence
const STORAGE_KEY = "sakhipay_emis";

export function loadEmis() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveEmis(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addEmi(emi) {
  const all = loadEmis();
  all.push(emi);
  saveEmis(all);
}

export function updateEmiById(id, updates) {
  const all = loadEmis();
  const idx = all.findIndex((e) => e.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    saveEmis(all);
  }
}

export function deleteEmiById(id) {
  const all = loadEmis().filter((e) => e.id !== id);
  saveEmis(all);
}