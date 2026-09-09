
import { Directory, File, Paths } from "expo-file-system";

import {
  AppSettings,
  Member,
  MonthlyExpense,
} from "../models/types";

import { DEFAULT_CATEGORIES } from "../constants/defaultCategories";

// ======================================================
// DIRECTORIES
// ======================================================

const ROOT_DIR = new Directory(
  Paths.document,
  "FlatExpenseData",
);

const MONTHS_DIR = new Directory(
  ROOT_DIR,
  "months",
);

const INVOICES_DIR = new Directory(
  ROOT_DIR,
  "invoices",
);

// ======================================================
// DIRECTORY SETUP
// ======================================================

function ensureDirectories() {
  if (!ROOT_DIR.exists) {
    ROOT_DIR.create();
  }

  if (!MONTHS_DIR.exists) {
    MONTHS_DIR.create();
  }

  if (!INVOICES_DIR.exists) {
    INVOICES_DIR.create();
  }
}

// ======================================================
// INITIALIZE STORAGE
// ======================================================

export function initializeStorage() {
  ensureDirectories();

  // -----------------------------
  // Members
  // -----------------------------

  const membersFile = new File(
    ROOT_DIR,
    "members.json",
  );

  if (!membersFile.exists) {
    membersFile.create();

    membersFile.write(
      JSON.stringify([], null, 2),
    );
  }

  // -----------------------------
  // Settings
  // -----------------------------

  const settingsFile = new File(
    ROOT_DIR,
    "settings.json",
  );

  if (!settingsFile.exists) {
    settingsFile.create();

    settingsFile.write(
      JSON.stringify(
        {
          flatName: "New Flat",
          currency: "৳",
          categories: DEFAULT_CATEGORIES,
        },
        null,
        2,
      ),
    );
  }
}

// ======================================================
// JSON HELPERS
// ======================================================

function readJSON<T>(file: File): T | null {
  try {
    if (!file.exists) {
      return null;
    }

    const content = file.textSync();

    if (!content) {
      return null;
    }

    return JSON.parse(content) as T;
  } catch (error) {
    console.error(
      "JSON read error:",
      error,
    );

    return null;
  }
}

function saveJSON(
  file: File,
  data: unknown,
) {
  file.write(
    JSON.stringify(data, null, 2),
  );
}

// ======================================================
// CURRENT MONTH
// ======================================================

export function getCurrentMonthKey(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");

  return `${year}-${month}`;
}

// ======================================================
// MEMBERS
// ======================================================

export function getMembers(): Member[] {
  ensureDirectories();

  const file = new File(
    ROOT_DIR,
    "members.json",
  );

  return (
    readJSON<Member[]>(file) ?? []
  );
}

export function saveMembers(
  members: Member[],
) {
  ensureDirectories();

  const file = new File(
    ROOT_DIR,
    "members.json",
  );

  saveJSON(file, members);
}

// ======================================================
// ADD MEMBER
// ======================================================

export function addMember(
  member: Member,
) {
  // ------------------------------------
  // 1. Add to active members
  // ------------------------------------

  const members = getMembers();

  const alreadyExists = members.some(
    (item) => item.id === member.id,
  );

  if (!alreadyExists) {
    members.push(member);

    saveMembers(members);
  }

  // ------------------------------------
  // 2. Add ONLY to current month
  // ------------------------------------

  const currentMonth =
    getCurrentMonthKey();

  const month =
    getMonth(currentMonth);

  if (!month) {
    return;
  }

  // Don't add twice
  const alreadyInMonth =
    month.members.some(
      (item) =>
        item.memberId === member.id,
    );

  if (alreadyInMonth) {
    return;
  }

  // Create empty amounts
  const amounts: Record<
    string,
    number
  > = {};

  month.categories.forEach(
    (category) => {
      amounts[category] = 0;
    },
  );

  const monthlyMember = {
    memberId: member.id,

    amounts,

    total: 0,

    dueFromPrevMonth: 0,

    grandTotalOwed: 0,

    given: 0,

    back: 0,

    status: "Due" as const,
  };

  const updatedMonth: MonthlyExpense = {
    ...month,

    members: [
      ...month.members,
      monthlyMember,
    ],

    updatedAt:
      new Date().toISOString(),
  };

  saveMonth(updatedMonth);
}

