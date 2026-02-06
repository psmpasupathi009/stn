/** Order status flow for tracking UI. Shared by orders list and track-order pages. */
export const ORDER_STATUS_FLOW = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
] as const

export function getOrderStatusIndex(status: string): number {
  const index = ORDER_STATUS_FLOW.indexOf(status as (typeof ORDER_STATUS_FLOW)[number])
  return index >= 0 ? index : 0
}
