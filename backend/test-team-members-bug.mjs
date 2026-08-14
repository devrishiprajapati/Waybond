/**
 * Bug Condition Exploration Test for TeamMember Operations
 * 
 * This test attempts TeamMember operations BEFORE the migration is applied.
 * It is EXPECTED TO FAIL with database errors, proving the bug exists.
 * 
 * Validates Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 * 
 * The test encodes correct behavior (operations should succeed),
 * but will fail on unfixed code because the TeamMember table doesn't exist.
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
 * Test helper - expects operation to succeed (correct behavior)
 * Will fail with database error if table doesn't exist (bug condition)
 */
async function testOperation(name, operation) {
  try {
    console.log(`\n[TEST] ${name}`);
    const result = await operation();
    console.log(`  ✓ PASSED: Operation succeeded`);
    console.log(`  Result:`, JSON.stringify(result, null, 2));
    results.passed++;
    return result;
  } catch (error) {
    console.log(`  ✗ FAILED: ${error.message}`);
    console.log(`  Error Code: ${error.code}`);
    console.log(`  Full Error:`, error);
    results.failed++;
    results.errors.push({
      test: name,
      message: error.message,
      code: error.code,
      details: error.toString()
    });
    return null;
  }
}

async function runBugExplorationTests() {
  console.log('='.repeat(80));
  console.log('BUG CONDITION EXPLORATION TEST - TeamMember Operations');
  console.log('='.repeat(80));
  console.log('\nThese tests attempt TeamMember operations on UNFIXED code.');
  console.log('Expected: All tests FAIL with database errors (proves bug exists)\n');

  // Test 1.1 & 1.5: GET TeamMembers (findMany operation)
  await testOperation(
    'Requirement 1.1, 1.5: GET TeamMembers via prisma.teamMember.findMany()',
    async () => {
      const members = await prisma.teamMember.findMany({
        orderBy: { position: 'asc' }
      });
      // This should return an array (correct behavior)
      if (!Array.isArray(members)) {
        throw new Error('Expected array result');
      }
      return members;
    }
  );

  // Test 1.2 & 1.5: Create TeamMember
  await testOperation(
    'Requirement 1.2, 1.5: Create TeamMember via prisma.teamMember.create()',
    async () => {
      const newMember = await prisma.teamMember.create({
        data: {
          name: 'Test Member',
          designation: 'Test Designation',
          shortBio: 'Test short bio',
          fullBio: 'Test full bio content',
          image: '/test-image.jpg',
          email: 'test@example.com',
          phone: '+1234567890',
          position: 0,
          isActive: true
        }
      });
      // Should return created member with id
      if (!newMember.id) {
        throw new Error('Expected created member with id');
      }
      return newMember;
    }
  );

  // Test 1.3 & 1.5: Update TeamMember (first check if any exist)
  await testOperation(
    'Requirement 1.3, 1.5: Update TeamMember via prisma.teamMember.update()',
    async () => {
      // First try to find any member (will fail if table doesn't exist)
      const members = await prisma.teamMember.findMany({ take: 1 });
      
      if (members.length === 0) {
        // If no members, create one first
        const created = await prisma.teamMember.create({
          data: {
            name: 'Member to Update',
            designation: 'Original Designation',
            shortBio: 'Original bio',
            fullBio: 'Original full bio',
            image: '/original.jpg',
            position: 0
          }
        });
        
        // Now update it
        const updated = await prisma.teamMember.update({
          where: { id: created.id },
          data: { designation: 'Updated Designation' }
        });
        return updated;
      } else {
        // Update existing member
        const updated = await prisma.teamMember.update({
          where: { id: members[0].id },
          data: { designation: 'Updated Designation' }
        });
        return updated;
      }
    }
  );

  // Test 1.4 & 1.5: Delete TeamMember
  await testOperation(
    'Requirement 1.4, 1.5: Delete TeamMember via prisma.teamMember.delete()',
    async () => {
      // First create a member to delete (will fail if table doesn't exist)
      const created = await prisma.teamMember.create({
        data: {
          name: 'Member to Delete',
          designation: 'Test Designation',
          shortBio: 'Test bio',
          fullBio: 'Test full bio',
          image: '/test.jpg',
          position: 0
        }
      });
      
      // Now delete it
      const deleted = await prisma.teamMember.delete({
        where: { id: created.id }
      });
      return deleted;
    }
  );

  // Additional test: Direct database query to check table existence
  await testOperation(
    'Direct SQL: Check if TeamMember table exists',
    async () => {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'TeamMember'
        ) as table_exists
      `;
      return result;
    }
  );

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('COUNTEREXAMPLES (Database Errors Found):');
    console.log('-'.repeat(80));
    results.errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.test}`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Code: ${error.code}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('BUG CONFIRMED: TeamMember table does not exist in database');
    console.log('All operations failed as expected, proving the bug condition.');
    console.log('='.repeat(80));
  } else {
    console.log('\n⚠ WARNING: All tests passed unexpectedly!');
    console.log('This suggests the TeamMember table already exists.');
    console.log('The bug may have been fixed already, or the root cause is incorrect.');
  }

  await prisma.$disconnect();
  
  // Exit with error code if tests failed (expected for bug exploration)
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
runBugExplorationTests().catch(async (error) => {
  console.error('\n✗ Fatal error running tests:', error);
  await prisma.$disconnect();
  process.exit(1);
});