// ======================================================
// UPDATE MEMBER
// ======================================================

export function updateMember(
  updatedMember: Member,
) {
  const members = getMembers();

  const updatedMembers =
    members.map((member) =>
      member.id === updatedMember.id
        ? updatedMember
        : member,
    );

  saveMembers(updatedMembers);

  // ------------------------------------
  // IMPORTANT:
  // Update ONLY current month name/
  // member reference remains same ID.
  //
  // Old months are NOT changed.
  // ------------------------------------
}

// ======================================================
// DELETE MEMBER
// ======================================================

export function deleteMember(
  memberId: string,
) {
  // ------------------------------------
  // 1. Remove from active members
  // ------------------------------------

  const members = getMembers();

  const updatedMembers =
    members.filter(
      (member) =>
        member.id !== memberId,
    );

  saveMembers(updatedMembers);

  // ------------------------------------
  // 2. Remove ONLY from current month
  // ------------------------------------

  const currentMonth =
    getCurrentMonthKey();

  const month =
    getMonth(currentMonth);

  if (!month) {
    return;
  }

  const updatedMonth: MonthlyExpense = {
    ...month,

    members:
      month.members.filter(
        (member) =>
          member.memberId !== memberId,
      ),

    updatedAt:
      new Date().toISOString(),
  };

  saveMonth(updatedMonth);
}

// ======================================================
// SETTINGS
// ======================================================

export function getSettings(): AppSettings {
  ensureDirectories();

  const file = new File(
    ROOT_DIR,
    "settings.json",
  );

  return (
    readJSON<AppSettings>(file) ?? {
      flatName: "New Flat",
      currency: "৳",
      categories: [
        ...DEFAULT_CATEGORIES,
      ],
    }
  );
}

export function saveSettings(settings: AppSettings) {
  ensureDirectories();

  // ------------------------------------
  // 1. Save settings
  // ------------------------------------

  const file = new File(ROOT_DIR, "settings.json");

  saveJSON(file, settings);

  // ------------------------------------
  // 2. Update ONLY current month
  // ------------------------------------

  const currentMonth = getCurrentMonthKey();

  const currentMonthData = getMonth(currentMonth);

  if (!currentMonthData) {
    return;
  }

  // ------------------------------------
  // Add new categories to current month
  // ------------------------------------

  const updatedCategories = [
    ...currentMonthData.categories,
    ...settings.categories.filter(
      (category) => !currentMonthData.categories.includes(category),
    ),
  ];

  // ------------------------------------
  // Add amount = 0 for new categories
  // for every member
  // ------------------------------------

  const updatedMembers = currentMonthData.members.map((member) => {
    const updatedAmounts = {
      ...member.amounts,
    };

    settings.categories.forEach((category) => {
      if (updatedAmounts[category] === undefined) {
        updatedAmounts[category] = 0;
      }
    });

    return {
      ...member,
      amounts: updatedAmounts,
    };
  });

  // ------------------------------------
  // Save current month
  // ------------------------------------

  const updatedMonth: MonthlyExpense = {
    ...currentMonthData,

    categories: updatedCategories,

    members: updatedMembers,

    flatName: settings.flatName,

    updatedAt: new Date().toISOString(),
  };

  saveMonth(updatedMonth);
}


// ======================================================
// MONTH FILE
// ======================================================

export function getMonthFile(
  month: string,
) {
  ensureDirectories();

  return new File(
    MONTHS_DIR,
    `${month}.json`,
  );
}

// ======================================================
// GET SINGLE MONTH
// ======================================================

export function getMonth(
  month: string,
): MonthlyExpense | null {
  const file =
    getMonthFile(month);

  return readJSON<MonthlyExpense>(
    file,
  );
}

// ======================================================
// SAVE MONTH
// ======================================================

export function saveMonth(
  data: MonthlyExpense,
) {
  const file =
    getMonthFile(data.month);

  saveJSON(file, data);
}

// ======================================================
// GET ALL MONTHS
// ======================================================

