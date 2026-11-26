const Tables = (() => {
  let productData = [];
  let productFiltered = [];
  let productPage = 1;
  const PAGE_SIZE = 15;
  let sortCol = 'revenue';
  let sortDir = 'desc';

  function formatCurrency(n) { return SalesData.fmt(n); }
  function formatNum(n) { return SalesData.fmtNum(Math.round(n)); }

  function renderProductTable() {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;

    const start = (productPage - 1) * PAGE_SIZE;
    const slice = productFiltered.slice(start, start + PAGE_SIZE);

    tbody.innerHTML = slice.map(r => `
      <tr>
        <td>${r.product}</td>
        <td><span class="category-pill ${r.category}">${r.category}</span></td>
        <td>${r.subCategory || '—'}</td>
        <td class="num">${formatNum(r.qty)}</td>
        <td class="num">${formatCurrency(r.revenue)}</td>
        <td class="num">${formatNum(r.orders)}</td>
        <td class="num">${formatCurrency(r.avgPrice)}</td>
      </tr>
    `).join('');

    const info = document.getElementById('prodPagInfo');
    const pageNum = document.getElementById('prodPageNum');
    const totalPages = Math.ceil(productFiltered.length / PAGE_SIZE);

    if (info) info.textContent = `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, productFiltered.length)} of ${formatNum(productFiltered.length)} products`;
    if (pageNum) pageNum.textContent = `Page ${productPage} of ${totalPages}`;

    const prev = document.getElementById('prodPrevBtn');
    const next = document.getElementById('prodNextBtn');
    if (prev) prev.disabled = productPage === 1;
    if (next) next.disabled = productPage >= totalPages;

    updateSortHeaders();
  }

  function updateSortHeaders() {
    document.querySelectorAll('#productTable th.sortable').forEach(th => {
      th.classList.remove('sorted-asc', 'sorted-desc');
      if (th.dataset.col === sortCol) {
        th.classList.add(sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
      }
    });
  }

  function sortProducts(col) {
    if (sortCol === col) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortCol = col;
      sortDir = 'desc';
    }
    applySearch(document.getElementById('productSearch')?.value || '');
  }

  function applySearch(query) {
    const q = (query || '').toLowerCase().trim();
    productFiltered = productData.filter(r =>
      !q || r.product.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.subCategory || '').toLowerCase().includes(q)
    );

    const numericCols = ['qty','revenue','orders','avgPrice'];
    productFiltered.sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (numericCols.includes(sortCol)) {
        va = parseFloat(va) || 0;
        vb = parseFloat(vb) || 0;
      } else {
        va = String(va || '').toLowerCase();
        vb = String(vb || '').toLowerCase();
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    productPage = 1;
    renderProductTable();
  }

  function update(data) {
    productData = SalesData.productTable(data);
    applySearch(document.getElementById('productSearch')?.value || '');
  }

  function renderTerritoryTable(territories) {
    const tbody = document.getElementById('territoryTableBody');
    if (!tbody) return;
    tbody.innerHTML = territories.map(t => `
      <tr>
        <td><strong>${t.territory}</strong></td>
        <td>${t.group}</td>
        <td class="num">${formatCurrency(t.revenue)}</td>
        <td class="num">${formatNum(t.orders)}</td>
        <td class="num">${formatNum(t.qty)}</td>
        <td class="num">${formatCurrency(t.aov)}</td>
        <td class="num">
          <div style="display:flex;align-items:center;gap:8px;justify-content:flex-end">
            <div style="width:60px;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden">
              <div style="width:${Math.min(t.share,100).toFixed(1)}%;height:100%;background:#2563eb;border-radius:3px"></div>
            </div>
            ${t.share.toFixed(1)}%
          </div>
        </td>
      </tr>
    `).join('');
  }

  function init() {
    document.querySelectorAll('#productTable th.sortable').forEach(th => {
      th.addEventListener('click', () => sortProducts(th.dataset.col));
    });

    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        productPage = 1;
        applySearch(e.target.value);
      });
    }

    document.getElementById('prodPrevBtn')?.addEventListener('click', () => {
      if (productPage > 1) { productPage--; renderProductTable(); }
    });

    document.getElementById('prodNextBtn')?.addEventListener('click', () => {
      const totalPages = Math.ceil(productFiltered.length / PAGE_SIZE);
      if (productPage < totalPages) { productPage++; renderProductTable(); }
    });
  }

  return { init, update, renderTerritoryTable };
})();
