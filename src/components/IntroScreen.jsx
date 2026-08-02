import '../App.css'

function IntroScreen({ onStart }) {
  return (
    <section className="screen-card">
      <h1>Money and Kindness Experiment</h1>
      <p>
        This study asks you to respond to a short series of messages as if you were on a phone.
        Please consider each request carefully and decide whether it feels worthy of support.
      </p>
      <ul>
        <li>
          You have a starting balance of $50 to hand out.
        </li>
        <li>
        Each question has a timer, you must respond before the timer runs out or the question will be skipped.
        </li>
      </ul>
      <button className="primary-btn" onClick={onStart}>
        Start experiment
      </button>
    </section>
  )
}

export default IntroScreen
