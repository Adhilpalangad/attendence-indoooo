import { useEffect, useRef, useState } from 'react'

function ClassRun({ entering }) {
  return <div className={`sketch ${entering ? 'entering' : ''}`}>
    <svg viewBox="0 0 640 260" role="img" aria-label="A student with a backpack rushing to class before attendance is taken">
      <defs><filter id="pencil"><feTurbulence type="fractalNoise" baseFrequency=".055" numOctaves="3" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale=".7" /></filter></defs>
      <g className="pencil-lines" filter="url(#pencil)" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path className="ground" d="M35 224 Q180 222 315 225 T608 224 M60 229 l45 -1 M380 230 l125 -1" />
        <g className="classroom"><path d="M449 222 V68 l111 -3 3 158 M455 219 V74 l99 -3 v151 M454 75 l62 20 v126 M516 95 v126 M505 153 h-3 M565 83 h36 v49 h-36 z M582 83 v49 M565 108 h36" /><path d="M459 48 l89 -2 1 -24 -90 2 z" /><text x="469" y="40" className="svg-label" stroke="none" fill="currentColor">AWH HAA...</text></g>
        <g className="clock"><circle cx="383" cy="62" r="21" /><path d="M383 46 v16 l12 6 M383 39 v3 M406 62 h-3 M383 85 v-3 M360 62 h3" /></g>
        <g className="runner-travel"><g className="runner-bounce">
          <g className="speed-lines"><path d="M164 113 h39 M153 125 h38 M165 141 h26" /></g>
          <g className="backpack"><path d="M225 117 q-20 -5 -24 15 l-6 26 q14 9 30 1 l7 -29 z M204 141 l17 4 -4 12 -16 -4 M215 118 q-4 -12 8 -11" /></g>
          <path d="M229 109 q-2 16 -9 29 l25 22 19 -33 -24 -16 M230 103 l-4 13" />
          <g className="head"><path d="M228 76 q-7 -18 9 -22 19 -5 25 10 l-3 18 6 4 -9 3 q-3 14 -17 11 l-8 -7 z M227 75 l-5 -9 6 -1 -1 -9 10 3 3 -9 8 8 11 -1 4 10 -15 -2 -7 8 -7 -1 M250 78 h1 M247 92 l8 -1" /></g>
          <g className="arm-front"><path d="M245 119 l23 20 22 -19 M240 128 l28 21 27 -23 M290 120 l4 -9 5 2 -2 8 7 -3 3 5 -12 4" /></g>
          <g className="leg-one"><path d="M242 156 l-16 31 -35 12 4 9 43 -13 22 -31 M190 198 l-8 4 -8 13 23 -4 -2 -6" /></g>
          <g className="leg-two"><path d="M223 154 l32 24 21 33 9 -5 -18 -39 -24 -17 M276 210 l1 9 25 1 q2 -6 -17 -14" /></g>
        </g></g>
        <g className="loose-paper"><path d="M330 150 l23 -7 9 29 -23 7 z M337 156 l14 -4 M339 163 l14 -4 M341 170 l8 -3" /></g>
      </g>
    </svg>
    <span className="sketch-note">“Wait! Don’t mark me absent!”</span>
  </div>
}

