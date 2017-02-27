const exec = require('child_process').exec;
const mp3Duration = require('mp3-duration');
const spawn = require('child_process').spawn;
const sync = require('child_process').spawnSync;
const FileHound = require('filehound');
const path = require('path');
const fs = require('fs');


const config = require(process.argv[2]);
console.log(config);

function lowerBackground(audioTrack, callback){
	console.log('Background lower');
	var extension = path.extname(config.music_bed);
	var loweredFile = tempConfig.musicbedPath + path.basename(config.music_bed, extension) + '.mp3';
	var lowerTask = spawn('sox', [
		'-V',
		'-r 44100',
		'-v 0.1',
		audioTrack,
		loweredFile,
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
	  		callback(loweredFile);
		} else {
		  	console.log('error', code);
		}
	});
};

function padAudio(audioTrack, callback){
	console.log('Padding audio');
	var extension = path.extname(audioTrack);
	var audioPadded = tempConfig.audiopadPath + path.basename(audioTrack, extension) + '.mp3';
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
	  		callback(audioPadded);
		} else {
			console.log('error', code);
		}
	});
}

function mixTracks(musicBed, audioPadded){
	console.log('Starting Mix');
	var extension = path.extname(audioPadded);
	var mixedTrack = tempConfig.audiomixPath + path.basename(audioPadded, extension) + '.mp3';
	mp3Duration(audioPadded, function (err, duration) {
		var mixTracksTask = spawn('sox', [
			'-V',
			'-m',
			'-v 1',
			musicBed,
			'-v 1',
			audioPadded,
			mixedTrack,
			'fade',
			'h',
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
};

function createVideos(image, audio, callback){
	var extension = path.extname(audio);
	var videoFile = tempConfig.videos + path.basename(audio, extension) + '.mp4';
	console.log('Creating:', videoFile);
	var videoCreate = spawn('ffmpeg', [
		'-y',
		'-loop',
		1,
		'-i',
		image,
		'-i',
		audio,
		'-c:v',
		'libx264',
		'-tune',
		'stillimage',
		'-shortest',
		videoFile
	]);
	videoCreate.stdout.on('data', (data) => {
		console.log(`${data}`);
	});

	videoCreate.stderr.on('data', (data) => {
		console.log(`${data}`);
	});

	videoCreate.on('close', (code) => {
		if ( code == 0 ){
			callback();
		} else {
			console.log('error', code);
		}
	});
}

function callVideos(allFiles, currentIndex, callback){
	createVideos(config.cover, allFiles[currentIndex], function(){
		if ( currentIndex + 1 < allFiles.length ){
			callVideos(currentIndex++);
		} else {
			callback();
		}
	});
}


var tempConfig = {};
tempConfig.distPath =  __dirname + '/dist/' + config.distpath;
tempConfig.musicbedPath = tempConfig.distPath + '/musicbed/';
tempConfig.audiopadPath = tempConfig.distPath + '/audiopad/';
tempConfig.audiomixPath = tempConfig.distPath + '/audiomix/';
tempConfig.videos = tempConfig.distPath + '/videos/';

if (!fs.existsSync(tempConfig.distPath )) {
    fs.mkdirSync(tempConfig.distPath);
    fs.mkdirSync(tempConfig.musicbedPath);
    fs.mkdirSync(tempConfig.audiopadPath);
    fs.mkdirSync(tempConfig.audiomixPath);
    fs.mkdirSync(tempConfig.videos);
};

files = FileHound.create()
  .paths(tempConfig.audiomixPath)
  .ext('mp3')
  .find();

files.then(function(found){
	callVideos(found, 0, function(){
		console.log('Videos Completed');
	});
});



/*lowerBackground(config.music_bed, function(musicbed){

	files = FileHound.create()
	  .paths(config.basepath)
	  .ext('flac')
	  .find();

	files.then(function(found){
		console.log(found);
		var mixedTracks = [];
		found.forEach(function(file){
			padAudio(file, function(audiopadded){
				mixTracks(musicbed, audiopadded);
			});
		});
		callVideos(mixedTracks, 0, function(){
			console.log('Videos Completed');
		});
	});
});*/