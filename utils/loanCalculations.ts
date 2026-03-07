/**
 * Flat-rate formula: Monthly Repayment = (Principal / Term) + (Principal × 0.005)
 * x = Principal / Term, y = Principal × 0.005 (0.5% monthly), Monthly = x + y
 */
export function calculateMonthlyPayment(
  principal: number,
  interestRatePercent: number,
  termMonths: number
): number {
  const monthlyPrincipal = principal / termMonths;
  const monthlyInterest = (principal * interestRatePercent) / 100;
  return monthlyPrincipal + monthlyInterest;
}

export function calculateMonthlyInterest(
  principal: number,
  interestRatePercent: number
): number {
  return (principal * interestRatePercent) / 100;
}

export function calculateMonthlyPrincipal(
  principal: number,
  termMonths: number
): number {
  return principal / termMonths;
}

export function calculateTotalRepayment(
  monthlyPayment: number,
  termMonths: number
): number {
  return monthlyPayment * termMonths;
}

export function calculateTotalInterest(
  totalRepayment: number,
  principal: number
): number {
  return totalRepayment - principal;
}
