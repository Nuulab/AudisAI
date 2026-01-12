import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2 text-lg font-bold">
          <img src="/logo-wht.svg" alt="AudisAI" className="w-8 h-8" />
           AudisAI
        </div>
      ),
    },
  };
}
