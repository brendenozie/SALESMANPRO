export const formatCreditCardNumber = (value) => {
  return value
    .replace(/\D/g, '') // Remove non-numeric characters
    .replace(/(\d{4})/g, '$1 ') // Add space every 4 digits
    .trim(); // Remove trailing space
};

export const formatExpirationDate = (value) => {
  return value
    .replace(/\D/g, '') // Remove non-numeric characters
    .replace(/(^\d{2})(\d{0,2})/, '$1/$2') // Format as MM/YY
    .trim();
};

export const formatCVC = (value) => {
  return value.replace(/\D/g, '').substring(0, 4); // Restrict to 4 digits
};
