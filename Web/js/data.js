const SalesData = (() => {
  let raw = [];
  let filtered = [];

  function fmt(n) {
    if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'K';
    return '$' + n.toFixed(0);
  }

  function fmtNum(n) {
    return n.toLocaleString('en-US');
  }

  async function load() {
    if (window.SALES_DATA) {
      raw = window.SALES_DATA;
    } else {
      const res = await fetch('data/sales_data.json');
      raw = await res.json();
    }
    filtered = raw;
    return raw;
  }

  function applyFilters(filters) {
    filtered = raw.filter(r => {
      if (filters.year && new Date(r.orderDate).getFullYear() !== parseInt(filters.year)) return false;
      if (filters.month && new Date(r.orderDate).getMonth() + 1 !== parseInt(filters.month)) return false;
      if (filters.category && r.category !== filters.category) return false;
      if (filters.territory && r.territory !== filters.territory) return false;
      if (filters.status && r.status !== filters.status) return false;
      return true;
    });
    return filtered;
  }

  function getFiltered() { return filtered; }

  function computeKPIs(data) {
    const orders = new Set();
    const customers = new Set();
    const products = new Set();
    let revenue = 0;
    let qty = 0;

    for (const r of data) {
      revenue += r.lineTotal;
      qty += r.qty || 0;
      if (r.orderId) orders.add(r.orderId);
      if (r.customerId) customers.add(r.customerId);
      if (r.productId) products.add(r.productId);
    }

    const aov = orders.size > 0
      ? revenue / orders.size
      : 0;

    return {
      revenue, qty,
      orders: orders.size,
      customers: customers.size,
      products: products.size,
      aov
    };
  }

  function groupBy(data, key, valueKey) {
    const map = {};
    for (const r of data) {
      const k = r[key];
      if (!k) continue;
      map[k] = (map[k] || 0) + (r[valueKey] || 0);
    }
    return map;
  }

  function groupByOrders(data, key) {
    const ordersSeen = {};
    for (const r of data) {
      const k = r[key];
      if (!k || !r.orderId) continue;
      if (!ordersSeen[k]) ordersSeen[k] = new Set();
      ordersSeen[k].add(r.orderId);
    }
    const result = {};
    for (const k of Object.keys(ordersSeen)) {
      result[k] = ordersSeen[k].size;
    }
    return result;
  }

  function monthlySales(data) {
    const map = {};
    for (const r of data) {
      if (!r.orderDate) continue;
      const d = new Date(r.orderDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + r.lineTotal;
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }

  function yearlySales(data) {
    const map = {};
    for (const r of data) {
      if (!r.orderDate) continue;
      const year = new Date(r.orderDate).getFullYear();
      map[year] = (map[year] || 0) + r.lineTotal;
    }
    return Object.entries(map).sort((a, b) => a[0] - b[0]);
  }

  function topProducts(data, n, reverse) {
    const byProd = {};
    for (const r of data) {
      if (!r.product) continue;
      byProd[r.product] = (byProd[r.product] || 0) + r.lineTotal;
    }
    const sorted = Object.entries(byProd).sort((a, b) => b[1] - a[1]);
    return reverse ? sorted.slice(-n).reverse() : sorted.slice(0, n);
  }

  function productTable(data) {
    const map = {};
    for (const r of data) {
      if (!r.product) continue;
      if (!map[r.product]) {
        map[r.product] = {
          product: r.product,
          category: r.category,
          subCategory: r.subCategory,
          qty: 0, revenue: 0, orders: new Set(), unitPrices: []
        };
      }
      map[r.product].qty += r.qty || 0;
      map[r.product].revenue += r.lineTotal;
      if (r.orderId) map[r.product].orders.add(r.orderId);
      if (r.unitPrice) map[r.product].unitPrices.push(r.unitPrice);
    }
    return Object.values(map).map(p => ({
      product: p.product,
      category: p.category,
      subCategory: p.subCategory,
      qty: p.qty,
      revenue: p.revenue,
      orders: p.orders.size,
      avgPrice: p.unitPrices.length > 0
        ? p.unitPrices.reduce((a, b) => a + b, 0) / p.unitPrices.length
        : 0
    }));
  }

  function territoryTable(data) {
    const map = {};
    for (const r of data) {
      if (!r.territory) continue;
      if (!map[r.territory]) {
        map[r.territory] = {
          territory: r.territory,
          group: r.territoryGroup,
          revenue: 0, orders: new Set(), qty: 0
        };
      }
      map[r.territory].revenue += r.lineTotal;
      map[r.territory].qty += r.qty || 0;
      if (r.orderId) map[r.territory].orders.add(r.orderId);
    }
    const totalRev = Object.values(map).reduce((s, t) => s + t.revenue, 0);
    return Object.values(map).map(t => ({
      ...t,
      orders: t.orders.size,
      aov: t.orders.size > 0 ? t.revenue / t.orders.size : 0,
      share: totalRev > 0 ? (t.revenue / totalRev) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }

  function exportCSV(data) {
    const cols = ['orderDetailId','orderId','orderDate','status','customerId',
      'territory','territoryGroup','product','category','subCategory',
      'qty','unitPrice','lineTotal','taxAmt','freight'];
    const header = cols.join(',');
    const rows = data.map(r =>
      cols.map(c => {
        const v = r[c];
        if (v === null || v === undefined) return '';
        const s = String(v);
        return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(',')
    );
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `depi_sales_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return { load, applyFilters, getFiltered, computeKPIs, groupBy, groupByOrders,
    monthlySales, yearlySales, topProducts, productTable, territoryTable, exportCSV, fmt, fmtNum };
})();
