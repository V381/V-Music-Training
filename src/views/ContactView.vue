<template>
  <div class="page">
    <header class="hero">
      <div id="particles-js" class="particles"></div>
      <div class="container">
        <h1>Connect With Us</h1>
        <p>Have questions, suggestions, or want to contribute? We'd love to hear from you!</p>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <div class="contact-cards">
          <article class="contact-card">
            <i class="fab fa-github"></i>
            <h3>GitHub Community</h3>
            <p>Join our open-source community. Contribute to projects, report issues, or suggest improvements.</p>
            <a href="https://github.com/v381" class="btn">Visit GitHub Profile</a>
          </article>

          <article class="contact-card">
            <i class="fas fa-envelope"></i>
            <h3>Direct Contact</h3>
            <p>Need help or have specific questions? Reach out directly via email.</p>
            <a href="mailto:paavlee@yahoo.com" class="btn">Send Email</a>
          </article>
        </div>

        <section class="faq">
          <h2>Frequently Asked Questions</h2>
          <div class="faq-items">
            <div class="faq-item">
              <h3>Are these tools really free?</h3>
              <p>Yes, all our tools are completely free and open-source.</p>
            </div>
            <div class="faq-item">
              <h3>How can I contribute?</h3>
              <p>You can contribute by submitting pull requests on GitHub or suggesting improvements via email.</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer class="main-footer">
      <div class="container">
        <p>© 2025 Music Learning Tools - Free Online Music Practice</p>
        <nav class="footer-nav">
          <router-link to="/">Home</router-link>
          <a href="#tools">Tools</a>
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
      margin: 0 auto;
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

  .contact-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-bottom: 60px;
  }

  .contact-card {
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

  .faq {
    text-align: center;

    h2 {
      font-size: 32px;
      margin-bottom: 30px;
    }

    .faq-items {
      max-width: 800px;
      margin: 0 auto;
    }

    .faq-item {
      background: #18181B;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      text-align: left;

      h3 {
        font-size: 20px;
        margin-bottom: 10px;
      }

      p {
        color: #D1D5DB;
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

    .contact-cards {
      grid-template-columns: 1fr;
    }
  }
  </style>
