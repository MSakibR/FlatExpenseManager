import {
  ExpenseStatus,
  MonthlyExpense,
  MonthlyMember,
  MonthlyMemberInput,
} from "../models/types";

/**
 * Calculate one member's monthly expense
 */
export function calculateMember(member: MonthlyMemberInput): MonthlyMember {
  const total = Object.values(member.amounts).reduce(
    (sum, amount) => sum + Number(amount || 0),
    0,
  );

  const dueFromPrevMonth = Number(member.dueFromPrevMonth || 0);

  const grandTotalOwed = total + dueFromPrevMonth;

  const given = Number(member.given || 0);

  /*
   * Positive back
   * = member gave more money
   * = Advance
   *
   * Negative back
   * = member still owes money
   * = Due
   */
  const back = given - grandTotalOwed;

  let status: ExpenseStatus;

  if (back > 0) {
    status = "Advance";
  } else if (back === 0) {
    status = "Paid";
  } else if (given > 0) {
    status = "Partially Paid";
  } else {
    status = "Due";
  }

  return {
    memberId: member.memberId,
    amounts: member.amounts,
    total,
    dueFromPrevMonth,
    grandTotalOwed,
    given,
    back,
    status,
  };
}

/**
 * Categories whose money goes to the flat owner.
 */
export const OWNER_CATEGORIES = [
  "Room costs",
  "Water Bill",
  "Gas Bill",
  "Electric Bill",
];

/**
 * Calculate how much the flat owner should receive.
 *
 * Example:
 *
 * Room costs = 10000
 * Water Bill = 1000
 * Gas Bill = 500
 * Electric Bill = 1500
 *
 * Owner Total = 13000
 */
export function calculateOwnerTotal(month: MonthlyExpense): number {
  return month.members.reduce((grandTotal, member) => {
    const memberOwnerTotal = OWNER_CATEGORIES.reduce((sum, category) => {
      return sum + Number(member.amounts[category] || 0);
    }, 0);

    return grandTotal + memberOwnerTotal;
  }, 0);
}

/**
 * Calculate owner due.
 *
 * Owner Due = Owner Total - Owner Given
 */
export function calculateOwnerDue(
  ownerTotal: number,
  ownerGiven: number,
): number {
  return Math.max(0, ownerTotal - ownerGiven);
}

/**
 * Calculate total information for a month.
 */
export function calculateMonthTotals(month: MonthlyExpense) {
  const totalExpense = month.members.reduce(
    (sum, member) => sum + Number(member.total || 0),
    0,
  );

  const totalGiven = month.members.reduce(
    (sum, member) => sum + Number(member.given || 0),
    0,
  );

  const totalDue = month.members.reduce((sum, member) => {
    return sum + Math.max(0, -Number(member.back || 0));
  }, 0);

  const totalAdvance = month.members.reduce((sum, member) => {
    return sum + Math.max(0, Number(member.back || 0));
  }, 0);

  const paidMembers = month.members.filter(
    (member) => member.status === "Paid",
  ).length;

  const partialMembers = month.members.filter(
    (member) => member.status === "Partially Paid",
  ).length;

  const dueMembers = month.members.filter(
    (member) => member.status === "Due",
  ).length;

  const advanceMembers = month.members.filter(
    (member) => member.status === "Advance",
  ).length;

  /*
   * Owner total is calculated from current month.
   */
  const ownerTotal = calculateOwnerTotal(month);

  /*
   * Use saved ownerGiven if available.
   */
  const ownerGiven = Number(month.ownerGiven || 0);

  const ownerDue = calculateOwnerDue(ownerTotal, ownerGiven);

  return {
    totalExpense,

    totalGiven,

    totalDue,

    totalAdvance,

    paidMembers,

    partialMembers,

    dueMembers,

    advanceMembers,

    memberCount: month.members.length,

    ownerTotal,

    ownerGiven,

    ownerDue,
  };
}
