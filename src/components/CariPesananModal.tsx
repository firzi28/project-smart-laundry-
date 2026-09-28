import React, { useState } from 'react';
import { LaundryOrder } from '../types';
import { X, Search, FileText, Phone, ArrowRight, Printer } from 'lucide-react';

interface CariPesananModalProps {
  orders: LaundryOrder[];
  onClose: () => void;
  onSelectOrder: (order: LaundryOrder) => void;
  onPrintOrder: (order: LaundryOrder) => void;
}

export const CariPesananModal: React.FC<CariPesananModalProps> = ({
  orders,
  onClose,
  onSelectOrder,
  onPrintOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(
    o =>
      o.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Cari Pesanan Laundry</h3>
              <p className="text-xs text-slate-500">Cari berdasarkan No. Nota, Nama, atau No. HP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Ketik nomor nota (mis: SL-2609-001) atau nama..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Result List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Tidak ada pesanan ditemukan</p>
              <p className="text-xs text-slate-500 mt-1">Coba kata kunci pencarian yang lain</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order.id}
                className="p-3 bg-white border border-slate-200/80 rounded-xl hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between gap-3"
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
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {order.paymentStatus === 'lunas' ? 'Lunas' : 'Belum Bayar'}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize">
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1 truncate">
                    {order.customerName}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {order.customerPhone} · Total: Rp {order.totalAmount.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onPrintOrder(order);
                      onClose();
                    }}
                    title="Cetak Nota"
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onSelectOrder(order);
                      onClose();
                    }}
                    className="p-2 text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                  >
                    <span>Detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
