const axios = require('axios');
const { exec } = require('child_process');

// Function to pull video from server by ID
async function getVideoById(videoId) {
  try {
    const response = await axios.get(`http://localhost:3000/videos/${videoId}`, {
      responseType: 'arraybuffer' // To receive binary data
    });
    return response.data;
  } catch (error) {
    console.error('Error retrieving video:', error.response.data);
    return null;
  }
}

// Function to extract frames from video using ffmpeg
function extractFrames(videoStream, timestamps) {
  const timestampString = timestamps.map(timestamp => `eq(n\\,${timestamp})`).join('+');
  const command = `ffmpeg -i pipe:0 -vf "select=${timestampString}" -vsync 0 -f image2pipe -vcodec ppm -` ;

  const childProcess = exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error extracting frames:', error);
    } else {
      console.log('Frames extracted successfully');
    }
  });

  // Pipe video stream to ffmpeg process
  videoStream.pipe(childProcess.stdin);

  // Handle stdout of the ffmpeg process
  childProcess.stdout.on('data', (data) => {
    // Here you can process the extracted frames (stored in data)
    console.log('Frame data:', data);
  });

  // Handle stderr of the ffmpeg process
  childProcess.stderr.on('data', (data) => {
    console.error('ffmpeg stderr:', data);
  });
}

// Example usage
const videoId = 'replace_with_video_id'; // Provide the actual video ID
const timestamps = [10, 20, 30]; // Timestamps at which frames are to be extracted

async function main() {
  const videoStream = await getVideoById(videoId);
  if (videoStream) {
    extractFrames(videoStream, timestamps);
  } else {
    console.error('Failed to retrieve video stream');
  }
}

main();
