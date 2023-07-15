import React from "react"

function ReservationForm({handleChange, handleSubmit, goBack, formData}) {
    return (
        <form onSubmit={(event) => handleSubmit(event)}>
        <label className="form-label" htmlFor="first_name">First name</label>
        <input
          className="form-control"
          type="text"
          id="first_name"
          name="first_name"
          placeholder="First name"
          onChange={handleChange}
          required
          value={formData.first_name}
        />
        <label className="form-label" htmlFor="last_name">Last name</label>
        <input
          className="form-control"
          type="text"
          id="last_name"
          name="last_name"
          placeholder="Last name"
          onChange={handleChange}
          required
          value={formData.last_name}
        />
        <label className="form-label" htmlFor="mobile_number">Mobile number</label>
        <input
          className="form-control"
          type="text"
          id="mobile_number"
          name="mobile_number"
          placeholder="Mobile number"
          onChange={handleChange}
          required
          value={formData.mobile_number}
        />
        <label className="form-label" htmlFor="reservation_date">Date of reservation</label>
        <input
          className="form-control"
          type="date"
          id="reservation_date"
          name="reservation_date"
          onChange={handleChange}
          required
          value={formData.reservation_date}
        />
        <label className="form-label" htmlFor="reservation_time">Time of reservation</label>
        <input
          className="form-control"
          type="time"
          id="reservation_time"
          name="reservation_time"
          onChange={handleChange}
          required
          value={formData.reservation_time}
        />
        <label className="form-label" htmlFor="people">Party size:</label>
        <input
          className="form-control"
          id="people"
          name="people"
          placeholder="Number of people in party"
          onChange={handleChange}
          required
          value={formData.people}
        />
        <button className="btn btn-outline-dark mr-2 mt-2" onClick={goBack}>Cancel</button>
        <button className="btn btn-outline-dark mt-2" type="submit">Submit</button>
      </form>
    )

}

export default ReservationForm;