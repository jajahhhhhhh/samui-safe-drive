/**
 * Facebook Post Parser Test Suite
 * Tests the parsePropertyFromFacebookPost function with various real-world scenarios
 */

import { parsePropertyFromFacebookPost, calculateStringSimilarity } from './facebook-parser';

// ============================================================================
// TEST CASES
// ============================================================================

const TEST_POSTS = {
  // Test 1: Complete, well-formatted post
  completePost: `
Beautiful villa in Chaweng Beach!
Price: 3200 THB/night
Contact: 08-1234-5678
somchai@gmail.com
Direct beach access, WiFi, AC, Pool, Kitchen, Parking
Perfect for families. Modern amenities.
  `,

  // Test 2: Minimal post with Thai content
  minimalPostThai: `
villa บ้านสวย 2500 บาท ชะแงน
โทร 0812345678
WiFi แอร์ สระว่ายน้ำ
  `,

  // Test 3: Broken formatting, missing some fields
  messyPost: `
nice apartment in lamai
price 1500-1800 THB
contact: +66812345678
has wifi and ac
  `,

  // Test 4: Very minimal - barely any details
  veryMinimalPost: `
house 2000 chaweng 0899999999
  `,

  // Test 5: Hotel with lots of amenities
  hotelPost: `
5-Star Luxury Hotel in Mae Nam
Price: 4200 THB per night
Contact: 08-8765-4321
Email: reservations@samuiresorts.co.th
Amenities: WiFi, AC, Pool, Spa, Restaurant, Room Service, Concierge, Gym
World-class resort with fine dining and all-inclusive experiences
  `,

  // Test 6: Condo with Thai Zone Name
  condoThai: `
คอนโด ใกล้หาด ที่ลิปะน้อย
ราคา 2800 บาท / คืน
โทร 08-9988-7776
email: lipanoi@resorts.co.th
WiFi, AC, ชูชีวิต, สระว่ายน้ำ, ยิม
อพาร์ต หรูหรา ตรงกับหาด
  `,

  // Test 7: Multiple phone numbers and emails
  multiContactPost: `
Beautiful apartment in Nathon
Price: 800 THB
Contact options:
Phone 1: 08-1111-2222
Phone 2: 0899944444
Email: contact1@gmail.com
Email: contact2@hotmail.com
Has kitchen, WiFi, parking, AC
  `,

  // Test 8: With image URLs
  postWithImages: `
Gorgeous villa Bophut
Price: 1800 THB/night
Call: 08-6712-3456
Photos: https://example.com/photo1.jpg, https://example.com/photo2.jpg, https://example.com/photo3.jpg
Traditional Thai house, WiFi, Kitchen, Garden, Parking
  `,
};

// ============================================================================
// TEST RUNNER
// ============================================================================

