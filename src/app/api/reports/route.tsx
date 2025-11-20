// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {connectDB} from "@/lib/db"; // ajusta si tu helper se llama connectDB
import Sale from "@/models/sale";
import Repair from "@/models/repair";
import Product from "@/models/product";
import Expense from "@/models/expense";

//////////////////////
// Report Cache model
//////////////////////
const ReportCacheSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    params: { type: Object, default: {} },
    result: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
// TTL index will be created (if not exists) to expire documents after X seconds
const ReportCache = mongoose.models.ReportCache || mongoose.model("ReportCache", ReportCacheSchema);

const DEFAULT_CACHE_TTL = Number(process.env.REPORT_CACHE_TTL_SECONDS || 300); // 5 min

// Helper: build date range filter from query
function buildDateRange(from?: string | null, to?: string | null, year?: string | null, month?: string | null) {
  if (from && to) {
    const f = new Date(from);
    const t = new Date(to);
    // include end of day
    t.setHours(23, 59, 59, 999);
    return { $gte: f, $lte: t };
  }
  if (year && month) {
    // month format "MM" or "M" or year-month like "2025-04"
    const y = Number(year);
    const m = Number(month); // 1-12
    if (!Number.isNaN(y) && !Number.isNaN(m)) {
      const f = new Date(y, m - 1, 1);
      const t = new Date(y, m, 0);
      t.setHours(23, 59, 59, 999);
      return { $gte: f, $lte: t };
    }
  }
  if (year) {
    const y = Number(year);
    if (!Number.isNaN(y)) {
      const f = new Date(y, 0, 1);
      const t = new Date(y, 11, 31, 23, 59, 59, 999);
      return { $gte: f, $lte: t };
    }
  }
  return null;
}

// Helper: key for cache
function cacheKeyFromParams(params: Record<string, any>) {
  // JSON stable string
  return "reports:" + JSON.stringify(params);
}

