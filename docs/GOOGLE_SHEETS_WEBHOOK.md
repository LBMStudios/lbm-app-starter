# Integración Directa con Google Sheets (Costo $0)

Esta guía explica cómo recibir automáticamente todas las respuestas de las encuestas en una planilla de **Google Sheets** en tiempo real mediante **Google Apps Script**.

---

## 📋 Paso a Paso de Configuración

### 1. Crear la Planilla de Google Sheets
1. Entrá a [sheets.new](https://sheets.new) para crear una planilla nueva.
2. En la primera fila (Fila 1), creá los siguientes encabezados de columna:
   ```text
   A: Timestamp | B: Survey Slug | C: Nombre | D: Email | E: País | F: Organización | G: Canal | H: Respuestas (JSON)
   ```

### 2. Pegar el Google Apps Script
1. En el menú superior de Google Sheets, andá a **Extensiones** > **Apps Script**.
2. Borrá el código que aparezca y pegá exactamente este script:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    var timestamp = data.submittedAt || new Date().toISOString();
    var surveySlug = data.surveySlug || "";
    var user = data.userData || {};
    var answers = data.answers || {};
    
    sheet.appendRow([
      timestamp,
      surveySlug,
      user.nombre || "",
      user.email || "",
      user.pais || "",
      user.organizacion || "",
      user.canal || "",
      JSON.stringify(answers)
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 3. Implementar como Web App
1. Hacé click en el botón azul **"Implementar"** (arriba a la derecha) > **"Nueva implementación"**.
2. En el engranaje de tipo de implementación, seleccioná **"Aplicación web"**.
3. Configurá:
   * **Descripción**: `Recepción de encuestas LBM / UA`
   * **Ejecutar como**: `Yo (tu cuenta)`
   * **Quién tiene acceso**: **`Cualquiera`** *(Esto permite que el endpoint de Next.js le envíe los datos sin autenticación compleja)*.
4. Hacé click en **"Implementar"**, autorizá los permisos y copiá la **URL de la aplicación web** (termina en `/exec`).

### 4. Configurar la Variable de Entorno
En tu archivo `.env.local` (y en las variables de entorno de Vercel):
```env
SURVEY_WEBHOOK_URL="https://script.google.com/macros/s/TU_SCRIPT_ID/exec"
```

¡Listo! Cada vez que alguien complete una encuesta, la fila aparecerá automáticamente en tu Google Sheet al segundo.
