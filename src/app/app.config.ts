import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideState, provideStore } from '@ngrx/store';
import { provideHttpClient } from '@angular/common/http';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { authFeature } from './auth/store/auth.reducers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideStore(),
    provideState(authFeature.name, authFeature.reducer),
    provideHttpClient(),
    provideStoreDevtools({
      maxAge: 25, // Keep last 25 states
      logOnly: !isDevMode(), // Restrict extension to log-only mode
      autoPause: true, // Auto-pause when the tab is inactive
      trace: false, // Disable trace for performance
      traceLimit: 75, // Limit trace to 75
    }),
  ],
};
