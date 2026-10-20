import { RenderMode, ServerRoute } from '@angular/ssr';

// Zona de pruebas: renderizamos solo en el cliente para que el servidor de
// Angular no intente llamar al backend durante el SSR.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
