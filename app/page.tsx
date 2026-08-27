'use client';

import { useEffect, useRef, useState } from 'react';

const promises = [
  {
    number: '01',
    title: 'Listen without defending',
    copy: 'Your feelings are not a debate for me to win. I want to hear the whole truth of how my actions landed.',
  },
  {
    number: '02',
    title: 'Choose consistency',
    copy: 'Not one big gesture followed by old habits. Small, honest choices—especially when nobody is watching.',
  },
  {
    number: '03',
    title: 'Respect your pace',
    copy: 'I can ask for another chance, but I cannot rush your healing. I will make room for what you need.',
  },
  {
    number: '04',
    title: 'Protect what we rebuild',
    copy: 'Trust should feel safe in my hands. I want my actions to make that true again, one day at a time.',
  },
];

const filmFrames = [
  { kicker: 'the little things', title: 'The laugh I can hear before it happens', tone: 'frame-cocoa' },
  { kicker: 'the quiet things', title: 'The calm that only feels like you', tone: 'frame-smoke' },
  { kicker: 'the real things', title: 'Every ordinary moment I took for granted', tone: 'frame-amber' },
  { kicker: 'the us things', title: 'A future I still want to earn', tone: 'frame-night' },
];

type AudioScene = {
  context: AudioContext;
  oscillators: OscillatorNode[];
  master: GainNode;
  timer: ReturnType<typeof setInterval>;
};

