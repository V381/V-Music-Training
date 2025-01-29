<template>
  <div class="page">
    <header class="hero">
      <div id="particles-js" class="particles"></div>
      <div class="container">
        <h1>Start Your Music Journey Here</h1>
        <p>Free online tools to help you learn music at your own pace. Perfect for beginners and students who want to improve their musical skills.</p>
        <div class="features">
          Learn Notes • Practice Guitar • Keep Time • Train Your Ears
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <div class="tool-cards">
          <article class="tool-card">
            <i class="fas fa-music"></i>
            <h3>Note Learning Tool</h3>
            <p>Master music note reading with interactive exercises. Perfect for beginners learning to read sheet music.</p>
            <a href="http://v381.github.io/Music_Trainer/html.html" class="btn">Start Learning</a>
          </article>

          <article class="tool-card">
            <i class="fas fa-guitar"></i>
            <h3>Guitar Notes Guide</h3>
            <p>Interactive fretboard training to help you memorize notes on your guitar.</p>
            <a href="https://v381.github.io/Guitar_Fretboard_Note_Trainer/" class="btn">Start Learning</a>
          </article>

          <article class="tool-card">
            <i class="fas fa-clock"></i>
            <h3>Simple Metronome</h3>
            <p>Practice your timing with our easy-to-use online metronome.</p>
            <a href="http://v381.github.io/Metronome/html.html" class="btn">Start Practice</a>
          </article>

          <article class="tool-card">
            <i class="fas fa-headphones"></i>
            <h3>Ear Training</h3>
            <p>Develop your musical ear with interactive exercises. Train yourself to recognize intervals, chords, and scales.</p>
            <a href="https://v381.github.io/V-Ear-Training/" class="btn">Start Practice</a>
          </article>
      <article
        class="tool-card"
      >
      <i class="fas fa-keyboard"></i>
        <h3>Piano Note Trainer</h3>
        <p >
          Learn piano notes and keyboard positions with interactive exercises.
          Master key signatures, chord progressions, and scales through engaging
          practice sessions.
        </p>
        <a
          href="https://v381.github.io/Piano_Note_Trainer/"
          aria-label="Start piano note training"
          class="btn"
        >
          Start Learning
        </a>
      </article>
        </div>
      </div>
    </main>

    <footer class="main-footer">
      <div class="container">
        <p>© 2025 Music Learning Tools - Free Online Music Practice</p>
        <nav class="footer-nav">
          <a href="#tools">Tools</a>
          <router-link to="/contact">Contact</router-link>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { particlesConfig } from '../config/particlesConfig'

onMounted(() => {
  if (window.particlesJS) {
    window.particlesJS('particles-js', particlesConfig)
  }
})
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .main-nav {
    background: #18181B;
    padding: 16px 0;

    .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 20px;
      font-weight: bold;
      color: white;
      text-decoration: none;

      &:hover {
        color: #c41e3a;
        transition: color 0.3s ease;
      }
    }

    .nav-links {
      display: flex;
      gap: 20px;

      a {
        color: white;
        text-decoration: none;

        &:hover {
          color: #c41e3a;
          transition: color 0.3s ease;
        }
      }
    }
  }

  .hero {
    background: #c41e3a;
    color: white;
    text-align: center;
    padding: 60px 0;
    position: relative;

    .container {
      position: relative;
      z-index: 1;
    }

    h1 {
      font-size: 40px;
      margin-bottom: 20px;
      font-weight: bold;
    }

    p {
      font-size: 18px;
      max-width: 800px;
      margin: 0 auto 20px;
    }

    .features {
      font-size: 14px;
      opacity: 0.8;
    }

    .particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  .main-content {
    flex: 1;
    padding: 60px 0;
  }

  .tool-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-top: 40px;
  }

  .tool-card {
    background: #18181B;
    border-radius: 12px;
    padding: 30px;
    text-align: center;
    transition: transform 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      transform: translateY(-5px);
    }

    i {
      font-size: 48px;
      color: #c41e3a;
      margin-bottom: 20px;
    }

    h3 {
      font-size: 24px;
      margin-bottom: 15px;
    }

    p {
      color: #D1D5DB;
      margin-bottom: 20px;
    }

    .btn {
      display: inline-block;
      background: #c41e3a;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      transition: background 0.3s ease;

      &:hover {
        background: darken(#c41e3a, 10%);
      }
    }
  }

  .main-footer {
    background: #18181B;
    padding: 30px 0;
    text-align: center;

    p {
      color: #9CA3AF;
      margin-bottom: 15px;
    }

    .footer-nav {
      display: flex;
      justify-content: center;
      gap: 20px;

      a {
        color: #9CA3AF;
        text-decoration: none;

        &:hover {
          color: #c41e3a;
          transition: color 0.3s ease;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .hero {
      h1 {
        font-size: 32px;
      }

      p {
        font-size: 16px;
      }
    }

    .tool-cards {
      grid-template-columns: 1fr;
    }
  }
  </style>
