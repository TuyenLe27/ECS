const puppeteer = require('puppeteer-core');
const fs = require('fs');

// Tìm browser có sẵn trên Windows (Edge hoặc Chrome)
const findBrowser = () => {
  const paths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  return paths.find(p => fs.existsSync(p)) || paths[0];
};
const { Client, Payment, Employee } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

const generate = async (type, { from, to }) => {
  let title = '', tableHeaders = [], rows = [];

  if (type === 'payments') {
    title = 'Báo Cáo Thanh Toán';
    const where = {};
    if (from && to) where.due_date = { [Op.between]: [from, to] };
    const data = await Payment.findAll({
      where,
      include: [{ model: Client, as: 'client', attributes: ['company_name'] }],
      order: [['due_date', 'ASC']]
    });
    tableHeaders = ['#', 'Số HĐ', 'Khách Hàng', 'Số Tiền ($)', 'Hạn TT', 'Ngày TT', 'Trạng Thái'];
    rows = data.map((p, i) => [
      i + 1, p.invoice_no, p.client?.company_name,
      `$${Number(p.amount).toLocaleString()}`,
      moment(p.due_date).format('DD/MM/YYYY'),
      p.paid_date ? moment(p.paid_date).format('DD/MM/YYYY') : '-',
      `<span class="badge badge-${p.status}">${p.status}</span>`
    ]);
  } else if (type === 'clients') {
    title = 'Báo Cáo Khách Hàng';
    const data = await Client.findAll({ order: [['company_name', 'ASC']] });
    tableHeaders = ['#', 'Mã KH', 'Tên Công Ty', 'Người Liên Hệ', 'Email', 'Thành Phố', 'Trạng Thái'];
    rows = data.map((c, i) => [i + 1, c.client_code, c.company_name, c.contact_person, c.email, c.city || '-', c.status]);
  }

  const html = `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1a1a2e; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid #1E3A5F; padding-bottom: 20px; }
      .logo-area h1 { font-size: 22px; color: #1E3A5F; font-weight: 700; }
      .logo-area p { color: #666; font-size: 12px; margin-top: 4px; }
      .report-info { text-align: right; font-size: 12px; color: #666; }
      .report-info strong { color: #1E3A5F; }
      h2 { font-size: 18px; color: #1E3A5F; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      thead tr { background: #1E3A5F; color: white; }
      thead th { padding: 10px 8px; text-align: left; font-weight: 600; }
      tbody tr:nth-child(even) { background: #f0f4ff; }
      tbody tr:nth-child(odd) { background: #ffffff; }
      tbody td { padding: 8px; border-bottom: 1px solid #e0e7ff; }
      .badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
      .badge-paid { background: #d1fae5; color: #065f46; }
      .badge-pending { background: #fef3c7; color: #92400e; }
      .badge-overdue { background: #fee2e2; color: #991b1b; }
      .badge-active { background: #d1fae5; color: #065f46; }
      .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #e0e7ff; padding-top: 15px; }
      .summary { background: #f0f4ff; border-left: 4px solid #1E3A5F; padding: 10px 15px; margin-bottom: 20px; border-radius: 4px; }
      .summary span { font-weight: 600; color: #1E3A5F; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo-area">
        <h1>⚡ Excell-On Consulting Services</h1>
        <p>ECS Management System - Professional Report</p>
      </div>
      <div class="report-info">
        <div><strong>Ngày xuất:</strong> ${moment().format('DD/MM/YYYY HH:mm')}</div>
        <div><strong>Loại báo cáo:</strong> ${title}</div>
        ${from && to ? `<div><strong>Kỳ:</strong> ${moment(from).format('DD/MM/YYYY')} - ${moment(to).format('DD/MM/YYYY')}</div>` : ''}
      </div>
    </div>
    <h2>${title}</h2>
    <div class="summary">Tổng số bản ghi: <span>${rows.length}</span></div>
    <table>
      <thead>
        <tr>${tableHeaders.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
    <div class="footer">Tài liệu này được tạo tự động bởi hệ thống ECS — © ${new Date().getFullYear()} Excell-On Consulting Services</div>
  </body>
  </html>`;

  const browser = await puppeteer.launch({ executablePath: findBrowser(), args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const buffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px' } });
  await browser.close();
  return buffer;
};

module.exports = { generate };
