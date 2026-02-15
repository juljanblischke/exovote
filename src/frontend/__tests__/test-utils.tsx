import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import de from '@/messages/de.json';

type WrapperProps = {
  children: React.ReactNode;
};

function AllProviders({ children }: WrapperProps) {
  return (
    <NextIntlClientProvider locale="de" messages={de}>
      {children}
    </NextIntlClientProvider>
  );
}

function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