function useCountUp(target, ms = 700) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf, start
    const tick = (t) => {
      start ??= t
      const k = Math.min((t - start) / ms, 1)
      setV(target * (1 - Math.pow(1 - k, 3)))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

function compute(total, attended, target) {
  const p = target / 100
  const pct = (attended / total) * 100
  if (pct < target) {
    const n = Math.ceil((p * total - attended) / (1 - p) - 1e-9)
    return { pct, kind: 'attend', n, after: ((attended + n) / (total + n)) * 100 }
  }
  const n = Math.floor(attended / p - total + 1e-9)
  return { pct, kind: 'skip', n, after: (attended / (total + n)) * 100 }
}

function Result({ r, target }) {
  const shown = useCountUp(r.pct)
  const s = (n) => `${n} class${n === 1 ? '' : 'es'}`
  return (
    <section className="result">
      <div className="big">{shown.toFixed(1)}<span>%</span></div>
      <div className="meter">
        <div className={`fill ${r.kind}`} style={{ width: `${Math.min(r.pct, 100)}%` }} />
        <div className="mark" style={{ left: `${target}%` }}><i>{target}%</i></div>
      </div>
      {r.kind === 'attend' ? (
        <>
          <p className="verdict bad">Attend <b>{s(r.n)}</b> more.</p>
          <p className="note">Miss none of them and you'll land on {r.after.toFixed(2)}%.</p>
        </>
      ) : r.n === 0 ? (
        <>
          <p className="verdict good">Right on the line.</p>
          <p className="note">Skip even one class and you fall below {target}%.</p>
        </>
      ) : (
        <>
          <p className="verdict good">You may skip <b>{s(r.n)}</b>.</p>
          <p className="note">You'd still hold {r.after.toFixed(2)}%.</p>
        </>
      )}
    </section>
  )
}

function Calculator() {
  const [total, setTotal] = useState('')
  const [att, setAtt] = useState('')
  const [target, setTarget] = useState(75)
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const t = parseInt(total, 10), a = parseInt(att, 10)
    setRes(null)
    if (!(t > 0) || isNaN(a) || a < 0) return setErr('Please enter valid numbers.')
    if (a > t) return setErr('You cannot attend more classes than were held.')
    setErr('')
    setRes({ ...compute(t, a, target), target })
  }

  return (
    <div className="card fade">
      <div className="eyebrow">The attendance register</div>
      <h2>Let’s do the math.</h2>
      <p className="card-sub">A little honesty. A little arithmetic.</p>
      <form onSubmit={submit}>
        <label>Total classes held
          <input type="number" min="1" placeholder="100" value={total} onChange={(e) => setTotal(e.target.value)} />
        </label>
        <label>Classes you attended
          <input type="number" min="0" placeholder="32" value={att} onChange={(e) => setAtt(e.target.value)} />
        </label>
        <label>Required percentage <b>{target}%</b>
          <input type="range" min="50" max="95" step="1" value={target} onChange={(e) => setTarget(+e.target.value)} />
        </label>
        <button className="btn" type="submit">Calculate</button>
      </form>
      <div aria-live="polite">{err && <p className="err">{err}</p>}
        {res && <Result r={res} target={res.target} />}</div>
    </div>
  )
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [entering, setEntering] = useState(false)
  const [off, setOff] = useState(true)
  const [audioMissing, setAudioMissing] = useState(false)
  const audio = useRef(null)
  const timer = useRef(null)
  useEffect(() => {
    audio.current.volume = 0.08
    return () => clearTimeout(timer.current)
  }, [])

  const start = () => {
    if (entering) return
    setEntering(true)
    audio.current?.play().then(() => setOff(false)).catch(() => setOff(true))
    timer.current = setTimeout(() => { setStarted(true); setEntering(false) }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 950)
  }
  const toggle = () => {
    const a = audio.current
    if (a.paused) { a.play().then(() => setOff(false)).catch(() => setOff(true)) } else { a.pause(); setOff(true) }
  }

  return (
    <main>
      <audio ref={audio} src="/song.mp3" loop preload="none" onError={() => { setAudioMissing(true); setOff(true) }} />
      <header className="site-header"><a className="wordmark" href="/">the attendance club<span> a student survival tool</span></a><span className="header-note">No proxies. Just numbers.</span></header>
      {started && <button className="music" onClick={toggle} disabled={audioMissing} aria-label={audioMissing ? 'Music file unavailable' : off ? 'Play quiet background music' : 'Mute background music'}>{audioMissing ? 'Music unavailable' : off ? '♫ Sound off' : '♫ Sound on'} </button>}
      {!started ? (
        <div className="hero fade">
          <div className="eyebrow">For the academically present-ish.</div>
          <h1>Late to class.<br /><em>Early to calculate.</em></h1>
          <p>Before you run for the door, find out<br className="desktop-break" /> how many classes you can actually miss.</p>
          <ClassRun entering={entering} />
          <button className="btn" onClick={start} disabled={entering}>{entering ? 'Running to class…' : 'Check my attendance'} <span aria-hidden="true">↗</span></button>
          <div className="hero-footnote">Your 75% deserves a fighting chance.</div>
        </div>
      ) : (
        <div className="calculator-page"><div className="calculator-story fade"><div className="eyebrow">Made it. Almost.</div><h1>Every class<br /><em>counts. Sadly.</em></h1><p>Let’s see where you stand before<br />you plan your next “sick day”.</p><ClassRun /><button className="back-link" onClick={() => setStarted(false)}>← Back to the rush</button></div><Calculator /></div>
      )}
      <footer>Made for students who count classes. <span>And occasionally attend them.</span></footer>
    </main>
  )
}
