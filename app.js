/**
 * Módulo principal del Dashboard de Leads Carrera Moto
 * Coordina la obtención de datos y actualización de la interfaz
 */

const Dashboard = {
    // Datos actuales del dashboard
    data: {
        leads: [],
        startDate: null,
        endDate: null,
        lastUpdate: null
    },
    
    // Estadísticas calculadas
    stats: {
        total: 0,
        uncontacted: 0,
        hubspot: {
            total: 0,
            uncontacted: 0
        },
        sheets: {
            total: 0,
            uncontacted: 0
        },
        byVendor: {}
    },
    
    /**
     * Inicializa el dashboard
     */
    init: function() {
        this.setupDateRange();
        this.setupEventListeners();
        ChartManager.initCharts();
        
        // Cargar datos iniciales (usamos setTimeout para darle tiempo a la configuración)
        setTimeout(() => {
            this.refreshData();
        }, 500);
    },
    
    /**
     * Configura el rango de fechas por defecto (mes actual)
     */
    setupDateRange: function() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Primer día del mes actual
        this.data.startDate = new Date(currentYear, currentMonth, 1);
        
        // Último día del mes actual
        this.data.endDate = new Date(currentYear, currentMonth + 1, 0);
        
        // Actualizar selectores de fecha en la interfaz
        const monthSelect = document.getElementById('month');
        const yearSelect = document.getElementById('year');
        
        if (monthSelect && yearSelect) {
            monthSelect.value = currentMonth + 1; // El select usa 1-12
            yearSelect.value = currentYear.toString();
        }
    },
    
    /**
     * Configura los event listeners para la interacción del usuario
     */
    setupEventListeners: function() {
        // Escuchar cambios en los selectores de fecha
        document.getElementById('month').addEventListener('change', () => {
            this.updateDateRange();
            this.refreshData();
        });
        
        document.getElementById('year').addEventListener('change', () => {
            this.updateDateRange();
            this.refreshData();
        });
        
        // Botón de actualización de datos
        document.getElementById('refresh-data').addEventListener('click', () => {
            this.refreshData();
        });
    },
    
    /**
     * Actualiza el rango de fechas según los selectores
     */
    updateDateRange: function() {
        const monthSelect = document.getElementById('month');
        const yearSelect = document.getElementById('year');
        
        if (!monthSelect || !yearSelect) return;
        
        const month = parseInt(monthSelect.value) - 1; // Convertir a 0-11
        const year = parseInt(yearSelect.value);
        
        // Validar valores
        if (isNaN(month) || isNaN(year)) return;
        
        // Actualizar fechas
        this.data.startDate = new Date(year, month, 1);
        this.data.endDate = new Date(year, month + 1, 0);
    },
    
    /**
     * Actualiza los datos del dashboard
     */
    refreshData: async function() {
        try {
            // Mostrar indicador de carga
            this.showLoading(true);
            
            // Comprobar si la configuración está completa
            if (!Config.isConfigComplete()) {
                console.warn('La configuración de APIs no está completa');
                Config.openConfigModal();
                return;
            }
            
            // Obtener datos de ambas fuentes
            let hubspotLeads = [];
            let sheetsLeads = [];
            
            try {
                if (Config.hubspot.apiKey) {
                    hubspotLeads = await HubspotAPI.getLeads(
                        this.data.startDate, 
                        this.data.endDate
                    );
                } else {
                    // Datos de prueba si no hay API key
                    hubspotLeads = HubspotAPI.getMockData();
                }
            } catch (error) {
                console.error('Error al obtener datos de HubSpot:', error);
                hubspotLeads = [];
            }
            
            try {
                if (Config.googleSheets.spreadsheetId && Config.googleSheets.apiKey) {
                    sheetsLeads = await SheetsAPI.getLeads(
                        this.data.startDate,
                        this.data.endDate
                    );
                } else {
                    // Datos de prueba si no hay configuración
                    sheetsLeads = SheetsAPI.getMockData();
                }
            } catch (error) {
                console.error('Error al obtener datos de Google Sheets:', error);
                sheetsLeads = [];
            }
            
            // Combinar datos
            this.data.leads = [...hubspotLeads, ...sheetsLeads];
            this.data.lastUpdate = new Date();
            
            // Calcular estadísticas
            this.calculateStats(hubspotLeads, sheetsLeads);
            
            // Actualizar interfaz
            this.updateUI();
            
        } catch (error) {
            console.error('Error al actualizar los datos:', error);
            alert('Error al actualizar los datos. Consulte la consola para más detalles.');
        } finally {
            // Ocultar indicador de carga
            this.showLoading(false);
        }
    },
    
    /**
     * Calcula estadísticas en base a los datos obtenidos
     * @param {Array} hubspotLeads - Leads de HubSpot
     * @param {Array} sheetsLeads - Leads de Google Sheets
     */
    calculateStats: function(hubspotLeads, sheetsLeads) {
        // Reiniciar estadísticas
        this.stats = {
            total: 0,
            uncontacted: 0,
            hubspot: {
                total: 0,
                uncontacted: 0
            },
            sheets: {
                total: 0,
                uncontacted: 0
            },
            byVendor: {}
        };
        
        // Estadísticas de HubSpot
        this.stats.hubspot.total = hubspotLeads.length;
        this.stats.hubspot.uncontacted = hubspotLeads.filter(lead => !lead.isContacted).length;
        
        // Estadísticas de Google Sheets
        this.stats.sheets.total = sheetsLeads.length;
        this.stats.sheets.uncontacted = sheetsLeads.filter(lead => !lead.isContacted).length;
        
        // Estadísticas totales
        this.stats.total = this.stats.hubspot.total + this.stats.sheets.total;
        this.stats.uncontacted = this.stats.hubspot.uncontacted + this.stats.sheets.uncontacted;
        
        // Estadísticas por vendedor
        const allLeads = [...hubspotLeads, ...sheetsLeads];
        
        allLeads.forEach(lead => {
            if (lead.owner) {
                const ownerName = typeof lead.owner === 'string' ? lead.owner : 'Sin nombre';
                
                if (!this.stats.byVendor[ownerName]) {
                    this.stats.byVendor[ownerName] = 0;
                }
                
                this.stats.byVendor[ownerName]++;
            }
        });
    },
    
    /**
     * Actualiza la interfaz del dashboard con los datos nuevos
     */
    updateUI: function() {
        // Actualizar KPIs principales
        document.getElementById('total-leads').textContent = this.stats.total;
        document.getElementById('uncontacted-leads').textContent = this.stats.uncontacted;
        
        // Actualizar detalle por fuente
        document.getElementById('hubspot-leads').textContent = this.stats.hubspot.total;
        document.getElementById('sheets-leads').textContent = this.stats.sheets.total;
        document.getElementById('hubspot-uncontacted').textContent = this.stats.hubspot.uncontacted;
        document.getElementById('sheets-uncontacted').textContent = this.stats.sheets.uncontacted;
        
        // Calcular y actualizar porcentaje de contactados
        const contactedPercentage = this.stats.total > 0 
            ? Math.round(((this.stats.total - this.stats.uncontacted) / this.stats.total) * 100) 
            : 0;
        
        document.getElementById('contacted-percentage').textContent = `${contactedPercentage}%`;
        document.getElementById('contact-progress').style.width = `${contactedPercentage}%`;
        
        // Actualizar hora de última actualización
        if (this.data.lastUpdate) {
            const timeFormat = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
            document.getElementById('last-update-time').textContent = 
                this.data.lastUpdate.toLocaleDateString('es-MX') + ' ' + 
                this.data.lastUpdate.toLocaleTimeString('es-MX', timeFormat);
        }
        
        // Actualizar tabla de vendedores
        this.updateVendorTable();
        
        // Actualizar gráficos
        ChartManager.updateLeadsTrendChart(this.data.leads, this.data.startDate, this.data.endDate);
        ChartManager.updateSourceDistributionChart(this.stats);
    },
    
    /**
     * Actualiza la tabla de vendedores
     */
    updateVendorTable: function() {
        const tableBody = document.querySelector('#vendor-table tbody');
        
        if (!tableBody) return;
        
        // Limpiar tabla
        tableBody.innerHTML = '';
        
        // Ordenar vendedores por número de leads (descendente)
        const sortedVendors = Object.entries(this.stats.byVendor)
            .sort((a, b) => b[1] - a[1]);
        
        // Crear filas para cada vendedor
        sortedVendors.forEach(([vendor, leadsCount]) => {
            const percentage = this.stats.total > 0 
                ? ((leadsCount / this.stats.total) * 100).toFixed(1) 
                : '0.0';
                
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vendor}</td>
                <td>${leadsCount}</td>
                <td>${percentage}%</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Si no hay datos, mostrar mensaje
        if (sortedVendors.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="3" class="empty-table">No hay datos disponibles</td>
            `;
            tableBody.appendChild(emptyRow);
        }
    },
    
    /**
     * Muestra u oculta indicador de carga
     * @param {Boolean} show - Indica si mostrar u ocultar
     */
    showLoading: function(show) {
        const refreshBtn = document.getElementById('refresh-data');
        
        if (refreshBtn) {
            if (show) {
                refreshBtn.textContent = 'Actualizando...';
                refreshBtn.disabled = true;
            } else {
                refreshBtn.textContent = 'Actualizar Datos';
                refreshBtn.disabled = false;
            }
        }
    }
};

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    Dashboard.init();
});
