/**
 * List handler for reservation resources
 */
const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  const { date } = req.query;
  if (req.query.mobile_number) {
    const data = await service.search(req.query.mobile_number);
    res.json({ data });
  } else {
    const data = await service.list(date);
    res.json({
      data,
    });
  }
}

async function create(req, res, next) {
  const data = await service.create(req.body.data);
  if (data.status !== "booked") {
    next({ status: 400, message: `status cannot be ${data.status}` });
  }
  res.status(201).json({ data });
}

async function read(req, res, next) {
  const { reservation_id } = req.params;
  if (!reservation_id) {
    next({
      status: 404,
      message: `reservation_id is required`,
    });
  } else {
    const data = await service.read(reservation_id);
    if (data) {
      res.status(200).json({ data });
    } else {
      next({ status: 404, message: `no reservation found with that id: ${reservation_id}`});
    }
  }
}

async function update(req, res, next) {
  const { reservation_id } = req.params;
  const updatedReservation = {
    ...req.body.data,
    reservation_id: reservation_id,
  };
  const data = await service.read(reservation_id);
  if (!data) {
    next({
      status: 404,
      message: `no request found with request_id: ${reservation_id}`,
    });
  } else {
    if (data.status === "booked") {
      const updated = await service.update(updatedReservation);
      res.json({ data: updated });
    } else {
      next({
        status: 400,
        message: "You can only update reservations with a booked status.",
      });
    }
  }
}

async function updateStatus(req, res, next) {
  const reservation = res.locals.reservation;
  const { status } = req.body.data;
  const updatedReservation = {
    ...reservation,
    status,
  };
  const data = await service.updateStatus(updatedReservation);
  res.json({ data });
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

async function validateStatus(req, res, next) {
  const { status } = req.body.data;
  const { reservation_id } = req.params; // Extract reservation_id from req.params
  const foundReservation = await service.read(reservation_id);
  if (foundReservation) {
    res.locals.reservation = foundReservation;
    if (foundReservation.status === "finished") {
      next({
        status: 400,
        message: "A finished reservation cannot be updated",
      });
    }
    const validStatusList = ["booked", "seated", "finished", "cancelled"];
    if (validStatusList.includes(status)) {
      next();
    } else {
      next({
        status: 400,
        message: `unknown status: ${status}`,
      });
    }
  } else {
    next({
      status: 404,
      message: `No reservation found with reservation_id: ${reservation_id}`,
    });
  }
}

function validateTime(req, res, next) {
  const { reservation_time } = req.body.data;
  const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

  if (!timeRegex.test(reservation_time)) {
    next({
      status: 400,
      message: "Invalid reservation_time format.",
    });
  }

  next();
}

module.exports = {
  list: asyncErrorBoundary(list),
  read: asyncErrorBoundary(read),
  create: [
    validateDataExists,
    ...fields.map(createValidatorFor),
    validateTime,
    validateSpecific,
    asyncErrorBoundary(create),
  ],
  updateStatus: [
    validateDataExists,
    asyncErrorBoundary(validateStatus),
    asyncErrorBoundary(updateStatus),
  ],
  update: [
    validateDataExists,
    ...fields.map(createValidatorFor),
    validateTime,
    validateSpecific,
    asyncErrorBoundary(update),
  ],
};
