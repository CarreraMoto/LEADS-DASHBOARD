# Dashboard de Leads - Carrera Moto

Un dashboard interactivo para monitorizar leads y prospectos comerciales para Carrera Moto, una agencia de motos Royal Enfield en Aguascalientes.

## Características

- Visualización de leads recibidos en el mes actual
- Monitoreo de leads pendientes por contactar
- Integración con HubSpot y Google Sheets
- Actualización en tiempo real mediante APIs
- Filtrado por mes y año
- Gráficos interactivos para análisis de tendencias
- Vista de distribución por fuente y por vendedor

## Requisitos previos

Para utilizar este dashboard necesitarás:

1. **HubSpot API Key** - Para acceder a los leads de Meta que llegan a HubSpot
2. **Google Cloud Platform**:
   - Habilitar Google Sheets API
   - Crear una API Key con acceso a Google Sheets API

## Instalación

1. Clona este repositorio:

```bash
git clone https://github.com/carreramoto/leads-dashboard.git
cd leads-dashboard
```

2. Configura las APIs:
   - Al abrir el dashboard por primera vez, se te solicitará:
     - HubSpot API Key
     - ID del documento de Google Sheets
     - Google Sheets API Key

3. Despliega en GitHub Pages:
   - Activa GitHub Pages en la configuración del repositorio
   - Selecciona la rama `main` como fuente
   - La aplicación estará disponible en `https://[username].github.io/leads-dashboard/`

## Uso

1. **Acceso**: Abre el dashboard en tu navegador
2. **Filtrado**: Selecciona el mes y año para filtrar los datos
3. **Actualización**: Haz clic en "Actualizar Datos" para obtener la información más reciente
4. **Visualización**:
   - Panel superior: KPIs principales (total de leads, leads sin contactar, porcentaje)
   - Gráficos centrales: Tendencias y distribución por fuente
   - Tabla inferior: Distribución por vendedor

## Configuración de Google Sheets

Para que el dashboard funcione correctamente con Google Sheets, asegúrate de que tu hoja de cálculo tenga:

1. Una columna para la fecha (identificable por contener "fecha" o "date" en el encabezado)
2. Una columna para el vendedor/asesor (identificable por contener "asesor", "vendedor" o "propietario" en el encabezado)
3. Permisos adecuados (al menos acceso de lectura público o con la cuenta de servicio)

## Soporte

Para cualquier duda o problema con la implementación, contacta a:

- Arturo, Gerente de Carrera Moto
- Equipo de desarrollo interno

## Próximas mejoras

- Filtrado por tipo de moto
- Integración con CRM completo
- Panel de conversión de leads a ventas
- Notificaciones automáticas para leads sin contactar

---

&copy; 2025 Carrera Moto. Todos los derechos reservados.
