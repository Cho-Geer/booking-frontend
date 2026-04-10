export const isBookingExpired = (appointmentDate: string, startTime: string) => {
  const nowJst = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const utcDate = new Date(appointmentDate);
  const jstDateStr = utcDate.toLocaleDateString('en-CA');
  const bookingTime = new Date(`${jstDateStr}T${startTime}:00+09:00`);
  return bookingTime < nowJst;
}

export const formatBookingDate = (date: string | undefined): string => {
    if (!date) return '-';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};