const Charts = (() => {
  const instances = {};

  const PALETTE = {
    blue: '#2563eb',
    teal: '#0d9488',
    amber: '#f59e0b',
    purple: '#7c3aed',
    green: '#10b981',
    red: '#ef4444',
    cyan: '#06b6d4',
    indigo: '#4f46e5',
  };

  const CAT_COLORS = {
    Bikes: '#2563eb',
    Components: '#0d9488',
    Accessories: '#f59e0b',
    Clothing: '#7c3aed',
  };

  const TERRITORY_COLORS = [
    '#2563eb','#0d9488','#f59e0b','#7c3aed','#10b981','#ef4444','#06b6d4','#4f46e5'
  ];

  const STATUS_COLORS = {
    Shipped: '#10b981',
    Approved: '#2563eb',
    'In process': '#06b6d4',
    Backordered: '#f59e0b',
    Rejected: '#ef4444',
    Cancelled: '#94a3b8',
  };

  Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
  Chart.defaults.color = '#64748b';
  Chart.defaults.borderColor = '#e2e8f0';
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;

  function tooltipDefaults() {
    return {
      backgroundColor: '#0f172a',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: '#1e293b',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      titleFont: { weight: '700', size: 13 },
      bodyFont: { size: 12 },
    };
  }

  function destroy(id) {
    if (instances[id]) {
      instances[id].destroy();
      delete instances[id];
    }
  }

  function create(id, config) {
    destroy(id);
    const ctx = document.getElementById(id);
    if (!ctx) return;
    instances[id] = new Chart(ctx, config);
    return instances[id];
  }

  function renderTrend(monthly) {
    const labels = monthly.map(([k]) => {
      const [y, m] = k.split('-');
      return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });
    const values = monthly.map(([, v]) => v);

    create('chartTrend', {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Revenue',
          data: values,
          borderColor: PALETTE.blue,
          backgroundColor: 'rgba(37,99,235,0.08)',
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: true,
          tension: 0.3,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipDefaults(),
            callbacks: {
              label: ctx => ' ' + SalesData.fmt(ctx.raw)
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 12, maxRotation: 45 } },
          y: {
            ticks: { callback: v => SalesData.fmt(v) },
            grid: { color: 'rgba(0,0,0,0.04)' }
          }
        }
      }
    });
  }

  function renderCategory(byCategory) {
    const labels = Object.keys(byCategory);
    const values = Object.values(byCategory);
    const colors = labels.map(l => CAT_COLORS[l] || PALETTE.blue);

    create('chartCategory', {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            ...tooltipDefaults(),
            callbacks: {
              label: ctx => ' ' + SalesData.fmt(ctx.raw) + ' (' + ((ctx.raw / values.reduce((a,b)=>a+b,0))*100).toFixed(1) + '%)'
            }
          }
        }
      }
    });
  }

  function renderTerritory(byTerritory) {
    const sorted = Object.entries(byTerritory).sort((a,b) => b[1] - a[1]);
    const labels = sorted.map(([k]) => k);
    const values = sorted.map(([,v]) => v);

    create('chartTerritory', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Revenue',
          data: values,
          backgroundColor: TERRITORY_COLORS.slice(0, labels.length),
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipDefaults(),
            callbacks: { label: ctx => ' ' + SalesData.fmt(ctx.raw) }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxRotation: 30 } },
          y: {
            ticks: { callback: v => SalesData.fmt(v) },
            grid: { color: 'rgba(0,0,0,0.04)' }
          }
        }
      }
    });
  }

  function renderTop10(topProds, canvasId) {
    const labels = topProds.map(([k]) => k.length > 28 ? k.slice(0,28) + '…' : k);
    const values = topProds.map(([,v]) => v);

    create(canvasId || 'chartTop10', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Revenue',
          data: values,
          backgroundColor: PALETTE.blue,
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipDefaults(),
            callbacks: { label: ctx => ' ' + SalesData.fmt(ctx.raw) }
          }
        },
        scales: {
          x: {
            ticks: { callback: v => SalesData.fmt(v) },
            grid: { color: 'rgba(0,0,0,0.04)' }
          },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
  }

  function renderBottom10(bottomProds) {
    const labels = bottomProds.map(([k]) => k.length > 28 ? k.slice(0,28) + '…' : k);
    const values = bottomProds.map(([,v]) => v);

    create('chartProdBottom10', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Revenue',
          data: values,
          backgroundColor: PALETTE.red,
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipDefaults(),
            callbacks: { label: ctx => ' ' + SalesData.fmt(ctx.raw) }
          }
        },
        scales: {
          x: {
            ticks: { callback: v => SalesData.fmt(v) },
            grid: { color: 'rgba(0,0,0,0.04)' }
          },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
  }

  function renderStatus(byStatus) {
    const labels = Object.keys(byStatus);
    const values = Object.values(byStatus);
    const colors = labels.map(l => STATUS_COLORS[l] || '#94a3b8');

    create('chartStatus', {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            ...tooltipDefaults(),
            callbacks: {
              label: ctx => ' ' + SalesData.fmtNum(ctx.raw) + ' orders (' + ((ctx.raw / values.reduce((a,b)=>a+b,0))*100).toFixed(1) + '%)'
            }
          }
        }
      }
    });
  }

  function renderYearly(yearly) {
    const labels = yearly.map(([k]) => k);
    const values = yearly.map(([,v]) => v);

    create('chartYearly', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Annual Revenue',
          data: values,
          backgroundColor: [
            'rgba(37,99,235,0.7)',
            'rgba(37,99,235,0.8)',
            'rgba(37,99,235,0.9)',
            'rgba(37,99,235,0.6)',
          ],
          borderColor: PALETTE.blue,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipDefaults(),
            callbacks: { label: ctx => ' ' + SalesData.fmt(ctx.raw) }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: { callback: v => SalesData.fmt(v) },
            grid: { color: 'rgba(0,0,0,0.04)' }
          }
        }
      }
    });
  }

  function renderProductCategory(byCategory) {
    const labels = Object.keys(byCategory);
    const values = Object.values(byCategory);
    const colors = labels.map(l => CAT_COLORS[l] || PALETTE.blue);

    create('chartProdCategory', {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            ...tooltipDefaults(),
            callbacks: {
              label: ctx => ' ' + SalesData.fmt(ctx.raw)
            }
          }
        }
      }
    });
  }

  function renderSubcategory(bySubcat) {
    const sorted = Object.entries(bySubcat).sort((a,b) => b[1] - a[1]);
    const labels = sorted.map(([k]) => k);
    const values = sorted.map(([,v]) => v);

    create('chartSubcat', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Units',
          data: values,
          backgroundColor: PALETTE.teal,
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipDefaults(),
            callbacks: { label: ctx => ' ' + SalesData.fmtNum(ctx.raw) + ' units' }
          }
        },
        scales: {
          x: { ticks: { callback: v => SalesData.fmtNum(v) }, grid: { color: 'rgba(0,0,0,0.04)' } },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
  }

  function renderTerritoryBar(territories) {
    const labels = territories.map(t => t.territory);
    const values = territories.map(t => t.revenue);

    create('chartTerritoryBar', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Revenue',
          data: values,
          backgroundColor: TERRITORY_COLORS.slice(0, labels.length),
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipDefaults(),
            callbacks: { label: ctx => ' ' + SalesData.fmt(ctx.raw) }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: { callback: v => SalesData.fmt(v) },
            grid: { color: 'rgba(0,0,0,0.04)' }
          }
        }
      }
    });
  }

  function renderTerritoryGroup(territories) {
    const groups = {};
    for (const t of territories) {
      groups[t.group] = (groups[t.group] || 0) + t.revenue;
    }
    const labels = Object.keys(groups);
    const values = Object.values(groups);
    const groupColors = ['#2563eb','#0d9488','#f59e0b'];

    create('chartTerritoryGroup', {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: groupColors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            ...tooltipDefaults(),
            callbacks: {
              label: ctx => ' ' + SalesData.fmt(ctx.raw) + ' (' + ((ctx.raw / values.reduce((a,b)=>a+b,0))*100).toFixed(1) + '%)'
            }
          }
        }
      }
    });
  }

  function renderTerritoryOrders(territories) {
    const sorted = [...territories].sort((a,b) => b.orders - a.orders);
    const labels = sorted.map(t => t.territory);
    const values = sorted.map(t => t.orders);

    create('chartTerritoryOrders', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Orders',
          data: values,
          backgroundColor: PALETTE.purple,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipDefaults(),
            callbacks: { label: ctx => ' ' + SalesData.fmtNum(ctx.raw) + ' orders' }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { ticks: { callback: v => SalesData.fmtNum(v) }, grid: { color: 'rgba(0,0,0,0.04)' } }
        }
      }
    });
  }

  function renderTerritoryBubble(territories) {
    const maxRev = Math.max(...territories.map(t => t.revenue));
    const datasets = territories.map((t, i) => ({
      label: t.territory,
      data: [{
        x: t.orders,
        y: t.revenue,
        r: Math.max(6, (t.revenue / maxRev) * 36)
      }],
      backgroundColor: TERRITORY_COLORS[i % TERRITORY_COLORS.length] + 'bb',
      borderColor: TERRITORY_COLORS[i % TERRITORY_COLORS.length],
      borderWidth: 2,
    }));

    create('chartTerritoryBubble', {
      type: 'bubble',
      data: { datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            ...tooltipDefaults(),
            callbacks: {
              label: ctx => {
                const t = territories.find(t => t.territory === ctx.dataset.label);
                return [
                  ' ' + ctx.dataset.label,
                  ' Revenue: ' + SalesData.fmt(ctx.raw.y),
                  ' Orders: ' + SalesData.fmtNum(ctx.raw.x),
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Number of Orders', color: '#64748b', font: { size: 12 } },
            ticks: { callback: v => SalesData.fmtNum(v) },
            grid: { color: 'rgba(0,0,0,0.04)' }
          },
          y: {
            title: { display: true, text: 'Revenue (USD)', color: '#64748b', font: { size: 12 } },
            ticks: { callback: v => SalesData.fmt(v) },
            grid: { color: 'rgba(0,0,0,0.04)' }
          }
        }
      }
    });
  }

  return {
    renderTrend, renderCategory, renderTerritory, renderTop10, renderBottom10,
    renderStatus, renderYearly, renderProductCategory, renderSubcategory,
    renderTerritoryBar, renderTerritoryGroup, renderTerritoryOrders, renderTerritoryBubble,
  };
})();
