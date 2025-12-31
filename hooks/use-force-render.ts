import { useState } from 'react';

export function useForceRender() {
  const [forced, setForced] = useState<boolean>(true);

  const rerender = () => {
    setForced(prev => !prev);
  };

  return [forced.toString(), rerender] as const;
}
