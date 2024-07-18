
document.getElementById('screenshot-button').addEventListener('click', () => {
  console.log('Take Screenshot button clicked');
  chrome.runtime.sendMessage({ action: "captureScreenshot" }, async (response) => {
    if (response.screenshotUrl) {
      console.log('Screenshot captured:', response.screenshotUrl);
      const blob = await (await fetch(response.screenshotUrl)).blob();
      const formData = new FormData();
      formData.append('image', blob, 'screenshot.png');

      const resultDiv = document.getElementById('result');
      const loadingDiv = document.getElementById('loading');

      // Show loading spinner
      loadingDiv.classList.add('visible');
      resultDiv.innerHTML = '';

      try {
        const fetchResponse = await fetch('https://visionvoice-3fe2867078e2.herokuapp.com/analyze-image', {
          method: 'POST',
          body: formData
        });

        const data = await fetchResponse.json();
        console.log('Server response:', data);

        const reader = new FileReader();
        reader.onload = function(e) {
          resultDiv.innerHTML = `
            <img src="${e.target.result}" alt="Screenshot Image" style="max-width: 100%; max-height: 30vh; margin-bottom: 20px;">
            <audio controls id="audio-player"></audio>
            <p>${data.content}</p>`;
          
          const audioPlayer = document.getElementById('audio-player');
          audioPlayer.src = 'https://visionvoice-3fe2867078e2.herokuapp.com//audio';
          audioPlayer.load();
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error:', error);
        resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
      } finally {
        // Hide loading spinner
        loadingDiv.classList.remove('visible');
      }
    }
  });
});
