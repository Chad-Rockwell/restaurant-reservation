const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

export function reservationRequestValidation(request = {}) {
  const validationErrors = [];
  const { mobile_number, reservation_time, reservation_date } = request;
  const reservationDate = new Date(reservation_date);
  const reservationDay = reservationDate.getUTCDay();
  const currentDate = new Date();

  if (reservationDay === 2) {
    validationErrors.push(new Error("Restaurant is closed on Tuesdays"));
  }

  currentDate.setUTCHours(0, 0, 0, 0);
  if (reservationDate < currentDate) {
    validationErrors.push(new Error(`Reservation date must be in the future`));
  }
  if (!phoneRegExp.test(mobile_number)) {
    validationErrors.push(new Error('Invalid mobile number'));
  }
  return validationErrors;
}
