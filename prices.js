const parseCsv = (text) => {
  const rows = [];
  let current = '';
  let row = [];
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (insideQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      row.push(current);
      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  if (current || row.length) {
    row.push(current);
    if (row.some((cell) => cell.trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
};

const formatPrice = (value) => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return value;
  return `Rs ${numericValue}`;
};

const normalizeRows = (rows, config) => {
  return rows
    .slice(1)
    .map((row) => ({
      category: (row[config.categoryIndex] || '').trim(),
      product: (row[config.productIndex] || '').trim(),
      price: (row[config.primaryPriceIndex] || '').trim(),
    }))
    .filter((row) => row.category && row.product && row.price);
};

const groupRows = (rows) => {
  const groups = new Map();
  rows.forEach((row) => {
    if (!groups.has(row.category)) {
      groups.set(row.category, []);
    }
    groups.get(row.category).push(row);
  });
  return groups;
};

const buildPriceRows = (rows) => rows.map((row) => `
  <tr>
    <td>${row.product}</td>
    <td><span class="price-badge">${formatPrice(row.price)}</span></td>
  </tr>
`).join('');

const serviceTabs = document.querySelectorAll('[data-price-service-tabs] .tab');
const categoryTabs = document.getElementById('price-category-tabs');
const catalogShell = document.getElementById('price-catalog-shell');
const catalogTitle = document.getElementById('catalog-title');
const catalogDescription = document.getElementById('catalog-description');
const embeddedPriceData = window.PRICE_DATA || {};

const catalogs = {
  drycleaning: {
    label: 'Drycleaning',
    description: 'Category-wise YouClean prices for garments, footwear, household items, and luxury care.',
    rows: normalizeRows(parseCsv(embeddedPriceData.drycleaningCsv || ''), {
      categoryIndex: 0,
      productIndex: 1,
      primaryPriceIndex: 3,
    }),
  },
  'steam-iron': {
    label: 'Steam Iron',
    description: 'Quick ironing rates for everyday garments and household items, organized by category.',
    rows: normalizeRows(parseCsv(embeddedPriceData.steamIronCsv || ''), {
      categoryIndex: 0,
      productIndex: 1,
      primaryPriceIndex: 2,
    }),
  },
};

let activeService = 'drycleaning';
let activeCategory = '';

const renderCategoryTabs = (serviceKey) => {
  const groupedRows = groupRows(catalogs[serviceKey].rows);
  const categories = [...groupedRows.keys()];
  activeCategory = categories[0] || '';

  categoryTabs.innerHTML = categories.map((category) => `
    <button class="category-link ${category === activeCategory ? 'is-active' : ''}" type="button" data-category-tab="${category}">
      ${category}
    </button>
  `).join('');

  categoryTabs.querySelectorAll('[data-category-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.getAttribute('data-category-tab') || '';
      renderCatalog();
      renderCategoryTabs(serviceKey);
    });
  });
};

const renderCatalog = () => {
  const serviceConfig = catalogs[activeService];
  const groupedRows = groupRows(serviceConfig.rows);
  const categoryRows = groupedRows.get(activeCategory) || [];

  catalogTitle.textContent = serviceConfig.label;
  catalogDescription.textContent = serviceConfig.description;

  if (!categoryRows.length) {
    catalogShell.innerHTML = '<div class="catalog-empty">No prices available right now.</div>';
    return;
  }

  catalogShell.innerHTML = `
    <article class="price-group">
      <div class="price-group-header">
        <h3>${activeCategory}</h3>
        <p>${categoryRows.length} items</p>
      </div>
      <div class="price-table-wrap">
        <table class="price-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>YouClean price</th>
            </tr>
          </thead>
          <tbody>
            ${buildPriceRows(categoryRows)}
          </tbody>
        </table>
      </div>
    </article>
  `;
};

const renderService = (serviceKey) => {
  activeService = serviceKey;
  serviceTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.getAttribute('data-service-tab') === serviceKey);
  });
  renderCategoryTabs(serviceKey);
  renderCatalog();
};

serviceTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const serviceKey = tab.getAttribute('data-service-tab');
    if (!serviceKey) return;
    renderService(serviceKey);
  });
});

renderService(activeService);
