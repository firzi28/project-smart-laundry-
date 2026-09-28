import * as XLSX from 'xlsx';
import { CashTransaction, LaundryOrder, Customer } from '../types';

export function exportCashReportToExcel(
  transactions: CashTransaction[],
  startDate: string,
  endDate: string,
  outletName: string
) {
  const titleRow = [['LAPORAN MUTASI KAS - SMART LAUNDRY']];
  const infoRows = [
    ['Outlet:', outletName],
    ['Periode:', `${startDate} s/d ${endDate}`],
    ['Tanggal Cetak:', new Date().toLocaleString('id-ID')],
    [],
  ];

  const headers = [
    'No',
    'Tanggal & Waktu',
    'Tipe',
    'Kategori',
    'Akun / Metode',
    'No. Nota Terkait',
    'Keterangan',
    'Dicatat Oleh',
    'Pemasukan (Rp)',
    'Pengeluaran (Rp)',
  ];

  let totalMasuk = 0;
  let totalKeluar = 0;

  const dataRows = transactions.map((t, idx) => {
    const masuk = t.type === 'masuk' ? t.amount : 0;
    const keluar = t.type === 'keluar' ? t.amount : 0;
    totalMasuk += masuk;
    totalKeluar += keluar;

    return [
      idx + 1,
      new Date(t.createdAt).toLocaleString('id-ID'),
      t.type === 'masuk' ? 'Kas Masuk' : 'Kas Keluar',
      t.category.replace('_', ' ').toUpperCase(),
      t.accountType === 'tunai' ? 'Tunai' : 'Non-Tunai (QRIS/Transfer)',
      t.invoiceNumber || '-',
      t.description,
      t.recordedBy,
      masuk,
      keluar,
    ];
  });

  const summaryRows = [
    [],
    ['', '', '', '', '', '', 'TOTAL', '', totalMasuk, totalKeluar],
    ['', '', '', '', '', '', 'SURPLUS / SALDO BERSIH', '', totalMasuk - totalKeluar, ''],
  ];

  const fullSheetData = [...titleRow, ...infoRows, headers, ...dataRows, ...summaryRows];

  const worksheet = XLSX.utils.aoa_to_sheet(fullSheetData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 14 },
    { wch: 20 },
    { wch: 24 },
    { wch: 18 },
    { wch: 35 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mutasi Kas');
  XLSX.writeFile(workbook, `SmartLaundry_Laporan_Kas_${startDate}_sd_${endDate}.xlsx`);
}

export function exportOrderReportToExcel(
  orders: LaundryOrder[],
  startDate: string,
  endDate: string,
  outletName: string
) {
  const titleRow = [['LAPORAN DATA PESANAN - SMART LAUNDRY']];
  const infoRows = [
    ['Outlet:', outletName],
    ['Periode:', `${startDate} s/d ${endDate}`],
    ['Total Pesanan:', `${orders.length} Pesanan`],
    ['Tanggal Cetak:', new Date().toLocaleString('id-ID')],
    [],
  ];

  const headers = [
    'No',
    'No. Nota',
    'Tanggal Masuk',
    'Nama Pelanggan',
    'No. WhatsApp',
    'Rincian Layanan',
    'Durasi',
    'Kiloan (kg)',
    'Satuan (pcs)',
    'Meteran (m)',
    'Antar Jemput',
    'Ongkir (Rp)',
    'Total Bayar (Rp)',
    'Status Pembayaran',
    'Metode Bayar',
    'Status Pesanan',
    'Kasir',
  ];

  let totalNominal = 0;
  let totalKiloan = 0;
  let totalSatuan = 0;
  let totalMeteran = 0;

  const dataRows = orders.map((ord, idx) => {
    totalNominal += ord.totalAmount;
    totalKiloan += ord.kiloanQty;
    totalSatuan += ord.satuanQty;
    totalMeteran += ord.meteranQty;

    const itemsSummary = ord.items.map(i => `${i.name} (${i.quantity}x)`).join('; ');

    return [
      idx + 1,
      ord.invoiceNumber,
      new Date(ord.createdAt).toLocaleString('id-ID'),
      ord.customerName,
      ord.customerPhone,
      itemsSummary,
      ord.durationLabel,
      ord.kiloanQty,
      ord.satuanQty,
      ord.meteranQty,
      ord.deliveryLabel,
      ord.deliveryFee,
      ord.totalAmount,
      ord.paymentStatus === 'lunas' ? 'LUNAS' : 'BELUM BAYAR',
      ord.paymentMethod.toUpperCase(),
      ord.orderStatus.toUpperCase(),
      ord.cashierName,
    ];
  });

  const summaryRows = [
    [],
    [
      '',
      '',
      '',
      '',
      '',
      'TOTAL REKAPITULASI',
      '',
      totalKiloan,
      totalSatuan,
      totalMeteran,
      '',
      '',
      totalNominal,
      '',
      '',
      '',
      '',
    ],
  ];

  const fullSheetData = [...titleRow, ...infoRows, headers, ...dataRows, ...summaryRows];

  const worksheet = XLSX.utils.aoa_to_sheet(fullSheetData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 20 },
    { wch: 24 },
    { wch: 16 },
    { wch: 32 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 15 },
    { wch: 16 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pesanan');
  XLSX.writeFile(workbook, `SmartLaundry_Laporan_Pesanan_${startDate}_sd_${endDate}.xlsx`);
}

export function exportCustomerAnalysisToExcel(
  customers: Customer[],
  newCustomersCount: number,
  topFrequencyCustomers: Customer[],
  topSpendingCustomers: Customer[],
  startDate: string,
  endDate: string
) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Ringkasan
  const summarySheetData = [
    ['ANALISA PELANGGAN - SMART LAUNDRY'],
    ['Periode:', `${startDate} s/d ${endDate}`],
    ['Tanggal Cetak:', new Date().toLocaleString('id-ID')],
    [],
    ['METRIK UTAMA', 'NILAI'],
    ['Total Pelanggan Terdaftar', customers.length],
    ['Pelanggan Baru (pada periode)', newCustomersCount],
    ['Pelanggan Loyal / Berulang', customers.filter(c => c.totalOrders > 1).length],
    [],
    ['TOP 5 PELANGGAN BERDASARKAN FREKUENSI ORDER'],
    ['No', 'Nama Pelanggan', 'No. WhatsApp', 'Jumlah Pesanan', 'Total Belanja (Rp)'],
    ...topFrequencyCustomers.map((c, i) => [
      i + 1,
      c.name,
      c.phone,
      `${c.totalOrders} Pesanan`,
      c.totalSpent,
    ]),
    [],
    ['TOP 5 PELANGGAN BERDASARKAN NILAI BELANJA TERTINGGI'],
    ['No', 'Nama Pelanggan', 'No. WhatsApp', 'Total Belanja (Rp)', 'Jumlah Pesanan'],
    ...topSpendingCustomers.map((c, i) => [
      i + 1,
      c.name,
      c.phone,
      c.totalSpent,
      `${c.totalOrders} Pesanan`,
    ]),
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
  wsSummary['!cols'] = [{ wch: 6 }, { wch: 28 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Ringkasan Pelanggan');

  // Sheet 2: Semua Pelanggan
  const allCustomerHeaders = [
    'No',
    'Nama Pelanggan',
    'No. WhatsApp',
    'Alamat Lengkap',
    'Catatan / Preferensi',
    'Total Order',
    'Total Belanja (Rp)',
    'Terdaftar Sejak',
  ];

  const allCustomerRows = customers.map((c, idx) => [
    idx + 1,
    c.name,
    c.phone,
    c.address,
    c.notes || '-',
    c.totalOrders,
    c.totalSpent,
    new Date(c.createdAt).toLocaleDateString('id-ID'),
  ]);

  const wsAll = XLSX.utils.aoa_to_sheet([allCustomerHeaders, ...allCustomerRows]);
  wsAll['!cols'] = [
    { wch: 6 },
    { wch: 26 },
    { wch: 18 },
    { wch: 36 },
    { wch: 30 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(workbook, wsAll, 'Daftar Semua Pelanggan');

  XLSX.writeFile(workbook, `SmartLaundry_Analisa_Pelanggan_${startDate}_sd_${endDate}.xlsx`);
}

export function exportServiceAnalysisToExcel(
  serviceStats: Array<{
    name: string;
    key: string;
    count: number;
    quantity: number;
    unit: string;
    revenue: number;
    sharePercent: number;
  }>,
  totalRevenue: number,
  startDate: string,
  endDate: string
) {
  const workbook = XLSX.utils.book_new();

  const titleRow = [['ANALISA LAYANAN - SMART LAUNDRY']];
  const infoRows = [
    ['Periode:', `${startDate} s/d ${endDate}`],
    ['Total Omzet Layanan:', `Rp ${totalRevenue.toLocaleString('id-ID')}`],
    ['Tanggal Cetak:', new Date().toLocaleString('id-ID')],
    [],
  ];

  const headers = [
    'No',
    'Kategori Layanan',
    'Volume / Kuantitas',
    'Satuan',
    'Frekuensi Order',
    'Total Omzet (Rp)',
    'Kontribusi Omzet (%)',
  ];

  const dataRows = serviceStats.map((item, idx) => [
    idx + 1,
    item.name,
    item.quantity,
    item.unit,
    item.count,
    item.revenue,
    `${item.sharePercent.toFixed(1)}%`,
  ]);

  const summaryRow = [
    [],
    ['', 'TOTAL', '', '', '', totalRevenue, '100%'],
  ];

  const fullData = [...titleRow, ...infoRows, headers, ...dataRows, ...summaryRow];
  const worksheet = XLSX.utils.aoa_to_sheet(fullData);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 18 },
    { wch: 10 },
    { wch: 18 },
    { wch: 20 },
    { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Analisa Layanan');
  XLSX.writeFile(workbook, `SmartLaundry_Analisa_Layanan_${startDate}_sd_${endDate}.xlsx`);
}
