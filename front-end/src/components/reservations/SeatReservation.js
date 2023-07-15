import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { readReservation, listTables, seatReservation, changeReservationStatus } from "../../utils/api";
import ErrorAlert from "../../layout/ErrorAlert";

export default function SeatReservation() {
  const [currentReservation, setCurrentReservation] = useState({});
  const [reservationError, setReservationError] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  const [tableId, setTableId] = useState("");
  const [seatingErrors, setSeatingErrors] = useState(null);

  const { reservation_id } = useParams();

  const history = useHistory();

  useEffect(loadData, [reservation_id]);

  // Function to load reservation and available tables data
  function loadData() {
    const abortController = new AbortController();
    setReservationError(null);
    
    // Load reservation data
    readReservation(reservation_id, abortController.signal)
      .then(setCurrentReservation)
      .catch(setReservationError);
      
    // Load available tables data
    listTables(abortController.signal)
      .then(setAvailableTables)
      .catch(setReservationError);
      
    return () => abortController.abort();
  }

  // Event handler for select change
  const handleSelectChange = (event) => {
    event.preventDefault();
    setTableId(event.target.value);
  };

  // Event handler for cancel button click
  const handleCancel = (event) => {
    event.preventDefault();
    history.goBack(); // Navigate back to the previous page
  };

  // Event handler for form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSeatingErrors(null);
    const ac = new AbortController();
    
    try {
      await seatReservation(reservation_id, tableId, ac.signal);
      await changeReservationStatus(currentReservation, "seated");
      history.push(`/dashboard`); // Navigate to the dashboard after successful submission
    } catch (error) {
      console.log(error);
      setSeatingErrors(error);
    }
    
    return () => ac.abort();
  };

  if (Object.keys(currentReservation).length && availableTables.length) {
    return (
      <div className="container mt-5 p-5">
        {/* Seat Reservation Title */}
        <div className="d-flex justify-content-center p-4">
          <h1 className="header">Seat Reservation</h1>
        </div>
        
        <div className="container">
          {/* Reservation Information */}
          <div className="container">
            <h3 className="text-center">
              #{currentReservation.reservation_id} -{" "}
              {currentReservation.first_name} {currentReservation.last_name} on{" "}
              {currentReservation.reservation_date.split("T")[0]} at{" "}
              {currentReservation.reservation_time} for{" "}
              {currentReservation.people}
            </h3>
          </div>
          
          {/* Seating Errors */}
          <ErrorAlert error={seatingErrors} />
          
          {/* Seat Selection Form */}
          <div className="container p-5">
            <label  className="font-weight-bold" htmlFor="table_id">Seat at:</label>
            <select
              name="table_id"
              id="table_id"
              className="form-control"
              onChange={handleSelectChange}
              value={tableId}
            >
              <option value="">Select A Table</option>
              {availableTables.map((table) => (
                <option key={table.table_id} value={table.table_id}>
                  {table.table_name} - {table.capacity}
                </option>
              ))}
            </select>
          </div>
          
          {/* Seat Options */}
          <div className="d-flex justify-content-center">
            <div>
              <button
                type="button"
                className="btn btn-secondary mr-2"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
            <div>
              <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <h2 className="text-center">{reservationError}</h2>;
  }
}
