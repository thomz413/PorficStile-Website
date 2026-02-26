// lib/whatsapp.ts
export interface WhatsAppMessageConfig {
  type: 'product_inquiry' | 'general_inquiry' | 'bulk_order' | 'stock_notification' | 'custom_order' | 'collaboration' | 'price_inquiry';
  productName?: string;
  productPrice?: number;
  currency?: string;
  size?: string;
  quantity?: number;
  category?: string;
  customMessage?: string;
  businessType?: 'retail' | 'wholesale' | 'dropshipping' | 'brand';
}

export interface ProductInfo {
  nombre: string;
  precio?: number;
  categoria?: string;
  enOferta?: boolean;
  precioDescuento?: number;
  porcentajeDescuento?: number;
  descripcion?: string;
}

export function generateWhatsAppMessage(config: WhatsAppMessageConfig): string {
  const { type, productName, productPrice, currency, size, quantity, category, customMessage, businessType } = config;
  
  const timestamp = new Date().toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let message = '';

  switch (type) {
    case 'product_inquiry':
      message = `🛍️ *CONSULTA DE PRODUCTO*
      
📅 ${timestamp}

🔹 *Producto:* ${productName || 'No especificado'}
${productPrice ? `💰 *Precio:* ${currency || 'S/.'} ${productPrice.toFixed(2)}` : ''}
${size ? `📏 *Talla:* ${size}` : ''}
${quantity ? `🔢 *Cantidad:* ${quantity}` : ''}
${category ? `🏷️ *Categoría:* ${category}` : ''}

❓ *¿Qué información necesitas?*
• ¿Tienen stock disponible?
• ¿Cuáles son las formas de pago?
• ¿Hacen envíos a mi ciudad?
• ¿Hay descuentos por volumen?
• ¿Cuál es el tiempo de entrega?

💬 *Escribe tu consulta específica aquí:*

---
📞 *Moda Peru - Ropa y Textiles Peruanos*
🌐 www.modaperu.com`;

      break;

    case 'bulk_order':
      message = `📦 *PEDIDO AL POR MAYOR*
      
📅 ${timestamp}

🏢 *Tipo de negocio:* ${businessType === 'retail' ? 'Tienda minorista' : businessType === 'wholesale' ? 'Distribuidor mayorista' : businessType === 'dropshipping' ? 'Dropshipping' : 'Marca propia'}

${productName ? `🔹 *Producto(s) de interés:* ${productName}` : ''}
${quantity ? `📊 *Cantidad estimada:* ${quantity} unidades` : ''}
${category ? `🏷️ *Categoría:* ${category}` : ''}

💼 *Información que necesitamos:*
• ¿Cuál es tu negocio y dónde está ubicado?
• ¿Qué volumen de compras mensual necesitas?
• ¿Buscas catálogo completo o productos específicos?
• ¿Necesitas personalización o etiquetado propio?

🎯 *Beneficios para mayoristas:*
• Descuentos progresivos por volumen
• Prioridad en producción
• Opciones de financiamiento
• Soporte personalizado

💬 *Cuéntanos más sobre tu proyecto:*

---
📞 *Moda Peru - Ventas Corporativas*
🌐 www.modaperu.com`;

      break;

    case 'stock_notification':
      message = `🔔 *NOTIFICACIÓN DE STOCK*
      
📅 ${timestamp}

🔹 *Producto:* ${productName || 'No especificado'}

✅ *¡Estoy interesado/a!*
Por favor, avísenme cuando este producto esté disponible nuevamente.

📱 *Mis datos de contacto:*
• Nombre: [Tu nombre]
• WhatsApp: [Tu número - opcional]
• Email: [Tu email - opcional]

📦 *Información de pedido:*
${quantity ? `• Cantidad deseada: ${quantity} unidades` : ''}
${size ? `• Talla requerida: ${size}` : ''}

⚡ *¿Necesitas algo más?*
• ¿Quieres que te avisen por otros medios?
• ¿Tienes fecha límite para recibirlo?
• ¿Necesitas productos similares?

💬 *Deja tus datos y te contactaremos:*

---
📞 *Moda Peru - Servicio al Cliente*
🌐 www.modaperu.com`;

      break;

    case 'custom_order':
      message = `🎨 *PEDIDO PERSONALIZADO*
      
📅 ${timestamp}

👔 *Tipo de personalización:*
• Diseño propio
• Logo/branding
• Colores específicos
• Tallas especiales
• Materiales personalizados

${productName ? `🔹 *Producto base:* ${productName}` : ''}
${quantity ? `📊 *Cantidad:* ${quantity} unidades` : ''}

📋 *Detalles del proyecto:*
• Describe tu idea o requisito
• Adjunta referencias si tienes
• Menciona fecha límite
• Presupuesto estimado (opcional)

🎯 *Nuestro proceso:*
1. Consulta inicial (gratis)
2. Diseño y cotización
3. Aprobación de muestra
4. Producción
5. Entrega

💬 *Cuéntanos sobre tu proyecto:*

---
📞 *Moda Peru - Producción Personalizada*
🌐 www.modaperu.com`;

      break;

    case 'collaboration':
      message = `🤝 *COLABORACIÓN / MARCA BLANCA*
      
📅 ${timestamp}

🏷️ *Tipo de colaboración:*
• Marca blanca (producción para tu marca)
• Distribución exclusiva
• Diseño conjunto
• Dropshipping
• Franquicia

${businessType ? `🏢 *Tu negocio:* ${businessType}` : ''}

📋 *Sobre tu proyecto:*
• Describe tu marca o negocio
• ¿Qué tipo de productos necesitas?
• ¿Cuál es tu mercado objetivo?
• Volumen estimado mensual

🎯 *¿Qué ofrecemos?*
• Producción de alta calidad
• Diseño y desarrollo
• Logística y distribución
• Soporte continuo
• Precios competitivos

💬 *Cuéntanos más sobre tu marca:*

---
📞 *Moda Peru - Desarrollo de Negocios*
🌐 www.modaperu.com`;

      break;

    case 'price_inquiry':
      message = `💰 *CONSULTA DE PRECIOS*
      
📅 ${timestamp}

${productName ? `🔹 *Producto(s):* ${productName}` : ''}
${category ? `🏷️ *Categoría:* ${category}` : ''}

💵 *Información que necesitas:*
• Lista de precios actualizada
• Descuentos por volumen
• Precios para distribuidores
• Costos de envío
• Formas de pago

📊 *Para cotizar mejor:*
• ¿Qué cantidad necesitas?
• ¿Es para revender o uso personal?
• ¿A qué país/ciudad se envía?
• ¿Con qué frecuencia comprarás?

💬 *Especifica qué productos te interesan:*

---
📞 *Moda Peru - Ventas*
🌐 www.modaperu.com`;

      break;

    case 'general_inquiry':
    default:
      message = `👋 *CONSULTA GENERAL*
      
📅 ${timestamp}

🔍 *Tipo de consulta:*
• Información de productos
• Tiempos de entrega
• Métodos de pago
• Envíos internacionales
• Política de devoluciones
• Atención al cliente

${productName ? `🔹 *Producto de interés:* ${productName}` : ''}
${category ? `🏷️ *Categoría:* ${category}` : ''}

💬 *¿En qué podemos ayudarte?*
• Escribe tu pregunta específica
• Menciona si eres cliente nuevo
• Indica tu país/ciudad para envíos

⏰ *Horario de atención:*
• Lunes a Viernes: 9:00 AM - 6:00 PM
• Sábados: 9:00 AM - 2:00 PM
• Domingos: Cerrado

💬 *Escribe tu consulta:*

---
📞 *Moda Peru - Atención al Cliente*
🌐 www.modaperu.com`;
  }

  return message;
}

// Helper function to create product-specific messages
export function createProductMessage(
  product: ProductInfo,
  quantity: number = 1,
  size?: string,
  customNote?: string
): string {
  const config: WhatsAppMessageConfig = {
    type: 'product_inquiry',
    productName: product.nombre,
    productPrice: product.enOferta && product.precioDescuento ? product.precioDescuento : product.precio,
    category: product.categoria,
    quantity,
    size,
    customMessage: customNote
  };

  return generateWhatsAppMessage(config);
}

// Helper function for bulk orders
export function createBulkOrderMessage(
  products: string[],
  businessType: 'retail' | 'wholesale' | 'dropshipping' | 'brand',
  estimatedQuantity?: number
): string {
  const config: WhatsAppMessageConfig = {
    type: 'bulk_order',
    productName: products.join(', '),
    businessType,
    quantity: estimatedQuantity
  };

  return generateWhatsAppMessage(config);
}

// Helper function for stock notifications
export function createStockNotificationMessage(
  productName: string,
  quantity?: number,
  size?: string
): string {
  const config: WhatsAppMessageConfig = {
    type: 'stock_notification',
    productName,
    quantity,
    size
  };

  return generateWhatsAppMessage(config);
}
