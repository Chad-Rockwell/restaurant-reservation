import React from "react";
import { makeReservation } from "../../utils/api";
import ErrorAlert from "../../layout/ErrorAlert";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useEffect } from "react";
import { reservationRequestValidation } from "../../validations/reservationValidation";
import ReservationForm from "./ReservationForm";

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

      //Prevent an API call if form data is invalid
      if (validationErrors.length === 0) {
        const abortController = new AbortController();
        makeReservation(reservationRequest, abortController.signal)
          .then((response) => {
            history.push(
              `/dashboard?date=${reservationRequest.reservation_date}`
            );
          })
          .catch((error) => {
            setApiError(error);
          });
        return () => abortController.abort();
      }

      setSubmitted(false);
    }
  }, [reservationRequest, submitted, validationErrors.length, history]);

  return (
    <div className="container mt-4 p-4">
      <ReservationForm goBack={goBack} formData={reservationRequest} handleChange={handleChange} handleSubmit={submitHandler}/>
      {apiError && <ErrorAlert error={apiError} />}
      {validationErrors.length > 0 && (
        <>
          {validationErrors.map((error) => {
            return <ErrorAlert key={error.message} error={error} />;
          })}
        </>
      )}
    </div>
  );
}

export default CreateReservation;
