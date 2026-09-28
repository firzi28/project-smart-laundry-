import { useState, useEffect } from 'react';
import {
  Outlet,
  ServiceDuration,
  DeliveryZone,
  CashierStaff,
  Customer,
  LaundryOrder,
  CashTransaction,
  ActiveTab,
  OrderStatus,
  PaymentMethod,
} from './types';
import {
  INITIAL_OUTLETS,
  INITIAL_DURATIONS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_CASHIERS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_CASH_TRANSACTIONS,
  STORAGE_KEYS,
  getStoredData,
  setStoredData,
} from './utils/storage';

import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { BerandaModule } from './components/BerandaModule';
import { PesananModule } from './components/PesananModule';
import { LaporanModule } from './components/LaporanModule';
import { PengaturanModule } from './components/PengaturanModule';

import { TambahPesananModal } from './components/TambahPesananModal';
import { CariPesananModal } from './components/CariPesananModal';
import { TambahPelangganModal } from './components/TambahPelangganModal';
import { CariPelangganModal } from './components/CariPelangganModal';
import { TambahOutletModal } from './components/TambahOutletModal';
import { StrukModal } from './components/StrukModal';

export default function App() {
  // 1. Persistent State
  const [outlets, setOutlets] = useState<Outlet[]>(() =>
    getStoredData(STORAGE_KEYS.OUTLETS, INITIAL_OUTLETS)
  );

  const [currentOutletId, setCurrentOutletId] = useState<string>(() =>
    getStoredData(STORAGE_KEYS.CURRENT_OUTLET_ID, INITIAL_OUTLETS[0].id)
  );

  const [durations, setDurations] = useState<ServiceDuration[]>(() =>
    getStoredData(STORAGE_KEYS.DURATIONS, INITIAL_DURATIONS)
  );

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(() =>
    getStoredData(STORAGE_KEYS.DELIVERY_ZONES, INITIAL_DELIVERY_ZONES)
  );

  const [cashiers, setCashiers] = useState<CashierStaff[]>(() =>
    getStoredData(STORAGE_KEYS.CASHIERS, INITIAL_CASHIERS)
  );

  const [customers, setCustomers] = useState<Customer[]>(() =>
    getStoredData(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS)
  );

  const [orders, setOrders] = useState<LaundryOrder[]>(() =>
    getStoredData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS)
  );

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() =>
    getStoredData(STORAGE_KEYS.CASH_TRANSACTIONS, INITIAL_CASH_TRANSACTIONS)
  );

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('beranda');
  const [ordersInitialTab, setOrdersInitialTab] = useState<'antrian' | 'siap_ambil' | 'belum_bayar'>('antrian');

  // 3. Modal States
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [isSearchOrderOpen, setIsSearchOrderOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isSearchCustomerOpen, setIsSearchCustomerOpen] = useState(false);
  const [isAddOutletOpen, setIsAddOutletOpen] = useState(false);
  const [printingOrder, setPrintingOrder] = useState<LaundryOrder | null>(null);

  // Set document title
  useEffect(() => {
    document.title = 'Smart Laundry';
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    setStoredData(STORAGE_KEYS.OUTLETS, outlets);
  }, [outlets]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.CURRENT_OUTLET_ID, currentOutletId);
  }, [currentOutletId]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.DURATIONS, durations);
  }, [durations]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.DELIVERY_ZONES, deliveryZones);
  }, [deliveryZones]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.CASHIERS, cashiers);
  }, [cashiers]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.CUSTOMERS, customers);
  }, [customers]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    setStoredData(STORAGE_KEYS.CASH_TRANSACTIONS, cashTransactions);
  }, [cashTransactions]);

  // Current outlet object
  const currentOutlet = outlets.find(o => o.id === currentOutletId) || outlets[0] || INITIAL_OUTLETS[0];

  // Actions
  const handleSelectOutlet = (outlet: Outlet) => {
    setCurrentOutletId(outlet.id);
  };

  const handleAddOutlet = (newOutlet: Outlet) => {
    setOutlets(prev => [...prev, newOutlet]);
    setCurrentOutletId(newOutlet.id);
  };

  // Order Handlers
  const handleSaveOrder = (
    newOrder: LaundryOrder,
    isPaid: boolean,
    paymentMethod: PaymentMethod
  ) => {
    setOrders(prev => [newOrder, ...prev]);

    // Update customer stats
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === newOrder.customerId) {
          return {
            ...c,
            totalOrders: c.totalOrders + 1,
            totalSpent: c.totalSpent + newOrder.totalAmount,
          };
        }
        return c;
      })
    );

    // If paid immediately, create cash transaction
    if (isPaid) {
      const newTx: CashTransaction = {
        id: `ctx-${Date.now()}`,
        outletId: newOrder.outletId,
        type: 'masuk',
        category: 'pembayaran_pesanan',
        accountType: paymentMethod === 'tunai' ? 'tunai' : 'non_tunai',
        amount: newOrder.totalAmount,
        description: `Pembayaran ${newOrder.invoiceNumber} (${newOrder.customerName})`,
        invoiceNumber: newOrder.invoiceNumber,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        recordedBy: newOrder.cashierName,
      };
      setCashTransactions(prev => [newTx, ...prev]);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            orderStatus: newStatus,
            completedAt: newStatus === 'selesai' ? new Date().toISOString() : o.completedAt,
          };
        }
        return o;
      })
    );
  };

  const handleSettlePayment = (orderId: string, method: PaymentMethod) => {
    const orderToSettle = orders.find(o => o.id === orderId);
    if (!orderToSettle) return;

    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            paymentStatus: 'lunas',
            paymentMethod: method,
            paymentDate: new Date().toISOString(),
          };
        }
        return o;
      })
    );

    // Record cash transaction
    const newTx: CashTransaction = {
      id: `ctx-${Date.now()}`,
      outletId: orderToSettle.outletId,
      type: 'masuk',
      category: 'pembayaran_pesanan',
      accountType: method === 'tunai' ? 'tunai' : 'non_tunai',
      amount: orderToSettle.totalAmount,
      description: `Pelunasan Nota ${orderToSettle.invoiceNumber} (${orderToSettle.customerName})`,
      invoiceNumber: orderToSettle.invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      recordedBy: orderToSettle.cashierName || 'Kasir Smart Laundry',
    };
    setCashTransactions(prev => [newTx, ...prev]);
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            orderStatus: 'batal',
          };
        }
        return o;
      })
    );
  };

  // Cashier Handlers
  const handleAddCashier = (cashier: CashierStaff) => {
    setCashiers(prev => [...prev, cashier]);
  };

  const handleDeleteCashier = (id: string) => {
    setCashiers(prev => prev.filter(c => c.id !== id));
  };

  // Customer Handlers
  const handleAddCustomer = (customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Duration Handlers
  const handleAddDuration = (duration: ServiceDuration) => {
    setDurations(prev => [...prev, duration]);
  };

  const handleDeleteDuration = (id: string) => {
    setDurations(prev => prev.filter(d => d.id !== id));
  };

  // Delivery Zone Handlers
  const handleAddDeliveryZone = (zone: DeliveryZone) => {
    setDeliveryZones(prev => [...prev, zone]);
  };

  const handleDeleteDeliveryZone = (id: string) => {
    setDeliveryZones(prev => prev.filter(z => z.id !== id));
  };

  // Cash transaction addition
  const handleAddCashTransaction = (tx: CashTransaction) => {
    setCashTransactions(prev => [tx, ...prev]);
  };

  // Navigate to orders with specific initial tab
  const handleNavigateToOrders = (statusTab: 'antrian' | 'siap_ambil' | 'belum_bayar' = 'antrian') => {
    setOrdersInitialTab(statusTab);
    setActiveTab('pesanan');
  };

  // Count active pending orders for current outlet (for tab badge)
  const pendingCount = orders.filter(
    o => o.outletId === currentOutlet.id && o.orderStatus === 'antrian'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Header with Logo & Outlet Selector Dropdown + '+' Button */}
      <Header
        outlets={outlets}
        currentOutlet={currentOutlet}
        onSelectOutlet={handleSelectOutlet}
        onOpenAddOutlet={() => setIsAddOutletOpen(true)}
      />

      {/* 2. Desktop Navigation Sub-header / Mobile Bottom Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab)}
        pendingOrderCount={pendingCount}
      />

      {/* 3. Main Workspace Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5">
        {activeTab === 'beranda' && (
          <BerandaModule
            currentOutlet={currentOutlet}
            orders={orders}
            onOpenAddOrder={() => setIsAddOrderOpen(true)}
            onOpenSearchOrder={() => setIsSearchOrderOpen(true)}
            onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
            onOpenSearchCustomer={() => setIsSearchCustomerOpen(true)}
            onNavigateToOrders={handleNavigateToOrders}
            onPrintOrder={order => setPrintingOrder(order)}
            onSelectOrder={order => {
              setPrintingOrder(order);
            }}
          />
        )}

        {activeTab === 'pesanan' && (
          <PesananModule
            orders={orders}
            outlets={outlets}
            currentOutlet={currentOutlet}
            initialTab={ordersInitialTab}
            onSelectOutlet={handleSelectOutlet}
            onOpenAddOrder={() => setIsAddOrderOpen(true)}
            onPrintOrder={order => setPrintingOrder(order)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onSettlePayment={handleSettlePayment}
            onCancelOrder={handleCancelOrder}
          />
        )}

        {activeTab === 'laporan' && (
          <LaporanModule
            orders={orders}
            cashTransactions={cashTransactions}
            customers={customers}
            outlets={outlets}
            currentOutlet={currentOutlet}
            onSelectOutlet={handleSelectOutlet}
            onAddCashTransaction={handleAddCashTransaction}
          />
        )}

        {activeTab === 'pengaturan' && (
          <PengaturanModule
            outlets={outlets}
            currentOutlet={currentOutlet}
            durations={durations}
            deliveryZones={deliveryZones}
            cashiers={cashiers}
            customers={customers}
            onSelectOutlet={handleSelectOutlet}
            onAddDuration={handleAddDuration}
            onDeleteDuration={handleDeleteDuration}
            onAddDeliveryZone={handleAddDeliveryZone}
            onDeleteDeliveryZone={handleDeleteDeliveryZone}
            onAddCashier={handleAddCashier}
            onDeleteCashier={handleDeleteCashier}
            onAddCustomer={handleAddCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        )}
      </main>

      {/* 4. Modals */}
      {/* Tambah Pesanan Modal */}
      {isAddOrderOpen && (
        <TambahPesananModal
          outlet={currentOutlet}
          customers={customers}
          durations={durations}
          deliveryZones={deliveryZones}
          cashiers={cashiers}
          onClose={() => setIsAddOrderOpen(false)}
          onSaveOrder={handleSaveOrder}
          onQuickAddCustomer={handleAddCustomer}
        />
      )}

      {/* Cari Pesanan Modal */}
      {isSearchOrderOpen && (
        <CariPesananModal
          orders={orders.filter(o => o.outletId === currentOutlet.id)}
          onClose={() => setIsSearchOrderOpen(false)}
          onSelectOrder={order => {
            setPrintingOrder(order);
          }}
          onPrintOrder={order => setPrintingOrder(order)}
        />
      )}

      {/* Tambah Pelanggan Modal */}
      {isAddCustomerOpen && (
        <TambahPelangganModal
          onClose={() => setIsAddCustomerOpen(false)}
          onSaveCustomer={handleAddCustomer}
        />
      )}

      {/* Cari Pelanggan Modal */}
      {isSearchCustomerOpen && (
        <CariPelangganModal
          customers={customers}
          onClose={() => setIsSearchCustomerOpen(false)}
          onOpenAddCustomer={() => {
            setIsSearchCustomerOpen(false);
            setIsAddCustomerOpen(true);
          }}
        />
      )}

      {/* Tambah Outlet Modal */}
      {isAddOutletOpen && (
        <TambahOutletModal
          onClose={() => setIsAddOutletOpen(false)}
          onSave={handleAddOutlet}
        />
      )}

      {/* Struk / Nota Modal */}
      {printingOrder && (
        <StrukModal
          order={printingOrder}
          outlet={outlets.find(o => o.id === printingOrder.outletId) || currentOutlet}
          onClose={() => setPrintingOrder(null)}
        />
      )}
    </div>
  );
}
