const ExcelJS = require('exceljs');
const { Client, Payment, Employee, Service, Department } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

// Style helpers
const headerStyle = {
  font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: { bottom: { style: 'thin', color: { argb: 'FF000000' } } }
};
const rowStyle = (isEven) => ({
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFF0F4FF' : 'FFFFFFFF' } }
});
const overdueStyle = {
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } },
  font: { color: { argb: 'FF991B1B' } }
};

const generate = async (type, { from, to, status, service_id }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Excell-On Services';
  workbook.created = new Date();

  let sheet, data, columns, reportTitle;

  if (type === 'clients') {
    reportTitle = 'BÁO CÁO KHÁCH HÀNG';
    data = await Client.findAll({ order: [['company_name', 'ASC']] });
    sheet = workbook.addWorksheet('Clients');
    columns = [
      { header: 'STT', key: 'stt', width: 6 },
      { header: 'Mã KH', key: 'client_code', width: 12 },
      { header: 'Tên Công Ty', key: 'company_name', width: 30 },
      { header: 'Người Liên Hệ', key: 'contact_person', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Điện Thoại', key: 'phone', width: 15 },
      { header: 'Thành Phố', key: 'city', width: 15 },
      { header: 'Quốc Gia', key: 'country', width: 15 },
      { header: 'Ngành', key: 'industry', width: 20 },
      { header: 'Trạng Thái', key: 'status', width: 12 }
    ];
    sheet.columns = columns;
    data.forEach((item, i) => {
      const row = sheet.addRow({ stt: i + 1, ...item.dataValues });
      row.eachCell(cell => { Object.assign(cell, rowStyle(i % 2 === 0)); });
    });

  } else if (type === 'payments') {
    reportTitle = 'BÁO CÁO THANH TOÁN';
    const where = {};
    if (from && to) where.due_date = { [Op.between]: [from, to] };
    if (status) where.status = status;
    data = await Payment.findAll({
      where,
      include: [{ model: Client, as: 'client', attributes: ['company_name'] }],
      order: [['due_date', 'ASC']]
    });
    sheet = workbook.addWorksheet('Payments');
    columns = [
      { header: 'STT', key: 'stt', width: 6 },
      { header: 'Số HĐ', key: 'invoice_no', width: 15 },
      { header: 'Khách Hàng', key: 'client', width: 28 },
      { header: 'Số Tiền ($)', key: 'amount', width: 15 },
      { header: 'Hạn Thanh Toán', key: 'due_date', width: 18 },
      { header: 'Ngày Thanh Toán', key: 'paid_date', width: 18 },
      { header: 'Phương Thức', key: 'payment_method', width: 15 },
      { header: 'Trạng Thái', key: 'status', width: 12 }
    ];
    sheet.columns = columns;
    data.forEach((item, i) => {
      const row = sheet.addRow({
        stt: i + 1,
        invoice_no: item.invoice_no,
        client: item.client?.company_name,
        amount: parseFloat(item.amount),
        due_date: moment(item.due_date).format('DD/MM/YYYY'),
        paid_date: item.paid_date ? moment(item.paid_date).format('DD/MM/YYYY') : '-',
        payment_method: item.payment_method,
        status: item.status
      });
      row.getCell('amount').numFmt = '$#,##0.00';
      row.eachCell(cell => { Object.assign(cell, rowStyle(i % 2 === 0)); });
    });

  } else if (type === 'late_payments') {
    reportTitle = 'BÁO CÁO THANH TOÁN TRỄ HẠN';
    const where = { status: 'overdue' };
    if (from && to) where.due_date = { [Op.between]: [from, to] };
    data = await Payment.findAll({
      where,
      include: [{ model: Client, as: 'client', attributes: ['company_name', 'phone', 'email'] }],
      order: [['due_date', 'ASC']]
    });
    sheet = workbook.addWorksheet('Late Payments');
    columns = [
      { header: 'STT', key: 'stt', width: 6 },
      { header: 'Số HĐ', key: 'invoice_no', width: 15 },
      { header: 'Khách Hàng', key: 'client', width: 28 },
      { header: 'Email KH', key: 'client_email', width: 25 },
      { header: 'Điện Thoại', key: 'client_phone', width: 15 },
      { header: 'Số Tiền ($)', key: 'amount', width: 15 },
      { header: 'Hạn Thanh Toán', key: 'due_date', width: 18 },
      { header: 'Số Ngày Quá Hạn', key: 'days_overdue', width: 18 },
      { header: 'Phương Thức', key: 'payment_method', width: 15 }
    ];
    sheet.columns = columns;
    data.forEach((item, i) => {
      const daysOverdue = moment().diff(moment(item.due_date), 'days');
      const row = sheet.addRow({
        stt: i + 1,
        invoice_no: item.invoice_no,
        client: item.client?.company_name,
        client_email: item.client?.email || '-',
        client_phone: item.client?.phone || '-',
        amount: parseFloat(item.amount),
        due_date: moment(item.due_date).format('DD/MM/YYYY'),
        days_overdue: daysOverdue,
        payment_method: item.payment_method
      });
      row.getCell('amount').numFmt = '$#,##0.00';
      // Highlight overdue rows in red
      row.eachCell(cell => { Object.assign(cell, overdueStyle); });
    });

  } else if (type === 'employees') {
    reportTitle = 'BÁO CÁO NHÂN VIÊN';
    const where = {};
    if (service_id) where.service_id = service_id;
    data = await Employee.findAll({
      where,
      include: [
        { model: Service, as: 'service', attributes: ['name', 'type'] },
        { model: Department, as: 'department', attributes: ['name', 'code'] }
      ],
      order: [['emp_code', 'ASC']]
    });
    sheet = workbook.addWorksheet('Employees');
    columns = [
      { header: 'STT', key: 'stt', width: 6 },
      { header: 'Mã NV', key: 'emp_code', width: 12 },
      { header: 'Họ', key: 'last_name', width: 15 },
      { header: 'Tên', key: 'first_name', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Điện Thoại', key: 'phone', width: 15 },
      { header: 'Chức Danh', key: 'designation', width: 20 },
      { header: 'Phòng Ban', key: 'department', width: 20 },
      { header: 'Dịch Vụ Phụ Trách', key: 'service', width: 22 },
      { header: 'Ngày Vào Làm', key: 'join_date', width: 15 },
      { header: 'Lương ($)', key: 'salary', width: 15 },
      { header: 'Trạng Thái', key: 'status', width: 12 }
    ];
    sheet.columns = columns;
    data.forEach((item, i) => {
      const row = sheet.addRow({
        stt: i + 1, emp_code: item.emp_code,
        last_name: item.last_name, first_name: item.first_name,
        email: item.email, phone: item.phone || '-',
        designation: item.designation,
        department: item.department?.name || '-',
        service: item.service?.name || 'N/A',
        join_date: item.join_date ? moment(item.join_date).format('DD/MM/YYYY') : '-',
        salary: item.salary ? parseFloat(item.salary) : 0,
        status: item.status
      });
      row.getCell('salary').numFmt = '$#,##0.00';
      row.eachCell(cell => { Object.assign(cell, rowStyle(i % 2 === 0)); });
    });
  }

  // Style header row
  sheet.getRow(1).eachCell(cell => { Object.assign(cell, headerStyle); });
  sheet.getRow(1).height = 28;

  // Tiêu đề báo cáo
  sheet.insertRow(1, []);
  sheet.insertRow(1, [`EXCELL-ON CONSULTING SERVICES (ECS) - ${reportTitle} - ${moment().format('DD/MM/YYYY HH:mm')}`]);
  sheet.getRow(1).font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
  sheet.getRow(1).height = 32;
  if (from && to) {
    sheet.insertRow(2, [`Kỳ báo cáo: ${moment(from).format('DD/MM/YYYY')} — ${moment(to).format('DD/MM/YYYY')}`]);
    sheet.getRow(2).font = { italic: true, size: 11, color: { argb: 'FF666666' } };
  }

  return workbook.xlsx.writeBuffer();
};

module.exports = { generate };
