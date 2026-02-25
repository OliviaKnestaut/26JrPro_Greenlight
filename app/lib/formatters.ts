export const formatDateMDY = (input: string | Date | null | undefined): string => {
    if (!input) return '';
    const tryIsoParts = (s: string) => {
        const iso = s.includes('T') ? s.split('T')[0] : s;
        const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        return m ? { y: m[1], m: m[2], d: m[3] } : null;
    };
    if (typeof input === 'string') {
        const parts = tryIsoParts(input);
        if (parts) return `${Number(parts.m)}/${Number(parts.d)}/${parts.y}`;
        const d = new Date(input);
        if (isNaN(d.getTime())) return '';
        const month = String(d.getMonth() + 1);
        const day = String(d.getDate());
        const year = d.getFullYear();
        return `${month}/${day}/${year}`;
    }
    const d = new Date(input as Date);
    if (isNaN(d.getTime())) return '';
    const month = String(d.getMonth() + 1);
    const day = String(d.getDate());
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
};

export const formatTime = (s?: string) => {
    if (!s) return '';
    const asDate = new Date(s);
    if (!isNaN(asDate.getTime())) {
        try {
            // use locale formatting but ensure AM/PM stays attached to the time using a non-breaking space
            const localized = asDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
            return localized.replace(/\s?(AM|PM|am|pm)$/, '\u00A0$1');
        } catch (e) {
            // fall through to manual formatting
        }
    }
    const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
    if (m) {
        let hh = parseInt(m[1], 10);
        const mm = m[2];
        const ampm = hh >= 12 ? 'PM' : 'AM';
        hh = hh % 12 || 12;
        return `${hh}:${mm}\u00A0${ampm}`;
    }
    return s;
};

export const formatDuration = (minutes?: number | string): string => {
    if (minutes == null) return '';

    const totalMinutes = typeof minutes === 'string' ? parseInt(minutes, 10) : minutes;
    if (isNaN(totalMinutes) || totalMinutes < 0) return '';

    if (totalMinutes < 60) {
        return `${totalMinutes} minute${totalMinutes === 1 ? '' : 's'}`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (remainingMinutes === 0) {
        return `${hours} hour${hours === 1 ? '' : 's'}`;
    }

    return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
};
