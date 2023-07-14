import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../../utils/api";
import ErrorAlert from "../../layout/ErrorAlert";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  // const [tablesError, setTablesError] = useState(null);
  const [currentDate, setCurrentDate] = useState(date); // Add currentDate state

  useEffect(loadDashboard, [currentDate]); // Use currentDate in useEffect

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date: currentDate }, abortController.signal) // Use currentDate for fetching reservations
      .then(setReservations)
      .catch(setReservationsError);
    listTables(abortController.signal)
      .then(setTables)
      // .catch(setTablesError);
    return () => abortController.abort();
  }

  function handlePrevious() {
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);
    setCurrentDate(previousDate.toISOString().split("T")[0]);
  }

  function handleNext() {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentDate(nextDate.toISOString().split("T")[0]);
  }

  function handleToday() {
    const today = new Date().toISOString().split("T")[0];
    setCurrentDate(today);
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date {currentDate}</h4>{" "}
        <div>
          {reservations.map((reservation) => {
            const { reservation_id } = reservation;
            const timeParts = reservation.reservation_time.split(":");
            const hours = parseInt(timeParts[0], 10);
            const minutes = parseInt(timeParts[1], 10);
            const period = hours >= 12 ? "PM" : "AM";
            const formattedHours = hours > 12 ? hours - 12 : hours;
            const formattedMinutes = minutes.toString().padStart(2, "0");
            const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;
            return (
              <div key={reservation_id}>
                <p>
                  {reservation.first_name} {reservation.last_name} {formattedTime} Party size: {reservation.people}
                </p>
                <Link to={`/reservations/${reservation_id}/seat`}>Seat</Link>
              </div>
            );
          })}
        </div>
        <div className="ml-auto">
          <button className="btn btn-primary mr-2" onClick={handlePrevious}>
            Previous
          </button>
          <button className="btn btn-primary mr-2" onClick={handleToday}>
            Today
          </button>
          <button className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
      <div>
        <h4>Tables</h4>
        <table>
          <thead>
            <tr>
              <th>Table Name</th>
              <th>Capacity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => {
              const status = table.reservation_id ? "Occupied" : "Free";
              return (
                <tr key={table.table_id}>
                  <td>{table.table_name}</td>
                  <td>{table.capacity}</td>
                  <td data-table-id-status={table.table_id}>{status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
  
      <ErrorAlert error={reservationsError} />
      {/* {JSON.stringify(reservations)} */}
    </main>
  );
}

export default Dashboard;
