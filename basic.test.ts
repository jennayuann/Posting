/**
 * SmartMatch Basic Test Cases
 *
 * Demonstrates creating postings and using the LLM-assisted SmartMatch
 */

import { GeminiLLM, Config } from './gemini-llm';
import {
    postings,
    createPosting,
    updatePosting,
    cancelPosting,
    fulfillPosting,
    expirePosting,
    deletePosting,
    smartMatch
} from './postings';

/**
 * Load configuration from config.json
 */
function loadConfig(): Config {
    try {
        const config = require('../config.json');
        return config;
    } catch (error) {
        console.error('❌ Error loading config.json. Please ensure it exists with your API key.');
        console.error('Error details:', (error as Error).message);
        process.exit(1);
    }
}

/**
 * Clear all postings before each test
 */
function resetPostings() {
    postings.length = 0;
}

/**
 * Test case 1: Manual creation of postings
 */
export async function testManualPosting(): Promise<void> {
    console.log('\n🧪 BASIC TEST CASE 1: Manual Posting');
    console.log('===============================');

    resetPostings();

    console.log('📝 Creating postings manually...');
    const p1 = createPosting(
        'Alice',
        'LENDER',
        'Scientific Calculator',
        'Calculator',
        'TI-84 scientific calculator available for borrowing',
        new Date(),
        new Date(Date.now() + 1) // expires 1ms from now
    );

    const p2 = createPosting(
        'Bob',
        'LENDER',
        'Basic Calculator',
        'Calculator',
        'Simple calculator available, suitable for exams',
        new Date(),
        new Date(Date.now() + 48 * 60 * 60 * 1000) // valid for 2 days
    );

    const p3 = createPosting(
        'Carl',
        'BORROWER',
        'USB-C to Lightning Charger',
        'Charger',
        'Need a USB-C to lightning charger for my iPhone',
        new Date(),
        // empty availableUntil = indefinitely
    );

    console.log('✅ Postings created:');
    postings.forEach(p => {
        console.log(`- ${p.owner}[${p.role}] ${p.name} (${p.category}): ${p.description}`);
    });

    // --- Update a posting ---
    console.log('\n✏️ Updating Bob’s calculator posting...');
    updatePosting(p2, undefined, undefined, 'Basic calculator, works well for accounting exams');
    console.log(`Updated Bob's description: ${p2.description}`);

    // --- Cancel a posting ---
    console.log('\n✏️ Cancelling Bob’s calculator posting...');
    cancelPosting(p2);
    console.log(`Bob's posting status after cancellation: ${p2.status}`);

    // --- Fulfilling a posting ---
    console.log('\n✏️ Fulfilling Carl’s posting...');
    fulfillPosting(p3);
    console.log(`Carl’s posting status after fulfillment: ${p3.status}`);

    // --- Expire a posting ---
    console.log('\n⏳ Expring Alice’s posting...');
    await new Promise(res => setTimeout(res, 2)); // wait 2ms so Alice's posting expiry time passes
    expirePosting(p1);
    console.log(`Alice’s posting status after expiry: ${p1.status}`);

    // --- Delete a posting (must be non-ACTIVE) ---
    console.log('\n🗑️ Deleting Alice’s expired posting...');
    deletePosting(p1);

    console.log('\n📦 Current postings state:', postings);
}

/**
 * Test case 2: LLM-assisted SmartMatch
 */
