'use client';

import { useEffect, useState } from 'react';

const promises = [
  {
    number: '01',
    title: 'Listen without defending',
    copy: 'Your feelings are not a debate for me to win. I want to hear the whole truth of how my actions landed.',
  },
  {
    number: '02',
    title: 'Choose consistency',
    copy: 'Not one big gesture followed by old habits. Small, honest choices, especially when nobody is watching.',
  },
  {
    number: '03',
    title: 'Share my socials voluntarily',
    copy: 'You are not responsible for keeping me faithful. That responsibility is mine. This is simply one way I can offer transparency while trust rebuilds.',
  },
  {
    number: '04',
    title: 'Communicate proactively',
    copy: 'No secrets and no strategic omissions. I will tell you what matters before you have to discover it, even when honesty has consequences for me.',
  },
  {
    number: '05',
    title: 'Respect your pace',
    copy: 'I can ask for another chance, but I cannot rush your healing. I will make room for what you need and respect the pace you choose.',
  },
  {
    number: '06',
    title: 'Respect whatever you choose',
    copy: 'The last time we talked, you said you did not feel safe with me. I heard you. I am not assuming there will be another chance. Whatever you choose, I owe you honesty, consistency, and respect—with no pressure from me.',
  },
  {
    number: '07',
    title: 'If we rebuild, let it be slowly',
    copy: 'Remember when I used to say I was in no rush because we had the rest of our lives to figure things out? I still mean that. If you choose us again, there is no deadline and no rushing you.',
  },
  {
    number: '08',
    title: 'Keep doing the inner work',
    copy: 'I started therapy and began identifying the underlying patterns behind my disloyal choices. Understanding them is not an excuse. It is part of changing them.',
  },
];

const filmFrames = [
  { kicker: 'the little things', title: 'The laugh I can hear before it happens', tone: 'frame-cocoa' },
  { kicker: 'the quiet things', title: 'The calm that only feels like you', tone: 'frame-smoke' },
  { kicker: 'the real things', title: 'Every ordinary moment I took for granted', tone: 'frame-amber' },
  { kicker: 'the us things', title: 'A future I still want to earn', tone: 'frame-night' },
];

