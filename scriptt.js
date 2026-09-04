/* =========================================================
   PixelCode.sv — script.js
   JavaScript ES6 puro, sin dependencias.
   Controla: iconos, header al hacer scroll, menú móvil,
   scroll suave con resaltado de sección activa, filtrado
   del portafolio, modal de demos y el formulario de contacto.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // Inicializa los íconos de Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  setYear();
  initHeaderScroll();
  initMobileMenu();
  initSmoothScrollAndActiveLink();
  initPortfolioFilter();
  initContactForm();

});

/* ---------------------------------------------------------
   Año dinámico en el footer
--------------------------------------------------------- */
function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------------------------------------------------------
   Header: cambia de apariencia al hacer scroll
--------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const toggleHeaderStyle = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  toggleHeaderStyle();
  window.addEventListener('scroll', toggleHeaderStyle, { passive: true });
}

/* ---------------------------------------------------------
   Menú móvil: abrir/cerrar y alternar íconos hamburguesa/X
--------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const iconMenu = document.getElementById('icon-menu');
  const iconClose = document.getElementById('icon-close');
  if (!toggleBtn || !menu) return;

  const closeMenu = () => {
    menu.style.maxHeight = '0px';
    toggleBtn.setAttribute('aria-expanded', 'false');
    iconMenu.classList.remove('hidden');
    iconClose.classList.add('hidden');
  };

  const openMenu = () => {
    menu.style.maxHeight = menu.scrollHeight + 'px';
    toggleBtn.setAttribute('aria-expanded', 'true');
    iconMenu.classList.add('hidden');
    iconClose.classList.remove('hidden');
  };

  toggleBtn.addEventListener('click', () => {
    const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Cierra el menú móvil al elegir un enlace
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

/* ---------------------------------------------------------
   Scroll suave entre secciones + resaltado del enlace activo
--------------------------------------------------------- */
function initSmoothScrollAndActiveLink() {
  const headerOffset = 80; // alto aproximado del header fijo
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  // Desplazamiento suave respetando el header fijo
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return; // deja pasar enlaces externos (WhatsApp, etc.)

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Resalta el enlace de la sección visible usando IntersectionObserver
  const desktopLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');

        desktopLinks.forEach((link) => {
          const matches = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('is-active', matches);
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------------------------------------------------------
   Filtrado en vivo del portafolio
--------------------------------------------------------- */
function initPortfolioFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');
  const emptyState = document.getElementById('empty-state');
  if (!filterButtons.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      // Actualiza el estado visual de los botones
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      button.classList.add('is-active');

      // Muestra/oculta tarjetas según la categoría
      let visibleCount = 0;
      cards.forEach((card) => {
        const matches = filter === 'todos' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !matches);
        if (matches) visibleCount++;
      });

      if (emptyState) {
        emptyState.classList.toggle('hidden', visibleCount > 0);
      }
    });
  });
}

/* ---------------------------------------------------------
   Formulario de contacto: valida y arma un mensaje de WhatsApp
--------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  const WHATSAPP_NUMBER = '50360281287'; // número de PixelCode.sv en formato internacional sin '+'

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fields = {
      nombre: form.querySelector('#nombre'),
      negocio: form.querySelector('#negocio'),
      telefono: form.querySelector('#telefono'),
      tipo: form.querySelector('#tipo'),
    };

    let isValid = true;

    Object.values(fields).forEach((field) => {
      const errorEl = field.parentElement.querySelector('.field-error');
      const filled = field.value.trim().length > 0;

      field.classList.toggle('is-invalid', !filled);
      if (errorEl) errorEl.classList.toggle('is-visible', !filled);

      if (!filled) isValid = false;
    });

    if (!isValid) {
      status.textContent = 'Completa los campos marcados para continuar.';
      status.style.color = '#FF8080';
      return;
    }

    // Arma el mensaje de WhatsApp con los datos del formulario
    const mensajeExtra = form.querySelector('#mensaje').value.trim();
    const lineas = [
      `Hola PixelCode.sv, quiero cotizar un proyecto:`,
      `Nombre: ${fields.nombre.value.trim()}`,
      `Negocio: ${fields.negocio.value.trim()}`,
      `Teléfono: ${fields.telefono.value.trim()}`,
      `Tipo de proyecto: ${fields.tipo.value}`,
    ];
    if (mensajeExtra) lineas.push(`Detalles: ${mensajeExtra}`);

    const texto = encodeURIComponent(lineas.join('\n'));
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`;

    status.textContent = 'Abriendo WhatsApp…';
    status.style.color = '#22E6C8';

    window.open(url, '_blank', 'noopener');
    form.reset();

    setTimeout(() => {
      status.textContent = '¡Gracias! Te contactaremos por WhatsApp.';
    }, 400);
  });
}
