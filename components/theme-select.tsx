import { useEffect, type JSX } from 'react';

import { Sun, Moon, Monitor } from 'lucide-react';

import { appStore, type Theme } from '@/stores';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from './ui/button';

const colorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

const DARK = 'dark';
const LIGHT = 'light';
const SYSTEM = 'system';

const THEME_OPTIONS: readonly [Theme, string][] = [
  [DARK, 'دارک'],
  [SYSTEM, 'پیش فرض سیستم'],
  [LIGHT, 'لایت'],
];

const ICONS: Record<Theme, JSX.Element> = {
  [DARK]: <Moon className='size-4' />,
  [LIGHT]: <Sun className='size-4' />,
  [SYSTEM]: <Monitor className='size-4' />,
};

/**
 * make sure to change this inside `index.html` as well
 */
const DATA_ATTR = 'data-theme';

type ThemeSelectProps = {
  single?: boolean;
};

export function ThemeSelect({ single = false }: ThemeSelectProps) {
  const theme = appStore.useTheme() || 'system';
  const setTheme = appStore.useSetTheme();

  const handleThemeChange = (theme: Theme) => {
    if (!theme) return;

    const root = document.documentElement;

    root.classList.remove(DARK, LIGHT);
    root.removeAttribute(DATA_ATTR);

    const resolvedTheme = theme === SYSTEM ? (colorSchemeMedia.matches ? DARK : LIGHT) : theme;

    setTheme(theme);
    root.classList.add(resolvedTheme);
    root.setAttribute(DATA_ATTR, theme);
  };

  const handleRotateTheme = () => {
    if (!theme) return;

    const index = THEME_OPTIONS.findIndex(([option]) => option === theme);
    const nextIndex = (index + 1) % THEME_OPTIONS.length;

    handleThemeChange(THEME_OPTIONS[nextIndex][0]);
  };

  useEffect(() => {
    handleThemeChange(theme);

    const handleColorSchemeChange = () => {
      if (theme !== 'system') return;

      const systemTheme = colorSchemeMedia.matches ? DARK : LIGHT;
      const root = document.documentElement;

      root.classList.toggle(DARK, systemTheme === 'dark');
      root.classList.toggle(LIGHT, systemTheme === 'light');
    };

    colorSchemeMedia.addEventListener('change', handleColorSchemeChange);

    return () => colorSchemeMedia.removeEventListener('change', handleColorSchemeChange);
  }, []);

  if (single) {
    const [_, label] = THEME_OPTIONS.find(([option]) => option === theme)!;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size='sm'
            variant='outline'
            onClick={handleRotateTheme}
            className='max-w-full cursor-pointer'
          >
            {ICONS[theme]}
          </Button>
        </TooltipTrigger>

        <TooltipContent className='capitalize'>{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <ToggleGroup
      key={theme}
      variant='outline'
      value={theme}
      type='single'
      onValueChange={handleThemeChange}
    >
      {THEME_OPTIONS.map(([value, label]) => (
        <Tooltip key={value}>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value={value}
              aria-label={`Toggle ${theme} theme`}
              data-state={theme === value && 'on'}
              className='cursor-pointer'
            >
              {ICONS[value]}
            </ToggleGroupItem>
          </TooltipTrigger>

          <TooltipContent className='capitalize'>{label}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  );
}
