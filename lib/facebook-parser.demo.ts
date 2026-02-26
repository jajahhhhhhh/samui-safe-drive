/**
 * FACEBOOK PARSER - DEMO OUTPUT
 * Simulating parsePropertyFromFacebookPost() on real test cases
 *
 * Run this to see what the parser extracts from Facebook posts
 */

import { parsePropertyFromFacebookPost, calculateStringSimilarity } from './facebook-parser';

// ============================================================================
// TEST CASE 1: Complete, well-formatted post
// ============================================================================

const post1 = `
Beautiful villa in Chaweng Beach!
Price: 3200 THB/night
Contact: 08-1234-5678
somchai@gmail.com
Direct beach access, WiFi, AC, Pool, Kitchen, Parking
Perfect for families. Modern amenities.
`;

const result1 = parsePropertyFromFacebookPost(post1);

console.log('\n' + '='.repeat(80));
console.log('TEST 1: Complete, Well-Formatted Post');
console.log('='.repeat(80));
console.log('\nInput Post:');
console.log(post1);
console.log('\n📊 Extraction Results:');
console.log(JSON.stringify(result1, null, 2));

// ============================================================================
// TEST CASE 2: Minimal post with Thai content
// ============================================================================

const post2 = `
villa บ้านสวย 2500 บาท ชะแงน
โทร 0812345678
WiFi แอร์ สระว่ายน้ำ
`;

const result2 = parsePropertyFromFacebookPost(post2);

console.log('\n' + '='.repeat(80));
console.log('TEST 2: Minimal Post with Thai Content');
console.log('='.repeat(80));
console.log('\nInput Post:');
console.log(post2);
console.log('\n📊 Extraction Results:');
console.log(JSON.stringify(result2, null, 2));

// ============================================================================
// TEST CASE 3: Broken formatting
// ============================================================================

const post3 = `
nice apartment in lamai
price 1500-1800 THB
contact: +66812345678
has wifi and ac
`;

const result3 = parsePropertyFromFacebookPost(post3);

console.log('\n' + '='.repeat(80));
console.log('TEST 3: Broken Formatting, Incomplete Data');
console.log('='.repeat(80));
console.log('\nInput Post:');
console.log(post3);
console.log('\n📊 Extraction Results:');
console.log(JSON.stringify(result3, null, 2));

// ============================================================================
// TEST CASE 4: Hotel with many amenities
// ============================================================================

const post4 = `
5-Star Luxury Hotel in Mae Nam
Price: 4200 THB per night
Contact: 08-8765-4321
Email: reservations@samuiresorts.co.th
Amenities: WiFi, AC, Pool, Spa, Restaurant, Room Service, Concierge, Gym
World-class resort with fine dining and all-inclusive experiences
`;

const result4 = parsePropertyFromFacebookPost(post4);

console.log('\n' + '='.repeat(80));
console.log('TEST 4: Hotel with Rich Amenities');
console.log('='.repeat(80));
console.log('\nInput Post:');
console.log(post4);
console.log('\n📊 Extraction Results:');
console.log(JSON.stringify(result4, null, 2));

// ============================================================================
// DUPLICATE DETECTION TEST
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('DUPLICATE DETECTION: Same Property, Different Prices');
console.log('='.repeat(80));

const dupPost1 = `
Villa in Chaweng
Price: 2500 THB
Contact: 08-1234-5678
wifi, ac, pool
`;

const dupPost2 = `
Beautiful villa Chaweng beach
Price: 2800 THB
Contact: 08-1234-5678
direct beach access, WiFi, AC, Pool
`;

const dupResult1 = parsePropertyFromFacebookPost(dupPost1);
const dupResult2 = parsePropertyFromFacebookPost(dupPost2);

