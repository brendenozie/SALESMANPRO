const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { getTemplateById } = require('../lib/website-builder/template-registry');
const EcommerceShoesSite = require('../components/site/layouts/EcommerceShoesLayout/body/EcommerceShoesSite').default;
const { StoreContextProvider } = require('../contexts/StoreContext');

const tpl = getTemplateById('ecommerce-shoes@v1');
const sections = tpl.authenticSections.map(s => ({
  id: s.id,
  type: s.type || s.id,
  component: s.component || s.name,
  visible: true,
  content: { title: s.name, ...(s.defaultContent || {}) }
}));

const mockStore = {
  id: 'store-test-ecommerce-shoes',
  name: 'Ecommerce Shoes Store',
  slug: 'ecommerce-shoes',
  themeSettings: { primaryColor: '#10B981' },
  sections,
  heroSlides: [{ id: 'slide-1', headline: 'Test' }],
  StoreCategory: [],
  marketplaceListings: [],
  promotions: []
};

try {
  const html = ReactDOMServer.renderToString(
    React.createElement(StoreContextProvider, { initialStore: mockStore },
      React.createElement(EcommerceShoesSite, { pageData: mockStore, companyId: 'test' })
    )
  );
  console.log('Rendered successfully! Length:', html.length);
} catch (e) {
  console.error('FAILED:', e.message);
  console.error(e.stack);
}
