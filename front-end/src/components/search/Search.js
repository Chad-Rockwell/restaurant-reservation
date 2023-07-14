import React, { useState } from "react";
import ErrorAlert from "../../layout/ErrorAlert";
import { listReservations } from "../../utils/api";
import { Link } from "react-router-dom/cjs/react-router-dom.min";


export default function SearchPage() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [foundReservations, setFoundReservations] = useState([]);
  const [error, setError] = useState(null);
  const [showList, setShowList] = useState(false);

  const handleChange = (event) => {
    event.preventDefault();
    setMobileNumber(event.target.value);
  };

  const handleFind = (event) => {
    event.preventDefault();
    const ac = new AbortController();
    function findReservations() {
      const mobile_number = mobileNumber;
      listReservations({ mobile_number }, ac.signal)
        .then(setFoundReservations)
        .then(setShowList(true))
        .catch(setError);
    }
    findReservations();
    return () => ac.abort();
  };

  return (
    <>
      <div className="search search-title">
        <h1>Search Reservations</h1>
      </div>
      <div className="search search-error">
        <ErrorAlert error={error} />
      </div>

      <div className="search input-group">
        <label htmlFor="mobile_number">
          Mobile Number:
          <input
            id="mobile_number"
            className="form-control"
            name="mobile_number"
            type="text"
            required
            placeholder="Enter Mobile Number"
            onChange={handleChange}
            value={mobileNumber}
          />
        </label>
        <div className="input-group mb-3">
          <button
            className="btn btn-outline-dark"
            type="submit"
            onClick={handleFind}
          >Find
          </button>
        </div>
      </div>
      {showList ? (
        <div className="search search-results">
          {foundReservations.length ? (
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
              {foundReservations.map((reservation) => {
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
              )}
            </tbody>
          </table>
          ) : (
            <h4>No Reservations Found</h4>
          )}
        </div>
      ) : null}
    </>
  );
}