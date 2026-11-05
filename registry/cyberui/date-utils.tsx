// Generated from packages/react/src/date-utils.tsx. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.
'use client';
import { parseDate, parseTime } from '@internationalized/date';
export function date(value?: string | null) { try {
    return value ? parseDate(value) : null;
}
catch {
    return null;
} }
export function time(value?: string | null) { try {
    return value ? parseTime(value) : null;
}
catch {
    return null;
} }
