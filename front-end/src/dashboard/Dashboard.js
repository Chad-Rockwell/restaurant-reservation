import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [currentDate, setCurrentDate] = useState(date); // Add currentDate state

  useEffect(loadDashboard, [currentDate]); // Use currentDate in useEffect

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date: currentDate }, abortController.signal) // Use currentDate for fetching reservations
      .then(setReservations)
      .catch(setReservationsError);
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
        {/* Update to use currentDate */}
        <div>
          {reservations.map((reservation) => {
            const timeParts = reservation.reservation_time.split(":");
            const hours = parseInt(timeParts[0], 10);
            const minutes = parseInt(timeParts[1], 10);
            const period = hours >= 12 ? "PM" : "AM";
            const formattedHours = hours > 12 ? hours - 12 : hours;
            const formattedMinutes = minutes.toString().padStart(2, "0");
            const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;
            return (
              <p key={reservation.reservation_id}>
                {reservation.first_name} {reservation.last_name} {formattedTime} Party size: {reservation.people}
              </p>
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
      <ErrorAlert error={reservationsError} />
      {/* {JSON.stringify(reservations)} */}
    </main>
  );
}

export default Dashboard;
