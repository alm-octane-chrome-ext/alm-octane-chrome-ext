const allAudioStreams = [
  {"name": "1.FM 50s & 60s", "src": "https://strm112.1.fm/60s_70s_mobile_mp3"},
  {"name": "1.FM Absolute 70s Pop", "src": "https://strm112.1.fm/70s_mobile_mp3"},
  {"name": "1.FM America's Best Ballads", "src": "https://strm112.1.fm/onelive_mobile_mp3"},
  {"name": "1.FM Blues", "src": "https://strm112.1.fm/blues_mobile_mp3"},
  {"name": "1.FM Italia", "src": "https://strm112.1.fm/italiaonair_mobile_mp3"},
  {"name": "1.FM Reggae Trade", "src": "https://strm112.1.fm/reggae_mobile_mp3"},
  {"name": "1.FM Slow Jamz", "src": "https://strm112.1.fm/slowjamz_mobile_mp3"},
  {"name": "80s Alive", "src": "https://media2.hostin.cc/80s-alive.mp3"},
  {"name": "80s Forever", "src": "https://azuracast.ssl-stream.com/radio/8050/256.mp3"},
  {"name": "8Radio", "src": "https://edge4.audioxi.com/8RADIO"},
  {"name": "Aardvark Blues", "src": "https://ais-sa5.cdnstream1.com/b77280_128mp3"},
  {"name": "ABC Classic 2", "src": "https://live-radio01.mediahubaustralia.com/FM2W/mp3/"},
  {"name": "ABC Jazz", "src": "https://live-radio01.mediahubaustralia.com/JAZW/mp3/"},
  {"name": "Absolute Chillout", "src": "https://ais-sa5.cdnstream1.com/b05055_128mp3"},
  {"name": "Africana", "src": "https://s39.myradiostream.com/:8888/listen.mp3"},
  {"name": "Ambient Sleeping Pill", "src": "https://radio.stereoscenic.com/asp-h"},
  {"name": "America's Country", "src": "https://ais-sa2.cdnstream1.com/1976_128.mp3"},
  {"name": "Antenne 70s Rock", "src": "https://s3-webradio.rockantenne.de/70er-rock/stream/mp3"},
  {"name": "Antenne 80s Rock", "src": "https://s7-webradio.rockantenne.de/80er-rock/stream/mp3"},
  {"name": "Antenne 90s Rock", "src": "https://s7-webradio.rockantenne.de/90er-rock/stream/mp3"},
  {"name": "Antenne Alternative", "src": "https://s3-webradio.rockantenne.de/alternative/stream/mp3"},
  {"name": "Antenne Chillout", "src": "https://s2-webradio.antenne.de/chillout/stream/mp3"},
  {"name": "Antenne Greatest Hits", "src": "https://s1-webradio.antenne.de/greatest-hits/stream/mp3"},
  {"name": "Antenne Love Songs", "src": "https://s5-webradio.antenne.de/lovesongs/stream/mp3"},
  {"name": "Antenne Modern Rock", "src": "https://s2-webradio.rockantenne.de/modern-rock/stream/mp3"},
  {"name": "Antenne Rock", "src": "https://s6-webradio.rockantenne.de/rockantenne/stream/mp3"},
  {"name": "Antenne Soft Rock", "src": "https://s1-webradio.rockantenne.de/soft-rock/stream/mp3"},
  {"name": "Antenne Symphonic Rock", "src": "https://s4-webradio.rockantenne.de/symphonic-rock/stream/mp3"},
  {"name": "Antenne Top 40", "src": "https://s6-webradio.antenne.de/top-40/stream/mp3"},
  {"name": "Asterisk", "src": "https://securestreams6.autopo.st:2173/stream"},
  {"name": "Bakahnal Caribbean", "src": "https://streams.radio.co/s4ee0c1592/listen"},
  {"name": "BigB CPOP", "src": "https://antares.dribbcast.com/proxy/cpop?mp=/s"},
  {"name": "BigB JPOP", "src": "https://antares.dribbcast.com/proxy/jpop?mp=/s"},
  {"name": "Blues", "src": "https://i4.streams.ovh/sc/bluesrad/stream"},
  {"name": "Boss Boss", "src": "https://ais-sa5.cdnstream1.com/b26873_128mp3"},
  {"name": "Box UK", "src": "https://boxstream.danceradiouk.com/stream/1/"},
  {"name": "Café del Mar", "src": "https://streams.radio.co/se1a320b47/listen"},
  {"name": "Celtic Moon", "src": "https://jenny.torontocast.com:2000/stream/CelticMoon"},
  {"name": "Chaos", "src": "http://node-34.zeno.fm/wmpk2q28fwzuv"},
  {"name": "Chill", "src": "https://media-ice.musicradio.com/ChillMP3"},
  {"name": "Cinemix", "src": "https://kathy.torontocast.com:1825/stream"},
  {"name": "Classic Rock 109", "src": "https://tunes1.classicrock109.com/cr109"},
  {"name": "Dakar Musique", "src": "https://listen.senemultimedia.net:8092/stream"},
  {"name": "DanceFM", "src": "https://edge126.rcs-rds.ro/profm/dancefm.mp3"},
  {"name": "Dancehall Live", "src": "https://streamer.radio.co/s830ce6f36/listen"},
  {"name": "DigiFM", "src": "https://edge76.rcs-rds.ro/digifm/digifm.mp3"},
  {"name": "Disco Palace", "src": "https://broadcast.miami/proxy/thediscopalace?mp=/stream/;"},
  {"name": "Eco 99", "src": "https://eco01.livecdn.biz/ecolive/99fm/icecast.audio"},
  {"name": "Electronic Dance Experience", "src": "https://patmos.cdnstream.com/proxy/aamppcre?mp=/stream"},
  {"name": "EuropaFM", "src": "https://astreaming.edi.ro:8443/EuropaFM_aac"},
  {"name": "FDNY Scanner", "src": "https://broadcastify.cdnstream1.com/9358"},
  {"name": "Folk Alley", "src": "https://freshgrass.streamguys1.com/folkalley-128mp3-tunein"},
  {"name": "Forest Green", "src": "https://stream.streamaudio.de:8000/forest-green"},
  {"name": "Funky Corner", "src": "https://ais-sa2.cdnstream1.com/2447_192.mp3"},
  {"name": "GotRadio Alternative", "src": "https://pureplay.cdnstream1.com/6033_128.mp3"},
  {"name": "GotRadio Metal", "src": "https://pureplay.cdnstream1.com/6014_128.mp3"},
  {"name": "GotRadio R&B Classics", "src": "https://pureplay.cdnstream1.com/6023_128.mp3"},
  {"name": "GotRadio Reggae", "src": "https://pureplay.cdnstream1.com/6051_128.mp3"},
  {"name": "GotRadio Soft Rock Café", "src": "https://pureplay.cdnstream1.com/6010_128.mp3"},
  {"name": "GotRadio The 50s", "src": "https://pureplay.cdnstream1.com/6005_128.mp3"},
  {"name": "GotRadio The 60s", "src": "https://pureplay.cdnstream1.com/6011_128.mp3"},
  {"name": "GotRadio The 70s", "src": "https://pureplay.cdnstream1.com/6013_128.mp3"},
  {"name": "GotRadio The 80s", "src": "https://pureplay.cdnstream1.com/6009_128.mp3"},
  {"name": "GotRadio Urban", "src": "https://pureplay.cdnstream1.com/6044_64.aac"},
  {"name": "Guerrilla", "src": "https://s2.stationplaylist.com:9460/guerrilla"},
  {"name": "Hot Hitz 80s", "src": "https://s1.reliastream.com/proxy/hothitz80s?mp=/stream"},
  {"name": "ISKC Rock", "src": "https://443-1.autopo.st/79/RockRadio"},
  {"name": "Italian Music", "src": "https://streaming.radiostreamlive.com/radioitalianmusic_devices"},
  {"name": "Jazz Cafe", "src": "http://radio.wanderingsheep.net:8090/jazzcafe320"},
  {"name": "Kan 88", "src": "https://kanliveicy.media.kan.org.il/icy/kan88_mp3"},
  {"name": "Kan Tarbut", "src": "http://kanliveicy.media.kan.org.il/icy/kantarbut_mp3"},
  {"name": "KissFM", "src": "https://live.kissfm.ro/kissfm.aacp"},
  {"name": "Kol Hamusica", "src": "https://kanliveicy.media.kan.org.il/icy/kankolhamusica_mp3"},
  {"name": "LAPD South Scanner", "src": "https://broadcastify.cdnstream1.com/20296"},
  {"name": "LAPD Valley Scanner", "src": "https://broadcastify.cdnstream1.com/26569"},
  {"name": "Large Caribbean", "src": "https://sonic01.instainternet.com/8312/stream"},
  {"name": "MagicFM", "src": "https://live.magicfm.ro/magicfm.aacp"},
  {"name": "Morow", "src": "https://stream.morow.com/morow_med.mp3"},
  {"name": "New York Live", "src": "https://streaming.radiostreamlive.com/radionylive_devices"},
  {"name": "ON Classic Rock", "src": "https://0n-classicrock.radionetz.de/0n-classicrock.mp3"},
  {"name": "Paradise", "src": "https://stream-tx3.radioparadise.com/mp3-192"},
  {"name": "Positively 00s", "src": "https://streaming.positivity.radio/pr/posi00s/icecast.audio"},
  {"name": "Positively 60s", "src": "https://streaming.positivity.radio/pr/posi60s/icecast.audio"},
  {"name": "Positively 70s", "src": "https://streaming.positivity.radio/pr/posi70s/icecast.audio"},
  {"name": "Positively 80s", "src": "https://streaming.positivity.radio/pr/posi80s/icecast.audio"},
  {"name": "Positively 90s", "src": "https://streaming.positivity.radio/pr/posi90s/icecast.audio"},
  {"name": "Positively Easy", "src": "https://streaming.positivity.radio/pr/posieasy/icecast.audio"},
  {"name": "ProFM", "src": "https://edge126.rcs-rds.ro/profm/profm.mp3"},
  {"name": "Prog Palace", "src": "https://cheetah.streemlion.com:4775/stream"},
  {"name": "Radios 100 Oldies", "src": "https://gb25.streamgates.net/radios-audio/100Oldies/icecast.audio"},
  {"name": "Rastafari Jams", "src": "https://s2.radio.co/sccc2dccb5/listen"},
  {"name": "Reshet Bet", "src": "http://kanliveicy.media.kan.org.il/icy/kanbet_mp3"},
  {"name": "Reshet Gimmel", "src": "http://kanliveicy.media.kan.org.il/icy/kangimmel_mp3"},
  {"name": "RockFM", "src": "https://live.rockfm.ro/rockfm.aacp"},
  {"name": "Romantic Italy", "src": "https://italianradio.streamingmedia.it/play"},
  {"name": "Ronin Japan", "src": "https://s3.radio.co/sff133d65b/listen"},
  {"name": "Soma Beat Blender", "src": "http://ice1.somafm.com/beatblender-128-mp3"},
  {"name": "Soma Black Rock", "src": "http://ice1.somafm.com/brfm-128-mp3"},
  {"name": "Soma Boot Liquor", "src": "http://ice1.somafm.com/bootliquor-128-mp3"},
  {"name": "Soma cliqhop idm", "src": "http://ice1.somafm.com/cliqhop-128-mp3"},
  {"name": "Soma Covers", "src": "http://ice1.somafm.com/covers-128-mp3"},
  {"name": "Soma Deep Space One", "src": "http://ice1.somafm.com/deepspaceone-128-mp3"},
  {"name": "Soma DEF CON", "src": "http://ice1.somafm.com/defcon-128-mp3"},
  {"name": "Soma Digitalis", "src": "http://ice1.somafm.com/digitalis-128-mp3"},
  {"name": "Soma Drone Zone", "src": "http://ice1.somafm.com/dronezone-128-mp3"},
  {"name": "Soma Dub Step Beyond", "src": "http://ice1.somafm.com/dubstep-128-mp3"},
  {"name": "Soma Fluid", "src": "http://ice1.somafm.com/fluid-128-mp3"},
  {"name": "Soma Folk Forward", "src": "http://ice1.somafm.com/folkfwd-128-mp3"},
  {"name": "Soma Groove Salad", "src": "http://ice1.somafm.com/groovesalad-128-mp3"},
  {"name": "Soma Groove Salad Classic", "src": "http://ice1.somafm.com/gsclassic-128-mp3"},
  {"name": "Soma Heavyweight Reggae", "src": "http://ice1.somafm.com/reggae-128-mp3"},
  {"name": "Soma Illinois Street Lounge", "src": "http://ice1.somafm.com/illstreet-128-mp3"},
  {"name": "Soma Indie Pop Rocks!", "src": "http://ice1.somafm.com/indiepop-128-mp3"},
  {"name": "Soma Left Coast 70s", "src": "http://ice1.somafm.com/seventies-128-mp3"},
  {"name": "Soma Lush", "src": "http://ice1.somafm.com/lush-128-mp3"},
  {"name": "Soma Metal Detector", "src": "http://ice1.somafm.com/metal-128-mp3"},
  {"name": "Soma n5MD", "src": "http://ice1.somafm.com/n5md-128-mp3"},
  {"name": "Soma PopTron", "src": "http://ice1.somafm.com/poptron-128-mp3"},
  {"name": "Soma Secret Agent", "src": "http://ice1.somafm.com/secretagent-128-mp3"},
  {"name": "Soma Seven Inch Soul", "src": "http://ice1.somafm.com/7soul-128-mp3"},
  {"name": "Soma SF Police Scanner", "src": "http://ice1.somafm.com/scanner-128-mp3"},
  {"name": "Soma Live", "src": "http://ice1.somafm.com/live-128-mp3"},
  {"name": "Soma Sonic Universe", "src": "http://ice1.somafm.com/sonicuniverse-128-mp3"},
  {"name": "Soma Space Station", "src": "http://ice1.somafm.com/spacestation-128-mp3"},
  {"name": "Soma Suburbs of Goa", "src": "http://ice1.somafm.com/suburbsofgoa-128-mp3"},
  {"name": "Soma The Trip", "src": "http://ice1.somafm.com/thetrip-128-mp3"},
  {"name": "Soma Thistle", "src": "http://ice1.somafm.com/thistle-128-mp3"},
  {"name": "Soma Underground 80s", "src": "http://ice1.somafm.com/u80s-128-mp3"},
  {"name": "Soma Vaporwaves", "src": "http://ice1.somafm.com/vaporwaves-128-mp3"},
  {"name": "Spoon", "src": "https://spoonradio.ice.infomaniak.ch/spoonradio-hd.mp3"},
  {"name": "Studio 19 Greece", "src": "https://stream.crete.ovh:8443/1"},
  {"name": "Sunny 105", "src": "https://us5.internet-radio.com/proxy/sunny105?mp=/stream;"},
  {"name": "Surf Shack", "src": "https://streamer.radio.co/s74e0a4911/listen"},
  {"name": "Tel Aviv 102", "src": "https://102.livecdn.biz/102fm_aac"},
  {"name": "That 70s Channel", "src": "https://ais-sa5.cdnstream1.com/b68000_128mp3"},
  {"name": "Virgin", "src": "https://astreaming.edi.ro:8443/VirginRadio_aac"},
];