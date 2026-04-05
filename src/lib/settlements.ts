import type { Expense, User, MemberBalance, Settlement } from '@/types';

/**
 * Calculate net balances for all trip members based on expenses.
 * Positive net = they owe money. Negative net = they're owed money.
 */
export function calculateBalances(
  expenses: Expense[],
  members: { user_id: string; user: User }[]
): MemberBalance[] {
  const memberMap = new Map(members.map(m => [m.user_id, m.user]));
  const balances = new Map<string, { owed: number; owing: number }>();

  // Initialize all members
  for (const m of members) {
    balances.set(m.user_id, { owed: 0, owing: 0 });
  }

  for (const expense of expenses) {
    const { amount, paid_by, split_type, split_details } = expense;
    const memberIds = Array.from(memberMap.keys());

    // Calculate each person's share
    let shares: Record<string, number> = {};

    if (split_type === 'equal') {
      const perPerson = amount / memberIds.length;
      for (const id of memberIds) {
        shares[id] = perPerson;
      }
    } else if (split_type === 'custom' || split_type === 'specific') {
      shares = split_details;
    }

    // Update balances
    for (const [userId, share] of Object.entries(shares)) {
      const bal = balances.get(userId);
      if (!bal) continue;

      if (userId === paid_by) {
        // They paid, so others owe them (amount - their share)
        bal.owing += amount - share;
      } else {
        // They didn't pay, so they owe their share
        bal.owed += share;
      }

      balances.set(userId, bal);
    }
  }

  return Array.from(balances.entries()).map(([userId, bal]) => ({
    user: memberMap.get(userId)!,
    total_owed: Math.round(bal.owed * 100) / 100,
    total_owing: Math.round(bal.owing * 100) / 100,
    net: Math.round((bal.owed - bal.owing) * 100) / 100,
  }));
}

/**
 * Calculate optimal settlements to minimize number of transactions.
 * Uses a greedy algorithm: match largest debtor with largest creditor.
 */
export function calculateSettlements(balances: MemberBalance[]): Settlement[] {
  // Separate into debtors (positive net = they owe) and creditors (negative net = they're owed)
  const debtors = balances
    .filter(b => b.net > 0.01)
    .map(b => ({ user: b.user, amount: b.net }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = balances
    .filter(b => b.net < -0.01)
    .map(b => ({ user: b.user, amount: -b.net }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];

  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.user,
        to: creditor.user,
        amount: Math.round(amount * 100) / 100,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) di++;
    if (creditor.amount < 0.01) ci++;
  }

  return settlements;
}