export default function Home() {
  const [soundOn, setSoundOn] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dodgeCount, setDodgeCount] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);
  const audioScene = useRef<AudioScene | null>(null);

  useEffect(() => {
    const updateProgress = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(available > 0 ? window.scrollY / available : 0);
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  useEffect(() => {
    return () => {
      if (audioScene.current) {
        clearInterval(audioScene.current.timer);
        audioScene.current.oscillators.forEach((oscillator) => oscillator.stop());
        void audioScene.current.context.close();
      }
    };
  }, []);

  const stopSound = () => {
    const scene = audioScene.current;
    if (!scene) return;
    clearInterval(scene.timer);
    scene.master.gain.exponentialRampToValueAtTime(0.0001, scene.context.currentTime + 0.45);
    window.setTimeout(() => {
      scene.oscillators.forEach((oscillator) => oscillator.stop());
      void scene.context.close();
    }, 500);
    audioScene.current = null;
    setSoundOn(false);
  };

  const startSound = () => {
    const BrowserAudioContext = window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const context = new BrowserAudioContext();
    const master = context.createGain();
    const filter = context.createBiquadFilter();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.075, context.currentTime + 1.8);
    filter.type = 'lowpass';
    filter.frequency.value = 720;
    filter.Q.value = 0.7;
    master.connect(filter);
    filter.connect(context.destination);

    const progressions = [
      [110, 164.81, 220],
      [98, 146.83, 196],
      [130.81, 196, 261.63],
      [87.31, 130.81, 174.61],
    ];
    const oscillators = progressions[0].map((frequency, index) => {
      const oscillator = context.createOscillator();
      const voice = context.createGain();
      oscillator.type = index === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index === 1 ? -7 : index === 2 ? 5 : 0;
      voice.gain.value = index === 0 ? 0.7 : 0.14;
      oscillator.connect(voice);
      voice.connect(master);
      oscillator.start();
      return oscillator;
    });

    let chord = 0;
    const timer = setInterval(() => {
      chord = (chord + 1) % progressions.length;
      oscillators.forEach((oscillator, index) => {
        oscillator.frequency.exponentialRampToValueAtTime(
          progressions[chord][index],
          context.currentTime + 3.5,
        );
      });
    }, 7000);

    audioScene.current = { context, oscillators, master, timer };
    setSoundOn(true);
  };

  const toggleSound = () => {
    if (soundOn) stopSound();
    else startSound();
  };

  const dodgeNo = (pointerType: string) => {
    if (pointerType !== 'mouse' || dodgeCount >= 3) return;
    const positions = [
      { x: 92, y: -36 },
      { x: -84, y: 38 },
      { x: 66, y: 46 },
    ];
    setNoPosition(positions[dodgeCount]);
    setDodgeCount((count) => count + 1);
  };

  return (
    <main>
      <div className="grain" aria-hidden="true" />
      <div className="scroll-line" aria-hidden="true">
        <span style={{ transform: `scaleX(${scrollProgress})` }} />
      </div>

      <nav className="topbar" aria-label="Page controls">
        <a className="monogram" href="#top" aria-label="Back to the beginning">M / Y</a>
        <span className="now-playing"><i className={soundOn ? 'is-playing' : ''} /> Original midnight loop</span>
        <button className="sound-button" type="button" onClick={toggleSound} aria-pressed={soundOn}>
          <span className="equalizer" aria-hidden="true"><i /><i /><i /></span>
          <span>Sound</span>
          <b>{soundOn ? 'on' : 'off'}</b>
        </button>
      </nav>

      <header id="top" className="hero">
        <div className="ambient ambient-one" aria-hidden="true" />
        <div className="ambient ambient-two" aria-hidden="true" />
        <p className="eyebrow reveal-one">An honest letter, in motion</p>
        <h1 className="reveal-two">
          I owe you more
          <span>than flowers.</span>
        </h1>
        <p className="hero-copy reveal-three">
          So I made you a small corner of the internet—one where I can own what I did,
          tell you what I am changing, and ask for the chance to show you better.
        </p>
        <a className="begin reveal-three" href="#letter">
          <span>Read what I should have said</span>
          <b aria-hidden="true">↓</b>
        </a>
        <aside className="side-note" aria-hidden="true">
          <span>made with intention</span><i /><span>keep scrolling</span>
        </aside>
      </header>

      <div className="ticker" aria-hidden="true">
        <div>
          <span>NO EXCUSES</span><i>✦</i><span>REAL ACCOUNTABILITY</span><i>✦</i>
          <span>BETTER ACTIONS</span><i>✦</i><span>NO EXCUSES</span><i>✦</i>
          <span>REAL ACCOUNTABILITY</span><i>✦</i><span>BETTER ACTIONS</span><i>✦</i>
        </div>
      </div>

      <section id="letter" className="letter-section">
        <div className="section-tag"><span>01</span> the part that matters</div>
        <div className="letter-grid">
          <div className="letter-lead">
            <p>What I should have said sooner</p>
            <h2>I am sorry for the hurt my actions caused you.</h2>
          </div>
          <div className="letter-body">
            <p className="dropcap">
              Whatever I meant to do does not erase what you felt. I know that intention is not
              the same thing as impact, and “I didn’t mean to” cannot be where accountability ends.
            </p>
            <p>
              You deserved patience, honesty, and care from me. Where I fell short, I hurt someone
              I love. I am not here to talk you out of your feelings. I am here to own my part in them.
            </p>
            <blockquote>“This is not an argument.<br />It is not an excuse.<br /><em>It is an apology.</em>”</blockquote>
          </div>
        </div>
        <div className="orbit-word orbit-listen" aria-hidden="true">listen</div>
        <div className="orbit-word orbit-learn" aria-hidden="true">learn</div>
        <div className="orbit-word orbit-repair" aria-hidden="true">repair</div>
      </section>

      <section className="actions-section">
        <div className="actions-heading">
          <div className="section-tag light"><span>02</span> what happens next</div>
          <h2>Sorry is a sentence.<br /><em>Change is the proof.</em></h2>
          <p>
            A website is still just a gesture. What matters is who I choose to be after you close it.
            These are the actions I want to practice—not perform.
          </p>
        </div>
        <div className="promise-grid">
          {promises.map((promise) => (
            <article className="promise-card" key={promise.number}>
              <span>{promise.number}</span>
              <div className="promise-icon" aria-hidden="true"><i /></div>
              <h3>{promise.title}</h3>
              <p>{promise.copy}</p>
              <b aria-hidden="true">↗</b>
            </article>
          ))}
        </div>
      </section>

      <section className="film-section" aria-label="The moments I miss">
        <div className="film-heading">
          <div className="section-tag"><span>03</span> the things I miss</div>
          <h2>Not just the big moments.<br /><em>The us in between.</em></h2>
        </div>
        <div className="film-track">
          {filmFrames.map((frame, index) => (
            <article className={`film-frame ${frame.tone}`} key={frame.title}>
              <span className="frame-number">0{index + 1}</span>
              <div className="frame-light" aria-hidden="true" />
              <p>{frame.kicker}</p>
              <h3>{frame.title}</h3>
              <small>memory reel / still developing</small>
            </article>
          ))}
        </div>
      </section>

      <section className="meme-section">
        <div className="meme-copy">
          <div className="section-tag light"><span>04</span> very serious business</div>
          <p className="meme-kicker">A brief meme intermission</p>
          <h2>Your honor,<br /><em>I miss my girl.</em></h2>
          <p>
            Me, formally presenting my case to the court of us with absolutely no legal training,
            one emotional-support suit, and a suspicious amount of hope.
          </p>
          <div className="meme-caption">COME HOME? <span>(respectfully. very respectfully.)</span></div>
        </div>
        <div className="meme-stage" aria-label="A playful suited figure making a dramatic appeal">
          <div className="spotlight" aria-hidden="true" />
          <div className="suit-figure" aria-hidden="true">
            <i className="head" />
            <i className="body" />
            <i className="lapel left-lapel" />
            <i className="lapel right-lapel" />
            <i className="arm left-arm" />
            <i className="arm right-arm" />
          </div>
          <span className="stage-note">dramatic recreation</span>
        </div>
      </section>

      <section className="closing-section">
        <div className="closing-halo" aria-hidden="true"><i /><i /><i /></div>
        <div className="section-tag centered"><span>05</span> one honest question</div>
        <p className="closing-pre">No pressure. No pretending. Just hope.</p>
        <h2>I want us to feel<br />like <em>us</em> again.</h2>
        <p className="closing-copy">
          I am not asking you to forget. I am asking for the chance to show you that I can learn,
          repair, and love you with more care than I did before.
        </p>

        {!answer && (
          <div className="answer-zone" aria-label="Would you give us another chance?">
            <button className="yes-button" type="button" onClick={() => setAnswer('yes')}>
              Yes, let’s talk <span>♥</span>
            </button>
            <button
              className="no-button"
              type="button"
              onPointerEnter={(event) => dodgeNo(event.pointerType)}
              onClick={() => setAnswer('no')}
              style={{ transform: `translate(${noPosition.x}px, ${noPosition.y}px)` }}
            >
              {dodgeCount >= 3 ? 'Okay, you can choose this' : 'Not yet'}
            </button>
            {dodgeCount > 0 && dodgeCount < 3 && <span className="dodge-note">I had to try 😅</span>}
            {dodgeCount >= 3 && <span className="dodge-note">Joke over—your choice is yours.</span>}
          </div>
        )}

        {answer === 'yes' && (
          <div className="answer-card positive" role="status">
            <span>♥</span>
            <h3>Then let me show you better.</h3>
            <p>No speeches. No shortcuts. Just the next honest conversation—and the actions after it.</p>
          </div>
        )}

        {answer === 'no' && (
          <div className="answer-card" role="status">
            <span>♡</span>
            <h3>I understand.</h3>
            <p>Thank you for reading this far. Your answer, your space, and your feelings are yours to keep.</p>
          </div>
        )}

        <footer>
          <span>Made with accountability</span>
          <i />
          <span>and a little bit of hope</span>
        </footer>
      </section>
    </main>
  );
}
