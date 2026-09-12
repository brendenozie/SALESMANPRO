const fs = require('fs');
const c1 = fs.readFileSync('components/site/layouts/BookingsLayout/BookingsLayout.tsx', 'utf8').split('\n');
const c2 = fs.readFileSync('components/site/layouts/SalonBookingsLayout/BookingsLayout.tsx', 'utf8').split('\n');
console.log('Bookings lines:', c1.length, 'Salon lines:', c2.length);

for (let i = 0; i < Math.max(c1.length, c2.length); i++) {
  if (c1[i] !== c2[i]) {
    console.log(`Line ${i+1}:`);
    console.log('  Bookings:', JSON.stringify(c1[i]));
    console.log('  Salon:   ', JSON.stringify(c2[i]));
  }
}
