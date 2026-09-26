const { getCategoryMenus } = require('./constant/CATEGORY_MENUS');

try {
  const menus = getCategoryMenus('test-slug', 'ADMIN', 'Ghuba Pro', true);
  console.log("Supported Categories in CATEGORY_MENUS:", Object.keys(menus));
  console.log("\nSample menu for 'School Head' / 'Educational & Online Courses':");
  const schoolMenu = menus["Educational & Online Courses"] || menus["School Head"];
  if (schoolMenu) {
    console.log(schoolMenu.map(m => ({ label: m.label, href: m.href, subCount: m.subItems?.length })));
  }
  console.log("\nSample menu for 'Real Estate':");
  const realEstateMenu = menus["Real Estate"];
  if (realEstateMenu) {
    console.log(realEstateMenu.map(m => ({ label: m.label, href: m.href, subCount: m.subItems?.length })));
  }
} catch (e) {
  console.error(e);
}
