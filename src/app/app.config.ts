import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { FirestoreProjectsService } from './core/services/firestore-projects.service';
import { ProjectsService } from './core/services/projects.service';

const firebaseProviders = [] as any[];
if (environment.firebaseConfig && environment.firebaseConfig.projectId) {
  firebaseProviders.push(provideFirebaseApp(() => initializeApp(environment.firebaseConfig)));
  firebaseProviders.push(provideFirestore(() => getFirestore()));
  firebaseProviders.push(provideAuth(() => getAuth()));
}

// No emulator support: always use the real Firestore connection configured via environment.firebaseConfig

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    // Firebase (optional) + Firestore
    ...firebaseProviders,
    // Provide ProjectsService: only use Firestore implementation when Firebase configured.
    // If no Firebase config is present, register a factory that throws a helpful error
    // instead of allowing Angular to try to instantiate FirestoreProjectsService (which needs Firestore).
    ...(environment.firebaseConfig && environment.firebaseConfig.projectId ? [
      {
        provide: ProjectsService,
        useClass: FirestoreProjectsService
      },
      // ensure concrete class is registered for DI construction
      FirestoreProjectsService
    ] : [
      {
        provide: ProjectsService,
        useFactory: () => {
          throw new Error('Firestore is not configured. Set environment.firebaseConfig.projectId to enable Firestore-backed ProjectsService.');
        }
      }
    ])
  ]
};
