const Dashboard = (() => {
  let currentPage = 'overview';
  const filters = { year: '', month: '', category: '', territory: '', status: '' };

  function setKPI(id, value, sub) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
    const subEl = document.getElementById(id + 'Sub');
    if (subEl && sub !== undefined) subEl.textContent = sub;
  }

  function updateOverviewKPIs(data) {
    const kpis = SalesData.computeKPIs(data);
    setKPI('kpiRevenue', SalesData.fmt(kpis.revenue), `${SalesData.fmtNum(kpis.qty)} units × avg price`);
    setKPI('kpiOrders', SalesData.fmtNum(kpis.orders), 'unique orders');
    setKPI('kpiUnits', SalesData.fmtNum(kpis.qty), 'total quantity sold');
    setKPI('kpiCustomers', SalesData.fmtNum(kpis.customers), 'unique customers');
    setKPI('kpiAov', SalesData.fmt(kpis.aov), 'per order average');
    setKPI('kpiProducts', SalesData.fmtNum(kpis.products), 'distinct SKUs');
  }

  function updateOverviewCharts(data) {
    Charts.renderTrend(SalesData.monthlySales(data));
    Charts.renderCategory(SalesData.groupBy(data, 'category', 'lineTotal'));
    Charts.renderTerritory(SalesData.groupBy(data, 'territory', 'lineTotal'));
    Charts.renderTop10(SalesData.topProducts(data, 10, false), 'chartTop10');
    Charts.renderStatus(SalesData.groupByOrders(data, 'status'));
    Charts.renderYearly(SalesData.yearlySales(data));
  }

  function updateProductKPIs(data) {
    const products = SalesData.productTable(data);
    const subcats = new Set(data.map(r => r.subCategory).filter(Boolean));
    const topProd = products.sort((a,b) => b.revenue - a.revenue)[0];
    const totalQty = data.reduce((s, r) => s + (r.qty || 0), 0);

    setKPI('kpiTotalProducts', SalesData.fmtNum(products.length), 'distinct products');
    setKPI('kpiBestProduct', topProd ? topProd.product : '—', topProd ? SalesData.fmt(topProd.revenue) : '');
    setKPI('kpiProdUnits', SalesData.fmtNum(totalQty), 'total units');
    setKPI('kpiSubcats', SalesData.fmtNum(subcats.size), 'subcategories');
  }

  function updateProductCharts(data) {
    Charts.renderProductCategory(SalesData.groupBy(data, 'category', 'lineTotal'));
    Charts.renderSubcategory(SalesData.groupBy(data, 'subCategory', 'qty'));
    Charts.renderTop10(SalesData.topProducts(data, 10, false), 'chartProdTop10');
    Charts.renderBottom10(SalesData.topProducts(data, 10, true));
  }

  function updateTerritoryKPIs(data) {
    const territories = SalesData.territoryTable(data);
    const groups = new Set(data.map(r => r.territoryGroup).filter(Boolean));
    const top = territories[0];
    const totalRev = territories.reduce((s, t) => s + t.revenue, 0);
    const avgRev = territories.length > 0 ? totalRev / territories.length : 0;

    setKPI('kpiTerritories', SalesData.fmtNum(territories.length), 'active territories');
    setKPI('kpiTopTerritory', top ? top.territory : '—', top ? SalesData.fmt(top.revenue) : '');
    setKPI('kpiGroups', SalesData.fmtNum(groups.size), 'territory groups');
    setKPI('kpiAvgTerritory', SalesData.fmt(avgRev), 'per territory avg');
  }

  function updateTerritoryCharts(data) {
    const territories = SalesData.territoryTable(data);
    Charts.renderTerritoryBar(territories);
    Charts.renderTerritoryGroup(territories);
    Charts.renderTerritoryOrders(territories);
    Charts.renderTerritoryBubble(territories);
    Tables.renderTerritoryTable(territories);
  }

  function refresh() {
    const data = SalesData.applyFilters(filters);
    updateFilterSummary(data.length);

    if (currentPage === 'overview') {
      updateOverviewKPIs(data);
      updateOverviewCharts(data);
    } else if (currentPage === 'products') {
      updateProductKPIs(data);
      updateProductCharts(data);
      Tables.update(data);
    } else if (currentPage === 'territory') {
      updateTerritoryKPIs(data);
      updateTerritoryCharts(data);
    }
  }

  function updateFilterSummary(count) {
    const parts = [];
    if (filters.year) parts.push(`Year: ${filters.year}`);
    if (filters.month) {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      parts.push(`Month: ${months[parseInt(filters.month) - 1]}`);
    }
    if (filters.category) parts.push(`Category: ${filters.category}`);
    if (filters.territory) parts.push(`Territory: ${filters.territory}`);
    if (filters.status) parts.push(`Status: ${filters.status}`);

    const el = document.getElementById('filterSummary');
    if (!el) return;
    if (parts.length === 0) {
      el.textContent = `Showing all ${SalesData.fmtNum(count)} records`;
    } else {
      el.textContent = `Filtered: ${parts.join(' · ')} — ${SalesData.fmtNum(count)} records`;
    }
  }

  function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const target = document.getElementById(`page-${page}`);
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);

    if (target) target.classList.remove('hidden');
    if (navItem) navItem.classList.add('active');

    const label = target?.dataset.label || page;
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = label;

    currentPage = page;
    refresh();

    if (window.innerWidth <= 1024) {
      closeSidebar();
    }
  }

  function openSidebar() {
    document.getElementById('sidebar')?.classList.add('open');
    document.getElementById('sidebarOverlay')?.classList.add('open');
  }

  function closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('open');
  }

  async function init() {
    try {
      await SalesData.load();

      const overlay = document.getElementById('loadingOverlay');
      if (overlay) {
        overlay.classList.add('hidden');
        setTimeout(() => overlay.remove(), 300);
      }

      Tables.init();

      document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', e => {
          e.preventDefault();
          switchPage(item.dataset.page);
        });
      });

      document.getElementById('filterYear')?.addEventListener('change', e => {
        filters.year = e.target.value;
        refresh();
      });
      document.getElementById('filterMonth')?.addEventListener('change', e => {
        filters.month = e.target.value;
        refresh();
      });
      document.getElementById('filterCategory')?.addEventListener('change', e => {
        filters.category = e.target.value;
        refresh();
      });
      document.getElementById('filterTerritory')?.addEventListener('change', e => {
        filters.territory = e.target.value;
        refresh();
      });
      document.getElementById('filterStatus')?.addEventListener('change', e => {
        filters.status = e.target.value;
        refresh();
      });

      document.getElementById('resetFilters')?.addEventListener('click', () => {
        filters.year = ''; filters.month = ''; filters.category = '';
        filters.territory = ''; filters.status = '';
        document.querySelectorAll('.filter-bar select').forEach(s => s.value = '');
        refresh();
      });

      document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
        SalesData.exportCSV(SalesData.getFiltered());
      });

      document.getElementById('menuToggle')?.addEventListener('click', openSidebar);
      document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
      document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);

      switchPage('overview');

    } catch (err) {
      console.error('Dashboard init failed:', err);
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) {
        overlay.querySelector('.loading-text').textContent = 'Failed to load data. Please refresh.';
      }
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => Dashboard.init());
