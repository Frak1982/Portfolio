const dialog = document.getElementById('project-dialog');
if (dialog && typeof dialog.showModal === 'function') {
  const content = document.getElementById('dialog-content');
  for (const button of document.querySelectorAll('[data-project]')) {
    const template = document.getElementById('project-' + button.dataset.project);
    if (!(template instanceof HTMLTemplateElement)) continue;
    button.hidden = false;
    button.addEventListener('click', () => {
      content.replaceChildren(template.content.cloneNode(true));
      dialog.showModal();
    });
  }
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  // Only the backdrop closes the dialog; clicking its inner padding must not.
  let pointerStartedOutside = false;
  const outside = (event) => {
    const bounds = dialog.getBoundingClientRect();
    return (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    );
  };
  dialog.addEventListener('pointerdown', (event) => {
    pointerStartedOutside = outside(event);
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog && pointerStartedOutside && outside(event)) dialog.close();
    pointerStartedOutside = false;
  });
}
