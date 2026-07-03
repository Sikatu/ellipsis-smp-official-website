import { useState } from 'react'

function Newsletter() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="section newsletter-section">
      <div className="newsletter-card">
        <p className="eyebrow">Stay Connected</p>
        <h2>Receive reflections, resources, and updates from Power Within Movement.</h2>
        <p>
          Join the community for thoughtful notes on confidence, presence, movement,
          and coming home to yourself.
        </p>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input type="email" placeholder="Enter your email" required />
          <button type="submit">Join the List</button>
        </form>

        {submitted && (
          <p className="form-success">Thank you — you’re on the list.</p>
        )}
      </div>
    </section>
  )
}

export default Newsletter
