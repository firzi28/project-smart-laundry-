import React from 'react';
import { LaundryOrder, Outlet } from '../types';
import {
  Plus,
  Search,
  UserPlus,
  UserSearch,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Package,
  Layers,
  Ruler,
  Printer,
} from 'lucide-react';

interface BerandaModuleProps {
  currentOutlet: Outlet;
  orders: LaundryOrder[];
  onOpenAddOrder: () => void;
  onOpenSearchOrder: () => void;
  onOpenAddCustomer: () => void;
  onOpenSearchCustomer: () => void;
  onNavigateToOrders: (statusTab?: 'antrian' | 'siap_ambil' | 'belum_bayar') => void;
  onPrintOrder: (order: LaundryOrder) => void;
  onSelectOrder: (order: LaundryOrder) => void;
}

export const BerandaModule: React.FC<BerandaModuleProps> = ({
  currentOutlet,
  orders,
  onOpenAddOrder,
  onOpenSearchOrder,
  onOpenAddCustomer,
  onOpenSearchCustomer,
  onNavigateToOrders,
  onPrintOrder,
  onSelectOrder,
}) => {
  // Filter orders for current outlet created today
  const todayStr = new Date().toISOString().split('T')[0];

  const todayOrders = orders.filter(
    o => o.outletId === currentOutlet.id && o.createdAt.startsWith(todayStr)
  );

  // If there are no orders today, we also support general outlet active calculations
  const todayRevenue = todayOrders
    .filter(o => o.orderStatus !== 'batal')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const todayOrderCount = todayOrders.filter(o => o.orderStatus !== 'batal').length;

  const todayKiloan = todayOrders
    .filter(o => o.orderStatus !== 'batal')
    .reduce((sum, o) => sum + o.kiloanQty, 0);

  const todaySatuan = todayOrders
    .filter(o => o.orderStatus !== 'batal')
    .reduce((sum, o) => sum + o.satuanQty, 0);

  const todayMeteran = todayOrders
    .filter(o => o.orderStatus !== 'batal')
    .reduce((sum, o) => sum + o.meteranQty, 0);

  // Status counts for current outlet
  const outletOrders = orders.filter(o => o.outletId === currentOutlet.id);
  const countAntrian = outletOrders.filter(
    o => o.orderStatus === 'antrian' || o.orderStatus === 'proses'
  ).length;
  const countSiapAmbil = outletOrders.filter(o => o.orderStatus === 'siap_ambil').length;
  const countBelumBayar = outletOrders.filter(
    o => o.paymentStatus === 'belum_bayar' && o.orderStatus !== 'batal'
  ).length;

  // Latest 4 orders
  const recentOrders = [...outletOrders].slice(0, 4);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Beranda Kasir
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Selamat datang di panel kontrol operasional <span className="font-semibold text-slate-700">{currentOutlet.name}</span>
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start sm:self-auto bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-2xs text-xs text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Sistem Siap Melayani</span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-700 font-medium">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* KARTU PESANAN HARI INI BERWARNA KUNING (Yellow Card As Required) */}
      <section
        aria-label="Kartu Pesanan Hari Ini"
        className="relative overflow-hidden rounded-2xl bg-amber-400 text-amber-950 p-5 sm:p-6 shadow-md border border-amber-300"
      >
        {/* Subtle decorative circles */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/15 pointer-events-none blur-sm" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-amber-500/20 pointer-events-none blur-sm" />

        <div className="relative z-10">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-amber-950/10 px-2.5 py-1 rounded-md">
                Pesanan Hari Ini
              </span>
              <span className="text-xs font-medium text-amber-900/80 hidden sm:inline">
                {currentOutlet.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
              <TrendingUp className="w-4 h-4" />
              <span className="font-mono tabular-nums">{todayOrderCount} Pesanan</span>
            </div>
          </div>

          {/* Main figures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                Ringkasan Pendapatan
              </p>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-amber-950 mt-1 font-mono tabular-nums">
                Rp {todayRevenue.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-amber-900/80 mt-1">
                Total omzet pesanan terbit hari ini
              </p>
            </div>

            {/* Rincian Kuantitas per Jenis Layanan: Kiloan (0 kg), Satuan (0 pcs), Meteran (0 m) */}
            <div className="bg-amber-300/60 rounded-xl p-3.5 border border-amber-500/20 backdrop-blur-2xs">
              <div className="text-[11px] font-bold text-amber-950 uppercase tracking-wider mb-2.5">
                Rincian Kuantitas Layanan
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/40 p-2 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-amber-900 mb-0.5">
                    <Package className="w-3 h-3" />
                    <span>Kiloan</span>
                  </div>
                  <div className="text-sm font-bold text-amber-950 font-mono tabular-nums">
                    {todayKiloan > 0 ? `${todayKiloan.toFixed(1)} kg` : '0 kg'}
                  </div>
                </div>

                <div className="bg-white/40 p-2 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-amber-900 mb-0.5">
                    <Layers className="w-3 h-3" />
                    <span>Satuan</span>
                  </div>
                  <div className="text-sm font-bold text-amber-950 font-mono tabular-nums">
                    {todaySatuan > 0 ? `${todaySatuan} pcs` : '0 pcs'}
                  </div>
                </div>

                <div className="bg-white/40 p-2 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-amber-900 mb-0.5">
                    <Ruler className="w-3 h-3" />
                    <span>Meteran</span>
                  </div>
                  <div className="text-sm font-bold text-amber-950 font-mono tabular-nums">
                    {todayMeteran > 0 ? `${todayMeteran.toFixed(1)} m` : '0 m'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTION GRID 2X2 (4 Tombol Utama As Required) */}
      <section aria-label="Aksi Cepat">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Aksi Cepat Kasir
          </h2>
          <span className="text-[11px] text-slate-500">Pintasan 1-Klik</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* 1. Tambah Pesanan (ikon Plus) */}
          <button
            type="button"
            onClick={onOpenAddOrder}
            className="group p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-400 group-hover:bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-xs transition-colors">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-950">
                Tambah Pesanan
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                Buat nota baru, kiloan/satuan/karpet
              </p>
            </div>
          </button>

          {/* 2. Cari Pesanan (ikon Kaca Pembesar) */}
          <button
            type="button"
            onClick={onOpenSearchOrder}
            className="group p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 group-hover:bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 shadow-xs transition-colors">
              <Search className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-950">
                Cari Pesanan
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                Lacak status nota & cek cucian siap
              </p>
            </div>
          </button>

          {/* 3. Tambah Pelanggan (ikon User Plus) */}
          <button
            type="button"
            onClick={onOpenAddCustomer}
            className="group p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 group-hover:bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 shadow-xs transition-colors">
              <UserPlus className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-950">
                Tambah Pelanggan
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                Daftarkan member & kontak WhatsApp
              </p>
            </div>
          </button>

          {/* 4. Cari Pelanggan (ikon User Search) */}
          <button
            type="button"
            onClick={onOpenSearchCustomer}
            className="group p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 group-hover:bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 shadow-xs transition-colors">
              <UserSearch className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-950">
                Cari Pelanggan
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                Database konsumen, riwayat & chat WA
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Status Ringkasan Tabering */}
      <section aria-label="Status Pesanan Cepat">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Status Operasional Outlet
          </h2>
          <button
            onClick={() => onNavigateToOrders()}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>Buka Semua Pesanan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onNavigateToOrders('antrian')}
            className="p-3 sm:p-4 bg-white border border-slate-200/90 rounded-2xl hover:border-amber-400 hover:shadow-xs transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Antrian Cuci</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
              {countAntrian}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 group-hover:text-amber-700 transition-colors">
              Menunggu / dicuci →
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToOrders('siap_ambil')}
            className="p-3 sm:p-4 bg-white border border-slate-200/90 rounded-2xl hover:border-emerald-400 hover:shadow-xs transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Siap Ambil</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1 font-mono tabular-nums">
              {countSiapAmbil}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 group-hover:text-emerald-700 transition-colors">
              Sudah selesai packing →
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToOrders('belum_bayar')}
            className="p-3 sm:p-4 bg-white border border-slate-200/90 rounded-2xl hover:border-red-400 hover:shadow-xs transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Belum Bayar</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-700 mt-1 font-mono tabular-nums">
              {countBelumBayar}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 group-hover:text-rose-700 transition-colors">
              Tagihan belum lunas →
            </div>
          </button>
        </div>
      </section>

      {/* Aktivitas Pesanan Terakhir */}
      <section aria-label="Pesanan Terkini">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Aktivitas Pesanan Terkini
          </h2>
          <span className="text-[11px] text-slate-500">{outletOrders.length} Total Nota</span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200/80 rounded-2xl text-center">
            <p className="text-xs text-slate-500">Belum ada pesanan di outlet ini</p>
            <button
              onClick={onOpenAddOrder}
              className="mt-3 inline-flex items-center gap-1.5 py-2 px-4 bg-amber-400 text-amber-950 font-bold rounded-xl text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pesanan Pertama</span>
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {recentOrders.map(order => (
              <div
                key={order.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {order.invoiceNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        order.paymentStatus === 'lunas'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {order.paymentStatus === 'lunas' ? 'Lunas' : 'Belum Bayar'}
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded capitalize">
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
                    {order.customerName}{' '}
                    <span className="text-slate-400 font-normal">({order.customerPhone})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {order.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                    Rp {order.totalAmount.toLocaleString('id-ID')}
                  </div>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <button
                      onClick={() => onPrintOrder(order)}
                      title="Cetak Struk"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition-colors"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
