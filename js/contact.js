const address = document.getElementById('email-address');
const copyButton = document.getElementById('copy-email');
const form = document.getElementById('contact-form');
const email = address?.textContent.trim();
const emailDialog = document.getElementById('email-dialog');
const canChooseEmail = email && typeof emailDialog?.showModal === 'function';

if (canChooseEmail) {
  const preview = document.getElementById('email-preview');
  const previewDetails = document.getElementById('email-preview-details');
  const status = document.getElementById('email-copy-status');
  const copyMessage = document.getElementById('copy-email-message');

  function showEmailOptions(subject = '', body = '') {
    const gmail = new URL('https://mail.google.com/mail/');
    gmail.search = new URLSearchParams({ view: 'cm', fs: '1', to: email, su: subject, body });
    const outlook = new URL('https://outlook.live.com/mail/0/deeplink/compose');
    outlook.search = new URLSearchParams({ to: email, subject, body });
    document.getElementById('email-gmail').href = gmail.href;
    document.getElementById('email-outlook').href = outlook.href;
    document.getElementById('email-app').href =
      'mailto:' +
      email +
      (subject || body
        ? '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)
        : '');
    preview.value = body ? 'A: ' + email + '\nOggetto: ' + subject + '\n\n' + body : email;
    copyMessage.textContent = body ? 'Copia messaggio' : 'Copia indirizzo email';
    previewDetails.open = false;
    status.textContent = '';
    emailDialog.showModal();
  }

  document.querySelectorAll('a[href^="mailto:"]:not([data-email-app])').forEach((link) => {
    link.addEventListener('click', (event) => {
      // Preserve explicit browser actions such as opening a link in a new tab.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      showEmailOptions();
    });
  });

  emailDialog.querySelector('.dialog-close').addEventListener('click', () => emailDialog.close());
  copyMessage.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(preview.value);
      status.textContent = 'Copiato. Incolla il testo nella tua posta.';
    } catch {
      previewDetails.open = true;
      preview.focus();
      preview.select();
      preview.setSelectionRange(0, preview.value.length);
      status.textContent =
        'Testo selezionato. Usa il comando Copia del tuo dispositivo, poi incollalo nella tua posta.';
    }
  });

  if (form) {
    form.hidden = false;
    const nameInput = form.elements.namedItem('name');
    const emailInput = form.elements.namedItem('email');
    const messageInput = form.elements.namedItem('message');
    [nameInput, messageInput].forEach((input) => {
      input.addEventListener('input', () => input.setCustomValidity(''));
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      [nameInput, messageInput].forEach((input) => {
        input.setCustomValidity(input.value.trim() ? '' : 'Inserisci un testo valido.');
      });
      if (!form.reportValidity()) return;
      showEmailOptions(
        'Contatto dal portfolio di Francesco Raciti',
        'Nome: ' +
          nameInput.value.trim() +
          '\nEmail: ' +
          emailInput.value.trim() +
          '\n\n' +
          messageInput.value.trim() +
          '\n\nConsenso al trattamento dei dati: prestato tramite il modulo del sito.',
      );
    });
  }
}
if (copyButton && address && email) {
  copyButton.hidden = false;
  let resetTimer;
  copyButton.addEventListener('click', async () => {
    clearTimeout(resetTimer);
    try {
      await navigator.clipboard.writeText(email);
      copyButton.textContent = '✓ Email copiata';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(address);
      selection?.removeAllRanges();
      selection?.addRange(range);
      copyButton.textContent = 'Email selezionata: usa Copia';
    }
    resetTimer = setTimeout(() => {
      copyButton.textContent = '⧉ Copia email';
    }, 3500);
  });
}
