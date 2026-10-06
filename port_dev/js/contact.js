/*
  CONTACT MODAL
  -------------
  Any element with [data-open-contact] opens the modal; the modal closes
  on its own close button, a backdrop click, or Escape.

  Mock email is a constant here — change CONTACT_EMAIL in one place when
  there's a real inbox to point at.
*/

(function () {
  var CONTACT_EMAIL = 'sadiegold@gmail.com';

  var modal = document.querySelector('.contact-modal');
  if (!modal) return;

  var emailLink = modal.querySelector('.contact-modal__email');
  if (emailLink) {
    emailLink.textContent = CONTACT_EMAIL;
    emailLink.href =
      'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONTACT_EMAIL);
    emailLink.target = '_blank';
    emailLink.rel = 'noopener';
  }

  function open() { modal.classList.add('is-open'); }
  function close() { modal.classList.remove('is-open'); }

  document.querySelectorAll('[data-open-contact]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      open();
    });
  });

  var closeBtn = modal.querySelector('.contact-modal__close');
  if (closeBtn) closeBtn.addEventListener('click', close);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();
