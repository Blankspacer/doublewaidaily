import { Reminder, Expense, ShoppingItem, DocumentItem, PlannerTask, FamilyMember } from '../types';

export const initialFamilyMembers: FamilyMember[] = [
  { id: 'm1', name: 'Neloy (Me)', role: 'Head of Household', avatarBg: 'bg-emerald-600' },
  { id: 'm2', name: 'Tasnim', role: 'Partner', avatarBg: 'bg-indigo-600' },
  { id: 'm3', name: 'Amma', role: 'Mom', avatarBg: 'bg-rose-600' },
  { id: 'm4', name: 'Fahim', role: 'Brother', avatarBg: 'bg-amber-600' },
];

export const getInitialReminders = (): Reminder[] => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const in3Days = new Date(today);
  in3Days.setDate(today.getDate() + 3);

  const in7Days = new Date(today);
  in7Days.setDate(today.getDate() + 7);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return [
    {
      id: 'rem-1',
      title: 'Pay Carnival / Dot Internet Bill (100 Mbps)',
      category: 'bill',
      dueDate: todayStr,
      dueTime: '17:00',
      priority: 'high',
      completed: false,
      notes: 'Monthly fee ৳1,200 via bKash bill pay.',
      assignedTo: 'm1',
      recurring: 'monthly',
    },
    {
      id: 'rem-2',
      title: 'Doctor Appointment - Dr. Rahman (Square Hospital)',
      category: 'appointment',
      dueDate: in3Days.toISOString().split('T')[0],
      dueTime: '18:30',
      priority: 'high',
      completed: false,
      notes: 'Take last month lipid panel report & prescription.',
      assignedTo: 'm3',
    },
    {
      id: 'rem-3',
      title: 'Pay DESCO / DPDC Electricity Bill',
      category: 'bill',
      dueDate: in7Days.toISOString().split('T')[0],
      dueTime: '12:00',
      priority: 'medium',
      completed: false,
      notes: 'Customer ID: 4920194. Approx ৳2,850.',
      assignedTo: 'm1',
      recurring: 'monthly',
    },
    {
      id: 'rem-4',
      title: "Tasnim's Birthday & Anniversary Dinner",
      category: 'birthday',
      dueDate: in7Days.toISOString().split('T')[0],
      dueTime: '20:00',
      priority: 'high',
      completed: false,
      notes: 'Order vanilla bean cake & reserve table at Izumi / Forest Lounge.',
      assignedTo: 'm1',
    },
    {
      id: 'rem-5',
      title: 'Air Conditioner Servicing & Deep Clean',
      category: 'household',
      dueDate: yesterday.toISOString().split('T')[0],
      dueTime: '11:00',
      priority: 'low',
      completed: true,
      notes: 'Sheba.xyz technician booked.',
      assignedTo: 'm2',
    },
  ];
};

export const getInitialExpenses = (): Expense[] => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yestStr = yesterday.toISOString().split('T')[0];

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const twoDaysStr = twoDaysAgo.toISOString().split('T')[0];

  return [
    {
      id: 'exp-1',
      amount: 450,
      currency: '৳',
      category: 'Groceries',
      note: 'Fresh seasonal vegetables & coriander (Karwan Bazar)',
      date: todayStr,
      paymentMethod: 'Cash',
      assignedTo: 'm1',
    },
    {
      id: 'exp-2',
      amount: 1450,
      currency: '৳',
      category: 'Dining',
      note: 'Family dinner - Biryani & Borhani',
      date: yestStr,
      paymentMethod: 'bKash',
      assignedTo: 'm2',
    },
    {
      id: 'exp-3',
      amount: 280,
      currency: '৳',
      category: 'Transport',
      note: 'Uber CNG ride from Gulshan-1 to Banani',
      date: yestStr,
      paymentMethod: 'Nagad',
      assignedTo: 'm1',
    },
    {
      id: 'exp-4',
      amount: 1850,
      currency: '৳',
      category: 'Utilities',
      note: 'Titas Gas prepaid card recharge',
      date: twoDaysStr,
      paymentMethod: 'bKash',
      assignedTo: 'm1',
    },
    {
      id: 'exp-5',
      amount: 620,
      currency: '৳',
      category: 'Health',
      note: 'Monthly BP & Diabetes vitamins (Lazz Pharma)',
      date: twoDaysStr,
      paymentMethod: 'Card',
      assignedTo: 'm3',
    },
  ];
};

