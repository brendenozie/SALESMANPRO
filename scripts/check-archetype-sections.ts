import { getTemplateById } from '../lib/website-builder/template-registry';

['furniture@v1', 'delivery@v1', 'restaurant@v1', 'ecommerce-shoes@v1', 'fashion@v1', 'automotive@v1'].forEach(id => {
  const tpl = getTemplateById(id);
  console.log('=== ' + id + ' ===');
  console.log(tpl?.authenticSections?.slice(0, 4).map(s => ({ id: s.id, name: s.name, component: s.component })));
});
