const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF invoice for an order
 * @param {Object} order - Order object
 * @returns {String} - URL to invoice (in production, would be S3 URL)
 */
const generateInvoice = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      // Create invoices directory if it doesn't exist
      const invoicesDir = path.join(__dirname, '../invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }
      
      const fileName = `invoice-${order.orderId}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      
      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Header
      doc.fontSize(20).text('INVOICE', { align: 'center' });
      doc.moveDown();
      
      // Order details
      doc.fontSize(12);
      doc.text(`Order ID: ${order.orderId}`);
      doc.text(`Date: ${order.createdAt.toLocaleDateString()}`);
      doc.text(`Status: ${order.status.toUpperCase()}`);
      doc.moveDown();
      
      // Delivery address
      doc.fontSize(14).text('Delivery Address:');
      doc.fontSize(10);
      if (order.deliveryAddress) {
        doc.text(order.deliveryAddress.street);
        doc.text(`${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}`);
        doc.text(order.deliveryAddress.country);
      }
      doc.moveDown();
      
      // Items table header
      doc.fontSize(12).text('Order Items:', { underline: true });
      doc.moveDown(0.5);
      
      const tableTop = doc.y;
      const itemX = 50;
      const qtyX = 300;
      const priceX = 380;
      const totalX = 460;
      
      doc.fontSize(10);
      doc.text('Item', itemX, tableTop);
      doc.text('Qty', qtyX, tableTop);
      doc.text('Price', priceX, tableTop);
      doc.text('Total', totalX, tableTop);
      
      // Draw line
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();
      
      // Items
      let yPosition = doc.y;
      order.items.forEach((item, i) => {
        doc.text(item.name, itemX, yPosition);
        doc.text(item.quantity.toString(), qtyX, yPosition);
        doc.text(`$${item.price.toFixed(2)}`, priceX, yPosition);
        doc.text(`$${(item.price * item.quantity).toFixed(2)}`, totalX, yPosition);
        yPosition += 20;
      });
      
      doc.y = yPosition;
      doc.moveDown();
      
      // Pricing breakdown
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      
      const summaryX = 380;
      doc.text(`Subtotal:`, summaryX, doc.y);
      doc.text(`$${order.subtotal.toFixed(2)}`, totalX, doc.y);
      doc.moveDown(0.5);
      
      if (order.discount > 0) {
        doc.text(`Discount:`, summaryX, doc.y);
        doc.text(`-$${order.discount.toFixed(2)}`, totalX, doc.y);
        doc.moveDown(0.5);
      }
      
      doc.text(`Delivery Fee:`, summaryX, doc.y);
      doc.text(`$${order.deliveryFee.toFixed(2)}`, totalX, doc.y);
      doc.moveDown(0.5);
      
      if (order.surgeFee > 0) {
        doc.text(`Surge Fee:`, summaryX, doc.y);
        doc.text(`$${order.surgeFee.toFixed(2)}`, totalX, doc.y);
        doc.moveDown(0.5);
      }
      
      doc.text(`Tax:`, summaryX, doc.y);
      doc.text(`$${order.tax.toFixed(2)}`, totalX, doc.y);
      doc.moveDown(0.5);
      
      // Total
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Total Amount:`, summaryX, doc.y);
      doc.text(`$${order.totalAmount.toFixed(2)}`, totalX, doc.y);
      
      // Footer
      doc.moveDown(2);
      doc.fontSize(10).font('Helvetica');
      doc.text('Thank you for your order!', { align: 'center' });
      
      // Finalize PDF
      doc.end();
      
      stream.on('finish', () => {
        // In production, upload to S3 and return S3 URL
        // For now, return local path
        const invoiceUrl = `/invoices/${fileName}`;
        resolve(invoiceUrl);
      });
      
      stream.on('error', reject);
      
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInvoice
};
