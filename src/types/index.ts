export type ServiceType = 'kiloan' | 'satuan' | 'meteran';

export type OrderStatus = 'antrian' | 'proses' | 'siap_ambil' | 'selesai' | 'batal';

export type PaymentStatus = 'lunas' | 'belum_bayar';

export type PaymentMethod = 'tunai' | 'qris' | 'transfer' | 'belum_dipilih';

export interface Outlet {
  id: string;
  name: string;
  address: string;
  phone: string;
  isDefault?: boolean;
}

export interface ServiceDuration {
  id: string;
  name: string;
  hours: number;
  label: string; // e.g., '72 jam (reguler)', '24 jam (ekspres)', '6 jam (kilat)'
  priceMultiplier: number;
  additionalFee: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  label: string; // e.g., 'Gratis (Rp 0)', 'Dekat (Rp 3.000)', 'Jauh (Rp 7.000)'
  description?: string;
}

export interface CashierStaff {
  id: string;
  name: string;
  phone: string;
  shift: string;
  role: 'kasir' | 'supervisor' | 'operator';
  active: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export type SpecificServiceCategory = 
  | 'cuci_setrika' 
  | 'bed_cover' 
  | 'sprei' 
  | 'boneka' 
  | 'karpet' 
  | 'selimut' 
  | 'kiloan_reguler' 
  | 'satuan_lainnya';

export interface OrderItem {
  id: string;
  name: string;
  category: SpecificServiceCategory;
  serviceType: ServiceType; // kiloan, satuan, meteran
  quantity: number; // kg, pcs, or meters
  unitPrice: number;
  subtotal: number;
}

export interface LaundryOrder {
  id: string;
  invoiceNumber: string; // e.g., SL-2601-001
  outletId: string;
  outletName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: OrderItem[];
  durationId: string;
  durationLabel: string;
  deliveryId: string;
  deliveryLabel: string;
  deliveryFee: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string; // ISO string
  estimatedCompletion: string; // ISO string
  completedAt?: string;
  cashierName: string;
  kiloanQty: number; // total in kg
  satuanQty: number; // total in pcs
  meteranQty: number; // total in meters
}

export interface CashTransaction {
  id: string;
  outletId: string;
  type: 'masuk' | 'keluar';
  category: 'pembayaran_pesanan' | 'operasional' | 'deterjen_parfum' | 'listrik_air' | 'gaji' | 'lainnya';
  accountType: 'tunai' | 'non_tunai';
  amount: number;
  description: string;
  invoiceNumber?: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
  recordedBy: string;
}

export type ActiveTab = 'beranda' | 'pesanan' | 'laporan' | 'pengaturan';
