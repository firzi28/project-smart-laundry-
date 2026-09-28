import React, { useState } from 'react';
import {
  Customer,
  LaundryOrder,
  OrderItem,
  ServiceDuration,
  DeliveryZone,
  CashierStaff,
  Outlet,
  SpecificServiceCategory,
  ServiceType,
  PaymentStatus,
  PaymentMethod,
} from '../types';
import { X, Plus, Trash2, User, Phone, Sparkles, Check, Clock, Truck, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TambahPesananModalProps {
  outlet: Outlet;
  customers: Customer[];
  durations: ServiceDuration[];
  deliveryZones: DeliveryZone[];
  cashiers: CashierStaff[];
  onClose: () => void;
  onSaveOrder: (newOrder: LaundryOrder, isPaid: boolean, paymentMethod: PaymentMethod) => void;
  onQuickAddCustomer: (customer: Customer) => void;
}

const PRESET_SERVICES: Array<{
  name: string;
  category: SpecificServiceCategory;
  serviceType: ServiceType;
  defaultPrice: number;
  unit: string;
}> = [
  { name: 'Cuci Setrika Reguler', category: 'cuci_setrika', serviceType: 'kiloan', defaultPrice: 8000, unit: 'kg' },
  { name: 'Bed Cover King / Queen', category: 'bed_cover', serviceType: 'satuan', defaultPrice: 35000, unit: 'pcs' },
  { name: 'Sprei', category: 'sprei', serviceType: 'satuan', defaultPrice: 15000, unit: 'pcs' },
  { name: 'Boneka', category: 'boneka', serviceType: 'satuan', defaultPrice: 30000, unit: 'pcs' },
  { name: 'Karpet', category: 'karpet', serviceType: 'meteran', defaultPrice: 15000, unit: 'm' },
  { name: 'Selimut', category: 'selimut', serviceType: 'satuan', defaultPrice: 25000, unit: 'pcs' },
];

export const TambahPesananModal: React.FC<TambahPesananModalProps> = ({
  outlet,
  customers,
  durations,
  deliveryZones,
  cashiers,
  onClose,
  onSaveOrder,
  onQuickAddCustomer,
}) => {
  // Customer selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Items
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: `itm-${Date.now()}-1`,
      name: 'Cuci Setrika Reguler',
      category: 'cuci_setrika',
      serviceType: 'kiloan',
      quantity: 3.0,
      unitPrice: 8000,
      subtotal: 24000,
    },
  ]);

  // Duration & Delivery
  const [selectedDurationId, setSelectedDurationId] = useState<string>(
    durations[0]?.id || 'dur-72'
  );
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(
    deliveryZones[0]?.id || 'del-gratis'
  );

  // Cashier
  const [selectedCashierId, setSelectedCashierId] = useState<string>(
    cashiers[0]?.name || 'Kasir Smart Laundry'
  );

  // Payment
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('belum_bayar');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [notes, setNotes] = useState('');

  // Handlers for items
  const handleAddItem = (preset: (typeof PRESET_SERVICES)[0]) => {
    const defaultQty = preset.serviceType === 'kiloan' ? 1.0 : 1;
    const newItem: OrderItem = {
      id: `itm-${Date.now()}-${Math.random()}`,
      name: preset.name,
      category: preset.category,
      serviceType: preset.serviceType,
      quantity: defaultQty,
      unitPrice: preset.defaultPrice,
      subtotal: defaultQty * preset.defaultPrice,
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, field: 'quantity' | 'unitPrice', val: number) => {
    setItems(prev =>
      prev.map(i => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: val };
        updated.subtotal = Math.round(updated.quantity * updated.unitPrice);
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Calculations
  const selectedDuration = durations.find(d => d.id === selectedDurationId) || durations[0];
  const selectedDelivery =
    deliveryZones.find(d => d.id === selectedDeliveryId) || deliveryZones[0];

  const itemsSubtotal = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  const deliveryFee = selectedDelivery ? selectedDelivery.fee : 0;
  const totalAmount = itemsSubtotal + deliveryFee;

  const totalKiloan = items
    .filter(i => i.serviceType === 'kiloan')
    .reduce((acc, curr) => acc + curr.quantity, 0);
  const totalSatuan = items
    .filter(i => i.serviceType === 'satuan')
    .reduce((acc, curr) => acc + curr.quantity, 0);
  const totalMeteran = items
    .filter(i => i.serviceType === 'meteran')
    .reduce((acc, curr) => acc + curr.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalCustomerId = selectedCustomerId;
    let finalCustomerName = '';
    let finalCustomerPhone = '';
    let finalCustomerAddress = '';

    if (isNewCustomer) {
      if (!newCustName.trim() || !newCustPhone.trim()) {
        alert('Mohon isi nama dan nomor WhatsApp pelanggan!');
        return;
      }
      const newCust: Customer = {
        id: `cst-${Date.now()}`,
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        address: newCustAddress.trim(),
        totalOrders: 1,
        totalSpent: totalAmount,
        createdAt: new Date().toISOString(),
      };
      onQuickAddCustomer(newCust);
      finalCustomerId = newCust.id;
      finalCustomerName = newCust.name;
      finalCustomerPhone = newCust.phone;
      finalCustomerAddress = newCust.address;
    } else {
      const c = customers.find(x => x.id === selectedCustomerId);
      if (!c) {
        alert('Mohon pilih pelanggan atau tambah pelanggan baru!');
        return;
      }
      finalCustomerId = c.id;
      finalCustomerName = c.name;
      finalCustomerPhone = c.phone;
      finalCustomerAddress = c.address;
    }

    const orderNumber = `SL-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;

    const durationHours = selectedDuration ? selectedDuration.hours : 72;
    const estimatedCompletion = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();

    const newOrder: LaundryOrder = {
      id: `ord-${Date.now()}`,
      invoiceNumber: orderNumber,
      outletId: outlet.id,
      outletName: outlet.name,
      customerId: finalCustomerId,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      customerAddress: finalCustomerAddress,
      items,
      durationId: selectedDurationId,
      durationLabel: selectedDuration ? selectedDuration.label : '72 jam (reguler)',
      deliveryId: selectedDeliveryId,
      deliveryLabel: selectedDelivery ? selectedDelivery.label : 'Gratis (Rp 0)',
      deliveryFee,
      subtotal: itemsSubtotal,
      discount: 0,
      totalAmount,
      paymentStatus,
      paymentMethod: paymentStatus === 'lunas' ? paymentMethod : 'belum_dipilih',
      paymentDate: paymentStatus === 'lunas' ? new Date().toISOString() : undefined,
      orderStatus: 'antrian',
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      estimatedCompletion,
      cashierName: selectedCashierId,
      kiloanQty: totalKiloan,
      satuanQty: totalSatuan,
      meteranQty: totalMeteran,
    };

    onSaveOrder(newOrder, paymentStatus === 'lunas', paymentMethod);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/50 text-amber-950 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950">Buat Pesanan Laundry Baru</h2>
              <p className="text-xs text-amber-900/80 font-medium">{outlet.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-950 hover:bg-amber-500/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Customer Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                Data Pelanggan
              </span>
              <button
                type="button"
                onClick={() => setIsNewCustomer(!isNewCustomer)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline decoration-amber-300"
              >
                {isNewCustomer ? 'Pilih dari Pelanggan Terdaftar' : '+ Pelanggan Baru'}
              </button>
            </div>

            {!isNewCustomer ? (
              <div>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  required
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - {c.address ? c.address.slice(0, 30) : 'Tanpa alamat'}
                    </option>
                  ))}
                </select>
                {selectedCustomerId && (
                  <p className="text-xs text-slate-500 mt-1.5">
                    {customers.find(c => c.id === selectedCustomerId)?.notes && (
                      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        Catatan: {customers.find(c => c.id === selectedCustomerId)?.notes}
                      </span>
                    )}
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={e => setNewCustName(e.target.value)}
                    placeholder="Contoh: Bpk. Rizky Pratama"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    No. WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      required
                      value={newCustPhone}
                      onChange={e => setNewCustPhone(e.target.value)}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Alamat Lengkap (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newCustAddress}
                    onChange={e => setNewCustAddress(e.target.value)}
                    placeholder="Jl. Mawar No. 10, RT 02/05"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
              <span>Tambah Layanan & Item</span>
              <span className="text-[11px] font-normal text-slate-500">Klik untuk tambah cepat</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_SERVICES.map(p => (
                <button
                  key={p.category + p.name}
                  type="button"
                  onClick={() => handleAddItem(p)}
                  className="flex flex-col items-start p-2.5 text-left bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl transition-all group"
                >
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-amber-950">
                    {p.name}
                  </span>
                  <span className="text-[11px] text-slate-500 group-hover:text-amber-800 font-mono tabular-nums">
                    Rp {p.defaultPrice.toLocaleString('id-ID')} / {p.unit}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 flex justify-between">
              <span>Daftar Cucian ({items.length} item)</span>
              <span>Subtotal: Rp {itemsSubtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="p-3 flex items-center gap-3 bg-white">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                    <span className="text-[10px] text-slate-500 capitalize">
                      Tipe: {item.serviceType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <label className="block text-[9px] text-slate-500">
                        {item.serviceType === 'kiloan'
                          ? 'Bobot (kg)'
                          : item.serviceType === 'meteran'
                          ? 'Panjang (m)'
                          : 'Jumlah (pcs)'}
                      </label>
                      <input
                        type="number"
                        step={item.serviceType === 'kiloan' || item.serviceType === 'meteran' ? '0.1' : '1'}
                        min="0.1"
                        value={item.quantity}
                        onChange={e => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-center font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>

                    <div className="w-24">
                      <label className="block text-[9px] text-slate-500">Harga Satuan</label>
                      <input
                        type="number"
                        step="1000"
                        min="0"
                        value={item.unitPrice}
                        onChange={e => handleUpdateItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-right font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>

                    <div className="w-24 text-right">
                      <label className="block text-[9px] text-slate-500">Subtotal</label>
                      <span className="text-xs font-bold text-slate-800 font-mono tabular-nums">
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options: Duration & Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Durasi Layanan */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Durasi Layanan
              </label>
              <select
                value={selectedDurationId}
                onChange={e => setSelectedDurationId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {durations.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Antar-Jemput */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                Antar-Jemput (Tarif & Zona)
              </label>
              <select
                value={selectedDeliveryId}
                onChange={e => setSelectedDeliveryId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {deliveryZones.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.label} {z.description ? `- ${z.description}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kasir & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Petugas Kasir
              </label>
              <select
                value={selectedCashierId}
                onChange={e => setSelectedCashierId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {cashiers.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Khusus Cucian
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Contoh: Pewangi lavender, noda minyak di kerah"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Payment Selection */}
          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-700" />
              Status & Metode Pembayaran
            </span>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setPaymentStatus('belum_bayar')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                  paymentStatus === 'belum_bayar'
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Bayar Nanti (Belum Bayar)
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('lunas')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                  paymentStatus === 'lunas'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Bayar Sekarang (Lunas)
              </button>
            </div>

            {paymentStatus === 'lunas' && (
              <div className="mt-3 flex items-center gap-2 pt-2 border-t border-amber-200">
                <span className="text-xs font-semibold text-slate-700">Metode:</span>
                {(['tunai', 'qris', 'transfer'] as PaymentMethod[]).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-1 px-3 text-xs font-semibold rounded-md border capitalize transition-colors ${
                      paymentMethod === method
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer Summary & Submit */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left w-full sm:w-auto">
            <div className="text-[11px] text-slate-500">
              Kiloan: <span className="font-semibold text-slate-700">{totalKiloan.toFixed(1)} kg</span> ·
              Satuan: <span className="font-semibold text-slate-700">{totalSatuan} pcs</span> ·
              Meteran: <span className="font-semibold text-slate-700">{totalMeteran} m</span>
            </div>
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              Total: Rp {totalAmount.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-6 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Simpan & Buat Nota</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
