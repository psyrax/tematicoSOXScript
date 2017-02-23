const exec = require('child_process').exec;
const originalBack = __dirname + '/back.mp3';
const lowerBack = __dirname + '/lowerBack.mp3';
const audioTrack = __dirname + '/1.flac';
const audioPadded = __dirname + '/1.mp3';
const mixedTrack = __dirname + '/1mixed.mp3';
const mp3Duration = require('mp3-duration');
const spawn = require('child_process').spawn;

function lowerBackground(){
	console.log('Background lower');
	var lowerTask = spawn('sox', [
		'-V',
		'-r 44100',
		'-v 0.1',
		originalBack,
		originalBack,
		'repeat',
		'5'
	]);

	lowerTask.stdout.on('data', (data) => {
	  console.log(`${data}`);
	});

	lowerTask.stderr.on('data', (data) => {
	  console.log(`${data}`);
	});

	lowerTask.on('close', (code) => {
	  if ( code == 0 ){
	  	console.log('Background lower complete');
	  	padAudio();
	  } else {
		  	console.log('error', code);
		  }
	});
};

function padAudio(){
	console.log('Padding audio');
	var padAudioTask = spawn('sox', [
		'-V',
		audioTrack,
		'-r 44100',
		audioPadded,
		'pad',
		'3',
		'3'
	]);
	padAudioTask.stdout.on('data', (data) => {
	  console.log(`${data}`);
	});

	padAudioTask.stderr.on('data', (data) => {
	  console.log(`${data}`);
	});

	padAudioTask.on('close', (code) => {
	  if ( code == 0 ){
	  	console.log('Pad complete');
	  	mixTracks();
	  } else {
		console.log('error', code);
		}
	});
}

function mixTracks(){
	console.log('Starting Mix');
	mp3Duration(audioPadded, function (err, duration) {
		var mixTracksTask = spawn('sox', [
			'-V',
			'-m',
			'-v 1',
			lowerBack,
			'-v 1',
			audioPadded,
			mixedTrack,
			'fade',
			'2.5',
			duration
		]);
		mixTracksTask.stdout.on('data', (data) => {
		  console.log(`${data}`);
		});

		mixTracksTask.stderr.on('data', (data) => {
		  console.log(`${data}`);
		});

		mixTracksTask.on('close', (code) => {
		  if ( code == 0 ){
		  	console.log('Mixing complete');
		  } else {
		  	console.log('error', code);
		  }
		});
	});
}

lowerBackground();

/*console.log('Lowering Background');
exec('sox -V --rate 44100 -v 0.1 "' + originalBack + '" "' + lowerBack +'" repeat 5', (error, stdout, stderr) => {
	if (error) {
		console.error(`Lowering error: ${error}`);
		return;
	}
	console.log(stderr);
	console.log('Transcoding audio track');
  	exec('sox -V "' + audioTrack + '" -r 44100 "' + audioPadded + '" pad 3 3' , (error, stdout, stderr) => {
  		if (error) {
    		console.error(`Transcoding error: ${error}`);
    		return;
  		}
  		console.log(stderr);
  		console.log('Getting duration');
  		mp3Duration(audioPadded, function (err, duration) {
			if (err) return console.log(err.message);
  			exec('sox -V -m  -v 1 "' + lowerBack + '" -v 1 "' + audioPadded + '" "'+ mixedTrack +'" fade 2.5 '+ duration , (error, stdout, stderr) => {
  				if (error) {
    				console.error(`Mixing error: ${error}`);
    				return;
  				}
  				console.log(stderr);
			});
		});
	});
});*/