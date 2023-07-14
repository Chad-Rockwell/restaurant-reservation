/**
 * List handler for reservation resources
 */
const service = require("./tables.service");
const reservationsService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res, next) {
  const data = await service.list();
  res.json({ data });
}

async function create(req, res, next) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

async function update(req, res, next) {
const {reservation_id} = res.locals.reservation;
const {table_id} = req.params;
const data = await service.update(table_id, reservation_id);
res.status(200).json({data});
}

//helper functions
let fields = ["table_name", "capacity"];

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

function validateTableName(req, res, next) {
  const { table_name } = req.body.data;
  if (table_name.length < 2) {
    next({
      status: 400,
      message: "table_name must be at least 2 characters long",
    });
  } else {
    next();
  }
}

function validateTableCapacity(req, res, next) {
  const { capacity } = req.body.data;
  if (typeof capacity !== "number") {
    next({
      status: 400,
      message: `Invalid, capacity must be a number: ${capacity}`,
    });
  } else {
    next();
  }
}

async function validateReservationId(req, res, next) {
  const {reservation_id} = req.body.data;
  if(!reservation_id) {
    next({status: 400, message: "request data must contain a reservation_id"});
  }
  else {
    const data = await reservationsService.read(reservation_id);
    if(!data) {
      next({status: 404, message: `could not find reservation with reservation_id: ${reservation_id}`});
    }
    else {
      res.locals.reservation = data;
      next();
    }
  }
}

async function validateCapacityAndAvailability(req, res, next) {
  const {table_id} = req.params;
  const data = await service.read(table_id);
  if(!data) {
    next({status: 404, message: `No tables found with table_id: ${table_id}`});
  }
  else {
    console.log(data);
    res.locals.table = data;
    if(res.locals.reservation.people > res.locals.table.capacity) {
      next({status: 400, message: "This reservations party size exceeds the tables capacity"});
    }
    if(res.locals.table.reservation_id !== null) {
      next({status: 400, message: "Table is already occupied"});
    }
    else {
      next();
    }
  }

}



module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    validateDataExists,
    ...fields.map(createValidatorFor),
    validateTableName,
    validateTableCapacity,
    asyncErrorBoundary(create),
  ],
  update: [validateDataExists, asyncErrorBoundary(validateReservationId), asyncErrorBoundary(validateCapacityAndAvailability), asyncErrorBoundary(update)],
};