export function runParserTests() {
  console.log('\n🧪 FACEBOOK POST PARSER TEST SUITE\n');
  console.log('=' .repeat(70));

  let passedTests = 0;
  let totalTests = Object.keys(TEST_POSTS).length;

  for (const [testName, postText] of Object.entries(TEST_POSTS)) {
    console.log(`\n📝 Test: ${testName}`);
    console.log('-'.repeat(70));

    const result = parsePropertyFromFacebookPost(postText);

    console.log(`✓ Success: ${result.success}`);
    console.log(`✓ Confidence: ${result.confidence}%`);

    if (result.property) {
      console.log(`\n📊 Extracted Data:`);
      console.log(`  - Title: ${result.property.title}`);
      console.log(`  - Zone: ${result.property.zone}`);
      console.log(`  - Type: ${result.property.propertyType}`);
      console.log(`  - Price: ${result.property.price} ${result.property.currency}`);
      console.log(`  - Owner: ${result.property.ownerName}`);
      console.log(`  - Phone: ${result.property.ownerPhone}`);
      console.log(`  - Email: ${result.property.ownerEmail}`);
      console.log(`  - Amenities: ${(result.property.amenities || []).join(', ')}`);
      console.log(`  - Description: ${(result.property.description || '').substring(0, 60)}...`);
    }

    if (result.errors.length > 0) {
      console.log(`\n⚠️  Warnings:`);
      result.errors.forEach(err => console.log(`   - ${err}`));
    }

    // Mark test as passed if reasonable extraction happened
    if (result.success && result.confidence >= 30) {
      passedTests++;
      console.log(`\n✅ PASS`);
    } else {
      console.log(`\n❌ FAIL (Low confidence or parsing failed)`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n📈 Results: ${passedTests}/${totalTests} tests passed\n`);
}

// ============================================================================
// DUPLICATE DETECTION TEST
// ============================================================================

export function runDuplicateTests() {
  console.log('\n🔍 DUPLICATE DETECTION TEST SUITE\n');
  console.log('='.repeat(70));

  // Test 1: Same property, different prices (should match)
  const post1 = `
Villa in Chaweng
Price: 2500 THB
Contact: 08-1234-5678
wifi, ac, pool
  `;

  const post2 = `
Beautiful villa Chaweng beach
Price: 2800 THB
Contact: 08-1234-5678
direct beach access, WiFi, AC, Pool
  `;

  console.log(`\n🧪 Test: Same property, different prices`);
  console.log('-'.repeat(70));

  const result1 = parsePropertyFromFacebookPost(post1);
  const result2 = parsePropertyFromFacebookPost(post2);

  if (result1.property && result2.property) {
    const titleSim = calculateStringSimilarity(
      result1.property.title || '',
      result2.property.title || ''
    );
    const priceDiff = Math.abs((result1.property.price || 0) - (result2.property.price || 0));
    const sameZone = result1.property.zone === result2.property.zone;
    const sameType = result1.property.propertyType === result2.property.propertyType;

    console.log(`Title similarity: ${titleSim}%`);
    console.log(`Price difference: ${priceDiff} THB`);
    console.log(`Same zone: ${sameZone}`);
    console.log(`Same type: ${sameType}`);

    const isDuplicate =
      sameZone && sameType && priceDiff <= 500;

    console.log(`\nResult: ${isDuplicate ? '✅ DUPLICATE DETECTED' : '❌ Not matched'}`);
  }

  // Test 2: Similar titles (should match via fuzzy)
  console.log(`\n🧪 Test: Similar titles, same zone/type`);
  console.log('-'.repeat(70));

  const sim = calculateStringSimilarity(
    'Beautiful villa in Chaweng Beach',
    'Gorgeous villa Chaweng beachfront'
  );

  console.log(`Similarity: ${sim}%`);
  console.log(`Result: ${sim >= 70 ? '✅ FUZZY MATCH' : '❌ Not similar enough'}`);
}

// ============================================================================
// PRICE HISTORY TRACKING TEST
// ============================================================================

export function runPriceHistoryTest() {
  console.log('\n📈 PRICE HISTORY TRACKING TEST\n');
  console.log('='.repeat(70));

  const priceHistory = [
    { price: 2500, date: '2024-01-15T10:00:00Z', source: 'facebook' },
    { price: 2700, date: '2024-01-16T14:30:00Z', source: 'facebook' },
    { price: 2600, date: '2024-01-17T09:00:00Z', source: 'facebook' },
    { price: 2800, date: '2024-01-18T11:45:00Z', source: 'facebook' },
  ];

  console.log(`📊 Sample Price History for Villa in Chaweng:\n`);

  priceHistory.forEach((entry, idx) => {
    const date = new Date(entry.date);
    const trend = idx > 0 ?
      (entry.price > priceHistory[idx-1].price ? '📈' : '📉') :
      '➡️';

    console.log(
      `  ${trend} Jan ${date.getDate()}: ${entry.price} THB (${entry.source})`
    );
  });

  const minPrice = Math.min(...priceHistory.map(p => p.price));
  const maxPrice = Math.max(...priceHistory.map(p => p.price));
  const avgPrice = Math.round(
    priceHistory.reduce((sum, p) => sum + p.price, 0) / priceHistory.length
  );

  console.log(`\n💰 Summary:`);
  console.log(`  - Min: ${minPrice} THB`);
  console.log(`  - Max: ${maxPrice} THB`);
  console.log(`  - Average: ${avgPrice} THB`);
  console.log(`  - Range: ${maxPrice - minPrice} THB`);
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

export function runAllTests() {
  runParserTests();
  runDuplicateTests();
  runPriceHistoryTest();

  console.log('\n✅ All tests completed!\n');
}

// For debugging - uncomment to run:
// runAllTests();
