import React from "react";
import { makeReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useEffect } from "react";

function CreateReservation() {
  // const numbers = Array.from({ length: 20 }, (_, index) => index + 1);
  const history = useHistory();
  const goBack = (event) => {
    event.preventDefault();
    history.goBack();
  };
  function handleChange({ target }) {
    setReservationRequest({
        ...reservationRequest,
        [target.name]: target.value,
    });
}
  const [reservationRequest, setReservationRequest] = useState({
    first_name: null,
    last_name: null,
    mobile_number: null,
    reservation_date: null,
    reservation_time: null,
    people: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [reservationsError, setReservationsError] = useState(null);

  const submitHandler = (event) => {
    event.preventDefault();
    setReservationsError(null);
    const validationErrors = [];

    const reservationDate = new Date(reservationRequest.reservation_date);
    const reservationDay = reservationDate.getUTCDay();
    if (reservationDay === 2) {
      validationErrors.push(new Error("Restaurant is closed on Tuesdays"));
    }

    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);
    if (reservationDate < currentDate) {
      validationErrors.push(new Error("Reservation date must be in the future"));
    }

    if (validationErrors.length > 0) {
      setReservationsError(validationErrors);
    } else if(validationErrors.length === 0) {
      setSubmitted(true);
    }
  };
  useEffect(() => {
    if(submitted) {
        console.log(reservationRequest);

        makeReservation(reservationRequest)
        .then((response) => {
          history.push(`/dashboard?date=${reservationRequest.reservation_date}`);
        })
        .catch((error) => {
          setReservationsError(error);
        });
    }

  }, [reservationRequest]);



  return (
    <div>
    <form onSubmit={(event) => submitHandler(event)}>
      <label htmlFor="first_name">First name</label>
      <input
        type="text"
        id="first_name"
        name="first_name"
        placeholder="First name"
        onChange={handleChange}
      ></input>
      <label htmlFor="last_name">Last name</label>
      <input
        type="text"
        id="last_name"
        name="last_name"
        placeholder="Last name"
        onChange={handleChange}
      ></input>
      <label htmlFor="mobile_number">Mobile number</label>
      <input
        type="text"
        id="mobile_number"
        name="mobile_number"
        placeholder="Mobile number"
        onChange={handleChange}
      ></input>
      <label htmlFor="reservation_date">Date of reservation</label>
      <input type="date" id="reservation_date" name="reservation_date" onChange={handleChange}></input>
      <label htmlFor="reservation_time">Time of reservation</label>
      <input type="time" id="reservation_time" name="reservation_time" onChange={handleChange}></input>
      <label htmlFor="people">Party size:</label>
      <input id="people" name="people" placeholder= "number of people in party" onChange={handleChange}>
      </input>
      {/* change people input to dropdown after tests pass */}
      {/* <select id="people" name="people" onChange={handleChange}>
        {numbers.map((number) => (
          <option key={number} value={number}>
            {number}
          </option>
        ))}
      </select> */}
      <button onClick={goBack}>Cancel</button>
      <button type="submit">Submit</button>
    </form>
    {reservationsError && (
  <>
    {reservationsError.map((error, index) => (
      <ErrorAlert key={index} error={error} />
    ))}
  </>
)}

    </div>
  );
}

export default CreateReservation;
