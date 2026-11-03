const address = document.getElementById('email-address');
const copyButton = document.getElementById('copy-email');
const form = document.getElementById('contact-form');
const email = address?.textContent.trim();
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
if (form && email) {
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
    const subject = encodeURIComponent('Richiesta di collaborazione dal portfolio');
    const body = encodeURIComponent(
      'Nome: ' +
        nameInput.value.trim() +
        '\nEmail: ' +
        emailInput.value.trim() +
        '\n\n' +
        messageInput.value.trim(),
    );
    window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
  });
}
