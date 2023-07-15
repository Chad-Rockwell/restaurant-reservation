import React, { useState } from "react";
import ErrorAlert from "../../layout/ErrorAlert";
import { listReservations, changeReservationStatus } from "../../utils/api";
import { Link } from "react-router-dom/cjs/react-router-dom.min";


export default function Search() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [foundReservations, setFoundReservations] = useState([]);
  const [error, setError] = useState(null);
  const [showList, setShowList] = useState(false);
  const phoneRegExp = /^((\+[1-9]{1,4}[ -]*)|(\([0-9]{2,3}\)[ -]*)|([0-9]{2,4})[ -]*)*?[0-9]{3,4}?[ -]*[0-9]{3,4}?$/;

  const handleChange = (event) => {
    event.preventDefault();
    setError(null);
    setMobileNumber(event.target.value);
  };

  const handleFind = (event) => {
    event.preventDefault();
    const ac = new AbortController();
    
      const mobile_number = mobileNumber;
      if (!phoneRegExp.test(mobile_number)) {
        setError(new Error("Invalid mobile number"));
      }
      else {
        function findReservations() {
          listReservations({ mobile_number }, ac.signal)
          .then(setFoundReservations)
          .then(setShowList(true))
          .catch(setError);
      }
      findReservations();
      }

    return () => ac.abort();
  };

  const handleCancel = async (reservation) => {
    try {
      if (
        window.confirm(
          "Do you want to cancel this reservation? This cannot be undone."
        )
      ) {
        await changeReservationStatus(reservation, "cancelled");
        handleFind();

      }
    } catch (error) {
      setError(error);
    }
  }

  return (
    <>
      <div className="container text-center p-auto m-auto">
        <h1 className="display-4 font-weight-bold mt-5">Search Reservations</h1>
      </div>
      <div className="search search-error">
        <ErrorAlert error={error} />
      </div>

      <div className="container font-weight-bold text-center">
        <div className="col">
          <label htmlFor="mobile_number">
            Mobile Number:
            <input
              id="mobile_number"
              className="form-control text-center"
              name="mobile_number"
              type="text"
              required
              placeholder="Enter Mobile Number"
              onChange={handleChange}
              value={mobileNumber}
            />
          </label>
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-outline-dark"
              type="submit"
              onClick={handleFind}
            >
              Find
            </button>
          </div>
                </div>
        </div>
      {showList ? (
        <div className="table-responsive pt-5">
          {foundReservations.length ? (
            <div className="container">
              <table className="table table-striped table-hover table-bordered">
                <thead>
                  <tr>
                    <th scope="col" className="text-nowrap">First Name</th>
                    <th scope="col" className="text-nowrap">Last Name</th>
                    <th scope="col" className="text-nowrap">Time</th>
                    <th scope="col" className="text-nowrap">Party Size</th>
                    <th scope="col" className="text-nowrap">Status</th>
                    <th scope="col" className="text-nowrap">Actions</th>
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
                      <tr key={reservation_id} className="font-weight-bold text-nowrap">
                        <td>{first_name}</td>
                        <td>{last_name}</td>
                        <td>{formattedTime}</td>
                        <td>{people}</td>
                        <td data-reservation-id-status={reservation_id}>
                          {status}
                        </td>
                        <td>
                          {status === "booked" && (
                            <Link to={`/reservations/${reservation_id}/seat`} className="btn btn-success font-weight-bold">
                              Seat
                            </Link>
                          )}
                        </td>
                        <td>
                          <button className="cancel-button btn btn-danger font-weight-bold"
                            data-reservation-id-cancel={
                              reservation.reservation_id
                            }
                            onClick={() => handleCancel(reservation)}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <h4 className="text-center">No reservations found</h4>
          )}
        </div>
      ) : null}
    </>
  );
}