if (dupResult1.property && dupResult2.property) {
  console.log('\nProperty 1:');
  console.log(`  Title: ${dupResult1.property.title}`);
  console.log(`  Price: ${dupResult1.property.price} THB`);
  console.log(`  Zone: ${dupResult1.property.zone}`);
  console.log(`  Type: ${dupResult1.property.propertyType}`);

  console.log('\nProperty 2:');
  console.log(`  Title: ${dupResult2.property.title}`);
  console.log(`  Price: ${dupResult2.property.price} THB`);
  console.log(`  Zone: ${dupResult2.property.zone}`);
  console.log(`  Type: ${dupResult2.property.propertyType}`);

  const titleSim = calculateStringSimilarity(
    dupResult1.property.title || '',
    dupResult2.property.title || ''
  );
  const priceDiff = Math.abs(
    (dupResult1.property.price || 0) - (dupResult2.property.price || 0)
  );

  console.log('\n🔍 Duplicate Detection Analysis:');
  console.log(`  Title Similarity: ${titleSim}%`);
  console.log(`  Price Difference: ${priceDiff} THB`);
  console.log(`  Same Zone: ${dupResult1.property.zone === dupResult2.property.zone}`);
  console.log(`  Same Type: ${dupResult1.property.propertyType === dupResult2.property.propertyType}`);
  console.log(`  Price within 500 THB: ${priceDiff <= 500}`);

  const isDuplicate =
    dupResult1.property.zone === dupResult2.property.zone &&
    dupResult1.property.propertyType === dupResult2.property.propertyType &&
    priceDiff <= 500;

  console.log(`\n✅ DUPLICATE MATCH: ${isDuplicate ? 'YES - Will be grouped' : 'NO - Different property'}`);

  if (isDuplicate) {
    console.log('   → Both properties will be linked with groupId');
    console.log('   → Price history will track: 2500 THB → 2800 THB');
  }
}

// ============================================================================
// CONFIDENCE SCORING
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('CONFIDENCE SCORING ANALYSIS');
console.log('='.repeat(80));

const testCases = [
  { name: 'Complete Post', result: result1 },
  { name: 'Minimal Thai Post', result: result2 },
  { name: 'Broken Format', result: result3 },
  { name: 'Hotel with Amenities', result: result4 },
];

console.log('\nConfidence Levels by Test Case:');
testCases.forEach(test => {
  const confidence = test.result.confidence;
  const color = confidence >= 80 ? '🟢' : confidence >= 60 ? '🟡' : '🔴';
  const status =
    confidence >= 80 ? 'HIGH - Ready to import' :
    confidence >= 60 ? 'MEDIUM - Review recommended' :
    'LOW - Manual editing needed';

  console.log(`  ${color} ${test.name}: ${confidence}% (${status})`);

  if (test.result.errors.length > 0) {
    console.log(`     Warnings: ${test.result.errors.join(', ')}`);
  }
});

// ============================================================================
// PRICE HISTORY EXAMPLE
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('PRICE HISTORY TRACKING EXAMPLE');
console.log('='.repeat(80));

const priceHistoryExample = [
  { price: 2500, date: '2024-01-15T10:00:00Z', source: 'facebook' },
  { price: 2700, date: '2024-01-16T14:30:00Z', source: 'facebook' },
  { price: 2600, date: '2024-01-17T09:00:00Z', source: 'facebook' },
  { price: 2800, date: '2024-01-18T11:45:00Z', source: 'facebook' },
];

console.log('\nProperty: Villa in Chaweng');
console.log('Timeline of Price Changes:');
priceHistoryExample.forEach((entry, idx) => {
  const date = new Date(entry.date);
  const trend = idx > 0 ?
    (entry.price > priceHistoryExample[idx - 1].price ? '📈 +' : '📉 ') :
    '➡️ ';
  const change = idx > 0 ?
    `${entry.price - priceHistoryExample[idx - 1].price} THB` :
    'Initial';

  console.log(`  ${trend} Jan ${date.getDate()}: ${entry.price} THB (${change})`);
});

const minPrice = Math.min(...priceHistoryExample.map(p => p.price));
const maxPrice = Math.max(...priceHistoryExample.map(p => p.price));
const avgPrice = Math.round(
  priceHistoryExample.reduce((sum, p) => sum + p.price, 0) / priceHistoryExample.length
);

console.log(`\n💰 Summary Statistics:`);
console.log(`  Minimum: ${minPrice} THB`);
console.log(`  Maximum: ${maxPrice} THB`);
console.log(`  Average: ${avgPrice} THB`);
console.log(`  Range: ${maxPrice - minPrice} THB (${((maxPrice - minPrice) / minPrice * 100).toFixed(1)}% variation)`);

console.log('\n✅ All tests completed!\n');