export default function Home() {
  const [soundOn, setSoundOn] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [theme, setTheme] = useState<'espresso' | 'rose' | 'vanilla'>('vanilla');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dodgeCount, setDodgeCount] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [answer, setAnswer] = useState<'yes' | 'no' | 'over' | null>(null);
  const [needText, setNeedText] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const [responseStatus, setResponseStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    const updateProgress = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(available > 0 ? window.scrollY / available : 0);
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

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

  const shareNeeds = async () => {
    const response = needText.trim();
    if (!response) {
      setShareStatus('Write what you need first.');
      return;
    }

    const message = `What I need from you:\n\n${response}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'What I need from you', text: message });
        setShareStatus('Shared only where you chose.');
        return;
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') return;
      }
    }

    await navigator.clipboard.writeText(message);
    setShareStatus('Copied. You can send it whenever and however you choose.');
  };

  const chooseAnswer = (choice: 'yes' | 'no' | 'over') => {
    setAnswer(choice);
    setResponseStatus('idle');
  };

  const sendAnswer = async () => {
    if (!answer || responseStatus === 'sending') return;

    setResponseStatus('sending');
    try {
      const response = await fetch('/api/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, needs: needText.trim(), website: '' }),
      });

      if (!response.ok) throw new Error('The response could not be sent.');
      setResponseStatus('sent');
    } catch {
      setResponseStatus('error');
    }
  };

  return (
    <main className={`site-shell theme-${theme}`}>
      <div className="grain" aria-hidden="true" />
      <div className="scroll-line" aria-hidden="true">
        <span style={{ transform: `scaleX(${scrollProgress})` }} />
      </div>

      <nav className="topbar" aria-label="Page controls">
        <a className="monogram" href="#top" aria-label="Back to the beginning">M / Y</a>
        <span className="now-playing"><i className={isPlaying ? 'is-playing' : ''} /> Background music</span>
        <button className="sound-button" type="button" onClick={() => setSoundOn((open) => !open)} aria-expanded={soundOn}>
          <span className={`equalizer ${isPlaying ? 'is-playing' : ''}`} aria-hidden="true"><i /><i /><i /></span>
          <span>Music</span>
          <b>{soundOn ? 'open' : 'closed'}</b>
        </button>
      </nav>

      <div className="palette-control" aria-label="Choose a color version">
        <span>Themes I thought you would love</span>
        <button type="button" className={theme === 'espresso' ? 'active' : ''} onClick={() => setTheme('espresso')} aria-pressed={theme === 'espresso'}>
          <i className="swatch espresso-swatch" /> Espresso
        </button>
        <button type="button" className={theme === 'rose' ? 'active' : ''} onClick={() => setTheme('rose')} aria-pressed={theme === 'rose'}>
          <i className="swatch rose-swatch" /> Midnight rose
        </button>
        <button type="button" className={theme === 'vanilla' ? 'active' : ''} onClick={() => setTheme('vanilla')} aria-pressed={theme === 'vanilla'}>
          <i className="swatch vanilla-swatch" /> Vanilla
        </button>
      </div>

      <aside className={`music-player ${soundOn ? 'open' : ''}`} aria-hidden={!soundOn}>
        <button className="player-close" type="button" onClick={() => setSoundOn(false)} aria-label="Close music player">×</button>
        <h2>Background music</h2>
        <audio
          controls
          preload="metadata"
          src="/song-for-site.mp3"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        >
          Your browser does not support the audio player.
        </audio>
        <small>Press play once, then keep reading while the song stays with you.</small>
      </aside>

      <header id="top" className="hero">
        <div className="ambient ambient-one" aria-hidden="true" />
        <div className="ambient ambient-two" aria-hidden="true" />
        <p className="eyebrow reveal-one">An honest letter, in motion</p>
        <h1 className="reveal-two">
          I owe you more
          <span>than flowers.</span>
        </h1>
        <p className="hero-copy reveal-three">
          So I made you a small corner of the internet, a place where I can own what I did,
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
            <h2>I am sorry, Cyd. You did not deserve the hurt I caused.</h2>
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
            Just like the flowers, this page is only a gesture. It cannot rebuild trust by itself.
            The proof begins after you close it, through the actions I practice, not perform.
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
          <h2>Your honor,<br /><em>I miss her.</em></h2>
          <p>
            Me, formally presenting my case to the court of us with absolutely no legal training,
            one emotional support suit, and a suspicious amount of hope.
          </p>
          <p className="idea-joke">
            At this point I am running out of dramatic ideas that might work. My remaining options
            are skywriting, a twelve slide presentation, or doing the real work consistently.
            The last one has the best reviews.
          </p>
          <div className="meme-caption">CAN WE TALK? <span>(respectfully. very respectfully.)</span></div>
        </div>
        <div className="meme-stage">
          <div className="spotlight" aria-hidden="true" />
          <img className="meme-character" src="/your-honor-3d.png" alt="A playful 3D suited character making a dramatic appeal" />
          <span className="stage-note">dramatic recreation</span>
        </div>
      </section>

      <section className="closing-section">
        <div className="closing-halo" aria-hidden="true"><i /><i /><i /></div>
        <div className="section-tag centered"><span>05</span> one honest question</div>
        <p className="closing-pre">No pressure. No pretending. Just hope.</p>
        <h2>I want you back, Cyd.<br />Let me <em>show</em> you.</h2>
        <p className="closing-copy">
          I know my choices gave you a reason to question what we built. I will not minimize the hurt
          or ask you to carry the responsibility of saving us. If you are willing, give me the chance
          to show you through consistent actions that I can be honest, accountable, and safe for you.
          I want to earn back what I damaged, not talk you into forgetting it.
        </p>

        <div className="needs-card">
          <span>Your voice belongs here too</span>
          <h3>If you see a path forward, what would you need from me?</h3>
          <textarea
            value={needText}
            onChange={(event) => {
              setNeedText(event.target.value);
              setShareStatus('');
            }}
            placeholder="Say it plainly. Boundaries, questions, time, actions, or anything else."
            rows={5}
            aria-label="What you need from me"
          />
          <div className="needs-actions">
            <button type="button" onClick={shareNeeds}>Share this in my own way</button>
            <small>Nothing leaves this page until you choose where to send it.</small>
          </div>
          {shareStatus && <p className="share-status" role="status">{shareStatus}</p>}
        </div>

        {!answer && (
          <div className="answer-zone" aria-label="Would you give us another chance?">
            <button className="yes-button" type="button" onClick={() => chooseAnswer('yes')}>
              Yes, let’s talk <span>♥</span>
            </button>
            <button
              className="no-button"
              type="button"
              onPointerEnter={(event) => dodgeNo(event.pointerType)}
              onClick={() => chooseAnswer('no')}
              style={{ transform: `translate(${noPosition.x}px, ${noPosition.y}px)` }}
            >
              {dodgeCount >= 3 ? 'Okay, you can choose this' : 'Not yet'}
            </button>
            <button className="over-button" type="button" onClick={() => chooseAnswer('over')}>
              I do not want this to work. I am over you.
            </button>
            {dodgeCount > 0 && dodgeCount < 3 && <span className="dodge-note">I had to try 😅</span>}
            {dodgeCount >= 3 && <span className="dodge-note">Joke over. Your choice is yours.</span>}
          </div>
        )}

        {answer === 'yes' && (
          <div className="answer-card positive" role="status">
            <span>♥</span>
            <h3>Then let me show you better.</h3>
            <p>No speeches. No shortcuts. Just the next honest conversation and the actions after it.</p>
          </div>
        )}

        {answer === 'no' && (
          <div className="answer-card" role="status">
            <span>♡</span>
            <h3>I understand.</h3>
            <p>Thank you for reading this far. Your answer, your space, and your feelings are yours to keep.</p>
          </div>
        )}

        {answer === 'over' && (
          <div className="answer-card" role="status">
            <span>♡</span>
            <h3>I hear you.</h3>
            <p>I will respect your answer. Thank you for reading, and I am sorry for the hurt I caused.</p>
          </div>
        )}

        {answer && (
          <div className="response-submit">
            <button type="button" onClick={sendAnswer} disabled={responseStatus === 'sending' || responseStatus === 'sent'}>
              {responseStatus === 'sending' ? 'Sending…' : responseStatus === 'sent' ? 'Answer sent' : 'Send my answer'}
            </button>
            <small>Nothing is sent automatically. This sends your choice and anything you wrote above.</small>
            {responseStatus === 'sent' && <p className="response-message success" role="status">Your answer was sent. Thank you for being honest.</p>}
            {responseStatus === 'error' && <p className="response-message" role="alert">It did not send. You can still share it in your own way.</p>}
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
