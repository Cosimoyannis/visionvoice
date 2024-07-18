document.getElementById('screenshot-button').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, async (dataUrl) => {
      const blob = await (await fetch(dataUrl)).blob();
      const formData = new FormData();
      formData.append('image', blob, 'screenshot.png');

      const resultDiv = document.getElementById('result');
      const loadingDiv = document.getElementById('loading');
      const audioPlayer = document.getElementById('audio-player');
      const logo = document.getElementById('logo');

      // Show loading spinner
      loadingDiv.classList.add('visible');
      resultDiv.classList.add('hidden');
      resultDiv.innerHTML = '';

      try {
        const response = await fetch('/analyze-image', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        const reader = new FileReader();
        reader.onload = function(e) {
          resultDiv.innerHTML = `
            <img src="${e.target.result}" alt="Screenshot Image" style="max-width: 100%; max-height: 30vh; margin-bottom: 20px;">
            <p>${data.content}</p>`;
          
          resultDiv.classList.add('hidden');
          audioPlayer.src = '/audio';
          audioPlayer.load();
          audioPlayer.classList.remove('hidden');
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        resultDiv.classList.remove('hidden');
      } finally {
        // Hide loading spinner
        loadingDiv.classList.remove('visible');
      }
    });
  } catch (error) {
    document.getElementById('result').innerHTML = `<p>Error: ${error.message}</p>`;
    document.getElementById('result').classList.remove('hidden');
  }
});
