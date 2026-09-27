export const PAYMENT_PLANS = {
  monthly: { label: "Lagan oyiga", amountUzs: 49000 },
  yearly: { label: "Lagan yiliga", amountUzs: 399000 },
} as const

export type PaymentPlan = keyof typeof PAYMENT_PLANS

export function formatUzs(amount: number) {
  return `${new Intl.NumberFormat("uz-UZ").format(amount)} UZS`
}
