import { Moon, NotebookPen, Plus, Settings, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/stores/ui.store';

interface HeaderProps {
  resolvedTheme: 'light' | 'dark';
}

export function Header({ resolvedTheme }: HeaderProps) {
  const openEditor = useUiStore((s) => s.openEditor);
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);
  const setTheme = useUiStore((s) => s.setTheme);
  const themeSetting = useUiStore((s) => s.theme);

  // Quick toggle flips light/dark; "system" users get the opposite of
  // whatever the OS currently resolves to.
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex items-center gap-2">
      <div className="flex items-center gap-2" aria-hidden>
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <NotebookPen className="size-4.5" />
        </span>
        <h1 className="text-sm font-semibold tracking-tight">
          Note Tracker
          <span className="ml-1.5 hidden text-xs font-normal text-muted-foreground sm:inline">
            local & private
          </span>
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button size="sm" onClick={() => openEditor(null)}>
          <Plus aria-hidden />
          New note
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          aria-label={
            themeSetting === 'system'
              ? 'Theme: following system — switch to dark'
              : themeSetting === 'dark'
                ? 'Switch to light theme'
                : 'Switch to dark theme'
          }
          title="Toggle theme"
        >
          {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
          title="Settings"
        >
          <Settings />
        </Button>
      </div>
    </header>
  );
}
