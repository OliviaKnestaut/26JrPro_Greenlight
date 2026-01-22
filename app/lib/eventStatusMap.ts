export type UiEventStatus =
    | 'draft'
    | 'in-review'
    | 'approved'
    | 'past'
    | 'rejected'
    | 'cancelled'
    | 'unknown';

const map: Record<string, UiEventStatus> = {
  // server enum -> UI token
    DRAFT: 'draft',
    REVIEW: 'in-review',
    APPROVED: 'approved',
    PAST: 'past',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
};

export function serverToUi(status?: string | null): UiEventStatus {
    if (!status) return 'unknown';
    const key = String(status).toUpperCase();
    return map[key] ?? 'unknown';
}

export default serverToUi;
