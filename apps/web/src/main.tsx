import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AuthSync } from './features/auth/AuthSync';
import { Provider } from 'react-redux';
import { PrimeReactProvider } from '@primereact/core';
import { store } from './store';
import { config } from './config';
import '@fontsource-variable/manrope';
import './i18n';
import './style.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PrimeReactProvider license={config.primeUiLicenseKey}>
        <AuthSync>
          <App />
        </AuthSync>
      </PrimeReactProvider>
    </Provider>
  </StrictMode>,
);
