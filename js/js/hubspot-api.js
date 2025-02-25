/**
 * Módulo para interactuar con la API de HubSpot
 * Proporciona funciones para obtener y analizar leads desde HubSpot
 */

const HubspotAPI = {
    // Configuración básica
    baseUrl: 'https://api.hubapi.com',
    
    /**
     * Obtiene los contactos (leads) de HubSpot según los criterios
     * @param {Date} startDate - Fecha de inicio para filtrar contactos
     * @param {Date} endDate - Fecha de fin para filtrar contactos
     * @returns {Promise<Array>} - Promise con el array de contactos
     */
    getLeads: async function(startDate, endDate) {
        if (!Config.hubspot.apiKey) {
            console.error('Error: HubSpot API Key no configurada');
            return [];
        }
        
        try {
            // Convertir fechas a timestamp para HubSpot
            const startTimestamp = startDate.getTime();
            const endTimestamp = endDate.getTime();
            
            // Parámetros para la solicitud
            const params = new URLSearchParams({
                hapikey: Config.hubspot.apiKey,
                limit: 100, // Número máximo de registros por solicitud
                properties: 'createdate,hs_lead_status,hubspot_owner_id',
                propertyMode: 'value_only'
            });
            
            // Filtrar por fecha de creación
            const filterParams = {
                propertyName: 'createdate',
                operator: 'BETWEEN',
                value: startTimestamp,
                highValue: endTimestamp
            };
            
            params.append('filterGroups', JSON.stringify([{filters: [filterParams]}]));
            
            // Realizar solicitud a HubSpot
            const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error en la respuesta de HubSpot: ${response.status}`);
            }
            
            const data = await response.json();
            return this.processLeadsData(data.results || []);
            
        } catch (error) {
            console.error('Error al obtener leads de HubSpot:', error);
            return [];
        }
    },
    
    /**
     * Procesa los datos de contactos recibidos de HubSpot
     * @param {Array} contacts - Array de contactos de HubSpot
     * @returns {Array} - Array de contactos procesados
     */
    processLeadsData: function(contacts) {
        if (!Array.isArray(contacts)) {
            console.error('Los datos de contactos no tienen el formato esperado');
            return [];
        }
        
        return contacts.map(contact => {
            // Extraer propiedades relevantes
            const properties = contact.properties || {};
            
            return {
                id: contact.id,
                createDate: properties.createdate ? new Date(parseInt(properties.createdate)) : null,
                status: properties.hs_lead_status || 'new',
                isContacted: this.isLeadContacted(contact),
                owner: properties.hubspot_owner_id || null,
                source: 'HubSpot'
            };
        });
    },
    
    /**
     * Determina si un lead ha sido contactado basado en su propietario
     * @param {Object} contact - Objeto de contacto de HubSpot
     * @returns {Boolean} - true si ha sido contactado, false en caso contrario
     */
    isLeadContacted: function(contact) {
        // Si el contacto tiene un propietario asignado, se considera contactado
        const ownerId = contact?.properties?.hubspot_owner_id;
        return ownerId !== null && ownerId !== undefined && ownerId !== '';
    },
    
    /**
     * Simula la obtención de datos para pruebas
     * @returns {Array} - Array de contactos de prueba
     */
    getMockData: function() {
        const currentDate = new Date();
        const mockLeads = [];
        
        // Generar datos aleatorios para pruebas
        for (let i = 0; i < 15; i++) {
            const createDate = new Date(currentDate);
            createDate.setDate(createDate.getDate() - Math.floor(Math.random() * 30));
            
            mockLeads.push({
                id: `mock-${i}`,
                createDate: createDate,
                status: Math.random() > 0.3 ? 'new' : 'qualified',
                isContacted: Math.random() > 0.4,
                owner: Math.random() > 0.4 ? `owner-${Math.floor(Math.random() * 5)}` : null,
                source: 'HubSpot'
            });
        }
        
        return mockLeads;
    }
};
