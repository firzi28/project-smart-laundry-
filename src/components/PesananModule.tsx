import React, { useState } from 'react';
import { LaundryOrder, Outlet, OrderStatus, PaymentMethod } from '../types';
import {
  Search,
  Plus,
  Printer,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Store,
  ChevronDown,
  Check,
  X,
  CreditCard,
  MessageCircle,
} from 'lucide-react';

interface PesananModuleProps {
  orders: LaundryOrder[];
  outlets: Outlet[];
  currentOutlet: Outlet;
  initialTab?: 'antrian' | 'siap_ambil' | 'belum_bayar';
  onSelectOutlet: (outlet: Outlet) => void;
  onOpenAddOrder: () => void;
  onPrintOrder: (order: LaundryOrder) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onSettlePayment: (orderId: string, method: PaymentMethod) => void;
  onCancelOrder: (orderId: string) => void;
}

export const PesananModule: React.FC<PesananModuleProps> = ({
  orders,
  outlets,
  currentOutlet,
  initialTab = 'antrian',
  onSelectOutlet,
  onOpenAddOrder,
  onPrintOrder,
  onUpdateOrderStatus,
  onSettlePayment,
  onCancelOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'antrian' | 'siap_ambil' | 'belum_bayar'>(initialTab);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Payment settlement modal state
  const [settlingOrder, setSettlingOrder] = useState<LaundryOrder | null>(null);
  const [settlementMethod, setSettlementMethod] = useState<PaymentMethod>('tunai');

  // Order detail preview modal
  const [detailOrder, setDetailOrder] = useState<LaundryOrder | null>(null);

  // Trigger search on click of search icon or pressing Enter
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearch(searchInput.trim().toLowerCase());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
  };

  // Filter orders for current outlet
  const outletOrders = orders.filter(o => o.outletId === currentOutlet.id);

  // Apply search query
  const searchedOrders = outletOrders.filter(o => {
    if (!activeSearch) return true;
    return (
      o.invoiceNumber.toLowerCase().includes(activeSearch) ||
      o.customerName.toLowerCase().includes(activeSearch) ||
      o.customerPhone.includes(activeSearch)
    );
  });

  // Filter by tab
  const displayedOrders = searchedOrders.filter(o => {
    if (activeTab === 'antrian') {
      return o.orderStatus === 'antrian' || o.orderStatus === 'proses';
    }
    if (activeTab === 'siap_ambil') {
      return o.orderStatus === 'siap_ambil';
    }
    if (activeTab === 'belum_bayar') {
      return o.paymentStatus === 'belum_bayar' && o.orderStatus !== 'batal';
    }
    return true;
  });

  // Tab counts
  const countAntrian = outletOrders.filter(
    o => o.orderStatus === 'antrian' || o.orderStatus === 'proses'
  ).length;
  const countSiapAmbil = outletOrders.filter(o => o.orderStatus === 'siap_ambil').length;
  const countBelumBayar = outletOrders.filter(
    o => o.paymentStatus === 'belum_bayar' && o.orderStatus !== 'batal'
  ).length;

  const handleConfirmSettlePayment = () => {
    if (!settlingOrder) return;
    onSettlePayment(settlingOrder.id, settlementMethod);
    setSettlingOrder(null);
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* Top Header Row: Judul Halaman "PESANAN" & Dropdown Pemilih Outlet di Kanan Atas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            PESANAN
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen antrian cucian, serah terima, dan status pembayaran
          </p>
        </div>

        {/* Dropdown pemilih outlet di kanan atas */}
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

      {/* Baris Pencarian: Input field "Cari nama / nota", ikon search yang bisa digunakan untuk search, serta tombol aksi utama + berwarna kuning */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          {/* Ikon search yang mana ikon search ini bisa di gunakan untuk search */}
          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
            title="Klik untuk mencari"
            aria-label="Cari sekarang"
          >
            <Search className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Cari nama / nota (tekan enter atau klik ikon kaca pembesar)"
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />

          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              title="Hapus filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tombol Aksi Utama '+' Berwarna Kuning untuk Membuat Pesanan Baru */}
        <button
          type="button"
          onClick={onOpenAddOrder}
          className="h-10 px-4 sm:px-5 bg-amber-400 hover:bg-amber-500 active:scale-98 text-amber-950 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          title="Buat Pesanan Baru"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span className="text-xs sm:text-sm hidden sm:inline">Pesanan Baru</span>
        </button>
      </form>

      {/* Active search tag if query exists */}
      {activeSearch && (
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
          <span>
            Menampilkan hasil untuk: <strong>"{activeSearch}"</strong> ({displayedOrders.length} ditemukan)
          </span>
          <button
            onClick={handleClearSearch}
            className="ml-auto text-amber-800 font-bold underline"
          >
            Reset
          </button>
        </div>
      )}

      {/* SISTEM TABERING TERBAGI MENJADI 3 STATUS PESANAN: Antrian, Siap Ambil, dan Belum Bayar */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('antrian')}
          className={`relative pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'antrian'
              ? 'text-amber-950 border-b-2 border-amber-400'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Antrian</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'antrian' ? 'bg-amber-400 text-amber-950' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {countAntrian}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('siap_ambil')}
          className={`relative pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'siap_ambil'
              ? 'text-amber-950 border-b-2 border-amber-400'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Siap Ambil</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'siap_ambil'
                ? 'bg-amber-400 text-amber-950'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {countSiapAmbil}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('belum_bayar')}
          className={`relative pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'belum_bayar'
              ? 'text-amber-950 border-b-2 border-amber-400'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Belum Bayar</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'belum_bayar'
                ? 'bg-rose-500 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {countBelumBayar}
          </span>
        </button>
      </div>

      {/* EMPTY STATE VIEW AS EXPLICITLY REQUIRED:
          "Jika tidak ada data pada status terkait, tampilkan Empty State View berupa ilustrasi 2D mesin cuci dan petugas laundry, judul "Belum Ada Data", serta teks deskripsi "Saat ini belum ada data yang dapat ditampilkan"." */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xs">
          {/* Ilustrasi 2D mesin cuci dan petugas laundry */}
          <div className="w-48 h-36 sm:w-56 sm:h-44 mx-auto mb-4 overflow-hidden rounded-xl bg-amber-50 flex items-center justify-center">
            <img
              src="/src/assets/images/laundry_empty_state_1790617897417.jpg"
              alt="Ilustrasi 2D mesin cuci dan petugas laundry"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={e => {
                // Fallback styling
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Judul "Belum Ada Data" */}
          <h2 className="text-base sm:text-lg font-bold text-slate-800">Belum Ada Data</h2>

          {/* Teks Deskripsi "Saat ini belum ada data yang dapat ditampilkan" */}
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            Saat ini belum ada data yang dapat ditampilkan
          </p>

          <button
            type="button"
            onClick={onOpenAddOrder}
            className="mt-5 inline-flex items-center gap-1.5 py-2.5 px-5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-xl text-xs transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buat Pesanan Sekarang</span>
          </button>
        </div>
      ) : (
        /* Order Cards List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedOrders.map(order => (
            <div
              key={order.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold font-mono text-slate-900">
                        {order.invoiceNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          order.paymentStatus === 'lunas'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {order.paymentStatus === 'lunas'
                          ? `Lunas (${order.paymentMethod.toUpperCase()})`
                          : 'Belum Bayar'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      {new Date(order.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onPrintOrder(order)}
                      title="Cetak Struk / Nota"
                      className="p-2 text-slate-600 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Customer and Items */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{order.customerName}</span>
                    <a
                      href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{order.customerPhone}</span>
                    </a>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-slate-700">
                        <span className="truncate pr-2">
                          {item.name} ({item.quantity}{' '}
                          {item.serviceType === 'kiloan'
                            ? 'kg'
                            : item.serviceType === 'meteran'
                            ? 'm'
                            : 'pcs'}
                          )
                        </span>
                        <span className="font-mono tabular-nums shrink-0">
                          Rp {item.subtotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                    <div className="pt-1 border-t border-slate-200/60 flex justify-between text-[11px] text-slate-500">
                      <span>Durasi: {order.durationLabel}</span>
                      <span>Antar: {order.deliveryLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Amount and Status actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Total Tagihan</span>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 font-mono tabular-nums">
                    Rp {order.totalAmount.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Status switcher button */}
                  {order.orderStatus === 'antrian' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'siap_ambil')}
                      className="inline-flex items-center gap-1 py-1.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-lg text-xs transition-colors"
                      title="Ubah status menjadi siap diambil"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Selesai Cuci</span>
                    </button>
                  )}

                  {order.orderStatus === 'siap_ambil' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'selesai')}
                      className="inline-flex items-center gap-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors"
                      title="Serah terima pakaian ke pelanggan"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Diambil</span>
                    </button>
                  )}

                  {/* Pelunasan button if not paid */}
                  {order.paymentStatus === 'belum_bayar' && (
                    <button
                      onClick={() => setSettlingOrder(order)}
                      className="inline-flex items-center gap-1 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Lunasi</span>
                    </button>
                  )}

                  <button
                    onClick={() => setDetailOrder(order)}
                    className="py-1.5 px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settle Payment Modal */}
      {settlingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Pelunasan Pembayaran</h3>
              <button
                onClick={() => setSettlingOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Nota:</span>
                <span className="font-bold text-slate-800">{settlingOrder.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <span className="font-semibold text-slate-800">{settlingOrder.customerName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600 font-semibold">Total Tagihan:</span>
                <span className="font-bold text-sm text-slate-900 font-mono">
                  Rp {settlingOrder.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Pilih Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['tunai', 'qris', 'transfer'] as PaymentMethod[]).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSettlementMethod(method)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border capitalize transition-all ${
                      settlementMethod === method
                        ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSettlingOrder(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSettlePayment}
                className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                Konfirmasi Lunas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Order Modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Rincian Lengkap Pesanan</h3>
                <span className="text-xs font-mono text-slate-500">
                  {detailOrder.invoiceNumber}
                </span>
              </div>
              <button
                onClick={() => setDetailOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Pelanggan:</span>
                  <span className="font-bold text-slate-800">{detailOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">WhatsApp:</span>
                  <span>{detailOrder.customerPhone}</span>
                </div>
                {detailOrder.customerAddress && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Alamat:</span>
                    <span className="text-right max-w-[200px]">{detailOrder.customerAddress}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu Masuk:</span>
                  <span>{new Date(detailOrder.createdAt).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimasi Selesai:</span>
                  <span>{new Date(detailOrder.estimatedCompletion).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kasir:</span>
                  <span>{detailOrder.cashierName}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1.5 uppercase tracking-wider text-[11px]">
                  Rincian Item
                </span>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {detailOrder.items.map(item => (
                    <div key={item.id} className="p-2.5 flex justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">{item.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {item.quantity}{' '}
                          {item.serviceType === 'kiloan'
                            ? 'kg'
                            : item.serviceType === 'meteran'
                            ? 'm'
                            : 'pcs'}{' '}
                          x Rp {item.unitPrice.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-800 self-center">
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {detailOrder.notes && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold">Catatan:</span> {detailOrder.notes}
                </div>
              )}

              <div className="space-y-1 pt-2 border-t border-slate-200 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal Cucian:</span>
                  <span className="font-mono">Rp {detailOrder.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkir ({detailOrder.deliveryLabel}):</span>
                  <span className="font-mono">
                    Rp {detailOrder.deliveryFee.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                  <span>Total Tagihan:</span>
                  <span className="font-mono">
                    Rp {detailOrder.totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
              {detailOrder.orderStatus !== 'batal' && (
                <button
                  onClick={() => {
                    if (confirm('Yakin ingin membatalkan pesanan ini?')) {
                      onCancelOrder(detailOrder.id);
                      setDetailOrder(null);
                    }
                  }}
                  className="py-2 px-3 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold"
                >
                  Batalkan Pesanan
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => {
                    onPrintOrder(detailOrder);
                    setDetailOrder(null);
                  }}
                  className="py-2 px-4 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Nota</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
