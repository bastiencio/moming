import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Invoice } from '@/hooks/useInvoices';
import DOMPurify from 'dompurify';

export const generateInvoicePDF = async (invoice: Invoice) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Header - INVOICE / 出货合同
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', pageWidth / 2, 25, { align: 'center' });
  pdf.setFontSize(16);
  pdf.text('出货合同', pageWidth / 2, 35, { align: 'center' });
  
  // Company Info (Left Side) - 沫茗发酵所
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('沫茗发酵所', 20, 55);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('18819353462', 20, 65);
  pdf.text('marciaxiao@live.com', 20, 72);
  pdf.text('广州市越秀区东华东路市场南街10号自编之一', 20, 79);
  
  // Client Information (Right Side)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('收件方：', pageWidth - 90, 55);
  pdf.text('收件地址：', pageWidth - 90, 65);
  pdf.text('联系人：', pageWidth - 90, 75);
  pdf.text('联系电话：', pageWidth - 90, 85);

  pdf.setFont('helvetica', 'normal');
  if (invoice.client) {
    pdf.text(invoice.client.company_name || invoice.client.name, pageWidth - 60, 55);
    if (invoice.client.address) {
      const addressLines = pdf.splitTextToSize(invoice.client.address, 60);
      pdf.text(addressLines, pageWidth - 60, 65);
    }
    if (invoice.client.contact_person) {
      pdf.text(invoice.client.contact_person, pageWidth - 60, 75);
    }
    if (invoice.client.phone) {
      pdf.text(invoice.client.phone, pageWidth - 60, 85);
    }
  }
  
  // Product category and details
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('货品种类：康普茶', 20, 105);

  // Invoice details
  pdf.text(`P.O. Number: ${invoice.po_number || 'N/A'}`, 20, 120);
  
  // Items Table
  const tableStartY = 135;
  const rowHeight = 12;
  
  // Table header with blue background
  pdf.setFillColor(70, 82, 165); // Blue color similar to the image
  pdf.rect(20, tableStartY, pageWidth - 40, rowHeight, 'F');
  
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('名称', 25, tableStartY + 8);
  pdf.text('数量', 80, tableStartY + 8);
  pdf.text('单价', 110, tableStartY + 8);
  pdf.text('单位', 135, tableStartY + 8);
  pdf.text('总价', 160, tableStartY + 8);
  pdf.text('备注', pageWidth - 25, tableStartY + 8);
  
  // Items
  pdf.setTextColor(0, 0, 0); // Black text
  pdf.setFont('helvetica', 'normal');
  let currentY = tableStartY + rowHeight + 5;
  
  if (invoice.invoice_items) {
    invoice.invoice_items.forEach((item, index) => {
      if (currentY > pageHeight - 100) {
        pdf.addPage();
        currentY = 20;
      }
      
      // Add border lines
      pdf.line(20, currentY - 5, pageWidth - 20, currentY - 5);
      
      pdf.text(item.product.name, 25, currentY);
      pdf.text(item.quantity.toString(), 80, currentY);
      pdf.text(`¥ ${item.unit_price.toFixed(0)}`, 110, currentY);
      pdf.text('瓶', 135, currentY);
      pdf.text(`¥ ${item.total_price.toFixed(0)}`, 160, currentY);
      
      currentY += rowHeight;
    });
  }
  
  // Bottom border
  pdf.line(20, currentY - 5, pageWidth - 20, currentY - 5);
  
  // Total
  currentY += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.text('总计', 120, currentY);
  pdf.text(`¥ ${invoice.total_amount.toFixed(0)}`, 160, currentY);
  
  // Signature sections
  currentY += 30;
  pdf.setFont('helvetica', 'normal');
  pdf.text('采购方签名（盖章）：', 20, currentY);
  pdf.text('销售方签名（盖章）：', 120, currentY);
  
  currentY += 20;
  pdf.text('收货人：', 20, currentY);
  pdf.text('收货日期：', 120, currentY);
  
  // Company account information
  currentY += 40;
  pdf.setFont('helvetica', 'bold');
  pdf.text('公司账户', 20, currentY);
  
  currentY += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.text('开户名：爱沫（广州）发酵研究有限公司', 20, currentY);
  
  currentY += 8;
  pdf.text('开户行：中国工商银行股份有限公司广州庙前直街支行', 20, currentY);
  
  currentY += 8;
  pdf.text('账号：3602001009200835963', 20, currentY);
  
  // Save the PDF
  const fileName = `invoice-${invoice.invoice_number}.pdf`;
  pdf.save(fileName);
};

