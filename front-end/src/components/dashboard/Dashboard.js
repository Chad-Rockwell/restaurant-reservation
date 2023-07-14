import React, { useEffect, useState } from "react";
import { listReservations, listTables, finishTable } from "../../utils/api";
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
  const [tablesError, setTablesError] = useState(null);
  const [currentDate, setCurrentDate] = useState(date); // Add currentDate state

  useEffect(loadDashboard, [currentDate]); // Use currentDate in useEffect

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date: currentDate }, abortController.signal) // Use currentDate for fetching reservations
      .then(setReservations)
      .catch(setReservationsError);
    listTables(abortController.signal).then(setTables).catch(setTablesError);
    return () => abortController.abort();
  }

  const handleFinish = async (table_id) => {
    try {
      if (
        window.confirm(
          "Is this table ready to seat new guests? This cannot be undone."
        )
      ) {
        await finishTable(table_id);
        loadDashboard();
      }
    } catch (error) {
      setTablesError(error);
    }
  };

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
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Time</th>
                <th>Party Size</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => {
                const {
                  reservation_id,
                  first_name,
                  last_name,
                  reservation_time,
                  people,
                  status,
                } = reservation;
                const timeParts = reservation_time.split(":");
                const hours = parseInt(timeParts[0], 10);
                const minutes = parseInt(timeParts[1], 10);
                const period = hours >= 12 ? "PM" : "AM";
                const formattedHours = hours > 12 ? hours - 12 : hours;
                const formattedMinutes = minutes.toString().padStart(2, "0");
                const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;

                if (reservation.status !== "finished") {
                  return (
                    <tr key={reservation_id}>
                      <td>{first_name}</td>
                      <td>{last_name}</td>
                      <td>{formattedTime}</td>
                      <td>{people}</td>
                      <td data-reservation-id-status={reservation_id}>
                        {status}
                      </td>
                      <td>
                        {status === "booked" && (
                          <Link to={`/reservations/${reservation_id}/seat`}>
                            Seat
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
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
              <th>Actions</th> {/* Add a new table header for Actions */}
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
                  <td>
                    {table.reservation_id /* Only show the Finish button if the table is occupied */ && (
                      <button
                        className="btn btn-danger"
                        data-table-id-finish={
                          table.table_id
                        } /* Add the data-table-id-finish attribute */
                        onClick={() => handleFinish(table.table_id)}
                      >
                        Finish
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />
      {/* {JSON.stringify(reservations)} */}
    </main>
  );
}

export default Dashboard;
