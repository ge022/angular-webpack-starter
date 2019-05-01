/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js/dist/zone';  // Included with Angular CLI.

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

if (module.hot) {
    module.hot.accept();
} else {
    enableProdMode();
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
        });
    }
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));



