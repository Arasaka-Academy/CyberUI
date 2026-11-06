import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

export function useFormReset(ref: RefObject<HTMLInputElement | HTMLButtonElement | null>, onReset: () => void, formId?: string) {
    const reset = useRef(onReset);
    useLayoutEffect(() => { reset.current = onReset; });
    useEffect(() => {
        const form = ref.current?.form;
        if (!form) return;
        let mounted = true;
        const handleReset = (event: Event) => {
            // Native reset defaults may run after the microtask checkpoint of a trusted event.
            // Use the next task so controlled values are restored after the browser clears files.
            setTimeout(() => { if (mounted && !event.defaultPrevented) reset.current(); }, 0);
        };
        form.addEventListener('reset', handleReset);
        return () => { mounted = false; form.removeEventListener('reset', handleReset); };
    }, [ref, formId]);
}
