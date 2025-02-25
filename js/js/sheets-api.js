/**
 * Módulo para interactuar con la API de Google Sheets
 * Proporciona funciones para obtener y analizar leads desde Google Sheets
 */

const SheetsAPI = {
    // URL base para las solicitudes a la API
    baseUrl: 'https://sheets.googleapis.com/v4/spreadsheets',
    
    /**
     * Obtiene los datos de leads desde Google Sheets
     * @param {Date} startDate - Fecha de inicio para filtrar
     * @param {Date} endDate - Fecha de fin para filtrar
     * @returns {Promise<Array>} - Promise con el array de leads
     */
    getLeads: async function(startDate, endDate) {
        if (!Config.googleSheets.spreadsheetId || !Config.googleSheets.apiKey) {
            console.error('Error: Configuración de Google Sheets incompleta');
            return [];
        }
        
        try {
            const { spreadsheetId, apiKey, range } = Config.googleSheets;
            
            // Crear URL para la solicitud
            const url = `${this.baseUrl}/${spreadsheetId}/values/${range}?key=${apiKey}`;
            
            // Realizar solicitud a Google Sheets API
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error en la respuesta de Google Sheets: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Procesar y filtrar datos por fecha
            return this.processSheetData(data, startDate, endDate);
            
        } catch (error) {
            console.error('Error al obtener datos de Google Sheets:', error);
            return [];
        }
    },
    
    /**
     * Procesa los datos recibidos de Google Sheets
     * @param {Object} responseData - Datos recibidos de la API
     * @param {Date} startDate - Fecha de inicio para filtrar
     * @param {Date} endDate - Fecha de fin para filtrar
     * @returns {Array} - Array de leads procesados
     */
    processSheetData: function(responseData, startDate, endDate) {
        if (!responseData || !responseData.values || !Array.isArray(responseData.values)) {
            console.error('Los datos de Google Sheets no tienen el formato esperado');
            return [];
        }
        
        const rows = responseData.values;
        
        // La primera fila contiene los encabezados
        if (rows.length < 2) {
            return [];
        }
        
        const headers = rows[0];
        const leads = [];
        
        // Encontrar índices de columnas clave
        const dateIndex = headers.findIndex(h => 
            h.toLowerCase().includes('fecha') || 
            h.toLowerCase().includes('date'));
        
        const asesorIndex = headers.findIndex(h => 
            h.toLowerCase().includes('asesor') || 
            h.toLowerCase().includes('vendedor') || 
            h.toLowerCase().includes('propietario'));
        
        // Si no encontramos las columnas necesarias, devolver un array vacío
        if (dateIndex === -1) {
            console.error('No se encontró la columna de fecha en los datos de Google Sheets');
            return [];
        }
        
        // Procesar cada fila (excepto la de encabezados)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            
            // Saltarse filas vacías
            if (!row || row.length === 0) continue;
            
            // Extraer y convertir la fecha
            let leadDate;
            try {
                // Intentar diferentes formatos de fecha
                const dateString = row[dateIndex] || '';
                
                // Primero intentar parsing estándar
                leadDate = new Date(dateString);
                
                // Si no es una fecha válida, intentar formato DD/MM/YYYY
                if (isNaN(leadDate) && dateString.includes('/')) {
                    const [day, month, year] = dateString.split('/');
                    leadDate = new Date(year, month - 1, day);
                }
                
                // Si sigue sin ser válida, omitir este registro
                if (isNaN(leadDate)) {
                    console.warn(`Formato de fecha inválido en la fila ${i+1}: ${dateString}`);
                    continue;
                }
            } catch (error) {
                console.warn(`Error al procesar la fecha en la fila ${i+1}:`, error);
                continue;
            }
            
            // Filtrar por fecha si se proporcionaron fechas de inicio y fin
            if (startDate && endDate) {
                if (leadDate < startDate || leadDate > endDate) {
                    continue;
                }
            }
            
            // Determinar si el lead ha sido contactado
            const isContacted = asesorIndex !== -1 && 
                               row[asesorIndex] !== undefined && 
                               row[asesorIndex] !== null && 
                               row[asesorIndex].trim() !== '';
            
            // Crear objeto de lead
            leads.push({
                id: `sheets-${i}`,
                createDate: leadDate,
                isContacted: isContacted,
                owner: asesorIndex !== -1 ? row[asesorIndex] || null : null,
                source: 'Google Sheets',
                rawData: row // Datos completos por si se necesitan después
            });
        }
        
        return leads;
    },
    
    /**
     * Genera datos de prueba para desarrollo
     * @returns {Array} - Array de leads simulados
     */
    getMockData: function() {
        const currentDate = new Date();
        const mockLeads = [];
        
        // Generar datos aleatorios para pruebas
        for (let i = 0; i < 20; i++) {
            const createDate = new Date(currentDate);
            createDate.setDate(createDate.getDate() - Math.floor(Math.random() * 30));
            
            mockLeads.push({
                id: `sheets-mock-${i}`,
                createDate: createDate,
                isContacted: Math.random() > 0.3,
                owner: Math.random() > 0.3 ? ['Leslye', 'Juan Pablo', 'Edgar', 'Karla', 'Monica'][Math.floor(Math.random() * 5)] : null,
                source: 'Google Sheets'
            });
        }
        
        return mockLeads;
    }
};
