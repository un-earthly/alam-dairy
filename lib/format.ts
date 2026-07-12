export function formatPrice(amount: number, locale: string): string {
  return amount.toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-US')
}
