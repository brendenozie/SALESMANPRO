// find-unmapped-companies.js
const words = ["bike", "motorcycle", "flourish", "book"];
words.forEach(w => {
  const matches = db.Company.find({ 
    $or: [
      { name: { $regex: w, $options: "i" } },
      { slug: { $regex: w, $options: "i" } }
    ]
  }).toArray();
  print(`=== Matches for "${w}" (${matches.length}) ===`);
  matches.forEach(m => print(`  ${m._id} | ${m.name} | slug: ${m.slug} | domain: ${m.domain} | user: ${m.userId}`));
});
