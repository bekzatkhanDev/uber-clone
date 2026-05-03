import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#0CC25F" />
        <ScrollViewStyleReset />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

const globalStyles = `
  /* Full-height layout — required for flex:1 to fill the viewport */
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    background-color: #fff;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  /* Dark mode body background */
  html.dark body {
    background-color: #000000 !important;
    color: #ffffff !important;
  }

  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  /* Thin, subtle scrollbars on desktop */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }

  html.dark ::-webkit-scrollbar-thumb {
    background: #4b5563;
  }
`;
