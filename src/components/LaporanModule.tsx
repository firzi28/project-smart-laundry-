import React, { useState } from 'react';
import {
  LaundryOrder,
  Outlet,
  CashTransaction,
  Customer,
  SpecificServiceCategory,
} from '../types';
import {
  Store,
  ChevronDown,
  Wallet,
  CreditCard,
  ShoppingBag,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  Users,
  PieChart,
  Calendar,
  Download,
  ArrowLeft,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  exportCashReportToExcel,
  exportOrderReportToExcel,
  exportCustomerAnalysisToExcel,
  exportServiceAnalysisToExcel,
} from '../utils/excel';

interface LaporanModuleProps {
  orders: LaundryOrder[];
  cashTransactions: CashTransaction[];
  customers: Customer[];
  outlets: Outlet[];
  currentOutlet: Outlet;
  onSelectOutlet: (outlet: Outlet) => void;
  onAddCashTransaction: (tx: CashTransaction) => void;
}

type ReportSubView = null | 'kas' | 'pesanan' | 'pelanggan' | 'layanan';

export const LaporanModule: React.FC<LaporanModuleProps> = ({
  orders,
  cashTransactions,
  customers,
  outlets,
  currentOutlet,
  onSelectOutlet,
  onAddCashTransaction,
}) => {
  const [activeSubView, setActiveSubView] = useState<ReportSubView>(null);

  // Date range state (default: last 30 days, max 90 days)
  const defaultEndDate = new Date().toISOString().split('T')[0];
  const defaultStartDate = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [dateError, setDateError] = useState<string | null>(null);

  // Add Cash Transaction Modal state
  const [isAddingCashTx, setIsAddingCashTx] = useState(false);
  const [txType, setTxType] = useState<'masuk' | 'keluar'>('masuk');
  const [txCategory, setTxCategory] = useState<CashTransaction['category']>('operasional');
  const [txAccount, setTxAccount] = useState<'tunai' | 'non_tunai'>('tunai');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txDescription, setTxDescription] = useState('');

  // Validate date range <= 90 days
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);

    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diffDays = Math.ceil((e - s) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      setDateError('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
    } else if (diffDays > 90) {
      setDateError(`Rentang periode dipilih ${diffDays} hari. Maksimal rentang adalah 90 hari!`);
    } else {
      setDateError(null);
    }
  };

  // 1. SALDO KAS (Saldo Tunai & Saldo Non-Tunai)
  const outletTransactions = cashTransactions.filter(t => t.outletId === currentOutlet.id);
  const saldoTunai = outletTransactions
    .filter(t => t.accountType === 'tunai')
    .reduce((sum, t) => (t.type === 'masuk' ? sum + t.amount : sum - t.amount), 0);

  const saldoNonTunai = outletTransactions
    .filter(t => t.accountType === 'non_tunai')
    .reduce((sum, t) => (t.type === 'masuk' ? sum + t.amount : sum - t.amount), 0);

  // 2. PESANAN HARI INI
  const todayStr = new Date().toISOString().split('T')[0];
  const outletOrders = orders.filter(o => o.outletId === currentOutlet.id);
  const todayOrders = outletOrders.filter(o => o.createdAt.startsWith(todayStr));

  const nilaiPesananHariIni = todayOrders
    .filter(o => o.orderStatus !== 'batal')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const jumlahPesananHariIni = todayOrders.filter(o => o.orderStatus !== 'batal').length;
  const pesananBatalHariIni = todayOrders.filter(o => o.orderStatus === 'batal').length;

  const totalBelumBayarHariIni = todayOrders
    .filter(o => o.paymentStatus === 'belum_bayar' && o.orderStatus !== 'batal')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Filtered dataset for detailed reports within chosen date range
  const periodTransactions = outletTransactions.filter(t => {
    const d = t.createdAt.split('T')[0];
    return d >= startDate && d <= endDate;
  });

  const periodOrders = outletOrders.filter(o => {
    const d = o.createdAt.split('T')[0];
    return d >= startDate && d <= endDate;
  });

  // ANALISA PELANGGAN (Data Pelanggan dalam periode <= 90 hari)
  // Pelanggan baru: terdaftar dalam periode startDate & endDate
  const newCustomersCount = customers.filter(c => {
    const d = c.createdAt.split('T')[0];
    return d >= startDate && d <= endDate;
  }).length;

  const totalPelanggan = customers.length;

  // Pelanggan dengan pesanan terbanyak & nilai terbanyak (berdasarkan order dalam periode)
  const customerOrderMap: { [id: string]: { customer: Customer; count: number; spend: number } } = {};
  periodOrders.forEach(o => {
    if (o.orderStatus === 'batal') return;
    if (!customerOrderMap[o.customerId]) {
      const found = customers.find(c => c.id === o.customerId) || {
        id: o.customerId,
        name: o.customerName,
        phone: o.customerPhone,
        address: o.customerAddress || '',
        totalOrders: 0,
        totalSpent: 0,
        createdAt: o.createdAt,
      };
      customerOrderMap[o.customerId] = { customer: found, count: 0, spend: 0 };
    }
    customerOrderMap[o.customerId].count += 1;
    customerOrderMap[o.customerId].spend += o.totalAmount;
  });

  const customerAnalysisList = Object.values(customerOrderMap);
  const topFrequencyCustomers = [...customerAnalysisList]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(x => ({ ...x.customer, totalOrders: x.count, totalSpent: x.spend }));

  const topSpendingCustomers = [...customerAnalysisList]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5)
    .map(x => ({ ...x.customer, totalOrders: x.count, totalSpent: x.spend }));

  // ANALISA LAYANAN: Bed cover, sprei, boneka, karpet, selimut, cuci setrika
  const serviceCategoriesDef: Array<{
    key: SpecificServiceCategory;
    name: string;
    unit: string;
  }> = [
    { key: 'bed_cover', name: 'Bed Cover', unit: 'pcs' },
    { key: 'sprei', name: 'Sprei', unit: 'pcs' },
    { key: 'boneka', name: 'Boneka', unit: 'pcs' },
    { key: 'karpet', name: 'Karpet', unit: 'm' },
    { key: 'selimut', name: 'Selimut', unit: 'pcs' },
    { key: 'cuci_setrika', name: 'Cuci Setrika', unit: 'kg' },
  ];

  let totalPeriodServiceRevenue = 0;
  const serviceStatsRaw = serviceCategoriesDef.map(def => {
    let count = 0;
    let quantity = 0;
    let revenue = 0;

    periodOrders.forEach(ord => {
      if (ord.orderStatus === 'batal') return;
      ord.items.forEach(item => {
        if (item.category === def.key) {
          count += 1;
          quantity += item.quantity;
          revenue += item.subtotal;
        }
      });
    });

    totalPeriodServiceRevenue += revenue;
    return {
      key: def.key,
      name: def.name,
      unit: def.unit,
      count,
      quantity,
      revenue,
    };
  });

  const serviceStats = serviceStatsRaw.map(s => ({
    ...s,
    sharePercent: totalPeriodServiceRevenue > 0 ? (s.revenue / totalPeriodServiceRevenue) * 100 : 0,
  }));

  // Handlers for exporting Excel
  const handleExportCashExcel = () => {
    if (dateError) return;
    exportCashReportToExcel(periodTransactions, startDate, endDate, currentOutlet.name);
  };

  const handleExportOrderExcel = () => {
    if (dateError) return;
    exportOrderReportToExcel(periodOrders, startDate, endDate, currentOutlet.name);
  };

  const handleExportCustomerExcel = () => {
    if (dateError) return;
    exportCustomerAnalysisToExcel(
      customers,
      newCustomersCount,
      topFrequencyCustomers,
      topSpendingCustomers,
      startDate,
      endDate
    );
  };

  const handleExportServiceExcel = () => {
    if (dateError) return;
    exportServiceAnalysisToExcel(serviceStats, totalPeriodServiceRevenue, startDate, endDate);
  };

  const handleSaveCashTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0) return;

    const newTx: CashTransaction = {
      id: `ctx-${Date.now()}`,
      outletId: currentOutlet.id,
      type: txType,
      category: txCategory,
      accountType: txAccount,
      amount: txAmount,
      description: txDescription.trim() || (txType === 'masuk' ? 'Kas Masuk' : 'Pengeluaran Kas'),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      recordedBy: 'Kasir Smart Laundry',
    };

    onAddCashTransaction(newTx);
    setIsAddingCashTx(false);
    setTxAmount(0);
    setTxDescription('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header Row: Judul "LAPORAN" & Dropdown Outlet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            {activeSubView && (
              <button
                onClick={() => setActiveSubView(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Kembali ke Menu Laporan"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {activeSubView
                ? activeSubView === 'kas'
                  ? 'LAPORAN KAS'
                  : activeSubView === 'pesanan'
                  ? 'LAPORAN PESANAN'
                  : activeSubView === 'pelanggan'
                  ? 'ANALISA PELANGGAN'
                  : 'ANALISA LAYANAN'
                : 'LAPORAN'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeSubView
              ? `Detail laporan periode maksimal rentang 90 hari dengan ekspor Excel`
              : `Ringkasan saldo kas, analitik harian, dan pembukuan komprehensif`}
          </p>
        </div>

        {/* Dropdown Outlet */}
        <div className="relative flex items-center bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-2xs self-start sm:self-auto hover:border-amber-400 transition-colors">
          <Store className="w-4 h-4 text-amber-600 mr-2 shrink-0" />
          <select
            value={currentOutlet.id}
            onChange={e => {
              const found = outlets.find(o => o.id === e.target.value);
              if (found) onSelectOutlet(found);
            }}
            className="bg-transparent text-xs font-semibold text-slate-800 pr-4 focus:outline-none cursor-pointer max-w-[200px] truncate"
          >
            {outlets.map(o => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5" />
        </div>
      </div>

      {/* Date Range Picker Bar (Shown in subviews or available globally) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pilih Periode Laporan (Maks. Rentang 90 Hari)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-400">Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={e => handleDateChange(e.target.value, endDate)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none"
              />
            </div>
            <span className="text-slate-400">s/d</span>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-400">Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={e => handleDateChange(startDate, e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {dateError && (
          <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{dateError}</span>
          </div>
        )}
      </div>

      {/* If No SubView is selected: Display Overview of the 3 Sections */}
      {!activeSubView && (
        <div className="space-y-6">
          {/* SEKSI 1: SALDO KAS (Saldo Tunai Rp 0 & Saldo Non-Tunai Rp 0) */}
          <section aria-label="Saldo Kas">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. Saldo Kas
                </h2>
                <span className="text-[11px] text-slate-400">Real-time balance</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingCashTx(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Catat Kas Masuk/Keluar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Saldo Tunai */}
              <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-amber-400 transition-all flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-amber-600" />
                    Saldo Tunai
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2 font-mono tabular-nums">
                    Rp {saldoTunai.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Uang fisik kasir di laci toko
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  Rp
                </div>
              </div>

              {/* Saldo Non-Tunai */}
              <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-amber-400 transition-all flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Saldo Non-Tunai
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2 font-mono tabular-nums">
                    Rp {saldoNonTunai.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Penerimaan via QRIS & Transfer Bank
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
            </div>
          </section>

          {/* SEKSI 2: PESANAN HARI INI */}
          <section aria-label="Pesanan Hari Ini">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Pesanan Hari Ini
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">
                {new Date().toLocaleDateString('id-ID')}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Nilai Pesanan (Rp 0) */}
              <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block truncate">
                  Nilai Pesanan
                </span>
                <div className="text-lg sm:text-xl font-black text-slate-900 mt-1 font-mono tabular-nums truncate">
                  Rp {nilaiPesananHariIni.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
                  Omzet kotor hari ini
                </span>
              </div>

              {/* Jumlah Pesanan (0 Pesanan) */}
              <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block truncate">
                  Jumlah Pesanan
                </span>
                <div className="text-lg sm:text-xl font-black text-slate-900 mt-1 font-mono tabular-nums">
                  {jumlahPesananHariIni} Pesanan
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                  Total nota terbit
                </span>
              </div>

              {/* Pesanan Batal (0 Pesanan) */}
              <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block truncate">
                  Pesanan Batal
                </span>
                <div className="text-lg sm:text-xl font-black text-rose-600 mt-1 font-mono tabular-nums">
                  {pesananBatalHariIni} Pesanan
                </div>
                <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">
                  Dibatalkan / Void
                </span>
              </div>

              {/* Total Belum Bayar (Rp 0) */}
              <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block truncate">
                  Total Belum Bayar
                </span>
                <div className="text-lg sm:text-xl font-black text-amber-700 mt-1 font-mono tabular-nums truncate">
                  Rp {totalBelumBayarHariIni.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-amber-600 font-medium mt-0.5 block">
                  Piutang pelanggan
                </span>
              </div>
            </div>
          </section>

          {/* SEKSI 3: LIHAT LAPORAN (Masing-masing menu dilengkapi ikon dalam kotak kuning) */}
          <section aria-label="Lihat Laporan">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Lihat Laporan
              </h2>
              <span className="text-[11px] text-slate-500">Maks. 90 hari & Ekspor Excel</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Menu 1: Laporan Kas (mutasi kas) */}
              <div
                onClick={() => setActiveSubView('kas')}
                className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-start gap-4 cursor-pointer group"
              >
                {/* Ikon dalam kotak kuning */}
                <div className="w-12 h-12 rounded-xl bg-amber-400 group-hover:bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-xs transition-colors">
                  <Wallet className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-950">
                    Laporan Kas (Mutasi Kas)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Arus kas masuk & keluar, pembelian perlengkapan, dan ekspor ke Excel
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-amber-800">
                    <span>Buka Rincian & Ekspor</span>
                    <span>→</span>
                  </div>
                </div>
              </div>

              {/* Menu 2: Laporan Pesanan (data pesanan) */}
              <div
                onClick={() => setActiveSubView('pesanan')}
                className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-start gap-4 cursor-pointer group"
              >
                {/* Ikon dalam kotak kuning */}
                <div className="w-12 h-12 rounded-xl bg-amber-400 group-hover:bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-xs transition-colors">
                  <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-950">
                    Laporan Pesanan (Data Pesanan)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Data transaksi lengkap, nota, metode bayar, dan ekspor ke Excel
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-amber-800">
                    <span>Buka Rincian & Ekspor</span>
                    <span>→</span>
                  </div>
                </div>
              </div>

              {/* Menu 3: Analisa Pelanggan (data pelanggan) */}
              <div
                onClick={() => setActiveSubView('pelanggan')}
                className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-start gap-4 cursor-pointer group"
              >
                {/* Ikon dalam kotak kuning */}
                <div className="w-12 h-12 rounded-xl bg-amber-400 group-hover:bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-xs transition-colors">
                  <Users className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-950">
                    Analisa Pelanggan (Data Pelanggan)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Pelanggan baru, pelanggan order terbanyak, dan nilai belanja tertinggi
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-amber-800">
                    <span>Buka Analisa & Ekspor</span>
                    <span>→</span>
                  </div>
                </div>
              </div>

              {/* Menu 4: Analisa Layanan (data layanan) */}
              <div
                onClick={() => setActiveSubView('layanan')}
                className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-start gap-4 cursor-pointer group"
              >
                {/* Ikon dalam kotak kuning */}
                <div className="w-12 h-12 rounded-xl bg-amber-400 group-hover:bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-xs transition-colors">
                  <PieChart className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-950">
                    Analisa Layanan (Data Layanan)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Bed cover, sprei, boneka, karpet, selimut, cuci setrika & ekspor ke Excel
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-amber-800">
                    <span>Buka Analisa Layanan</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* SUBVIEW 1: LAPORAN KAS (MUTASI KAS) */}
      {activeSubView === 'kas' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Mutasi Kas Periode: {startDate} s/d {endDate}
              </h2>
              <p className="text-xs text-slate-500">
                Menampilkan {periodTransactions.length} transaksi kas tercatat
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddingCashTx(true)}
                className="py-2 px-3 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 rounded-xl"
              >
                + Catat Kas
              </button>
              <button
                type="button"
                onClick={handleExportCashExcel}
                className="inline-flex items-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor ke Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Tipe</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Akun</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {periodTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Tidak ada transaksi kas pada periode yang dipilih
                      </td>
                    </tr>
                  ) : (
                    periodTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {new Date(tx.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-bold ${
                              tx.type === 'masuk' ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {tx.type === 'masuk' ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                            {tx.type === 'masuk' ? 'Kas Masuk' : 'Kas Keluar'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 capitalize">
                          {tx.category.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 text-slate-600 capitalize">
                          {tx.accountType === 'tunai' ? 'Tunai' : 'Non-Tunai'}
                        </td>
                        <td className="py-3 px-4 text-slate-800">
                          {tx.description}
                          {tx.invoiceNumber && (
                            <span className="text-[10px] text-amber-800 font-mono ml-1">
                              ({tx.invoiceNumber})
                            </span>
                          )}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-bold ${
                            tx.type === 'masuk' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {tx.type === 'masuk' ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: LAPORAN PESANAN (DATA PESANAN) */}
      {activeSubView === 'pesanan' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Data Pesanan Periode: {startDate} s/d {endDate}
              </h2>
              <p className="text-xs text-slate-500">
                Total {periodOrders.length} pesanan terbit di outlet {currentOutlet.name}
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportOrderExcel}
              className="inline-flex items-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor ke Excel (.xlsx)</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">No. Nota</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">Rincian Cucian</th>
                    <th className="py-3 px-4">Durasi</th>
                    <th className="py-3 px-4">Status Bayar</th>
                    <th className="py-3 px-4 text-right">Total Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {periodOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada data pesanan pada periode yang dipilih
                      </td>
                    </tr>
                  ) : (
                    periodOrders.map(ord => (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {ord.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(ord.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {ord.customerName}
                          </span>
                          <span className="text-[10px] text-slate-400">{ord.customerPhone}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {ord.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{ord.durationLabel}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              ord.paymentStatus === 'lunas'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {ord.paymentStatus === 'lunas' ? 'LUNAS' : 'BELUM BAYAR'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          Rp {ord.totalAmount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: ANALISA PELANGGAN (DATA PELANGGAN) */}
      {activeSubView === 'pelanggan' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Analisa Pelanggan Periode: {startDate} s/d {endDate}
              </h2>
              <p className="text-xs text-slate-500">
                Melihat metrik pelanggan baru, loyalitas, dan top spending
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCustomerExcel}
              className="inline-flex items-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor ke Excel (.xlsx)</span>
            </button>
          </div>

          {/* 4 Metrik Wajib: Pelanggan Baru & Total Pelanggan */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Berapa Pelanggan Baru</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-1 font-mono tabular-nums">
                {newCustomersCount} Pelanggan Baru
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Konsumen yang pertama kali mendaftar dalam rentang {startDate} s/d {endDate}
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Total Pelanggan Terdaftar</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-mono tabular-nums">
                {totalPelanggan} Pelanggan
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Seluruh database pelanggan Smart Laundry
              </p>
            </div>
          </div>

          {/* Pelanggan dengan Jumlah Pesanan Terbanyak & Pelanggan dengan Nilai Pesanan Terbanyak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pelanggan dengan jumlah pesanan terbanyak */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                Pelanggan dengan Jumlah Pesanan Terbanyak
              </h3>
              <div className="divide-y divide-slate-100">
                {topFrequencyCustomers.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Belum ada transaksi</p>
                ) : (
                  topFrequencyCustomers.map((cust, idx) => (
                    <div key={cust.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">{cust.name}</p>
                          <span className="text-[10px] text-slate-400">{cust.phone}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 block">
                          {cust.totalOrders} Pesanan
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Total Rp {cust.totalSpent.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pelanggan dengan nilai pesanan terbanyak */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Pelanggan dengan Nilai Pesanan Terbanyak
              </h3>
              <div className="divide-y divide-slate-100">
                {topSpendingCustomers.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Belum ada transaksi</p>
                ) : (
                  topSpendingCustomers.map((cust, idx) => (
                    <div key={cust.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">{cust.name}</p>
                          <span className="text-[10px] text-slate-400">{cust.phone}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-700 block">
                          Rp {cust.totalSpent.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {cust.totalOrders}x pesanan
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 4: ANALISA LAYANAN (DATA LAYANAN: Bed cover, sprei, boneka, karpet, selimut, cuci setrika) */}
      {activeSubView === 'layanan' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Analisa Layanan Periode: {startDate} s/d {endDate}
              </h2>
              <p className="text-xs text-slate-500">
                Kinerja 6 layanan utama: bed cover, sprei, boneka, karpet, selimut, cuci setrika
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportServiceExcel}
              className="inline-flex items-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor ke Excel (.xlsx)</span>
            </button>
          </div>

          {/* Cards for each service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceStats.map(stat => (
              <div
                key={stat.key}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{stat.name}</span>
                    <span className="text-[10px] bg-amber-50 text-amber-900 font-semibold px-2 py-0.5 rounded">
                      {stat.sharePercent.toFixed(1)}% Omzet
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-black text-slate-900 font-mono tabular-nums">
                      Rp {stat.revenue.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Total Volume:</span>
                      <span className="font-semibold text-slate-700 font-mono">
                        {stat.quantity} {stat.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frekuensi Dipesan:</span>
                      <span className="font-semibold text-slate-700 font-mono">
                        {stat.count}x
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contribution visual progress bar */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, stat.sharePercent)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Cash Transaction Modal */}
      {isAddingCashTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Catat Mutasi Kas Laundry</h3>
              <button
                onClick={() => setIsAddingCashTx(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCashTransaction} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxType('masuk')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      txType === 'masuk'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    + Kas Masuk (Pemasukan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('keluar')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      txType === 'keluar'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    - Kas Keluar (Biaya)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Akun / Saldo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxAccount('tunai')}
                    className={`py-1.5 text-xs font-semibold rounded-lg border ${
                      txAccount === 'tunai'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Kasir Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxAccount('non_tunai')}
                    className={`py-1.5 text-xs font-semibold rounded-lg border ${
                      txAccount === 'non_tunai'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Non-Tunai (Bank/QRIS)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori
                </label>
                <select
                  value={txCategory}
                  onChange={e => setTxCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="operasional">Operasional Rutin</option>
                  <option value="deterjen_parfum">Beli Deterjen / Parfum / Plastik</option>
                  <option value="listrik_air">Biaya Listrik, Gas & Air</option>
                  <option value="pembayaran_pesanan">Penerimaan Pesanan</option>
                  <option value="gaji">Gaji / Uang Makan Staf</option>
                  <option value="lainnya">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="500"
                  value={txAmount || ''}
                  onChange={e => setTxAmount(parseInt(e.target.value) || 0)}
                  placeholder="Contoh: 50000"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Singkat
                </label>
                <input
                  type="text"
                  value={txDescription}
                  onChange={e => setTxDescription(e.target.value)}
                  placeholder="Contoh: Pembelian gas LPG 3kg 2 tabung"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCashTx(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
