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
            return asDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
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
        return `${hh}:${mm} ${ampm}`;
    }
    return s;
};
