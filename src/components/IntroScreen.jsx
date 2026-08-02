import '../App.css'

function IntroScreen({ onStart }) {
  return (
    <section className="screen-card">
      <h1>Money and kindness experiment</h1>
      <p>
        This study asks you to respond to a short series of messages as if you were on a phone.
        Please consider each request carefully and decide whether it feels worthy of support.
      </p>
      <p>
        You begin with a fake balance of $50. Each choice will affect that balance, and the app will
        save your results at the end.
      </p>
      <button className="primary-btn" onClick={onStart}>
        Start experiment
      </button>
    </section>
  )
}

export default IntroScreen
