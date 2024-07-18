document.getElementById('screenshot-button').addEventListener('click', () => {
  console.log('Take Screenshot button clicked');
  chrome.runtime.sendMessage({ action: "captureScreenshot" }, async (response) => {
    if (response.screenshotUrl) {
      console.log('Screenshot captured:', response.screenshotUrl);
      const blob = await (await fetch(response.screenshotUrl)).blob();
      const formData = new FormData();
      formData.append('image', blob, 'screenshot.png');

      // Hide the initial content and show the loading spinner
      document.getElementById('logo').classList.add('hidden');
      document.getElementById('title').classList.add('hidden');
      document.getElementById('screenshot-button').classList.add('hidden');
      document.getElementById('loading').classList.remove('hidden');

      try {
        const fetchResponse = await fetch('https://your-app-name.herokuapp.com/analyze-image', {
          method: 'POST',
          body: formData
        });

        const data = await fetchResponse.json();
        console.log('Server response:', data);

        // Update the UI with the result
        const audioPlayer = document.getElementById('audio-player');
        audioPlayer.src = 'https://your-app-name.herokuapp.com/audio';
        audioPlayer.load();

        const resultContent = document.getElementById('result-content');
        resultContent.textContent = data.content;

        // Hide the loading spinner and show the result
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('result').classList.remove('hidden');
      } catch (error) {
        console.error('Error:', error);
        document.getElementById('result-content').textContent = `Error: ${error.message}`;
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('result').classList.remove('hidden');
      }
    }
  });
});
