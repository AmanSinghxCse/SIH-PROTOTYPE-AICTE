// Comprehensive Automated Verification Suite for AICTE CaseTrack (SIH26264)
import { tokenize, jaccardSimilarity, calculateRelatedness } from './utils/matchingEngine.ts';
import { getCaseAgeInDays, getDaysRemaining, isOverdue, isApproachingDeadline } from './utils/dateUtils.ts';
import { INITIAL_COMPLAINTS, INITIAL_INSTITUTIONS, INITIAL_BUREAUS } from './data/seedData.ts';

console.log('===============================================================');
console.log('AICTE CaseTrack (SIH26264) - End-to-End Verification Test Run');
console.log('===============================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
    if (details) console.log(`       Details: ${details}`);
  } else {
    console.error(`[FAIL] ${testName}`);
    if (details) console.error(`       Details: ${details}`);
  }
}

// TEST SUITE 1: Underlying Data Consistency
console.log('--- TEST SUITE 1: Data Consistency Across Modules ---');
const totalRecords = INITIAL_COMPLAINTS.length;
assert(totalRecords === 26, 'Total Complaints Count is 26', `Count: ${totalRecords}`);

const institutionSum = INITIAL_INSTITUTIONS.reduce((sum, inst) => {
  return sum + INITIAL_COMPLAINTS.filter(c => c.institutionId === inst.id).length;
}, 0);
assert(institutionSum === totalRecords, 'Sum of institution-wise complaints equals total registry complaints', `Inst Sum: ${institutionSum}, Total: ${totalRecords}`);

const bureauSum = INITIAL_BUREAUS.reduce((sum, b) => {
  return sum + INITIAL_COMPLAINTS.filter(c => c.bureauId === b.id).length;
}, 0);
assert(bureauSum === totalRecords, 'Sum of bureau complaints equals total registry complaints', `Bureau Sum: ${bureauSum}, Total: ${totalRecords}`);

// TEST SUITE 2: Date Calculations, Ageing & Overdue Rules
console.log('\n--- TEST SUITE 2: Case Ageing, Deadlines & Turnaround ---');
const case104 = INITIAL_COMPLAINTS.find(c => c.id === 'AICTE-2026-COMP-104');
const age104 = getCaseAgeInDays(case104.submissionDate);
assert(age104 === 35, 'COMP-104 age is exactly 35 calendar days (2026-09-18 to 2026-10-23)', `Computed: ${age104}`);

const daysRemaining104 = getDaysRemaining(case104.deadlineDate);
assert(daysRemaining104 === 2, 'COMP-104 days remaining is exactly 2 calendar days (2026-10-23 to 2026-10-25)', `Computed: ${daysRemaining104}`);

const isApp104 = isApproachingDeadline(case104.deadlineDate, case104.status, 5);
assert(isApp104 === true, 'COMP-104 correctly flagged as Approaching Deadline (2 days <= 5 days window)', `Result: ${isApp104}`);

const case101 = INITIAL_COMPLAINTS.find(c => c.id === 'AICTE-2026-COMP-101'); // Deadline 2026-09-19
const isOverdue101 = isOverdue(case101.deadlineDate, case101.status);
assert(isOverdue101 === true, 'COMP-101 correctly flagged as Overdue (deadline was 2026-09-19, past 2026-10-23)', `Result: ${isOverdue101}`);

// Turnaround for resolved cases
const resolvedCases = INITIAL_COMPLAINTS.filter(c => c.status === 'Resolved' && c.resolvedDate);
assert(resolvedCases.length === 4, 'Resolved cases count is exactly 4', `Count: ${resolvedCases.length}`);

const totalDays = resolvedCases.reduce((acc, c) => acc + getCaseAgeInDays(c.submissionDate, c.resolvedDate), 0);
const avgDays = (totalDays / resolvedCases.length).toFixed(1);
assert(avgDays === '17.8', 'Average resolution turnaround is 17.8 days', `Computed: ${avgDays} days`);

// TEST SUITE 3: Related-Case Heuristic Matching Engine
console.log('\n--- TEST SUITE 3: Related-Case Detection Engine ---');
const comp104 = INITIAL_COMPLAINTS.find(c => c.id === 'AICTE-2026-COMP-104');
const comp112 = INITIAL_COMPLAINTS.find(c => c.id === 'AICTE-2026-COMP-112');
const positiveMatch = calculateRelatedness(comp104, comp112);

assert(positiveMatch.overallScore >= 80, 'Positive pair (COMP-104 & COMP-112) scores >= 80% similarity', `Score: ${positiveMatch.overallScore}%`);
assert(positiveMatch.institutionMatchScore === 40, 'Positive pair gets exact 40 points for Institution ID match', `Inst Score: ${positiveMatch.institutionMatchScore}`);
assert(positiveMatch.categoryMatchScore === 25, 'Positive pair gets exact 25 points for Category match', `Category Score: ${positiveMatch.categoryMatchScore}`);
assert(positiveMatch.matchSignals.length >= 3, 'Positive pair generates itemized explainable match signals', `Signals: ${JSON.stringify(positiveMatch.matchSignals)}`);

// Negative Pair (Unrelated)
const comp101_antiRag = INITIAL_COMPLAINTS.find(c => c.id === 'AICTE-2026-COMP-101');
const comp105_unappPgdm = INITIAL_COMPLAINTS.find(c => c.id === 'AICTE-2026-COMP-105');
const negativeMatch = calculateRelatedness(comp101_antiRag, comp105_unappPgdm);

assert(negativeMatch.overallScore < 30, 'Negative pair (COMP-101 & COMP-105) scores low similarity (< 30%)', `Score: ${negativeMatch.overallScore}%`);
assert(negativeMatch.institutionMatchScore === 0, 'Negative pair gets 0 points for Institution match', `Inst Score: ${negativeMatch.institutionMatchScore}`);
assert(negativeMatch.categoryMatchScore === 0, 'Negative pair gets 0 points for Category match', `Category Score: ${negativeMatch.categoryMatchScore}`);

console.log('\n===============================================================');
console.log(`Summary: ${passedTests} of ${totalTests} tests passed.`);
console.log('===============================================================\n');