export function getAllMonths(): MonthlyExpense[] {
  ensureDirectories();

  try {
    const files =
      MONTHS_DIR.list();

    const months: MonthlyExpense[] =
      [];

    for (const item of files) {
      if (
        item instanceof File &&
        item.name.endsWith(".json")
      ) {
        const data =
          readJSON<MonthlyExpense>(
            item,
          );

        if (data) {
          months.push(data);
        }
      }
    }

    return months.sort(
      (a, b) =>
        b.month.localeCompare(
          a.month,
        ),
    );
  } catch (error) {
    console.error(
      "Could not load months:",
      error,
    );

    return [];
  }
}

// ======================================================
// DELETE MONTH
// ======================================================

export function deleteMonth(
  month: string,
) {
  const file =
    getMonthFile(month);

  if (file.exists) {
    file.delete();
  }
}

// ======================================================
// CREATE NEW MONTH
// ======================================================

export function createMonth(
  month: string,
  previousMonth?: MonthlyExpense | null,
): MonthlyExpense {
  const settings =
    getSettings();

  // ------------------------------------
  // Get CURRENT active members
  // ------------------------------------

  const members =
    getMembers();

  // ------------------------------------
  // Categories
  //
  // Previous month's categories
  // are copied to new month.
  // ------------------------------------

  const categories =
    previousMonth?.categories?.length
      ? [...previousMonth.categories]
      : [...settings.categories];

  // ------------------------------------
  // Create monthly members
  // ------------------------------------

  const monthlyMembers =
    members.map((member) => {
      const previousMember =
        previousMonth?.members.find(
          (item) =>
            item.memberId ===
            member.id,
        );

      // --------------------------------
      // Copy previous month's bills
      // --------------------------------

      const amounts: Record<
        string,
        number
      > = {};

      categories.forEach(
        (category) => {
          amounts[category] =
            previousMember?.amounts[
              category
            ] ?? 0;
        },
      );

      // --------------------------------
      // Carry previous balance
      //
      // Previous back:
      //
      // - negative = member owes us
      // - positive = member has advance
      //
      // New month:
      //
      // positive dueFromPrevMonth
      // = previous due
      //
      // negative
      // = previous advance
      // --------------------------------

      let dueFromPrevMonth = 0;

      if (previousMember) {
        dueFromPrevMonth =
          -previousMember.back;
      }

      return {
        memberId: member.id,

        amounts,

        total:
          previousMember?.total ??
          0,

        dueFromPrevMonth,

        grandTotalOwed: 0,

        given: 0,

        back: 0,

        status:
          "Due" as const,
      };
    });

  // ------------------------------------
  // Timestamps
  // ------------------------------------

  const now =
    new Date().toISOString();

  // ------------------------------------
  // New Month Object
  // ------------------------------------

  const newMonth: MonthlyExpense = {
    month,

    flatName: settings.flatName,

    categories,

    members: monthlyMembers,

    ownerTotal: 0,

    ownerGiven: 0,

    ownerDue: 0,

    createdAt: now,

    updatedAt: now,
  };

  // ------------------------------------
  // Save
  // ------------------------------------

  saveMonth(newMonth);

  return newMonth;
}

// ======================================================
// GET PREVIOUS MONTH
// ======================================================

export function getPreviousMonth(
  month: string,
): MonthlyExpense | null {
  const allMonths =
    getAllMonths();

  const previousMonths =
    allMonths.filter(
      (item) =>
        item.month < month,
    );

  if (
    previousMonths.length === 0
  ) {
    return null;
  }

  previousMonths.sort(
    (a, b) =>
      b.month.localeCompare(
        a.month,
      ),
  );

  return (
    previousMonths[0] ?? null
  );
}

// ======================================================
// CREATE MONTH FROM PREVIOUS MONTH
// ======================================================

export function createNewMonth(
  month: string,
): MonthlyExpense {
  const previousMonth =
    getPreviousMonth(month);

  return createMonth(
    month,
    previousMonth,
  );
}

// ======================================================
// INVOICE FILE
// ======================================================

export function getInvoiceFile(
  filename: string,
) {
  ensureDirectories();

  return new File(
    INVOICES_DIR,
    filename,
  );
}