export const generateInvoicePNG = async (invoice: Invoice) => {
  const htmlContent = generateInvoiceHTML(invoice);
  
  // Create a temporary div element to render the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = DOMPurify.sanitize(htmlContent);
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '800px';
  document.body.appendChild(tempDiv);
  
  try {
    // Generate canvas from the HTML element
    const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      width: 800,
      height: tempDiv.firstElementChild!.scrollHeight
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = `invoice-${invoice.invoice_number}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
};

export const generateInvoiceHTML = (invoice: Invoice): string => {
  return `
    <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #4e52a5; padding-bottom: 20px;">
        <div style="display: flex; justify-content: flex-start;">
          <img src="https://moming.lovable.app/lovable-uploads/4051c261-2a6f-4fc3-89b8-676e7fb3be4b.png" alt="Morning Kombucha Logo" style="height: 240px; width: auto;" />
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; text-align: right;">
          <h2 style="color: #2c3e50; margin: 0; font-size: 20px;">INVOICE</h2>
          <h2 style="color: #2c3e50; margin: 5px 0 0 0; font-size: 18px;">出货合同</h2>
        </div>
      </div>
      
      <!-- Company and Client Information -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="flex: 1;">
          <h3 style="color: #4e52a5; font-size: 18px; margin-bottom: 10px;">沫茗发酵所</h3>
          <p style="margin: 5px 0; line-height: 1.6;">
            18819353462<br>
            marciaxiao@live.com<br>
            广州市越秀区东华东路市场南街10号自编之一
          </p>
        </div>
        <div style="flex: 1; text-align: left; margin-left: 40px;">
          <p style="margin: 5px 0; line-height: 1.8;">
            <strong>收件方：</strong> ${invoice.client?.company_name || invoice.client?.name || 'N/A'}<br>
            <strong>收件地址：</strong> ${invoice.client?.address || 'N/A'}<br>
            <strong>联系人：</strong> ${invoice.client?.contact_person || 'N/A'}<br>
            <strong>联系电话：</strong> ${invoice.client?.phone || 'N/A'}
          </p>
        </div>
      </div>
      
      <!-- Product Information -->
      <div style="margin-bottom: 20px;">
        <p style="margin: 5px 0;">
          <strong>货品种类：</strong> 康普茶<br>
          <strong>P.O. Number:</strong> ${invoice.po_number || 'N/A'}
        </p>
      </div>
      
      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 2px solid #4e52a5;">
        <thead>
          <tr style="background-color: #4e52a5; color: white;">
            <th style="border: 1px solid #4e52a5; padding: 12px; text-align: left;">名称</th>
            <th style="border: 1px solid #4e52a5; padding: 12px; text-align: center;">数量</th>
            <th style="border: 1px solid #4e52a5; padding: 12px; text-align: center;">单价</th>
            <th style="border: 1px solid #4e52a5; padding: 12px; text-align: center;">单位</th>
            <th style="border: 1px solid #4e52a5; padding: 12px; text-align: center;">总价</th>
            <th style="border: 1px solid #4e52a5; padding: 12px; text-align: center;">备注</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.invoice_items?.map(item => `
            <tr>
              <td style="border: 1px solid #dee2e6; padding: 12px;">${item.product.name}</td>
              <td style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">${item.quantity}</td>
              <td style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">¥ ${item.unit_price.toFixed(0)}</td>
              <td style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">瓶</td>
              <td style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">¥ ${item.total_price.toFixed(0)}</td>
              <td style="border: 1px solid #dee2e6; padding: 12px; text-align: center;"></td>
            </tr>
          `).join('') || ''}
          <tr style="border-top: 2px solid #4e52a5;">
            <td colspan="4" style="border: 1px solid #dee2e6; padding: 12px; text-align: center; font-weight: bold;">总计</td>
            <td style="border: 1px solid #dee2e6; padding: 12px; text-align: center; font-weight: bold;">¥ ${invoice.total_amount.toFixed(0)}</td>
            <td style="border: 1px solid #dee2e6; padding: 12px;"></td>
          </tr>
        </tbody>
      </table>
      
      <!-- Signature Section -->
      <div style="display: flex; justify-content: space-between; margin: 40px 0;">
        <div style="flex: 1;">
          <p><strong>采购方签名（盖章）：</strong></p>
          <div style="height: 40px; border-bottom: 1px solid #ccc; margin: 10px 0;"></div>
          <p><strong>收货人：</strong></p>
          <div style="height: 30px; border-bottom: 1px solid #ccc; margin: 10px 0;"></div>
        </div>
        <div style="flex: 1; margin-left: 40px;">
          <p><strong>销售方签名（盖章）：</strong></p>
          <div style="height: 40px; border-bottom: 1px solid #ccc; margin: 10px 0;"></div>
          <p><strong>收货日期：</strong></p>
          <div style="height: 30px; border-bottom: 1px solid #ccc; margin: 10px 0;"></div>
        </div>
      </div>
      
      <!-- Company Account Information -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #4e52a5;">
        <h3 style="color: #4e52a5; margin-bottom: 15px;">公司账户</h3>
        <p style="line-height: 1.8; margin: 0;">
          <strong>开户名：</strong> 爱沫（广州）发酵研究有限公司<br>
          <strong>开户行：</strong> 中国工商银行股份有限公司广州庙前直街支行<br>
          <strong>账号：</strong> 3602001009200835963
        </p>
      </div>
      
      ${invoice.notes ? `
        <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #4e52a5;">
          <h4 style="color: #4e52a5; margin-bottom: 10px;">备注:</h4>
          <p style="margin: 0;">${invoice.notes}</p>
        </div>
      ` : ''}
    </div>
  `;
};