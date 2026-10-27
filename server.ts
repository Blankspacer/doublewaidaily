import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini client if a real API key is present
const rawKey = process.env.GEMINI_API_KEY;
const apiKey = rawKey && rawKey !== 'MY_GEMINI_API_KEY' && rawKey.trim().length > 10 ? rawKey.trim() : null;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper to race promise with timeout
const withTimeout = <T>(promise: Promise<T>, ms = 6000): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI request timed out')), ms)),
  ]);

// Multi-intent command decomposition endpoint
app.post('/api/parse-command', async (req: Request, res: Response) => {
  const { command, language = 'en', currentDate = new Date().toISOString() } = req.body;

  if (!command || typeof command !== 'string' || !command.trim()) {
    return res.status(400).json({ error: 'Command is required' });
  }

  const promptText = command.trim();

  // If Gemini is available, run through structured JSON model
  if (ai) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
        contents: `You are DayMate AI, an intelligent personal life assistant specializing in breaking multi-intent user instructions into structured actions.
Current Reference Date & Time: ${currentDate}
User language: ${language} (support both English and Bengali / Bangla).
Local currency default: ৳ (BDT) unless specified otherwise.

Analyze this user voice or text command:
"${promptText}"

Extract all intended operations into their respective categories:
1. Expenses: any spending, purchases made, money given.
2. Reminders: any upcoming obligations, deadlines, bill payments, appointments, birthdays, recurring chores.
3. Shopping items: any grocery, pantry, market, or shopping list additions.
4. Planner tasks: any specific tasks/agenda to schedule for today or a specific day.
5. Documents: any bills, warranties, receipts, or papers mentioned for saving or renewal.

Respond in JSON matching the exact schema. Also provide a polite, natural confirmation summary in the user's language (${language === 'bn' ? 'Bengali/বাংলা' : 'English'}).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiSummary: {
                type: Type.STRING,
                description: 'Friendly confirmation of all actions taken in the requested language',
              },
              expenses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    amount: { type: Type.NUMBER },
                    currency: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      description: 'Groceries, Utilities, Dining, Transport, Shopping, Health, Entertainment, Education, Other',
                    },
                    note: { type: Type.STRING },
                    date: { type: Type.STRING, description: 'YYYY-MM-DD format' },
                  },
                  required: ['amount', 'category', 'note'],
                },
              },
              reminders: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      description: 'bill, appointment, birthday, deadline, household, other',
                    },
                    dueDate: { type: Type.STRING, description: 'YYYY-MM-DD' },
                    dueTime: { type: Type.STRING, description: 'HH:mm 24-hr or null' },
                    priority: { type: Type.STRING, description: 'low, medium, high' },
                  },
                  required: ['title', 'category'],
                },
              },
              shoppingItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING, description: 'Produce, Pantry, Dairy, Meat/Fish, Household, Snacks, Personal Care, Other' },
                    quantity: { type: Type.STRING },
                    estimatedPrice: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                  },
                  required: ['name'],
                },
              },
              plannerTasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    timeBlock: { type: Type.STRING, description: 'morning, afternoon, evening' },
                    durationMinutes: { type: Type.NUMBER },
                    priority: { type: Type.STRING, description: 'low, medium, high' },
                  },
                  required: ['title', 'timeBlock'],
                },
              },
              documents: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING, description: 'bill, receipt, warranty, document, subscription' },
                    renewalDate: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: ['title', 'category'],
                },
              },
            },
            required: ['aiSummary'],
          },
        },
      }));

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        source: 'gemini',
        ...parsed,
      });
    } catch (err: any) {
      console.warn('Gemini parse error, falling back to heuristic parser:', err?.message || err);
      // Fall through to heuristic parser below
    }
  }

  // Heuristic rule-based multi-intent fallback parser
  const fallbackResult = parseFallbackCommand(promptText, currentDate, language);
  return res.json({
    success: true,
    source: 'fallback',
    ...fallbackResult,
  });
});

// AI Daily Planner Generator
app.post('/api/daily-planner', async (req: Request, res: Response) => {
  const { tasks = [], reminders = [], date = new Date().toISOString().split('T')[0], language = 'en' } = req.body;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are DayMate AI Daily Planner.
Date: ${date}
Language: ${language}
Given these pending user reminders and items:
${JSON.stringify({ tasks, reminders })}

Create a balanced, realistic, productive schedule structured into Morning (08:00 - 12:00), Afternoon (12:00 - 17:00), and Evening (17:00 - 22:00).
Include helpful productivity notes, a motivational quote, and top 3 priorities.
Respond in JSON format.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              quote: { type: Type.STRING },
              topPriorities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              morning: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    task: { type: Type.STRING },
                    tag: { type: Type.STRING },
                  },
                  required: ['time', 'task'],
                },
              },
              afternoon: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    task: { type: Type.STRING },
                    tag: { type: Type.STRING },
                  },
                  required: ['time', 'task'],
                },
              },
              evening: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    task: { type: Type.STRING },
                    tag: { type: Type.STRING },
                  },
                  required: ['time', 'task'],
                },
              },
              wellnessTip: { type: Type.STRING },
            },
            required: ['headline', 'topPriorities', 'morning', 'afternoon', 'evening'],
          },
        },
      });

      const plan = JSON.parse(response.text || '{}');
      return res.json({ success: true, plan });
    } catch (err: any) {
      console.warn('Gemini planner error:', err?.message || err);
    }
  }

  // Fallback planner generator
  return res.json({
    success: true,
    plan: {
      headline: language === 'bn' ? 'আজকের সুশৃঙ্খল দিনলিপি' : 'Your Optimized Day Plan',
      quote: language === 'bn' ? 'প্রতিটি ছোট পদক্ষেপই বড় সাফল্যের চাবিকাঠি।' : 'Focus on being productive instead of busy.',
      topPriorities: [
        language === 'bn' ? 'জরুরি বিল ও রিমাইন্ডার সম্পন্ন করা' : 'Pay urgent bills & clear overdue reminders',
        language === 'bn' ? 'দৈনিক বাজার ও রান্নার প্রস্তুতি' : 'Complete household groceries & shopping',
        language === 'bn' ? 'দিনের হিসাব ও বাজেট নিরীক্ষা' : 'Review daily spending & wrap up tasks',
      ],
      morning: [
        { time: '08:30 AM', task: language === 'bn' ? 'সকালের স্বাস্থ্যকর নাস্তা ও দিনের লক্ষ্য পর্যালোচনা' : 'Healthy breakfast & DayMate plan review', tag: 'Wellness' },
        { time: '10:00 AM', task: language === 'bn' ? 'গুরুত্বপূর্ণ কর্মব্যস্ততা ও জরুরি বার্তা' : 'Deep work block & priority communications', tag: 'Work' },
      ],
      afternoon: [
        { time: '01:30 PM', task: language === 'bn' ? 'দুপুরের খাবার ও সংক্ষিপ্ত বিশ্রাম' : 'Lunch break & quick recharge walk', tag: 'Break' },
        { time: '03:00 PM', task: language === 'bn' ? 'বিল পরিশোধ ও বাজার তালিকা যাচাই' : 'Process household errands & bills', tag: 'Errands' },
      ],
      evening: [
        { time: '06:30 PM', task: language === 'bn' ? 'বাজার বা মুদি সদাই সংগ্রহ' : 'Grocery pickup & family time', tag: 'Personal' },
        { time: '09:30 PM', task: language === 'bn' ? 'দৈনিক খরচ এন্ট্রি ও আগামীকালের প্রস্তুতি' : 'Log daily expenses & plan tomorrow', tag: 'Review' },
      ],
      wellnessTip: language === 'bn' ? 'পর্যাপ্ত পানি পান করুন এবং একটানা দীর্ঘক্ষণ বসে না থেকে বিরতি নিন।' : 'Stay hydrated and take a 5-minute break every hour.',
    },
  });
});

// Financial Insights Endpoint
app.post('/api/financial-insights', async (req: Request, res: Response) => {
  const { expenses = [], budget = 30000, currency = '৳', language = 'en' } = req.body;

  if (ai && expenses.length > 0) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are DayMate AI Personal Financial Advisor.
Currency: ${currency}
Monthly Budget: ${budget}
Recent Expenses:
${JSON.stringify(expenses.slice(0, 30))}
Language: ${language}

Provide:
1. Short analysis of highest spending categories.
2. Budget health status (e.g., Safe, Warning, Exceeded).
3. 2 actionable money-saving tips tailored for everyday household or individual life in Bangladesh/South Asia context.
Respond in JSON.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING, description: 'Safe, On Track, Warning, or Critical' },
              summary: { type: Type.STRING },
              topCategory: { type: Type.STRING },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              projectedSavings: { type: Type.STRING },
            },
            required: ['status', 'summary', 'tips'],
          },
        },
      });

      const insights = JSON.parse(response.text || '{}');
      return res.json({ success: true, insights });
    } catch (err: any) {
      console.warn('Gemini financial insights error:', err?.message || err);
    }
  }

  // Fallback calculation
  const total = expenses.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
  const percent = budget > 0 ? Math.round((total / budget) * 100) : 0;
  return res.json({
    success: true,
    insights: {
      status: percent > 90 ? 'Warning' : percent > 60 ? 'On Track' : 'Safe',
      summary: language === 'bn'
        ? `আপনি মোট ${currency}${total.toLocaleString()} খরচ করেছেন (বাজেটের ${percent}%)।`
        : `You have spent ${currency}${total.toLocaleString()} (${percent}% of budget).`,
      topCategory: 'Groceries',
      tips: [
        language === 'bn' ? 'সাপ্তাহিক কাঁচাবাজারের ফর্দ আগে তৈরি রাখলে অপ্রয়োজনীয় খরচ ১০-১৫% কমানো যায়।' : 'Preparing weekly grocery lists beforehand typically reduces impulse buying by 15%.',
        language === 'bn' ? 'ইউটিলিটি ও ইন্টারনেট বিল যথাসময়ে পরিশোধ করে লেট ফি এড়িয়ে চলুন।' : 'Pay utility bills before the due date to avoid recurring penalty surcharges.',
      ],
      projectedSavings: `${currency}${(budget * 0.12).toFixed(0)}`,
    },
  });
});

// Fallback multi-intent parser for when Gemini isn't called or for rapid local execution
function parseFallbackCommand(command: string, currentDateStr: string, lang: string) {
  const text = command.trim();
  const lower = text.toLowerCase();
  const expenses: any[] = [];
  const reminders: any[] = [];
  const shoppingItems: any[] = [];
  const plannerTasks: any[] = [];
  const documents: any[] = [];

  const today = new Date(currentDateStr);
  const nextFriday = getNextDayOfWeek(today, 5); // 5 = Friday
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const fridayStr = nextFriday.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  // 1. Detect Expense
  // Match e.g. "spent ৳450 on groceries", "৪৫০ টাকার কাঁচাবাজার করেছি", "500 tk lunch"
  const expenseRegex = /(?:(?:spent|cost|paid|খরচ|টাকার|টাকা|৳)\s*([৳$€£]?)\s*([\d\u09E6-\u09EF]+(?:\.\d+)?)|([\d\u09E6-\u09EF]+(?:\.\d+)?)\s*(?:টাকার|টাকা|tk|taka|৳))\s*(?:on|for|for the|বাবদ)?\s*([a-zA-Z\u0980-\u09FF\s]+?)(?:,|and|\.|remind|মনে করিয়ে|add|যোগ|$)/i;
  const expMatch = lower.match(expenseRegex);

  if (expMatch) {
    const rawNum = convertBengaliNumerals(expMatch[2] || expMatch[3] || '');
    const amount = parseFloat(rawNum);
    let note = (expMatch[4] || '').trim() || 'General Expense';
    // Clean up connecting words
    note = note.replace(/(?:remind|add|and|also|কালকের|শুক্রবার|করেছি|দেয়ার).*$/i, '').trim();

    let category = 'Groceries';
    if (/uber|pathao|rickshaw|bus|cng|metro|transport|ভাড়া|রিকশা/i.test(note)) category = 'Transport';
    else if (/bill|internet|wifi|gas|electricity|current|ওয়াইফাই|বিদ্যুৎ|পানি/i.test(note)) category = 'Utilities';
    else if (/lunch|dinner|burger|coffee|tea|restaurant|খাবার|চা/i.test(note)) category = 'Dining';
    else if (/medicine|doctor|pharmacy|ঔষধ|ডাক্তার/i.test(note)) category = 'Health';

    if (!isNaN(amount) && amount > 0) {
      expenses.push({
        amount,
        currency: '৳',
        category,
        note: note.charAt(0).toUpperCase() + note.slice(1),
        date: todayStr,
      });
    }
  }

  // 2. Detect Reminder
  // Match e.g. "remind me to pay my internet bill on Friday", "শুক্রবার ওয়াইফাই বিল দেয়ার কথা মনে করিয়ে দাও"
  const reminderRegex = /(?:(?:remind(?: me)? to|alert me to)\s*([a-zA-Z\u0980-\u09FF\s]+?)(?:on (friday|saturday|sunday|monday|tuesday|wednesday|thursday|tomorrow|today)|,|$)|(?:(শুক্রবার|শনিবার|রবিবার|সোমবার|মঙ্গলবার|বুধবার|বৃহস্পতিবার|আগামীকাল|কাল)\s*)?([a-zA-Z\u0980-\u09FF\s]+?)(?:দেয়ার কথা মনে করিয়ে দাও|মনে করিয়ে দাও|রিমাইন্ডার দাও|রিমাইন্ডার সেট করো))/i;
  const remMatch = text.match(reminderRegex);

  if (remMatch) {
    let title = (remMatch[1] || remMatch[4] || 'Important Task').trim();
    title = title.replace(/(?:add|and|also|shopping|list|আর কালকের|বাজারে|চাল).*$/i, '').trim();

    let targetDate = todayStr;
    if (/friday|শুক্রবার/i.test(text)) targetDate = fridayStr;
    else if (/tomorrow|কাল|আগামীকাল/i.test(text)) targetDate = tomorrowStr;

    let category = 'bill';
    if (/doctor|appointment|meeting|সাক্ষাৎ/i.test(title)) category = 'appointment';
    else if (/birthday|জন্মদিন/i.test(title)) category = 'birthday';
    else if (/clean|repair|wash|ঘর|বাসা/i.test(title)) category = 'household';

    reminders.push({
      title: title.charAt(0).toUpperCase() + title.slice(1),
      category,
      dueDate: targetDate,
      dueTime: '10:00',
      priority: 'high',
    });
  }

  // 3. Detect Shopping item
  // Match e.g. "add rice to tomorrow's shopping list", "চাল যোগ করো", "add milk and eggs to grocery list"
  const shoppingRegex = /(?:add|put|buy|বাজারে|বাজারের ফর্দে|যোগ করো)\s*([a-zA-Z\u0980-\u09FF\s,]+?)\s*(?:to (?:tomorrow's |today's )?(?:shopping|grocery|bazar|market) list|যোগ করো|কিনে এনো|$)/i;
  const shopMatch = text.match(shoppingRegex);

  if (shopMatch) {
    const rawItems = shopMatch[1].replace(/(?:remind|spent|bill|and add).*$/i, '').trim();
    const itemSplits = rawItems.split(/,|and|\+|এবং/).map((s) => s.trim()).filter(Boolean);

    for (const item of itemSplits) {
      if (item.length > 1 && !/shopping|list|remind|spent/i.test(item)) {
        let cat = 'Pantry';
        if (/rice|চাল|ডাল|oil|tel|আটা|ময়দা|flour|sugar/i.test(item)) cat = 'Pantry';
        else if (/milk|egg|cheese|দুধ|ডিম|দই/i.test(item)) cat = 'Dairy';
        else if (/fish|meat|chicken|beef|মাছ|মাংস|মুরগি/i.test(item)) cat = 'Meat/Fish';
        else if (/potato|onion|tomato|vegetable|সবজি|আলু|পেঁয়াজ/i.test(item)) cat = 'Produce';

        shoppingItems.push({
          name: item.charAt(0).toUpperCase() + item.slice(1),
          category: cat,
          quantity: '1',
          estimatedPrice: 120,
        });
      }
    }
  }

  // Construct confirmation summary
  let aiSummary = '';
  if (lang === 'bn') {
    const parts = [];
    if (expenses.length) parts.push(`৳${expenses[0].amount} খরচ নথিবদ্ধ করা হয়েছে`);
    if (reminders.length) parts.push(`রিমাইন্ডার (${reminders[0].title}) নির্ধারণ করা হয়েছে`);
    if (shoppingItems.length) parts.push(`বাজার তালিকায় ${shoppingItems.map((i) => i.name).join(', ')} যোগ করা হয়েছে`);
    aiSummary = parts.length > 0
      ? `সফলভাবে সম্পন্ন: ${parts.join(', ')}।`
      : 'নির্দেশনাটি গ্রহণ করা হয়েছে।';
  } else {
    const parts = [];
    if (expenses.length) parts.push(`Recorded expense of ৳${expenses[0].amount} for ${expenses[0].note}`);
    if (reminders.length) parts.push(`Scheduled reminder for "${reminders[0].title}" on ${reminders[0].dueDate}`);
    if (shoppingItems.length) parts.push(`Added ${shoppingItems.map((i) => i.name).join(', ')} to shopping list`);
    aiSummary = parts.length > 0
      ? `Done! ${parts.join('; ')}.`
      : 'Command processed successfully.';
  }

  return {
    aiSummary,
    expenses,
    reminders,
    shoppingItems,
    plannerTasks,
    documents,
  };
}

function convertBengaliNumerals(str: string): string {
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  return str.replace(/[০-৯]/g, (char) => bnToEn[char] || char);
}

function getNextDayOfWeek(date: Date, dayOfWeek: number) {
  const resultDate = new Date(date.getTime());
  resultDate.setDate(date.getDate() + ((7 + dayOfWeek - date.getDay()) % 7 || 7));
  return resultDate;
}

// Full-stack Vite dev middleware or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`DayMate AI server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
