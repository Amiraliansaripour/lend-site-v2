import { memo, useState, useEffect } from 'react';

import { cn } from '@/lib/utils';

// * constants
const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export type CountDownStatus = 'running' | 'finished';

export type CountDown = {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  status: CountDownStatus;
};

export type CountDownProps = {
  end: number | string;
  className?: string;
  onFinish?: () => void;
  children?: React.ReactNode | ((countDown: CountDown) => React.ReactNode);
};

export const CountDown = memo(function CountDown({
  end,
  className,
  children,
  onFinish,
}: CountDownProps) {
  const endDate = new Date(end);
  const [remainedTime, setRemainedTime] = useState(endDate.getTime() - Date.now());

  const status: CountDownStatus = remainedTime > 0 ? 'running' : 'finished';

  const days = Math.floor(remainedTime / DAY);
  const hours = Math.floor((remainedTime - days * DAY) / HOUR);
  const minutes = Math.floor((remainedTime - days * DAY - hours * HOUR) / MINUTE);
  // prettier-ignore
  const seconds = Math.floor((remainedTime - days * DAY - hours * HOUR - minutes * MINUTE) / SECOND);

  const countDown: CountDown = {
    days,
    hours,
    minutes,
    seconds,
    status,
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    intervalId = setInterval(() => {
      const remainedTime = endDate.getTime() - Date.now();

      if (remainedTime <= 0) {
        clearInterval(intervalId);
        setRemainedTime(0);
        onFinish?.();
        return;
      }

      setRemainedTime(remainedTime);
    }, 450);

    return () => {
      if (intervalId != null) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <div className={cn('flex w-fit text-right', className)}>
      {/* // TODO: implement default count down for system and expert pricings */}
      {children ? (typeof children === 'function' ? children(countDown) : children) : null}
    </div>
  );
});
