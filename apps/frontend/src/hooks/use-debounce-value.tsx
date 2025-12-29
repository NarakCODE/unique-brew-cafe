import * as React from "react";
import debounce from "lodash.debounce";

export type DebounceOptions = {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
};

export type ControlFunctions = {
    cancel: () => void;
    flush: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DebouncedState<T extends (...args: any[]) => any> = ((
    ...args: Parameters<T>
) => ReturnType<T> | undefined) &
    ControlFunctions;

export type UseDebounceValueOptions<T> = DebounceOptions & {
    equalityFn?: (left: T, right: T) => boolean;
};

function resolveValue<T>(val: T | (() => T)): T {
    return val instanceof Function ? (val as () => T)() : val;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultEq = (left: any, right: any) => left === right;

export function useDebounceValue<T>(
    initialValue: T | (() => T),
    delay: number,
    options?: UseDebounceValueOptions<T>
): [T, DebouncedState<(value: T) => void>] {
    const eq = options?.equalityFn ?? defaultEq;

    const [debouncedValue, setDebouncedValue] = React.useState<T>(() =>
        resolveValue(initialValue)
    );

    const updateDebouncedValue = React.useMemo(() => {
        const func = debounce(
            (value: T) => {
                setDebouncedValue(value);
            },
            delay,
            options
        );

        const wrappedFunc = ((value: T) => func(value)) as DebouncedState<
            (value: T) => void
        >;

        wrappedFunc.cancel = () => {
            func.cancel();
        };

        wrappedFunc.flush = () => {
            func.flush();
        };

        return wrappedFunc;
    }, [delay, options]);

    React.useEffect(() => {
        return () => {
            updateDebouncedValue.cancel();
        };
    }, [updateDebouncedValue]);

    const previousValueRef = React.useRef<T>(resolveValue(initialValue));

    React.useEffect(() => {
        const currentValue = resolveValue(initialValue);
        if (!eq(previousValueRef.current, currentValue)) {
            updateDebouncedValue(currentValue);
            previousValueRef.current = currentValue;
        }
    }, [initialValue, updateDebouncedValue, eq]);

    return [debouncedValue, updateDebouncedValue];
}
