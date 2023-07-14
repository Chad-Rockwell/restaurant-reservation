const knex = require("../db/connection");

function list() {
  return knex("tables").select("*").orderBy("table_name");
}

function read(table_id) {
  return knex("tables").select("*").where("table_id", table_id).first();
}

function create(tableData) {
  return knex("tables")
    .insert(tableData)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

function update(table_id, reservation_id) {
  return knex("tables").where("table_id", table_id).update({reservation_id});
}

function finish(table_id, reservation_id) {
  return knex.transaction(async (trx) => {
    await trx("reservations")
      .where({ reservation_id })
      .update({ status: "finished" });

    return trx("tables")
      .select("*")
      .where({ table_id: table_id })
      .update({ reservation_id: null }, "*")
      .then((updatedRecords) => updatedRecords[0]);
  });
}

module.exports = {
  list,
  create,
  read,
  update,
  finish,
};
