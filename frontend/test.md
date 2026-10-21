# Plan: sesión provisional vía DevTools

Con este enfoque no hace falta implementar nada en código; el "plan" es
simplemente el procedimiento manual:

1. **Levantar la app** — `npm start` en `frontend/` y abrir
   `http://localhost:4200` (estarán en `/login` porque el guard expulsa a los
   deslogueados).

2. **Abrir DevTools → Application → Local Storage → `http://localhost:4200`**
   y crear una clave llamada exactamente `reportaucn.usuario` (es la `USER_KEY`
   de `auth.service.ts:9`).

3. **Guardar un objeto `User` válido** con la forma de
   `src/app/models/index.ts:8`. Un valor de ejemplo (pueden cambiar nombre y
   correo, pero no los nombres de campos ni el rol):

   ```json
   {"id":1,"nombre":"Ana Usuario","correo":"ana@ucn.cl","rol":"usuario"}
   ```

   No hace falta `reportaucn.token`: el frontend nunca lo valida.

4. **Probar ambos roles** repitiendo el paso 3: con `"rol":"tecnico"` verán la
   vista de todos los reportes y el cambio de estado por fila; con
   `"rol":"usuario"` verán solo los suyos y el botón de eliminar si el reporte
   estuviera "abierto". Si la app ya está cargada, basta recargar la página
   para que `restaurarSesion()` levante ese valor en la signal.

5. **Qué van a ver dentro** — navegarán bien por `/equipos` y `/reportes` con
   sus shells de Material, pero las peticiones `GET /api/...` fallarán porque
   el backend no existe aún: verán los estados de error ("botón reintentar")
   que ya implementaron en esas páginas. Es lo esperado, no un bug del truco.

6. **Salir de la sesión falsa** — borrar la clave (o usar el botón logout del
   toolbar, que hace exactamente eso).

## Advertencias para la interrogación (van a preguntar esto)

- Aquí la "autorización" es 100% del lado del cliente: cualquiera que sepa la
  clave en localStorage es jefe. La regla real es que el backend decida los
  permisos leyendo el JWT.
- Cuando exista el backend real, este truco debe morir: el login de verdad
  escribirá ambas claves y ustedes no tendrán que volver a tocar DevTools.
