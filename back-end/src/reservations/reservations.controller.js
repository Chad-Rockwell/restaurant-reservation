/**
 * List handler for reservation resources
 */
const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  const { date } = req.query;
  const data = await service.list(date);
  res.json({
    data,
  });
}

async function create(req, res, next) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

//helper functions
let fields = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

function validateDataExists(req, res, next) {
  if (req.body.data) {
    next();
  } else {
    next({
      status: 400,
      message: `Please include a data object in your request body. ${req}`,
    });
  }
}

function createValidatorFor(field) {
  return function (req, res, next) {
    if (req.body.data[field]) {
      next();
    } else {
      next({
        status: 400,
        message: `Please include ${field} in the request data`,
      });
    }
  };
}

function validateSpecific(req, res, next) {
  const { people, reservation_time, reservation_date } = req.body.data;
  const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  const reservationDate = new Date(reservation_date);
  const reservationDay = reservationDate.getUTCDay();
  const currentDate = new Date();
  const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();
  const reservationDateTime = new Date(
    `${reservation_date}T${reservation_time}`
  );
  const reservationTime =
    reservationDateTime.getHours() * 60 + reservationDateTime.getMinutes();
  if (isNaN(Date.parse(reservation_date))) {
    next({
      status: 400,
      message: `Invalid reservation_date: ${reservation_date}`,
    });
  }

  if (reservationDay === 2) {
    next({ status: 400, message: `Restaurant is closed on Tuesdays` });
  }

  currentDate.setUTCHours(0, 0, 0, 0);
  const isPastDate = reservationDateTime < currentDate;
  const isSameDateAndPastTime =
    reservationDateTime.toISOString() < currentDate.toISOString() &&
    reservationTime < currentTime;
  if (isPastDate || isSameDateAndPastTime) {
    next({ status: 400, message: `Reservation date must be in the future` });
  }

  if (reservationTime < 630 || reservationTime > 1350) {
    next({
      status: 400,
      message: "Reservation time must be between 10:30 AM and 9:30 PM",
    });
  }

  if (!timeRegex.test(reservation_time)) {
    next({
      status: 400,
      message: `Invalid reservation_time: ${reservation_time}`,
    });
  }
  if (typeof people !== "number") {
    next({
      status: 400,
      message: `Invalid, people must be a number: ${people}`,
    });
  } else {
    next();
  }
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    validateDataExists,
    ...fields.map(createValidatorFor),
    validateSpecific,
    asyncErrorBoundary(create),
  ],
};