export const initialShoppingItems: ShoppingItem[] = [
  { id: 'shop-1', name: 'Miniket Rice (চিনিকুড়া / মিনিকেট চাল)', category: 'Pantry', quantity: '5', unit: 'kg', estimatedPrice: 420, isBought: false, assignedTo: 'm1' },
  { id: 'shop-2', name: 'Mustard & Soybean Oil (সরিষা ও সয়াবিন তেল)', category: 'Pantry', quantity: '2', unit: 'liters', estimatedPrice: 380, isBought: false, assignedTo: 'm1' },
  { id: 'shop-3', name: 'Farm Fresh Brown Eggs (ডিম)', category: 'Dairy', quantity: '1', unit: 'dozen', estimatedPrice: 155, isBought: true, assignedTo: 'm2' },
  { id: 'shop-4', name: 'Rupchanda Hilsa / Rui Fish (রুই মাছ)', category: 'Meat/Fish', quantity: '1.5', unit: 'kg', estimatedPrice: 850, isBought: false, assignedTo: 'm1' },
  { id: 'shop-5', name: 'Detergent & Dishwashing Liquid (হুইল / ভিম লিকুইড)', category: 'Household', quantity: '1', unit: 'pack', estimatedPrice: 240, isBought: false, assignedTo: 'm2' },
];

export const initialDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Walton Inverter Refrigerator Warranty Card',
    category: 'warranty',
    provider: 'Walton BD',
    renewalDate: '2028-06-15',
    notes: '12-year compressor warranty coverage. Invoice #WAL-89301.',
    fileMockType: 'pdf',
    important: true,
  },
  {
    id: 'doc-2',
    title: 'Apartment Tenancy Lease Agreement',
    category: 'document',
    provider: 'Dhanmondi Lake View',
    renewalDate: '2027-02-28',
    notes: '2-year contract. Advance deposit ৳1,00,000.',
    fileMockType: 'pdf',
    important: true,
  },
  {
    id: 'doc-3',
    title: 'Car Fitness Certificate & Smart Tax Token',
    category: 'document',
    provider: 'BRTA Mirpur',
    renewalDate: '2027-04-12',
    notes: 'Toyota Premio. Reg: Dhaka Metro Ga-42-1920.',
    fileMockType: 'doc',
    important: true,
  },
  {
    id: 'doc-4',
    title: 'Singer Smart Android TV Invoice & Guarantee',
    category: 'receipt',
    provider: 'Singer Mega Store',
    renewalDate: '2027-08-10',
    notes: 'Panel replacement 3 years warranty.',
    fileMockType: 'png',
  },
];

export const initialPlannerTasks: PlannerTask[] = [
  { id: 'p-1', time: '08:00 AM', task: 'Morning Chai, almonds & review DayMate reminders', tag: 'Morning', timeBlock: 'morning', completed: true, priority: 'medium' },
  { id: 'p-2', time: '10:00 AM', task: 'Sprint sync & client project delivery', tag: 'Deep Work', timeBlock: 'morning', completed: false, priority: 'high' },
  { id: 'p-3', time: '01:30 PM', task: 'Family lunch & quick walk', tag: 'Break', timeBlock: 'afternoon', completed: false, priority: 'low' },
  { id: 'p-4', time: '04:30 PM', task: 'Check internet bill and review weekly budget', tag: 'Finance', timeBlock: 'afternoon', completed: false, priority: 'high' },
  { id: 'p-5', time: '07:00 PM', task: 'Local bazaar stop: Pick up rice & mustard oil', tag: 'Errand', timeBlock: 'evening', completed: false, priority: 'medium' },
  { id: 'p-6', time: '09:30 PM', task: 'Wind down, read 20 pages & plan tomorrow with DayMate', tag: 'Reflection', timeBlock: 'evening', completed: false, priority: 'low' },
];
