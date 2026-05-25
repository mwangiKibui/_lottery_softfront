/* =====================================================================
   PRINCE LOTO — Dummy Data Store
   All placeholder data lives here. Replace by removing this import
   and letting App.Api fetch from the real backend.

   INTEGRATION NOTE: When USE_DUMMY_DATA = false, this file is still
   loaded but its data is never used — only the API responses matter.
   ===================================================================== */

window.App = window.App || {};

App.Data = {
  /* ── Lottery Types ── */
  lotteries: ['Mega Luck', 'Power Jackpot', 'Daily Cash', 'Golden Week'],

  /* ── Sellers ── */
  sellers: [
    { id: 'S001', name: 'Emma Rodriguez',  deviceId: 'DEV-EM01', supervisor: 'John Myers',  commission: 8,   paymentTerm: 'Monthly',   bonus: 250, profitLimit: 5000, logo: 'emma.png',    companyName: 'Emma Agency',   dailyLimit: 3000, sellLimit: 200, totalSold: 54200, status: 'active' },
    { id: 'S002', name: 'Michael Chen',    deviceId: 'DEV-MC22', supervisor: 'Lisa Wong',   commission: 7.5, paymentTerm: 'Biweekly',  bonus: 180, profitLimit: 4200, logo: 'michael.png', companyName: 'Chen Trading',  dailyLimit: 2800, sellLimit: 180, totalSold: 47800, status: 'active' },
    { id: 'S003', name: 'Sophia Laurent',  deviceId: 'DEV-SL09', supervisor: 'John Myers',  commission: 9,   paymentTerm: 'Monthly',   bonus: 310, profitLimit: 6000, logo: 'sophia.png',  companyName: 'Laurent Group', dailyLimit: 3500, sellLimit: 220, totalSold: 69800, status: 'active' },
    { id: 'S004', name: 'James Okonkwo',   deviceId: 'DEV-JO77', supervisor: 'Elena Voss',  commission: 7,   paymentTerm: 'Weekly',    bonus: 140, profitLimit: 3500, logo: 'james.png',   companyName: 'Okonkwo Ent',   dailyLimit: 2400, sellLimit: 150, totalSold: 35900, status: 'active' },
  ],

  /* ── Supervisors ── */
  supervisors: [
    { id: 'SPV1', name: 'John Myers',  contact: 'john@princeloto.com',  commission: 5,   region: 'North' },
    { id: 'SPV2', name: 'Lisa Wong',   contact: 'lisa@princeloto.com',  commission: 4.5, region: 'East'  },
    { id: 'SPV3', name: 'Elena Voss',  contact: 'elena@princeloto.com', commission: 5.2, region: 'West'  },
  ],

  /* ── Sales ── */
  sales: [
    { seller: 'Emma Rodriguez',  lottery: 'Mega Luck',     date: '2025-05-01', amount: 1250 },
    { seller: 'Emma Rodriguez',  lottery: 'Power Jackpot', date: '2025-05-03', amount: 980  },
    { seller: 'Michael Chen',    lottery: 'Mega Luck',     date: '2025-05-05', amount: 2100 },
    { seller: 'Sophia Laurent',  lottery: 'Daily Cash',    date: '2025-05-07', amount: 540  },
    { seller: 'James Okonkwo',   lottery: 'Golden Week',   date: '2025-05-09', amount: 3200 },
    { seller: 'Emma Rodriguez',  lottery: 'Daily Cash',    date: '2025-05-10', amount: 770  },
    { seller: 'Michael Chen',    lottery: 'Power Jackpot', date: '2025-05-12', amount: 1540 },
    { seller: 'Sophia Laurent',  lottery: 'Mega Luck',     date: '2025-05-14', amount: 2680 },
    { seller: 'James Okonkwo',   lottery: 'Mega Luck',     date: '2025-05-15', amount: 970  },
  ],

  /* ── Payment Conditions (global) ── */
  paymentConditions: {
    'Mega Luck':     { '1st': 12500, '2nd': 3200, '3rd': 850,  '4th': 400, '5th': 200, '6th': 100, '7th': 50, '8th': 25 },
    'Power Jackpot': { '1st': 25000, '2nd': 5500, '3rd': 1250, '4th': 600, '5th': 300, '6th': 150, '7th': 75, '8th': 40 },
    'Daily Cash':    { '1st': 5000,  '2nd': 1100, '3rd': 300,  '4th': 150, '5th': 80,  '6th': 40,  '7th': 20, '8th': 10 },
    'Golden Week':   { '1st': 18750, '2nd': 4200, '3rd': 950,  '4th': 500, '5th': 250, '6th': 120, '7th': 60, '8th': 30 },
  },

  /* ── Payment Overrides (seller / supervisor) ── */
  sellerPaymentOverrides: {},
  supervisorPaymentOverrides: {},

  /* ── Limit Categories ── */
  limitCategories: ['BLT', 'L3C', 'MRG', 'L4C1', 'L4C2', 'L4C3', 'L5C1', 'L5C2', 'L5C3'],

  /* ── Global Limits ── */
  globalLimits: {
    'Mega Luck':     { BLT: 4800, L3C: 2200, MRG: 1500, L4C1: 800,  L4C2: 800,  L4C3: 800,  L5C1: 400, L5C2: 400, L5C3: 400 },
    'Power Jackpot': { BLT: 6200, L3C: 3100, MRG: 2100, L4C1: 1100, L4C2: 1100, L4C3: 1100, L5C1: 550, L5C2: 550, L5C3: 550 },
    'Daily Cash':    { BLT: 2800, L3C: 1200, MRG: 750,  L4C1: 400,  L4C2: 400,  L4C3: 400,  L5C1: 200, L5C2: 200, L5C3: 200 },
    'Golden Week':   { BLT: 5400, L3C: 2700, MRG: 1850, L4C1: 950,  L4C2: 950,  L4C3: 950,  L5C1: 480, L5C2: 480, L5C3: 480 },
  },

  /* ── Limit Overrides ── */
  sellerLimits: {},
  supervisorLimits: {},

  /* ── Sold Tickets ── */
  soldTickets: [
    { id: '#T1001', lottery: 'Mega Luck',     buyer: 'john.d@ex.com',  price: 5,  status: 'active', seller: 'Emma Rodriguez', date: '2025-05-10' },
    { id: '#T1002', lottery: 'Power Jackpot', buyer: 'alice.w@ex.com', price: 10, status: 'active', seller: 'Michael Chen',   date: '2025-05-11' },
    { id: '#T1003', lottery: 'Daily Cash',    buyer: 'rob.t@ex.com',   price: 2,  status: 'active', seller: 'Sophia Laurent', date: '2025-05-12' },
    { id: '#T1004', lottery: 'Golden Week',   buyer: 'mary.k@ex.com',  price: 15, status: 'active', seller: 'James Okonkwo',  date: '2025-05-14' },
    { id: '#T1005', lottery: 'Mega Luck',     buyer: 'tony.s@ex.com',  price: 8,  status: 'active', seller: 'Emma Rodriguez', date: '2025-05-15' },
  ],

  /* ── Winning Tickets ── */
  winningTickets: [
    { ticket: 'W8912', lottery: 'Mega Luck',     prize: 12500, winner: 'Sarah L.',  status: 'paid',    seller: 'Emma Rodriguez', date: '2025-05-10' },
    { ticket: 'W4511', lottery: 'Power Jackpot', prize: 3450,  winner: 'David K.',  status: 'paid',    seller: 'Michael Chen',   date: '2025-05-12' },
    { ticket: 'W6720', lottery: 'Daily Cash',    prize: 500,   winner: 'Linda T.',  status: 'pending', seller: 'Sophia Laurent', date: '2025-05-13' },
    { ticket: 'W9832', lottery: 'Golden Week',   prize: 4200,  winner: 'Robert F.', status: 'pending', seller: 'James Okonkwo',  date: '2025-05-14' },
  ],

  /* ── Draw Numbers ── */
  drawNumbers: [
    { drawId: '#LN1023', lottery: 'Mega Luck',     lot3: '03,12,29', sec2: '08,22,35', third: '15,18,42', date: '2025-05-12' },
    { drawId: '#LN1022', lottery: 'Power Jackpot', lot3: '07,14,31', sec2: '05,19,27', third: '09,33,47', date: '2025-05-11' },
    { drawId: '#LN1021', lottery: 'Daily Cash',    lot3: '11,22,38', sec2: '02,16,29', third: '04,25,39', date: '2025-05-10' },
  ],

  /* ── Dashboard Summary ── */
  dashboardStats: {
    totalSell:  184250,
    paidAmount: 132480,
    profit:     51770,
    activeSellers: 4,
    totalTickets:  4823,
  },

  /* ── Helpers ── */
  nextSellerId() {
    const n = (this.sellers.length + 1).toString().padStart(3, '0');
    return `S${n}`;
  },

  nextSupervisorId() {
    const n = (this.supervisors.length + 1).toString().padStart(2, '0');
    return `SPV${n}`;
  },

  getSellersBySupervisor(supervisorName) {
    return this.sellers.filter(s => s.supervisor === supervisorName).map(s => s.name);
  },
};
