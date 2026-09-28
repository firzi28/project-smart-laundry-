import React from 'react';
import { LaundryOrder, Outlet } from '../types';
import { Printer, MessageCircle, X } from 'lucide-react';

interface StrukModalProps {
  order: LaundryOrder;
  outlet: Outlet;
  onClose: () => void;
}

export const StrukModal: React.FC<StrukModalProps> = ({ order, outlet, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0')
      ? '62' + cleanPhone.slice(1)
      : cleanPhone;

    const itemsText = order.items
      .map(
        i =>
          `• ${i.name} (${i.quantity} ${
            i.serviceType === 'kiloan' ? 'kg' : i.serviceType === 'meteran' ? 'm' : 'pcs'
          }) = Rp ${i.subtotal.toLocaleString('id-ID')}`
      )
      .join('%0A');

    const message = `*NOTA RESMI SMART LAUNDRY*%0A` +
      `--------------------------------%0A` +
      `*Outlet:* ${outlet.name}%0A` +
      `*No. Nota:* ${order.invoiceNumber}%0A` +
      `*Pelanggan:* ${order.customerName}%0A` +
      `*Tanggal:* ${new Date(order.createdAt).toLocaleDateString('id-ID')}%0A` +
      `*Estimasi Selesai:* ${new Date(order.estimatedCompletion).toLocaleString('id-ID')}%0A` +
      `--------------------------------%0A` +
      `*Rincian Cucian:*%0A${itemsText}%0A` +
      `*Durasi:* ${order.durationLabel}%0A` +
      `*Antar-Jemput:* ${order.deliveryLabel}%0A` +
      `--------------------------------%0A` +
      `*TOTAL:* Rp ${order.totalAmount.toLocaleString('id-ID')}%0A` +
      `*STATUS:* ${order.paymentStatus === 'lunas' ? 'LUNAS (' + order.paymentMethod.toUpperCase() + ')' : 'BELUM BAYAR'}%0A` +
      `--------------------------------%0A` +
      `Terima kasih telah mempercayakan pakaian Anda di ${outlet.name}! Simpan pesan ini sebagai bukti nota yang sah.`;

    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <span className="text-sm font-semibold text-slate-800">
            Pratinjau Struk / Nota Digital
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 overflow-y-auto bg-slate-100/70 flex justify-center">
          <div
            id="printable-receipt"
            className="w-full bg-white p-6 shadow-sm border border-slate-200/80 rounded-lg text-slate-800 font-mono text-xs"
          >
            {/* Store Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
              <div className="text-base font-bold tracking-wider uppercase text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                SMART LAUNDRY
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-0.5">{outlet.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{outlet.address}</div>
              <div className="text-[10px] text-slate-500">Telp/WA: {outlet.phone}</div>
            </div>

            {/* Invoice Meta */}
            <div className="border-b border-dashed border-slate-300 pb-3 mb-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Nota:</span>
                <span className="font-bold text-slate-900">{order.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal:</span>
                <span>{new Date(order.createdAt).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimasi:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(order.estimatedCompletion).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span>{order.cashierName}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-b border-dashed border-slate-300 pb-3 mb-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <span className="font-semibold text-slate-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. Telepon:</span>
                <span>{order.customerPhone}</span>
              </div>
              {order.customerAddress && (
                <div className="text-[10px] text-slate-500 pt-0.5">
                  Alamat: {order.customerAddress}
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="border-b border-dashed border-slate-300 pb-3 mb-3">
              <div className="font-bold pb-1 text-slate-700">RINCIAN LAYANAN</div>
              <div className="space-y-1.5 pt-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-800">{item.name}</span>
                      <span className="tabular-nums">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                    </div>
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
                ))}
              </div>
            </div>

            {/* Totals & Delivery */}
            <div className="border-b border-dashed border-slate-300 pb-3 mb-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Durasi:</span>
                <span>{order.durationLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Antar Jemput:</span>
                <span>{order.deliveryLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span className="tabular-nums">Rp {order.subtotal.toLocaleString('id-ID')}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Biaya Antar:</span>
                  <span className="tabular-nums">Rp {order.deliveryFee.toLocaleString('id-ID')}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Diskon:</span>
                  <span className="tabular-nums">-Rp {order.discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL AKHIR:</span>
                <span className="tabular-nums">Rp {order.totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Payment Status Stamp */}
            <div className="py-2.5 px-3 bg-slate-50 rounded border border-slate-200 text-center mb-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                Status Pembayaran
              </div>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  order.paymentStatus === 'lunas' ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {order.paymentStatus === 'lunas'
                  ? `LUNAS (${order.paymentMethod.toUpperCase()})`
                  : 'BELUM BAYAR'}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="text-[10px] text-slate-600 bg-amber-50 p-2 rounded border border-amber-200/60 mb-3">
                <span className="font-semibold">Catatan:</span> {order.notes}
              </div>
            )}

            {/* Terms Footer */}
            <div className="text-[9px] text-slate-400 text-center leading-relaxed">
              <p>• Harap membawa nota ini saat pengambilan pakaian.</p>
              <p>• Komplain maksimal 1x24 jam setelah cucian diambil.</p>
              <p>• Cucian yang tidak diambil dalam 30 hari di luar tanggung jawab kami.</p>
              <p className="mt-2 font-semibold text-slate-500">~ Terima Kasih Atas Kunjungan Anda ~</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Buttons */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
          <button
            onClick={handleSendWhatsApp}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Kirim via WA</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
