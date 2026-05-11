"use client";

/**
 * useSwipeUp — a mobile-only "swipe up to dive deeper" gesture hook.
 *
 * Returns:
 *  - `swiping`  — true while a finger is moving up past the threshold of intent.
 *  - `progress` — 0–1 normalized distance of the current swipe, useful for
 *                 driving live transforms ("the card lifts as you pull").
 *  - `bind`     — touch handlers to spread onto the element you want to listen on.
 *
 * The callback fires once when the user has dragged up more than the smaller
 * of `100px` or `40%` of the element's height, then released.
 *
 * Desktop pointer events are not bound — `onTouchStart` does not fire from a
 * mouse, so this is automatically inert on non-touch devices.
 */
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from "react";

export interface SwipeUpBind {
  onTouchStart: (e: ReactTouchEvent<HTMLElement>) => void;
  onTouchMove: (e: ReactTouchEvent<HTMLElement>) => void;
  onTouchEnd: (e: ReactTouchEvent<HTMLElement>) => void;
}

export interface SwipeUpState {
  swiping: boolean;
  progress: number;
  bind: SwipeUpBind;
}

export interface UseSwipeUpOptions {
  /** Minimum pixel distance to count as a swipe (default 100). */
  threshold?: number;
  /** Minimum fraction of element height to count as a swipe (default 0.4). */
  fractionThreshold?: number;
  /**
   * Optional minimum velocity (px/ms) — if exceeded, a shorter swipe still
   * counts. Defaults to 0.6 (a flick).
   */
  flickVelocity?: number;
  /** Called once when a successful upward swipe is released. */
  onSwipeUp?: () => void;
  /** Disable the hook entirely (e.g. when a modal is already open). */
  disabled?: boolean;
}

export function useSwipeUp(options: UseSwipeUpOptions = {}): SwipeUpState {
  const {
    threshold = 100,
    fractionThreshold = 0.4,
    flickVelocity = 0.6,
    onSwipeUp,
    disabled = false,
  } = options;

  const startY = useRef<number | null>(null);
  const startX = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const elementHeight = useRef<number>(0);
  // Latch out horizontal-dominant gestures so we don't fight the parent carousel.
  const cancelled = useRef<boolean>(false);

  const [swiping, setSwiping] = useState(false);
  const [progress, setProgress] = useState(0);

  const reset = useCallback(() => {
    startY.current = null;
    startX.current = null;
    startTime.current = 0;
    elementHeight.current = 0;
    cancelled.current = false;
    setSwiping(false);
    setProgress(0);
  }, []);

  const onTouchStart = useCallback(
    (e: ReactTouchEvent<HTMLElement>) => {
      if (disabled) return;
      const t = e.touches[0];
      if (!t) return;
      startY.current = t.clientY;
      startX.current = t.clientX;
      startTime.current = Date.now();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      elementHeight.current = rect.height || 1;
      cancelled.current = false;
      setSwiping(false);
      setProgress(0);
    },
    [disabled],
  );

  const onTouchMove = useCallback(
    (e: ReactTouchEvent<HTMLElement>) => {
      if (disabled || cancelled.current) return;
      if (startY.current === null || startX.current === null) return;
      const t = e.touches[0];
      if (!t) return;
      const dy = startY.current - t.clientY; // positive = moved up
      const dx = Math.abs(t.clientX - startX.current);

      // If horizontal motion dominates early, bow out so the photo carousel /
      // page scroll handles it.
      if (Math.abs(dy) < 8 && dx > 12) {
        cancelled.current = true;
        setSwiping(false);
        setProgress(0);
        return;
      }
      if (dy <= 0) {
        // Moving down or holding still — ignore for swipe-up purposes.
        setSwiping(false);
        setProgress(0);
        return;
      }

      const target = Math.min(
        threshold,
        elementHeight.current * fractionThreshold,
      );
      const p = Math.max(0, Math.min(1, dy / Math.max(target, 1)));
      setProgress(p);
      setSwiping(dy > 8);
    },
    [disabled, threshold, fractionThreshold],
  );

  const onTouchEnd = useCallback(
    (e: ReactTouchEvent<HTMLElement>) => {
      if (disabled) {
        reset();
        return;
      }
      if (startY.current === null || cancelled.current) {
        reset();
        return;
      }
      const endTouch = e.changedTouches[0];
      if (!endTouch) {
        reset();
        return;
      }
      const dy = startY.current - endTouch.clientY;
      const dt = Math.max(1, Date.now() - startTime.current);
      const velocity = dy / dt;
      const fractionDist = dy / Math.max(elementHeight.current, 1);

      const passed =
        dy >= threshold ||
        fractionDist >= fractionThreshold ||
        (dy > 40 && velocity >= flickVelocity);

      if (passed && onSwipeUp) {
        onSwipeUp();
      }
      reset();
    },
    [disabled, threshold, fractionThreshold, flickVelocity, onSwipeUp, reset],
  );

  const bind = useMemo<SwipeUpBind>(
    () => ({ onTouchStart, onTouchMove, onTouchEnd }),
    [onTouchStart, onTouchMove, onTouchEnd],
  );

  return { swiping, progress, bind };
}

export default useSwipeUp;