export async function testLLMSmartMatch(): Promise<void> {
    console.log('\n\n🧪 BASIC TEST CASE 2: LLM-Assisted SmartMatch');
    console.log('=======================================');

    resetPostings();
    const config = loadConfig();
    const llm = new GeminiLLM(config);

    console.log('📝 Creating sample postings...');
    const p1 = createPosting(
        'Alice',
        'LENDER',
        'Scientific Calculator',
        'Calculator',
        'TI-84 scientific calculator available for borrowing',
        new Date(),
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // expires in 3 days
    );

    const p2 = createPosting(
        'Bob',
        'LENDER',
        'Basic Calculator',
        'Calculator',
        'Simple calculator available, suitable for exams',
        new Date(),
        new Date(Date.now() + 48 * 60 * 60 * 1000) // valid for 2 days
    );

    const p3 = createPosting(
        'Carl',
        'BORROWER',
        'USB-C to Lightning Charger',
        'Charger',
        'Need a USB-C to lightning charger for my iPhone',
        new Date(),
        // empty availableUntil = indefinitely
    );

    console.log('✅ Postings created:');
    postings.forEach(p => {
        console.log(`- ${p.owner}[${p.role}] ${p.name} (${p.category}): ${p.description}`);
    });

    console.log('\n📦 Current postings state:', postings);

    const query = 'Need a basic calculator for tomorrow’s accounting exam';
    console.log(`\n🤖 Running SmartMatch for BORROWER query: "${query}"`);
    const results = await smartMatch(query, 'BORROWER', new Date(), llm);

    console.log('\n💡 SmartMatch Results');
    console.log('======================');
    results.forEach((r, index) => {
        console.log(
        `${index + 1}. ${r.posting.name} by ${r.posting.owner} — ${r.rationale}`
        );
    });
}

/**
 * Test case 3: Mixed (manual + LLM)
 */
export async function testMixedSmartMatch(): Promise<void> {
    console.log('\n\n🧪 BASIC TEST CASE 3: Mixed SmartMatch');
    console.log('================================');

    resetPostings();
    const config = loadConfig();
    const llm = new GeminiLLM(config);

    console.log('📝 Creating sample postings...');
    const p1 = createPosting(
        'Alice',
        'LENDER',
        'Scientific Calculator',
        'Calculator',
        'TI-84 scientific calculator available for borrowing',
        new Date(),
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // expires in 3 days
    );

    const p2 = createPosting(
        'Bob',
        'LENDER',
        'Basic Calculator',
        'Calculator',
        'Simple calculator available, suitable for exams',
        new Date(),
        new Date(Date.now() + 48 * 60 * 60 * 1000) // valid for 2 days
    );

    const p3 = createPosting(
        'Carl',
        'BORROWER',
        'USB-C to Lightning Charger',
        'Charger',
        'Need a USB-C to lightning charger for my iPhone',
        new Date(),
        // empty availableUntil = indefinitely
    );

    console.log('✅ Postings created:');
    postings.forEach(p => {
        console.log(`- ${p.owner}[${p.role}] ${p.name} (${p.category}): ${p.description}`);
    });

    console.log('\n📦 Current postings state:', postings);

    console.log('\n✏️ Manually updating Bob’s calculator posting to state that it is broken...');
    updatePosting(p2, "Broken Basic Calculator", undefined, 'Basic calculator, broken and unusable');

    const query = 'Need a basic calculator for tomorrow’s accounting exam';
    console.log(`\n🤖 Running SmartMatch for BORROWER query: "${query}"`);
    const results = await smartMatch(query, 'BORROWER', new Date(), llm);

    console.log('\n💡 SmartMatch Results');
    console.log('======================');
    results.forEach((r, index) => {
        console.log(
        `${index + 1}. ${r.posting.name} by ${r.posting.owner} — ${r.rationale}`
        );
    });
}

/**
 * Main function to run all test cases
 */
async function main(): Promise<void> {
    console.log('🎓 Basic Posting Test Suite');
    console.log('========================\n');

    try {
        // Run manual test
        await testManualPosting();

        // Run LLM test
        await testLLMSmartMatch();

        // Run mixed test
        await testMixedSmartMatch();

        console.log('\n🎉 All basic test cases completed successfully!');

    } catch (error) {
        console.error('❌ Test error:', (error as Error).message);
        process.exit(1);
    }
}

// Run the tests if this file is executed directly
if (require.main === module) {
    main();
}
