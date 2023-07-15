import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { readReservation, editReservation } from "../../utils/api";
import { formatAsTime } from "../../utils/date-time";
import ErrorAlert from "../../layout/ErrorAlert";
import { reservationRequestValidation } from "../../validations/reservationValidation";

export default function EditReservation() {
  const [currentReservation, setCurrentReservation] = useState(null);
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
        setCurrentReservation(reservation);
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
    <div>
      <form onSubmit={(event) => handleSubmit(event)}>
        <label htmlFor="first_name">First name</label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          placeholder="First name"
          onChange={handleChange}
          required
          value={reservationRequest.first_name}
        />
        <label htmlFor="last_name">Last name</label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          placeholder="Last name"
          onChange={handleChange}
          required
          value={reservationRequest.last_name}
        />
        <label htmlFor="mobile_number">Mobile number</label>
        <input
          type="text"
          id="mobile_number"
          name="mobile_number"
          placeholder="Mobile number"
          onChange={handleChange}
          required
          value={reservationRequest.mobile_number}
        />
        <label htmlFor="reservation_date">Date of reservation</label>
        <input
          type="date"
          id="reservation_date"
          name="reservation_date"
          onChange={handleChange}
          required
          value={reservationRequest.reservation_date}
        />
        <label htmlFor="reservation_time">Time of reservation</label>
        <input
          type="time"
          id="reservation_time"
          name="reservation_time"
          onChange={handleChange}
          required
          value={reservationRequest.reservation_time}
        />
        <label htmlFor="people">Party size:</label>
        <input
          id="people"
          name="people"
          placeholder="Number of people in party"
          onChange={handleChange}
          required
          value={reservationRequest.people}
        />
        <button onClick={goBack}>Cancel</button>
        <button type="submit">Submit</button>
      </form>
      {apiError && <ErrorAlert error={apiError} />}
      {validationErrors.length > 0 &&
        validationErrors.map((error, index) => (
          <ErrorAlert key={index} error={error} />
        ))}
    </div>
  );
}
