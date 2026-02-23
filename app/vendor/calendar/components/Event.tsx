import React from 'react';
import { getDay, setDay, differenceInMinutes } from 'date-fns';

import type {
    GenericEvent,
    EventBlockProps,
} from './types';
import { sizeEventBox, MIN_BOX_SIZE } from './utils';
import { formatTime } from '~/lib/formatters';

const BOX_POSITION_OFFSET = 26;
const TURQUOISE = '#36CFC9';


export const EventBlock = <T extends GenericEvent>({
    event,
    index,
    hour,
    events,
    onEventClick,
}: EventBlockProps<T>) => {
    const getEventDay = getDay(new Date(event.endTime));
    const fitHourToDate = setDay(hour, getEventDay);

    const boxStyle = event.allDay
        ? { boxSize: MIN_BOX_SIZE, boxPosition: index * BOX_POSITION_OFFSET }
        : sizeEventBox(event, fitHourToDate);
    const hasMultiple = events && events > 1;
    const widthStyle = event.allDay ? '80%' : (hasMultiple ? `${80 / events}%` : '100%');
    const boxLeftPosition = event.allDay ? 0 : (hasMultiple ? BOX_POSITION_OFFSET * index : 0);
    const inlineBg = event.status === 'approved' ? '#F6FFED' : event.status === 'in-review' ? '#FFFBE6': 'transparent';
    const inlineBorderLeft = event.status === 'approved' ? '#95DE64' : event.status === 'in-review' ? '#FFD666' : 'transparent';

    const formatCandidate = (v?: string | Date) => (v instanceof Date ? v.toString() : typeof v === 'string' ? v : v ? String(v) : undefined);
        const formattedStart = formatCandidate(event.startTime) ? formatTime(formatCandidate(event.startTime)) : undefined;
        const formattedEnd = formatCandidate(event.endTime) ? formatTime(formatCandidate(event.endTime)) : undefined;
        const displayTime = formattedStart && formattedEnd ? `${formattedStart} - ${formattedEnd}` : (formattedStart || undefined);

    const hidden = !event.allDay && differenceInMinutes(new Date(event.endTime), fitHourToDate) === 0;

    return (
        <div
            role={onEventClick ? 'button' : undefined}
            tabIndex={onEventClick ? 0 : undefined}
            onClick={onEventClick ? () => onEventClick(event) : undefined}
            onKeyDown={(e) => { if (onEventClick && (e as any).key === 'Enter') onEventClick(event); }}
            style={{
                display: hidden ? 'none' : 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: '4px',
                height: boxStyle.boxSize + '%',
                width: widthStyle,
                position: 'absolute',
                top: boxStyle.boxPosition + '%',
                left: boxLeftPosition + '%',
                zIndex: 2,
                backgroundColor: inlineBg,
                borderLeft: `4px solid ${inlineBorderLeft}`,
                padding: '4px',
                borderRadius: 8,
                cursor: onEventClick ? 'pointer' : 'default',
            }}>
                <span
                style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#135200',
                    width: '100%',
                    minWidth: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: '1.2',
                }}>
                    {String(event.title ?? '')}
                </span>
                {displayTime ? <p
                style={{
                    fontSize: '12px',
                    margin: 0,
                }}>
                    {displayTime}
                </p> : null}
        </div>
    );
};

