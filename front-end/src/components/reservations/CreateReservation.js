import React from "react";
import { makeReservation } from "../../utils/api";
import ErrorAlert from "../../layout/ErrorAlert";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useEffect } from "react";
import { reservationRequestValidation } from "../../validations/reservationValidation";

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
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const submitHandler = (event) => {
    event.preventDefault();
    setApiError(null);
    setValidationErrors([]);
    setReservationRequest({
      first_name: event.target.first_name.value,
      last_name: event.target.last_name.value,
      mobile_number: event.target.mobile_number.value,
      reservation_date: event.target.reservation_date.value,
      reservation_time: event.target.reservation_time.value,
      people: Number(event.target.people.value),
    });
    setValidationErrors(reservationRequestValidation(reservationRequest));
    setSubmitted(true);
  };
  useEffect(() => {
    if (submitted) {
      console.log(reservationRequest);

      if (validationErrors.length === 0) {
        makeReservation(reservationRequest)
          .then((response) => {
            history.push(
              `/dashboard?date=${reservationRequest.reservation_date}`
            );
          })
          .catch((error) => {
            setApiError(error);
          });
      }

      setSubmitted(false);
    }
  }, [reservationRequest]);

  return (
    <div className="container mt-4 p-4">
      <form onSubmit={(event) => submitHandler(event)}>
        <label className="form-label" htmlFor="first_name">
          First name
        </label>
        <input
          className="form-control"
          type="text"
          id="first_name"
          name="first_name"
          placeholder="First name"
          onChange={handleChange}
          required
        ></input>
        <label className="form-label" htmlFor="last_name">
          Last name
        </label>
        <input
          className="form-control"
          type="text"
          id="last_name"
          name="last_name"
          placeholder="Last name"
          onChange={handleChange}
          required
        ></input>
        <label className="form-label" htmlFor="mobile_number">
          Mobile number
        </label>
        <input
          className="form-control"
          type="text"
          id="mobile_number"
          name="mobile_number"
          placeholder="Mobile number"
          onChange={handleChange}
          required
        ></input>
        <label className="form-label" htmlFor="reservation_date">
          Date of reservation
        </label>
        <input
          className="form-control"
          type="date"
          id="reservation_date"
          name="reservation_date"
          onChange={handleChange}
          required
        ></input>
        <label className="form-label" htmlFor="reservation_time">
          Time of reservation
        </label>
        <input
          className="form-control"
          type="time"
          id="reservation_time"
          name="reservation_time"
          onChange={handleChange}
          required
        ></input>
        <label className="form-label" htmlFor="people">
          Party size:
        </label>
        <input
          className="form-control"
          id="people"
          name="people"
          placeholder="number of people in party"
          onChange={handleChange}
          required
        ></input>
        {/* change people input to dropdown after tests pass */}
        {/* <select id="people" name="people" onChange={handleChange}>
        {numbers.map((number) => (
          <option key={number} value={number}>
            {number}
          </option>
        ))}
      </select> */}
        <button className="btn btn-outline-dark mr-2 mt-2" onClick={goBack}>Cancel</button>
        <button className="btn btn-outline-dark mt-2" type="submit">Submit</button>
      </form>
      {apiError && <ErrorAlert error={apiError} />}
      {validationErrors.length > 0 && (
        <>
          {validationErrors.map((error, i) => {
            return <ErrorAlert key={i} error={error} />;
          })}
        </>
      )}
    </div>
  );
}

export default CreateReservation;
