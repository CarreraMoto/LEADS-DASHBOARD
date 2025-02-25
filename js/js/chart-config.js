/**
 * Módulo para configurar y gestionar los gráficos del dashboard
 * Utiliza Chart.js para crear visualizaciones
 */

const ChartManager = {
    // Referencias a los gráficos
    charts: {
        leadsTrend: null,
        sourceDistribution: null
    },
    
    // Colores principales para los gráficos
    colors: {
        primary: '#d32f2f',
        secondary: '#212121',
        success: '#4caf50',
        warning: '#ff9800',
        danger: '#f44336',
        background: 'rgba(211, 47, 47, 0.1)'
    },
    
    /**
     * Inicializa los gráficos del dashboard
     */
    initCharts: function() {
        // Configuración común para los gráficos
        Chart.defaults.font.family = "'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif";
        Chart.defaults.color = '#757575';
        
        // Inicializar gráficos vacíos
        this.initLeadsTrendChart();
        this.initSourceDistributionChart();
    },
    
    /**
     * Inicializa el gráfico de tendencia de leads
     */
    initLeadsTrendChart: function() {
        const ctx = document.getElementById('leads-trend-chart').getContext('2d');
        
        // Crear gráfico de línea para la tendencia de leads
        this.charts.leadsTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [], // Se llenará con fechas
                datasets: [
                    {
                        label: 'Total de Leads',
                        data: [], // Se llenará con datos
                        borderColor: this.colors.primary,
                        backgroundColor: this.colors.background,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Leads Contactados',
                        data: [], // Se llenará con datos
                        borderColor: this.colors.success,
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0 // Solo números enteros
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    },
    
    /**
     * Inicializa el gráfico de distribución por fuente
     */
    initSourceDistributionChart: function() {
        const ctx = document.getElementById('source-distribution-chart').getContext('2d');
        
        // Crear gráfico de dona para la distribución por fuente
        this.charts.sourceDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['HubSpot', 'Google Sheets'],
                datasets: [{
                    data: [0, 0], // Se llenará con datos
                    backgroundColor: [
                        this.colors.primary,
                        this.colors.secondary
                    ],
                    borderColor: 'white',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Actualiza el gráfico de tendencia de leads con nuevos datos
     * @param {Array} leads - Array de objetos de leads
     * @param {Date} startDate - Fecha de inicio
     * @param {Date} endDate - Fecha de fin
     */
    updateLeadsTrendChart: function(leads, startDate, endDate) {
        if (!leads || !Array.isArray(leads) || !this.charts.leadsTrend) {
            return;
        }
        
        // Agrupar leads por día
        const dailyLeads = this.groupLeadsByDay(leads, startDate, endDate);
        
        // Preparar datos para el gráfico
        const labels = Object.keys(dailyLeads);
        const totalData = labels.map(date => dailyLeads[date].total);
        const contactedData = labels.map(date => dailyLeads[date].contacted);
        
        // Actualizar datos del gráfico
        this.charts.leadsTrend.data.labels = labels;
        this.charts.leadsTrend.data.datasets[0].data = totalData;
        this.charts.leadsTrend.data.datasets[1].data = contactedData;
        
        // Actualizar el gráfico
        this.charts.leadsTrend.update();
    },
    
    /**
     * Actualiza el gráfico de distribución por fuente
     * @param {Object} stats - Estadísticas de leads
     */
    updateSourceDistributionChart: function(stats) {
        if (!stats || !this.charts.sourceDistribution) {
            return;
        }
        
        // Actualizar datos del gráfico
        this.charts.sourceDistribution.data.datasets[0].data = [
            stats.hubspot.total || 0,
            stats.sheets.total || 0
        ];
        
        // Actualizar el gráfico
        this.charts.sourceDistribution.update();
    },
    
    /**
     * Agrupa los leads por día para el gráfico de tendencia
     * @param {Array} leads - Array de objetos de leads
     * @param {Date} startDate - Fecha de inicio
     * @param {Date} endDate - Fecha de fin
     * @returns {Object} - Objeto con datos agrupados por día
     */
    groupLeadsByDay: function(leads, startDate, endDate) {
        const result = {};
        
        // Crear array de todas las fechas en el rango
        const dateArray = this.getDateRange(startDate, endDate);
        
        // Inicializar el objeto resultado con 0 para cada día
        dateArray.forEach(date => {
            const dateStr = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            result[dateStr] = { total: 0, contacted: 0 };
        });
        
        // Contar leads por día
        leads.forEach(lead => {
            if (!lead.createDate) return;
            
            const dateStr = lead.createDate.toISOString().split('T')[0];
            
            if (result[dateStr]) {
                result[dateStr].total += 1;
                
                if (lead.isContacted) {
                    result[dateStr].contacted += 1;
                }
            }
        });
        
        return result;
    },
    
    /**
     * Genera un array de fechas entre dos fechas dadas
     * @param {Date} startDate - Fecha de inicio
     * @param {Date} endDate - Fecha de fin
     * @returns {Array} - Array de objetos Date
     */
    getDateRange: function(startDate, endDate) {
        const dateArray = [];
        const currentDate = new Date(startDate);
        
        // Generar todas las fechas entre inicio y fin
        while (currentDate <= endDate) {
            dateArray.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dateArray;
    }
};
