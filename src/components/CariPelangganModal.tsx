import React, { useState } from 'react';
import { Customer } from '../types';
import { X, Search, Phone, MapPin, MessageCircle, Plus } from 'lucide-react';

interface CariPelangganModalProps {
  customers: Customer[];
  onClose: () => void;
  onOpenAddCustomer: () => void;
  onSelectCustomerForOrder?: (customer: Customer) => void;
}

export const CariPelangganModal: React.FC<CariPelangganModalProps> = ({
  customers,
  onClose,
  onOpenAddCustomer,
  onSelectCustomerForOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0')
      ? '62' + cleanPhone.slice(1)
      : cleanPhone;
    window.open(
      `https://wa.me/${phoneWithCountry}?text=Halo%20${encodeURIComponent(
        name
      )},%20kami%20dari%20Smart%20Laundry.%20Ada%20yang%20bisa%20kami%20bantu?`,
      '_blank'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Cari Database Pelanggan</h3>
              <p className="text-xs text-slate-500">Cari berdasarkan nama, nomor telepon, atau alamat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar + Add Button */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Ketik nama atau nomor handphone..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAddCustomer();
            }}
            className="p-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-xl flex items-center justify-center shrink-0 transition-colors"
            title="Tambah Pelanggan Baru"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Customer list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm font-semibold text-slate-700">Pelanggan tidak ditemukan</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Belum ada data pelanggan yang cocok dengan pencarian
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddCustomer();
                }}
                className="inline-flex items-center gap-1.5 py-2 px-4 bg-amber-400 text-amber-950 rounded-xl text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Daftarkan Sebagai Pelanggan Baru</span>
              </button>
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <div
                key={customer.id}
                className="p-3 bg-white border border-slate-200/80 rounded-xl hover:border-amber-400 hover:shadow-xs transition-all flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {customer.name}
                    </span>
                    <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded font-mono">
                      {customer.totalOrders}x Order
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.address && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  )}
                  {customer.notes && (
                    <div className="text-[10px] text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded mt-1 inline-block">
                      Catatan: {customer.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pt-1">
                  <button
                    onClick={() => openWhatsApp(customer.phone, customer.name)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Chat WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  {onSelectCustomerForOrder && (
                    <button
                      onClick={() => {
                        onSelectCustomerForOrder(customer);
                        onClose();
                      }}
                      className="py-1.5 px-3 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Pilih
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
