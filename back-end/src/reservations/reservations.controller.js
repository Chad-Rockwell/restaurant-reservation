/**
 * List handler for reservation resources
 */
async function list(req, res) {
  res.json({
    data: [],
  });
}

async function makeReservation(req, res, next) {

}

module.exports = {
  list,
  makeReservation,
};
