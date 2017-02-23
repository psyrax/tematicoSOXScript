const exec = require('child_process').exec;
const originalBack = __dirname + '/back.mp3';
const lowerBack = __dirname + '/lowerBack.mp3';
const mp3Duration = require('mp3-duration');
const spawn = require('child_process').spawn;
const FileHound = require('filehound');
const path = require('path');

function lowerBackground(audioTrack, audioPadded, mixedTrack){
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
	  		padAudio(audioTrack, audioPadded, mixedTrack);
		} else {
		  	console.log('error', code);
		}
	});
};

function padAudio(audioTrack, audioPadded, mixedTrack){
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
	  		mixTracks(audioTrack, audioPadded, mixedTrack);
		} else {
			console.log('error', code);
		}
	});
}

function mixTracks(audioTrack, audioPadded, mixedTrack){
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

function startTasks(audioTrack, audioPadded, mixedTrack){
	lowerBackground(audioTrack, audioPadded, mixedTrack);
};

files = FileHound.create()
  .paths(process.argv[2])
  .ext('flac')
  .find();

files.then(function(found){
	console.log(found);
	found.forEach(function(file){
		var audioTrack = file;
		var audioPadded =  __dirname + '/tmp/' + path.basename(file, '.flac') + '.mp3';
		var mixedTrack = __dirname + '/mixed/' + path.basename(file, '.flac') + '.mp3';
		startTasks(audioTrack, audioPadded, mixedTrack);
	})
});