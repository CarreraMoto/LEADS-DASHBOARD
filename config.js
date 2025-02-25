/**
 * Configuración de las APIs para el Dashboard de Leads
 * Este archivo maneja el almacenamiento seguro de credenciales
 * usando localStorage del navegador.
 */

// Objeto principal para la configuración
const Config = {
    // Valores por defecto (se reemplazarán con los valores guardados)
    hubspot: {
        apiKey: '',
        portalId: ''
    },
    googleSheets: {
        apiKey: '',
        spreadsheetId: '',
        range: 'A:Z' // Rango por defecto para leer todos los datos
    },
    
    // Inicializar configuración
    init: function() {
        this.loadConfig();
        this.setupListeners();
        this.checkConfigStatus();
    },
    
    // Cargar configuración desde localStorage
    loadConfig: function() {
        const savedConfig = localStorage.getItem('carreraMotoDashboardConfig');
        
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                this.hubspot.apiKey = config.hubspot?.apiKey || '';
                this.hubspot.portalId = config.hubspot?.portalId || '';
                this.googleSheets.apiKey = config.googleSheets?.apiKey || '';
                this.googleSheets.spreadsheetId = config.googleSheets?.spreadsheetId || '';
                this.googleSheets.range = config.googleSheets?.range || 'A:Z';
                
                console.log('Configuración cargada correctamente');
            } catch (error) {
                console.error('Error al cargar la configuración:', error);
                this.resetConfig();
            }
        } else {
            console.log('No se encontró configuración guardada');
        }
    },
    
    // Guardar configuración en localStorage
    saveConfig: function() {
        const configToSave = {
            hubspot: {
                apiKey: this.hubspot.apiKey,
                portalId: this.hubspot.portalId
            },
            googleSheets: {
                apiKey: this.googleSheets.apiKey,
                spreadsheetId: this.googleSheets.spreadsheetId,
                range: this.googleSheets.range
            }
        };
        
        localStorage.setItem('carreraMotoDashboardConfig', JSON.stringify(configToSave));
        console.log('Configuración guardada correctamente');
    },
    
    // Restablecer configuración a valores por defecto
    resetConfig: function() {
        this.hubspot.apiKey = '';
        this.hubspot.portalId = '';
        this.googleSheets.apiKey = '';
        this.googleSheets.spreadsheetId = '';
        this.googleSheets.range = 'A:Z';
        
        localStorage.removeItem('carreraMotoDashboardConfig');
        console.log('Configuración restablecida');
    },
    
    // Comprobar si la configuración está completa
    isConfigComplete: function() {
        return (
            this.hubspot.apiKey !== '' &&
            this.googleSheets.apiKey !== '' &&
            this.googleSheets.spreadsheetId !== ''
        );
    },
    
    // Verificar estado de configuración al cargar
    checkConfigStatus: function() {
        if (!this.isConfigComplete()) {
            this.openConfigModal();
        }
    },
    
    // Abrir modal de configuración
    openConfigModal: function() {
        const modal = document.getElementById('config-modal');
        
        // Llenar campos con valores actuales
        document.getElementById('hubspot-api-key').value = this.hubspot.apiKey;
        document.getElementById('sheets-id').value = this.googleSheets.spreadsheetId;
        document.getElementById('sheets-api-key').value = this.googleSheets.apiKey;
        
        modal.style.display = 'block';
    },
    
    // Cerrar modal de configuración
    closeConfigModal: function() {
        const modal = document.getElementById('config-modal');
        modal.style.display = 'none';
    },
    
    // Configurar event listeners
    setupListeners: function() {
        // Botón para guardar configuración
        document.getElementById('save-config').addEventListener('click', () => {
            this.hubspot.apiKey = document.getElementById('hubspot-api-key').value;
            this.googleSheets.spreadsheetId = document.getElementById('sheets-id').value;
            this.googleSheets.apiKey = document.getElementById('sheets-api-key').value;
            
            this.saveConfig();
            this.closeConfigModal();
            
            // Recargar datos si la configuración está completa
            if (this.isConfigComplete() && typeof Dashboard !== 'undefined') {
                Dashboard.refreshData();
            }
        });
        
        // Botón para cancelar
        document.getElementById('cancel-config').addEventListener('click', () => {
            this.closeConfigModal();
        });
        
        // Icono de configuración en la cabecera (se puede agregar después)
        const configBtn = document.createElement('button');
        configBtn.className = 'config-btn';
        configBtn.innerHTML = '⚙️';
        configBtn.addEventListener('click', () => this.openConfigModal());
        
        // Añadir el botón al encabezado después de que el DOM esté listo
        document.addEventListener('DOMContentLoaded', () => {
            const header = document.querySelector('header');
            header.appendChild(configBtn);
        });
    }
};

// Inicializar configuración cuando el script se carga
Config.init();
