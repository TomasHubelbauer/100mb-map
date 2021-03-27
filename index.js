import parse from './parse.js';

window.addEventListener('load', () => {
  const introDiv = document.querySelector('#introDiv');
  const input = document.querySelector('input');
  const statusDiv = document.querySelector('#statusDiv');
  input.addEventListener('change', async () => {
    if (input.files?.length !== 1) {
      statusDiv.textContent = 'Select a single file';
      return;
    }

    introDiv.remove();
    input.remove();

    const file = input.files[0];
    statusDiv.textContent = 'Got a file - converting to a buffer';
    const arrayBuffer = await file.arrayBuffer();
    const dataView = new DataView(arrayBuffer);
    statusDiv.textContent = 'Got a buffer - parsing';

    let limit = 20;
    for (const message of parse(dataView)) {
      console.log(message);
      if (limit-- === 0) {
        break;
      }
    }

    statusDiv.textContent = 'Done parsing - check console';
  });

  // Process the remembered selected file (by the browser) immediately if any
  if (input.value) {
    input.dispatchEvent(new Event('change'));
  }
});
