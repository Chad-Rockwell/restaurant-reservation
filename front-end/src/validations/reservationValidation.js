const phoneRegExp = /^((\+[1-9]{1,4}[ -]*)|(\([0-9]{2,3}\)[ -]*)|([0-9]{2,4})[ -]*)*?[0-9]{3,4}?[ -]*[0-9]{3,4}?$/;

export function reservationRequestValidation(request = {}) {
  const validationErrors = [];
  const { mobile_number, reservation_time, reservation_date } = request;
  const reservationDate = new Date(reservation_date);
  const reservationDay = reservationDate.getUTCDay();
  const currentDate = new Date();
  const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();
  const reservationDateTime = new Date(
    `${reservation_date}T${reservation_time}`
  );
  const reservationTime =
    reservationDateTime.getHours() * 60 + reservationDateTime.getMinutes();

  if (reservationDay === 2) {
    validationErrors.push(new Error("Restaurant is closed on Tuesdays"));
  }
  if (reservationTime < 630 || reservationTime > 1350) {
    validationErrors.push(
      new Error("Reservation time must be between 10:30 AM and 9:30 PM")
    );
  }
  const closeTime = 1260;
  const minutesToClose = closeTime - reservationTime;
  if (minutesToClose < 60) {
    validationErrors.push(new Error("Reservation time is too close to the closing time"));
  }

  currentDate.setUTCHours(0, 0, 0, 0);
  const isPastDate = reservationDateTime < currentDate;
  const isSameDateAndPastTime =
    reservationDateTime.toISOString() < currentDate.toISOString() &&
    reservationTime < currentTime;
  if (isPastDate || isSameDateAndPastTime) {
    validationErrors.push(
      new Error("Reservation date and time must be in the future")
    );
  }

  if (!phoneRegExp.test(mobile_number)) {
    validationErrors.push(new Error("Invalid mobile number"));
  }
  return validationErrors;
}
