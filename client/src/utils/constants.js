export const WHATSAPP_NUMBER = '919919919344';
export const WHATSAPP_DISPLAY = '+91 9919919344';
export const FOUNDER_PHONE = '+91 9919919344';
export const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/IPzZTg8DGAcHOg5qnaa9v3?mode=gi_t';
export const OFFICIAL_EMAIL = 'support.upvolt@gmail.com';
export const OFFICIAL_INSTAGRAM = 'https://www.instagram.com/upvolt_in/';
export const OFFICIAL_LINKEDIN = 'https://www.linkedin.com/company/upvolt-in/';

export const PRIORITY_BUYING_NUMBERS = [
  {
    raw: '919919919344',
    display: '+91 9919919344',
    label: 'Founder',
    tag: 'Priority 1 (Founder)',
    isFounder: true
  },
  {
    raw: '919651724906',
    display: '+91 96517 24906',
    label: 'Direct Order 1',
    tag: 'Priority 2',
    isFounder: false
  },
  {
    raw: '918077452474',
    display: '+91 80774 52474',
    label: 'Direct Order 2',
    tag: 'Priority 3',
    isFounder: false
  }
];

export const getWhatsAppLink = (message = 'Hi upVolt, I have a query regarding student components and project kits!', number = WHATSAPP_NUMBER) => {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

export const getProductWhatsAppLink = (product, number = WHATSAPP_NUMBER) => {
  const msg = `Hi upVolt! I want to order/buy: ${product.name} (Price: ₹${product.price}). Can you confirm availability and fast delivery?`;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
};
