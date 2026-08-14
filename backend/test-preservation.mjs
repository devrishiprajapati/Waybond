/**
 * Preservation Property Tests for Existing Database Operations
 * 
 * This test validates that existing API endpoints and database tables
 * work correctly BEFORE implementing the TeamMember migration fix.
 * 
 * These tests establish the baseline behavior that must be preserved
 * after applying the TeamMember table migration.
 * 
 * Validates Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 * 
 * EXPECTED OUTCOME: All tests PASS (confirms baseline behavior to preserve)
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Test results collector
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Test helper - validates operation succeeds and records result
 */
async function testOperation(name, requirement, operation, validator) {
  try {
    console.log(`\n[TEST] ${name}`);
    console.log(`  Requirement: ${requirement}`);
    const result = await operation();
    
    // Run validator if provided
    if (validator) {
      validator(result);
    }
    
    console.log(`  ✓ PASSED: Operation succeeded`);
    results.passed++;
    return result;
  } catch (error) {
    console.log(`  ✗ FAILED: ${error.message}`);
    console.log(`  Stack:`, error.stack);
    results.failed++;
    results.errors.push({
      test: name,
      requirement,
      message: error.message,
      stack: error.stack
    });
    return null;
  }
}

/**
 * Property-Based Tests: Preservation of Existing Database Operations
 * 
 * These tests verify that ALL existing database tables and operations
 * continue to work correctly after the TeamMember migration is applied.
 */
