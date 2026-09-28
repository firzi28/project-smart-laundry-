import React, { useState } from 'react';
import {
  Outlet,
  ServiceDuration,
  DeliveryZone,
  CashierStaff,
  Customer,
} from '../types';
import {
  Store,
  ChevronDown,
  Clock,
  Truck,
  UserCheck,
  Users,
  Info,
  Plus,
  Trash2,
  Search,
  Phone,
  MapPin,
  MessageCircle,
  ArrowLeft,
  Check,
  Headphones,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface PengaturanModuleProps {
  outlets: Outlet[];
  currentOutlet: Outlet;
  durations: ServiceDuration[];
  deliveryZones: DeliveryZone[];
  cashiers: CashierStaff[];
  customers: Customer[];
  onSelectOutlet: (outlet: Outlet) => void;
  onAddDuration: (duration: ServiceDuration) => void;
  onDeleteDuration: (id: string) => void;
  onAddDeliveryZone: (zone: DeliveryZone) => void;
  onDeleteDeliveryZone: (id: string) => void;
  onAddCashier: (cashier: CashierStaff) => void;
  onDeleteCashier: (id: string) => void;
  onAddCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

type SettingSection = null | 'durasi' | 'antar_jemput' | 'kasir' | 'pelanggan' | 'tentang';

export const PengaturanModule: React.FC<PengaturanModuleProps> = ({
  outlets,
  currentOutlet,
  durations,
  deliveryZones,
  cashiers,
  customers,
  onSelectOutlet,
  onAddDuration,
  onDeleteDuration,
  onAddDeliveryZone,
  onDeleteDeliveryZone,
  onAddCashier,
  onDeleteCashier,
  onAddCustomer,
  onDeleteCustomer,
}) => {
  const [activeSection, setActiveSection] = useState<SettingSection>(null);

  // States for Durasi Modal / Form
  const [isAddingDuration, setIsAddingDuration] = useState(false);
  const [durName, setDurName] = useState('');
  const [durHours, setDurHours] = useState<number>(48);
  const [durPriceMult, setDurPriceMult] = useState<number>(1.2);

  // States for Delivery Zone Modal / Form
  const [isAddingDelivery, setIsAddingDelivery] = useState(false);
  const [delName, setDelName] = useState('');
  const [delFee, setDelFee] = useState<number>(5000);
  const [delDesc, setDelDesc] = useState('');

  // States for Cashier Modal / Form
  const [isAddingCashier, setIsAddingCashier] = useState(false);
  const [cashierName, setCashierName] = useState('');
  const [cashierPhone, setCashierPhone] = useState('');
  const [cashierShift, setCashierShift] = useState('Pagi (08.00 - 16.00)');
  const [cashierRole, setCashierRole] = useState<'kasir' | 'supervisor' | 'operator'>('kasir');

  // States for Customer Search & Add inside Settings
  const [customerSearch, setCustomerSearch] = useState('');
  const [isAddingCustomerModal, setIsAddingCustomerModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes, setCustNotes] = useState('');

  // Durasi Handlers
  const handleSaveDuration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!durName.trim() || durHours <= 0) return;
    const newDur: ServiceDuration = {
      id: `dur-${Date.now()}`,
      name: durName.trim(),
      hours: durHours,
      label: `${durHours} jam (${durName.toLowerCase()})`,
      priceMultiplier: durPriceMult,
      additionalFee: 0,
    };
    onAddDuration(newDur);
    setIsAddingDuration(false);
    setDurName('');
    setDurHours(48);
  };

  // Delivery Zone Handlers
  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delName.trim() || delFee < 0) return;
    const newZone: DeliveryZone = {
      id: `del-${Date.now()}`,
      name: delName.trim(),
      fee: delFee,
      label: `${delName.trim()} (Rp ${delFee.toLocaleString('id-ID')})`,
      description: delDesc.trim() || `Tarif pengantaran ${delName.toLowerCase()}`,
    };
    onAddDeliveryZone(newZone);
    setIsAddingDelivery(false);
    setDelName('');
    setDelFee(5000);
    setDelDesc('');
  };

  // Cashier Handlers
  const handleSaveCashier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashierName.trim()) return;
    const newCashier: CashierStaff = {
      id: `csh-${Date.now()}`,
      name: cashierName.trim(),
      phone: cashierPhone.trim() || '0812-xxxx-xxxx',
      shift: cashierShift,
      role: cashierRole,
      active: true,
      createdAt: new Date().toISOString(),
    };
    onAddCashier(newCashier);
    setIsAddingCashier(false);
    setCashierName('');
    setCashierPhone('');
  };

  // Customer Handlers
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) return;
    const newCust: Customer = {
      id: `cst-${Date.now()}`,
      name: custName.trim(),
      phone: custPhone.trim(),
      address: custAddress.trim(),
      notes: custNotes.trim(),
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
    onAddCustomer(newCust);
    setIsAddingCustomerModal(false);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustNotes('');
  };

  const filteredCustomers = customers.filter(
    c =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header Row: Judul "PENGATURAN" & Dropdown Pemilih Outlet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            {activeSection && (
              <button
                onClick={() => setActiveSection(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Kembali ke Menu Pengaturan"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {activeSection
                ? activeSection === 'durasi'
                  ? 'PENGATURAN DURASI LAYANAN'
                  : activeSection === 'antar_jemput'
                  ? 'PENGATURAN ANTAR-JEMPUT'
                  : activeSection === 'kasir'
                  ? 'PENGATURAN KASIR'
                  : activeSection === 'pelanggan'
                  ? 'DATABASE PELANGGAN'
                  : 'TENTANG KAMI'
                : 'PENGATURAN'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi master data, tarif pengiriman, akses staf, dan informasi sistem
          </p>
        </div>

        {/* Dropdown pemilih outlet */}
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

      {/* MAIN MENU LIST (Ikon Berlatar Kuning Rounded As Required) */}
      {!activeSection && (
        <div className="space-y-3">
          {/* 1. Pengaturan Durasi Layanan */}
          <div
            onClick={() => setActiveSection('durasi')}
            className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Ikon berlatar kuning rounded */}
              <div className="w-12 h-12 rounded-2xl bg-amber-400 group-hover:bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-xs transition-colors">
                <Clock className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-950">
                  Pengaturan Durasi Layanan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  72 jam (reguler), 24 jam (ekspres), 6 jam (kilat), tambah & hapus durasi
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 shrink-0">Kelola →</span>
          </div>

          {/* 2. Pengaturan Antar-Jemput */}
          <div
            onClick={() => setActiveSection('antar_jemput')}
            className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Ikon berlatar kuning rounded */}
              <div className="w-12 h-12 rounded-2xl bg-amber-400 group-hover:bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-xs transition-colors">
                <Truck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-950">
                  Pengaturan Antar-Jemput
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tarif & zona pengiriman: gratis (Rp 0), dekat (Rp 3.000), jauh (Rp 7.000), tambah & hapus
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 shrink-0">Kelola →</span>
          </div>

          {/* 3. Pengaturan Kasir */}
          <div
            onClick={() => setActiveSection('kasir')}
            className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Ikon berlatar kuning rounded */}
              <div className="w-12 h-12 rounded-2xl bg-amber-400 group-hover:bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-xs transition-colors">
                <UserCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-950">
                  Pengaturan Kasir
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hak akses staf, icon tambah kasir, penugasan shift & nama kasir
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 shrink-0">Kelola →</span>
          </div>

          {/* 4. Pengaturan Pelanggan */}
          <div
            onClick={() => setActiveSection('pelanggan')}
            className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Ikon berlatar kuning rounded */}
              <div className="w-12 h-12 rounded-2xl bg-amber-400 group-hover:bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-xs transition-colors">
                <Users className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-950">
                  Pengaturan Pelanggan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Database konsumen, cari nama / no handphone, dan icon tambah pelanggan
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 shrink-0">Kelola →</span>
          </div>

          {/* 5. Tentang Kami */}
          <div
            onClick={() => setActiveSection('tentang')}
            className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between gap-4 cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Ikon berlatar kuning rounded */}
              <div className="w-12 h-12 rounded-2xl bg-amber-400 group-hover:bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-xs transition-colors">
                <Info className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-950">
                  Tentang Kami
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Profil aplikasi Smart Laundry, informasi versi & kontak bantuan pengguna
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 shrink-0">Buka →</span>
          </div>
        </div>
      )}

      {/* SECTION 1: PENGATURAN DURASI LAYANAN */}
      {activeSection === 'durasi' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daftar Durasi Layanan</h2>
              <p className="text-xs text-slate-500">
                Pilihan kecepatan pengerjaan cucian untuk pelanggan
              </p>
            </div>
            {/* Icon tambah durasi */}
            <button
              type="button"
              onClick={() => setIsAddingDuration(true)}
              className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              title="Tambah Durasi Baru"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Durasi</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {durations.map(dur => (
              <div
                key={dur.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    {dur.hours}j
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{dur.label}</h4>
                    <span className="text-[11px] text-slate-500">
                      Waktu pengerjaan: {dur.hours} jam · Multiplier: {dur.priceMultiplier}x
                    </span>
                  </div>
                </div>

                {/* Icon hapus */}
                <button
                  type="button"
                  onClick={() => {
                    if (durations.length <= 1) {
                      alert('Minimal harus ada 1 jenis durasi layanan');
                      return;
                    }
                    if (confirm(`Hapus durasi ${dur.label}?`)) {
                      onDeleteDuration(dur.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Hapus durasi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Form Modal Tambah Durasi */}
          {isAddingDuration && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Tambah Jenis Durasi</h3>
                  <button
                    onClick={() => setIsAddingDuration(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveDuration} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Layanan (misal: Same Day / Kilat)
                    </label>
                    <input
                      type="text"
                      required
                      value={durName}
                      onChange={e => setDurName(e.target.value)}
                      placeholder="Contoh: Same Day"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Lama Pengerjaan (Jam)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="168"
                      value={durHours}
                      onChange={e => setDurHours(parseInt(e.target.value) || 24)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pengali Tarif (Multiplier)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      value={durPriceMult}
                      onChange={e => setDurPriceMult(parseFloat(e.target.value) || 1.0)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingDuration(false)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-xl"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: PENGATURAN ANTAR-JEMPUT (TARIF & ZONA PENGIRIMAN) */}
      {activeSection === 'antar_jemput' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Tarif & Zona Pengiriman</h2>
              <p className="text-xs text-slate-500">
                Tarif bawaan: gratis (Rp 0), dekat (Rp 3.000), jauh (Rp 7.000)
              </p>
            </div>
            {/* Icon tambah antar jemput */}
            <button
              type="button"
              onClick={() => setIsAddingDelivery(true)}
              className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              title="Tambah Zona Pengiriman"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Zona</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {deliveryZones.map(zone => (
              <div
                key={zone.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{zone.label}</h4>
                    <span className="text-[11px] text-slate-500">
                      {zone.description || `Tarif ongkos kirim Rp ${zone.fee.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>

                {/* Icon hapus */}
                <button
                  type="button"
                  onClick={() => {
                    if (deliveryZones.length <= 1) {
                      alert('Minimal harus ada 1 jenis tarif pengiriman');
                      return;
                    }
                    if (confirm(`Hapus zona ${zone.label}?`)) {
                      onDeleteDeliveryZone(zone.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Hapus zona"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Form Modal Tambah Antar Jemput */}
          {isAddingDelivery && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Tambah Zona Pengiriman</h3>
                  <button
                    onClick={() => setIsAddingDelivery(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveDelivery} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Zona (misal: Sangat Jauh / Luar Kota)
                    </label>
                    <input
                      type="text"
                      required
                      value={delName}
                      onChange={e => setDelName(e.target.value)}
                      placeholder="Contoh: Luar Kota"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tarif Ongkir (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      value={delFee}
                      onChange={e => setDelFee(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Deskripsi Jarak / Keterangan
                    </label>
                    <input
                      type="text"
                      value={delDesc}
                      onChange={e => setDelDesc(e.target.value)}
                      placeholder="Contoh: Radius > 7 km"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingDelivery(false)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-xl"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: PENGATURAN KASIR (HAK AKSES STAF) */}
      {activeSection === 'kasir' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Hak Akses & Petugas Kasir</h2>
              <p className="text-xs text-slate-500">
                Kelola kasir toko yang bertugas mencatat order dan transaksi
              </p>
            </div>
            {/* Icon tambah kasir */}
            <button
              type="button"
              onClick={() => setIsAddingCashier(true)}
              className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              title="Tambah Kasir Baru"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Kasir</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {cashiers.map(csh => (
              <div
                key={csh.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    {csh.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{csh.name}</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold capitalize">
                        {csh.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {csh.phone} · Shift: {csh.shift}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (cashiers.length <= 1) {
                      alert('Minimal harus ada 1 orang kasir');
                      return;
                    }
                    if (confirm(`Hapus kasir ${csh.name}?`)) {
                      onDeleteCashier(csh.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Hapus kasir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Form Modal Tambah Kasir */}
          {isAddingCashier && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Tambah Petugas Kasir</h3>
                  <button
                    onClick={() => setIsAddingCashier(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveCashier} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Kasir *
                    </label>
                    <input
                      type="text"
                      required
                      value={cashierName}
                      onChange={e => setCashierName(e.target.value)}
                      placeholder="Contoh: Rina Anggraini"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nomor Handphone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={cashierPhone}
                      onChange={e => setCashierPhone(e.target.value)}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Shift Kerja
                    </label>
                    <select
                      value={cashierShift}
                      onChange={e => setCashierShift(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="Pagi (07.00 - 15.00)">Pagi (07.00 - 15.00)</option>
                      <option value="Siang (14.00 - 22.00)">Siang (14.00 - 22.00)</option>
                      <option value="Full Day Shift">Full Day Shift</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Peran & Hak Akses
                    </label>
                    <select
                      value={cashierRole}
                      onChange={e => setCashierRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="kasir">Kasir (Buka Order & Pembayaran)</option>
                      <option value="supervisor">Supervisor (Akses Penuh & Void)</option>
                      <option value="operator">Operator Cuci & Packing</option>
                    </select>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCashier(false)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-xl"
                    >
                      Simpan Kasir
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: PENGATURAN PELANGGAN (DATABASE KONSUMEN) */}
      {activeSection === 'pelanggan' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Database Konsumen</h2>
                <p className="text-xs text-slate-500">
                  Total {customers.length} pelanggan terdaftar di sistem
                </p>
              </div>
              {/* Icon tambah pelanggan */}
              <button
                type="button"
                onClick={() => setIsAddingCustomerModal(true)}
                className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                title="Tambah Pelanggan Baru"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tambah Pelanggan</span>
              </button>
            </div>

            {/* Icon cari nama / no handphone */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                placeholder="Cari nama / no handphone..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada pelanggan yang cocok dengan pencarian
              </div>
            ) : (
              filteredCustomers.map(cust => (
                <div
                  key={cust.id}
                  className="p-4 flex items-start justify-between hover:bg-slate-50/80 transition-colors gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{cust.name}</h4>
                      <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.2 rounded font-mono">
                        {cust.totalOrders}x Order
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{cust.phone}</span>
                    </div>
                    {cust.address && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.address}</span>
                      </div>
                    )}
                    {cust.notes && (
                      <div className="text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">
                        Preferensi: {cust.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Kirim Pesan WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus pelanggan ${cust.name}?`)) {
                          onDeleteCustomer(cust.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus pelanggan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Modal Tambah Pelanggan */}
          {isAddingCustomerModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Tambah Pelanggan Baru</h3>
                  <button
                    onClick={() => setIsAddingCustomerModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveCustomer} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={e => setCustName(e.target.value)}
                      placeholder="Contoh: Bpk. Wahyu Pratama"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nomor Handphone / WA *
                    </label>
                    <input
                      type="text"
                      required
                      value={custPhone}
                      onChange={e => setCustPhone(e.target.value)}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alamat Lengkap
                    </label>
                    <textarea
                      rows={2}
                      value={custAddress}
                      onChange={e => setCustAddress(e.target.value)}
                      placeholder="Alamat rumah atau kantor..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Catatan Cuci / Alergi
                    </label>
                    <input
                      type="text"
                      value={custNotes}
                      onChange={e => setCustNotes(e.target.value)}
                      placeholder="Contoh: Pewangi mawar, setrika licin"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomerModal(false)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-xl"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: TENTANG KAMI (PROFIL APLIKASI & KONTAK BANTUAN) */}
      {activeSection === 'tentang' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-white border border-amber-300/80 p-1 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src="/src/assets/images/smart_laundry_logo_modern_1790622189834.jpg"
                  alt="Smart Laundry"
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 uppercase">
                  Smart Laundry POS
                </h3>
                <p className="text-xs text-slate-500">
                  Versi Aplikasi v2.4.0 (Build 2026.09 Production)
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sistem Kasir & Pembukuan Terintegrasi</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                Profil Aplikasi
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Smart Laundry dirancang khusus untuk mempermudah operasional bisnis laundry kiloan,
                satuan, dan meteran. Mulai dari pendaftaran pesanan cepat, pencetakan nota digital/thermal,
                manajemen antrian cucian siap ambil, rekonsiliasi kas harian, hingga analitik omzet dan
                pelanggan terperinci dengan ekspor Excel.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                Kontak Bantuan & Layanan Pelanggan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Tim%20Support%20Smart%20Laundry,%20saya%20butuh%20bantuan"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-colors flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">WhatsApp CS Bantuan</span>
                    <span className="text-[11px] text-slate-500">0812-3456-7890 (Respon Cepat)</span>
                  </div>
                </a>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Email Dukungan Teknis</span>
                    <span className="text-[11px] text-slate-500">bantuan@smartlaundry.id</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Headphones className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Jam Operasional Layanan Bantuan:</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Senin - Minggu: 07.00 - 22.00 WIB (Siap melayani pertanyaan teknis & panduan kasir).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
