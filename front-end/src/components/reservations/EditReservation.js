import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { readReservation, editReservation } from "../../utils/api";
import { formatAsTime } from "../../utils/date-time";
import ErrorAlert from "../../layout/ErrorAlert";
import ReservationForm from "./ReservationForm";
import { reservationRequestValidation } from "../../validations/reservationValidation";

export default function EditReservation() {
  const [apiError, setApiError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const history = useHistory();

  const goBack = (event) => {
    event.preventDefault();
    history.goBack();
  };

  const { reservation_id } = useParams();

  const [reservationRequest, setReservationRequest] = useState({});

  function handleChange({ target }) {
    setReservationRequest({
      ...reservationRequest,
      [target.name]: target.value,
    });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ac = new AbortController();
    setValidationErrors([]);
    const newReservationRequest = {
      first_name: event.target.first_name.value,
      last_name: event.target.last_name.value,
      mobile_number: event.target.mobile_number.value,
      reservation_date: event.target.reservation_date.value,
      reservation_time: formatAsTime(event.target.reservation_time.value),
      people: Number(event.target.people.value),
    };
    setValidationErrors(reservationRequestValidation(newReservationRequest));
    try {
      setApiError(null);
      await editReservation(newReservationRequest, reservation_id, ac.signal);
      history.push(`/dashboard?date=${newReservationRequest.reservation_date}`);
    } catch (error) {
      setApiError(error);
    }
    return () => ac.abort();
  };

  useEffect(() => {
    const abortController = new AbortController();

    readReservation(reservation_id, abortController.signal)
      .then((reservation) => {
        
        setReservationRequest({
          first_name: reservation.first_name || "",
          last_name: reservation.last_name || "",
          mobile_number: reservation.mobile_number || "",
          reservation_date: reservation.reservation_date?.split("T")[0] || "",
          reservation_time: reservation.reservation_time || "",
          people: reservation.people || "",
        });
        setLoading(false); // Set loading to false after data is fetched and set
      })
      .catch(setApiError);

    return () => abortController.abort();
  }, [reservation_id]);

  if (loading) {
    return <h2>Loading...</h2>; // Render a loading indicator while data is being fetched
  }

  return (
    <div className="container mt-4 pt-4">
      <ReservationForm goBack={goBack} formData={reservationRequest} handleChange={handleChange} handleSubmit={handleSubmit}/>
      {apiError && <ErrorAlert error={apiError} />}
      {validationErrors.length > 0 &&
        validationErrors.map((error, index) => (
          <ErrorAlert key={index} error={error} />
        ))}
    </div>
  );
}