async function runPreservationTests() {
  console.log('='.repeat(80));
  console.log('PRESERVATION PROPERTY TESTS - Existing Database Operations');
  console.log('='.repeat(80));
  console.log('\nThese tests validate existing functionality BEFORE the migration.');
  console.log('Expected: All tests PASS (establishes baseline to preserve)\n');

  // ========================================================================
  // Requirement 3.2: Existing Database Tables Continue to Work
  // ========================================================================
  
  console.log('\n' + '─'.repeat(80));
  console.log('Testing Existing Database Tables (Requirement 3.2)');
  console.log('─'.repeat(80));

  // Test User table
  await testOperation(
    'Query User table via prisma.user.findMany()',
    '3.2 - User table queries work',
    async () => {
      const users = await prisma.user.findMany({ take: 5 });
      return users;
    },
    (result) => {
      if (!Array.isArray(result)) {
        throw new Error('Expected User query to return array');
      }
      console.log(`  Found ${result.length} users in database`);
    }
  );

  // Test Trip table
  await testOperation(
    'Query Trip table via prisma.trip.findMany()',
    '3.2 - Trip table queries work',
    async () => {
      const trips = await prisma.trip.findMany({ take: 5 });
      return trips;
    },
    (result) => {
      if (!Array.isArray(result)) {
        throw new Error('Expected Trip query to return array');
      }
      console.log(`  Found ${result.length} trips in database`);
    }
  );

  // Test Testimonial table
  await testOperation(
    'Query Testimonial table via prisma.testimonial.findMany()',
    '3.2 - Testimonial table queries work',
    async () => {
      const testimonials = await prisma.testimonial.findMany({ take: 5 });
      return testimonials;
    },
    (result) => {
      if (!Array.isArray(result)) {
        throw new Error('Expected Testimonial query to return array');
      }
      console.log(`  Found ${result.length} testimonials in database`);
    }
  );

  // Test Booking table
  await testOperation(
    'Query Booking table via prisma.booking.findMany()',
    '3.2 - Booking table queries work',
    async () => {
      const bookings = await prisma.booking.findMany({ take: 5 });
      return bookings;
    },
    (result) => {
      if (!Array.isArray(result)) {
        throw new Error('Expected Booking query to return array');
      }
      console.log(`  Found ${result.length} bookings in database`);
    }
  );

  // ========================================================================
  // Requirement 3.3: Database Connection Continues to Work
  // ========================================================================
  
  console.log('\n' + '─'.repeat(80));
  console.log('Testing Database Connection (Requirement 3.3)');
  console.log('─'.repeat(80));

  await testOperation(
    'Verify database connection works',
    '3.3 - Database connection and authentication',
    async () => {
      // Execute a simple query to verify connection
      const result = await prisma.$queryRaw`SELECT current_database(), current_user`;
      return result;
    },
    (result) => {
      if (!result || result.length === 0) {
        throw new Error('Expected database connection query to return result');
      }
      console.log(`  Connected to database: ${result[0].current_database}`);
      console.log(`  Connected as user: ${result[0].current_user}`);
    }
  );

  // Verify Prisma Client can execute raw queries
  await testOperation(
    'Verify Prisma Client raw query capability',
    '3.3 - Prisma Client connection functionality',
    async () => {
      const result = await prisma.$queryRaw`SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public'`;
      return result;
    },
    (result) => {
      console.log(`  Database has ${result[0].table_count} tables in public schema`);
    }
  );

  // ========================================================================
  // Requirement 3.1: Other API Endpoints Continue to Function
  // ========================================================================
  
  console.log('\n' + '─'.repeat(80));
  console.log('Testing API Data Access Patterns (Requirement 3.1)');
  console.log('─'.repeat(80));

  // Note: We're testing the database access patterns that these endpoints use,
  // not the HTTP endpoints themselves, since we're in a standalone test script

  // Test trips data access (GET /api/trips pattern)
  await testOperation(
    'Trips API data access pattern - findMany with orderBy',
    '3.1 - Trips API functionality preserved',
    async () => {
      const trips = await prisma.trip.findMany({ orderBy: { id: 'asc' } });
      return trips;
    },
    (result) => {
      if (!Array.isArray(result)) {
        throw new Error('Expected trips array');
      }
      console.log(`  Trips API pattern works: ${result.length} trips`);
    }
  );

  // Test testimonials data access (GET /api/testimonials pattern)
  await testOperation(
    'Testimonials API data access pattern - findMany with orderBy',
    '3.1 - Testimonials API functionality preserved',
    async () => {
      const testimonials = await prisma.testimonial.findMany({ 
        orderBy: { createdAt: 'desc' } 
      });
      return testimonials;
    },
    (result) => {
      if (!Array.isArray(result)) {
        throw new Error('Expected testimonials array');
      }
      console.log(`  Testimonials API pattern works: ${result.length} testimonials`);
    }
  );

  // Test auth data access (login pattern)
  await testOperation(
    'Auth data access pattern - user lookup by email',
    '3.1 - Auth API functionality preserved',
    async () => {
      // Test the user lookup pattern used by login
      // We don't need an actual email, just verify the query pattern works
      const user = await prisma.user.findFirst({ take: 1 });
      if (user) {
        // Test the exact pattern used in login
        const foundUser = await prisma.user.findUnique({ 
          where: { email: user.email } 
        });
        return foundUser;
      }
      return null; // No users in database is ok for this test
    },
    (result) => {
      console.log(`  Auth user lookup pattern works: ${result ? 'found user' : 'no users in DB'}`);
    }
  );

  // ========================================================================
  // Requirement 3.4: Admin Pages Data Access Works
  // ========================================================================
  
  console.log('\n' + '─'.repeat(80));
  console.log('Testing Admin Data Access Patterns (Requirement 3.4)');
  console.log('─'.repeat(80));

  await testOperation(
    'Admin trips data access',
    '3.4 - Admin trips page functionality',
    async () => {
      const trips = await prisma.trip.findMany({ orderBy: { id: 'asc' } });
      return trips;
    },
    (result) => {
      console.log(`  Admin trips access works: ${result.length} trips`);
    }
  );

  await testOperation(
    'Admin testimonials data access',
    '3.4 - Admin testimonials page functionality',
    async () => {
      const testimonials = await prisma.testimonial.findMany({ 
        orderBy: { createdAt: 'desc' } 
      });
      return testimonials;
    },
    (result) => {
      console.log(`  Admin testimonials access works: ${result.length} testimonials`);
    }
  );

  await testOperation(
    'Admin users data access',
    '3.4 - Admin users page functionality',
    async () => {
      const users = await prisma.user.findMany({ 
        orderBy: { lastLoginAt: 'desc' } 
      });
      return users;
    },
    (result) => {
      console.log(`  Admin users access works: ${result.length} users`);
    }
  );

  // ========================================================================
  // Requirement 3.5: Server Startup and Prisma Client Initialization
  // ========================================================================
  
  console.log('\n' + '─'.repeat(80));
  console.log('Testing Prisma Client Initialization (Requirement 3.5)');
  console.log('─'.repeat(80));

  await testOperation(
    'Prisma Client is properly initialized',
    '3.5 - Prisma Client initialization',
    async () => {
      // Verify Prisma Client can connect and execute queries
      const result = await prisma.$queryRaw`SELECT 1 as connection_test`;
      return result;
    },
    (result) => {
      if (result[0].connection_test !== 1) {
        throw new Error('Prisma Client connection test failed');
      }
      console.log(`  Prisma Client initialized and connected successfully`);
    }
  );

  // Verify database is PostgreSQL
  await testOperation(
    'Verify PostgreSQL database connection',
    '3.5 - PostgreSQL connection',
    async () => {
      const result = await prisma.$queryRaw`SELECT version()`;
      return result;
    },
    (result) => {
      const version = result[0].version;
      if (!version.toLowerCase().includes('postgresql')) {
        throw new Error('Expected PostgreSQL database');
      }
      console.log(`  PostgreSQL version: ${version.substring(0, 50)}...`);
    }
  );

  // ========================================================================
  // Property-Based Test: All Non-TeamMember Operations Succeed
  // ========================================================================
  
  console.log('\n' + '─'.repeat(80));
  console.log('Property Test: All Non-TeamMember Operations Work');
  console.log('─'.repeat(80));

  await testOperation(
    'Property: For all non-TeamMember operations, results are successful',
    'Requirements 3.1, 3.2, 3.3, 3.4, 3.5',
    async () => {
      // Test a transaction involving multiple existing tables
      const result = await prisma.$transaction(async (tx) => {
        const userCount = await tx.user.count();
        const tripCount = await tx.trip.count();
        const testimonialCount = await tx.testimonial.count();
        const bookingCount = await tx.booking.count();
        
        return {
          userCount,
          tripCount,
          testimonialCount,
          bookingCount
        };
      });
      return result;
    },
    (result) => {
      console.log(`  Transaction executed successfully:`);
      console.log(`    Users: ${result.userCount}`);
      console.log(`    Trips: ${result.tripCount}`);
      console.log(`    Testimonials: ${result.testimonialCount}`);
      console.log(`    Bookings: ${result.bookingCount}`);
    }
  );

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('FAILED TESTS:');
    console.log('-'.repeat(80));
    results.errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.test}`);
      console.log(`   Requirement: ${error.requirement}`);
      console.log(`   Error: ${error.message}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('⚠ WARNING: Some preservation tests failed!');
    console.log('Existing functionality may already have issues.');
    console.log('='.repeat(80));
  } else {
    console.log('\n' + '='.repeat(80));
    console.log('✓ SUCCESS: All preservation tests passed!');
    console.log('Baseline behavior documented - this must be preserved after migration.');
    console.log('='.repeat(80));
  }

  await prisma.$disconnect();
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
runPreservationTests().catch(async (error) => {
  console.error('\n✗ Fatal error running preservation tests:', error);
  await prisma.$disconnect();
  process.exit(1);
});
