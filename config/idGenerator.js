export function generateStudentId() {
  const prefix = 'UC';
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `${prefix}-${year}-${random}`;
}