export async function GET(req: NextRequest) {
  try {
    await connectDB(); // connect to DB

    // create TTL index if not exists
    try {
      await ReportCache.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: DEFAULT_CACHE_TTL });
    } catch (e) {
      // ignore index creation errors (already exists possibly)
    }

    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const year = url.searchParams.get("year");
    const month = url.searchParams.get("month"); // 1-12 or "all"
    // For compatibility with earlier UI using ?from&to, we'll prefer from/to over year/month
    const paramsForKey: any = { from, to, year, month };

    const cacheKey = cacheKeyFromParams(paramsForKey);

    // Try cache
    const cached = await ReportCache.findOne({ key: cacheKey });
    if (cached) {
      return NextResponse.json({ ...cached.result, cached: true });
    }

    // Build date range for matching createdAt / updatedAt
    let dateRangeFilter: any = null;
    if (from && to) {
      const dr = buildDateRange(from, to, null, null);
      if (dr) dateRangeFilter = dr;
    } else if (year && month && month !== "all") {
      // month param could be "2025-04" or just "4"
      if (year.includes("-")) {
        const [y, m] = year.split("-");
        dateRangeFilter = buildDateRange(null, null, y, m);
      } else {
        dateRangeFilter = buildDateRange(null, null, year, month);
      }
    } else if (year && (!month || month === "all")) {
      dateRangeFilter = buildDateRange(null, null, year, null);
    }

    // ---------- 1) Product income & product items aggregated ----------
    // Aggregate sales -> unwind items -> match item.type=product -> group productIncome and collect product quantities per productId
    const saleMatch: any = {};
    if (dateRangeFilter) {
      saleMatch.createdAt = dateRangeFilter;
    }

    const productAgg = await Sale.aggregate([
      { $match: saleMatch },
      { $unwind: "$items" },
      { $match: { "items.type": "product" } },
      {
        $group: {
          _id: "$items.productId",
          qty: { $sum: "$items.qty" },
          income: { $sum: "$items.lineTotal" },
        },
      },
    ]);

    // productIncome total:
    const productIncome = productAgg.reduce((s: number, r: any) => s + (r.income || 0), 0);

    // For productCost: fetch product purchasePrice for each productId and multiply by qty
    const productIds = productAgg.map((r: any) => r._id).filter(Boolean);
    let productCost = 0;
    if (productIds.length) {
      // find products and map prices
      const products = await Product.find({ _id: { $in: productIds } }).select("_id purchasePrice").lean();
      const priceMap = new Map<string, number>();
      products.forEach((p: any) => priceMap.set(String(p._id), Number(p.purchasePrice || 0)));
      for (const r of productAgg) {
        const pid = String(r._id);
        const purchasePrice = priceMap.get(pid) ?? 0;
        productCost += purchasePrice * (r.qty || 0);
      }
    }

    // ---------- 2) Service income: from repairs with status 'delivered' ----------
    // We'll aggregate repairs with status delivered in the date range (use repaired updatedAt as indicator)
    const repairMatch: any = { status: "delivered" };
    if (dateRangeFilter) {
      // use updatedAt to know when it was delivered
      repairMatch.updatedAt = dateRangeFilter;
    }

    // Join repairs -> sales -> sum sale.items where type=service
    const repairAgg = await Repair.aggregate([
      { $match: repairMatch },
      {
        $lookup: {
          from: "sales",
          localField: "saleId",
          foreignField: "_id",
          as: "sale",
        },
      },
      { $unwind: "$sale" },
      { $unwind: "$sale.items" },
      { $match: { "sale.items.type": "service" } },
      {
        $group: {
          _id: null,
          serviceIncome: { $sum: "$sale.items.lineTotal" },
          repairCount: { $sum: 1 },
          // also collect saleIds for ticket averages later
          saleIds: { $addToSet: "$sale._id" },
        },
      },
    ]);

    const serviceIncome = repairAgg.length ? repairAgg[0].serviceIncome || 0 : 0;
    const repairCount = repairAgg.length ? repairAgg[0].repairCount || 0 : 0;
    const serviceSaleIds = repairAgg.length ? repairAgg[0].saleIds || [] : [];

    // ---------- 3) Sales totals (all sales in date range) for totals, daily stats, avg ticket sale ----------
    const salesAgg = await Sale.aggregate([
      { $match: saleMatch },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$total" },
          countSales: { $sum: 1 },
          saleIds: { $push: "$_id" },
        },
      },
    ]);

    const totalSalesIncome = salesAgg.length ? salesAgg[0].totalSales || 0 : 0;
    const countSales = salesAgg.length ? salesAgg[0].countSales || 0 : 0;
    const saleIdsAll = salesAgg.length ? (salesAgg[0].saleIds || []) : [];

    // productIncome + serviceIncome should match totalSalesIncome in many cases, but we trust computed sums
    const totalIncome = productIncome + serviceIncome;

    // ---------- 4) Expenses ----------
    const expenseMatch: any = {};
    if (dateRangeFilter) {
      // expense date field is 'date'
      expenseMatch.date = dateRangeFilter;
    }
    const expenseAgg = await Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);
    let totalFixed = 0;
    let totalVariable = 0;
    for (const e of expenseAgg) {
      if (e._id === "fixed") totalFixed = e.total || 0;
      if (e._id === "variable") totalVariable = e.total || 0;
    }
    const totalExpenses = totalFixed + totalVariable;

    // ---------- 5) KPIs ----------
    // avgTicketsPerDay and avgIncomePerDay
    // We approximate days = number of days in selected range (if provided) else days between first sale and last sale in selection or 1
    let daysInRange = 1;
    if (dateRangeFilter) {
      const gte = dateRangeFilter.$gte;
      const lte = dateRangeFilter.$lte;
      daysInRange = Math.max(1, Math.ceil((lte.getTime() - gte.getTime()) / (1000 * 60 * 60 * 24)));
    } else {
      // If no range: use last 30 days default
      daysInRange = 30;
    }

    const avgTicketsPerDay = Number((countSales / daysInRange).toFixed(2));
    const avgIncomePerDay = Number((totalIncome / daysInRange) || 0);

    // avg ticket sale
    const avgTicketSale = countSales > 0 ? totalSalesIncome / countSales : 0;

    // avg ticket repair: average lineTotal per repair -> serviceIncome / repairCount (only delivered ones)
    const avgTicketRepair = repairCount > 0 ? serviceIncome / repairCount : 0;

    // growth month percent: compare selected month vs previous month (if year/month provided), otherwise compute month over month for latest month present
    let growthMonthPercent = 0;
    // we will attempt to compute if year/month provided or if from/to covers one month
    try {
      let currentPeriodStart: Date | null = null;
      let currentPeriodEnd: Date | null = null;
      let prevPeriodStart: Date | null = null;
      let prevPeriodEnd: Date | null = null;

      if (from && to) {
        // compare previous range of same length immediately before 'from'
        const f = new Date(from);
        const t = new Date(to);
        const len = t.getTime() - f.getTime();
        currentPeriodStart = f;
        currentPeriodEnd = t;
        prevPeriodEnd = new Date(f.getTime() - 1);
        prevPeriodStart = new Date(prevPeriodEnd.getTime() - len);
      } else if (year && month && month !== "all") {
        const y = Number(year);
        const m = Number(month);
        currentPeriodStart = new Date(y, m - 1, 1);
        currentPeriodEnd = new Date(y, m, 0, 23, 59, 59, 999);
        prevPeriodStart = new Date(y, m - 2, 1);
        prevPeriodEnd = new Date(y, m - 1, 0, 23, 59, 59, 999);
      } else if (year && (!month || month === "all")) {
        const y = Number(year);
        currentPeriodStart = new Date(y, 0, 1);
        currentPeriodEnd = new Date(y, 11, 31, 23, 59, 59, 999);
        prevPeriodStart = new Date(y - 1, 0, 1);
        prevPeriodEnd = new Date(y - 1, 11, 31, 23, 59, 59, 999);
      }

      if (currentPeriodStart && prevPeriodStart) {
        // compute income for current and prev periods (products+services)
        const currSalesAgg = await Sale.aggregate([
          { $match: { createdAt: { $gte: currentPeriodStart, $lte: currentPeriodEnd } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]);
        const prevSalesAgg = await Sale.aggregate([
          { $match: { createdAt: { $gte: prevPeriodStart, $lte: prevPeriodEnd } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]);
        const curr = currSalesAgg.length ? currSalesAgg[0].total || 0 : 0;
        const prev = prevSalesAgg.length ? prevSalesAgg[0].total || 0 : 0;
        growthMonthPercent = prev === 0 ? (curr === 0 ? 0 : 100) : ((curr - prev) / Math.abs(prev)) * 100;
      }
    } catch (e) {
      growthMonthPercent = 0;
    }

    // margin % = (grossProfit / totalIncome) * 100  (if totalIncome 0 -> 0)
    const grossProfit = totalIncome - productCost; // revenue - cost of goods sold (COGS)
    const marginPercent = totalIncome === 0 ? 0 : (grossProfit / totalIncome) * 100;

    // ---------- 6) Monthly buckets for the given year (monthly chart) ----------
    // We'll produce an array for months 1..12 for the requested year (or current year if none)
    const targetYear = (() => {
      if (year) {
        const y = Number(year);
        if (!isNaN(y)) return y;
      }
      return new Date().getFullYear();
    })();

    // Build monthly product income
    const monthlyProducts = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(targetYear, 0, 1), $lte: new Date(targetYear, 11, 31, 23, 59, 59, 999) },
        },
      },
      { $unwind: "$items" },
      { $match: { "items.type": "product" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          productIncome: { $sum: "$items.lineTotal" },
        },
      },
    ]);

    const monthlyServices = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(targetYear, 0, 1), $lte: new Date(targetYear, 11, 31, 23, 59, 59, 999) },
        },
      },
      { $unwind: "$items" },
      { $match: { "items.type": "service" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          serviceIncome: { $sum: "$items.lineTotal" },
        },
      },
    ]);

    const monthlyExpensesAgg = await Expense.aggregate([
      {
        $match: {
          date: { $gte: new Date(targetYear, 0, 1), $lte: new Date(targetYear, 11, 31, 23, 59, 59, 999) },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          expenses: { $sum: "$amount" },
        },
      },
    ]);

    // convert to map for merge
    const mapProducts = new Map<number, number>();
    for (const r of monthlyProducts) mapProducts.set(r._id, r.productIncome || 0);
    const mapServices = new Map<number, number>();
    for (const r of monthlyServices) mapServices.set(r._id, r.serviceIncome || 0);
    const mapExp = new Map<number, number>();
    for (const r of monthlyExpensesAgg) mapExp.set(r._id, r.expenses || 0);

    const monthly: any[] = [];
    const monthLabels = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    for (let m = 1; m <= 12; m++) {
      const prod = mapProducts.get(m) || 0;
      const serv = mapServices.get(m) || 0;
      const exp = mapExp.get(m) || 0;
      const net = prod + serv - exp;
      monthly.push({ month: monthLabels[m - 1], monthIndex: m, productIncome: prod, serviceIncome: serv, expenses: exp, net });
    }

    // ---------- 7) growth and dailyStats already computed ----------
    const result = {
      // base totals
      totalIncome,
      productIncome,
      productCost,
      serviceIncome,

      // repairs
      repairCount,
      avgRepairIncome: repairCount > 0 ? serviceIncome / repairCount : 0,

      // expenses
      totalFixed,
      totalVariable,
      totalExpenses,

      // utilities
      grossProfit,
      netProfit: grossProfit - totalExpenses,

      // KPIs
      dailyStats: {
        avgTicketsPerDay,
        avgIncomePerDay,
      },
      growth: {
        monthPercent: growthMonthPercent,
      },
      margin: marginPercent,
      avgTicketSale,
      avgTicketRepair,

      // monthly series for charts
      monthly,
      // meta
      generatedAt: new Date(),
    };

    // Save to cache
    try {
      await ReportCache.findOneAndUpdate(
        { key: cacheKey },
        { key: cacheKey, params: paramsForKey, result, createdAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (e) {
      // ignore cache errors
      console.warn("Report cache save error", e);
    }

    return NextResponse.json({ ...result, cached: false });
  } catch (err: any) {
    console.error("Error in /api/reports:", err);
    return NextResponse.json({ error: err.message || "Error servidor" }, { status: 500 });
  }
}
