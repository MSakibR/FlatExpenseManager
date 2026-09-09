export type ExpenseStatus = "Paid" | "Partially Paid" | "Due" | "Advance";

export interface Member {
  id: string;
  name: string;
  phone?: string;
  avatar?: string;
}

export interface MonthlyMemberInput {
  memberId: string;
  amounts: Record<string, number>;
  dueFromPrevMonth: number;
  given: number;
}

export interface MonthlyMember {
  memberId: string;

  amounts: Record<string, number>;

  total: number;

  dueFromPrevMonth: number;

  grandTotalOwed: number;

  given: number;

  back: number;

  status: ExpenseStatus;
}

export interface MonthlyExpense {
  month: string;

  flatName: string;

  categories: string[];

  members: MonthlyMember[];

  /*
   * Flat Owner Payment
   *
   * ownerTotal:
   * Room costs + Water Bill + Gas Bill + Electric Bill
   *
   * ownerGiven:
   * Amount already given to the owner
   *
   * ownerDue:
   * ownerTotal - ownerGiven
   */
  ownerTotal: number;

  ownerGiven: number;

  ownerDue: number;

  createdAt: string;

  updatedAt: string;
}

export interface AppSettings {
  flatName: string;

  currency: string;

  categories: string[];
}
