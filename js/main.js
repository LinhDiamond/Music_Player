const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER';

const heading = $('.audio-player__namesong');
const cdThumb = $('.audio-player__imgsong');
const audio = $('#audio');

const player = $('.audio-player');
const cd = $('.audio-player__imgsong');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const listSong = $('.list-song');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandomActive: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Ai Chung Tình Được Mãi',
            singer: 'Đinh Tùng Huy',
            image: './img/song1.jpg',
            path: './music/song1.mp3'
        },
        {
            name: 'Hai Chữ Đã Từng',
            singer: 'Như Việt',
            image: './img/song2.jpg',
            path: './music/song2.mp3'
        },
        {
            name: 'Thấm Thía',
            singer: 'Tống Gia Vỹ',
            image: './img/song3.jpg',
            path: './music/song3.mp3'
        },
        {
            name: 'Em Sẽ Là Cô Dâu',
            singer: 'Minh Vương',
            image: './img/song4.jpg',
            path: './music/song4.mp3'
        },
        {
            name: 'Tướng Quân',
            singer: 'Nhật Phong',
            image: './img/song5.jpg',
            path: './music/song5.mp3'
        },
        {
            name: 'Có Đáng Hay Không',
            singer: 'Vương Thiên Tuấn',
            image: './img/song6.jpg',
            path: './music/song6.mp3'
        },
        {
            name: 'Sợ Đánh Mất Em',
            singer: 'Nguyễn Mạnh, Jin Tuấn Nam',
            image: './img/song7.jpg',
            path: './music/song7.mp3'
        },
        {
            name: 'Dĩ Vãng Cuộc Tình',
            singer: 'Duy Mạnh',
            image: './img/song8.jpg',
            path: './music/song8.mp3'
        },
        {
            name: 'Anh Thương Em Còn Non Dại',
            singer: 'Đình Dũng, ACV',
            image: './img/song9.jpg',
            path: './music/song9.mp3'
        },
        {
            name: 'Không Đáng Để Thương',
            singer: 'Đinh Tùng Huy',
            image: './img/song10.jpg',
            path: './music/song10.mp3'
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="list-song__item ${index === app.currentIndex ? 'active' : ''}" data-index="${index}">
                    <img class="song__item-img" src="${song.image}" alt="Bát hát được lựa chọn: ${song.name}">
                    <div class="song-item__info">
                        <h2>${song.name}</h2>
                        <span class="song-item__info--singer">${song.singer}</span>
                    </div>
                    <div class="song-item__option">
                        <i class="fa-solid fa-ellipsis"></i>
                    </div>
                </div>
            `
        })
        listSong.innerHTML = htmls.join('\n');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function (e) {
        // Xử lý CD quay và dừng
        const cdThumbAnimate =  cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10s
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        // XỬ lý phóng to thu nhỏ CD
        const cdWidth  = cd.offsetWidth;
        document.onscroll = function () {
            const scrollTop = window.scrollY || (document.documentElement.scrollTop);
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth> 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // XỬ lý khi click nút play 
        playBtn.onclick = function(e) {
            if(app.isPlaying){
                audio.pause()
            }
            else
            {
                audio.play()
            }
        }

        // Khi bài hát được play
        audio.onplay = function(e) {
            app.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        // Khi bài hát bị pause
        audio.onpause = function(e) {
            app.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi time bài hát được update
        audio.ontimeupdate = function(e) {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }
        // Xử lý tua bài hát
        progress.onchange = function(e) {
            const seekTime =  progress.value / 100 * audio.duration;
            audio.currentTime = seekTime;
        }

        // Khi next bài hát
        nextBtn.onclick = function(e) {
            if(app.isRandomActive) {
                app.randomSong();
            } else {
                app.nextSong();
            }
            audio.play();
            app.render();
            app.scrollToActiveSong();
        }
        // Khi previous bài hát
        prevBtn.onclick = function(e) {
            if(app.isRandomActive) {
                app.randomSong();
            } else {
                app.prevSong();
            }
            audio.play();
            app.render();
            app.scrollToActiveSong();
        }

        // Khi bật / tắt random bài hát
        randomBtn.onclick = function(e) {
            app.isRandomActive = !app.isRandomActive;
            app.setConfig('isRandomActive', app.isRandomActive);
            randomBtn.classList.toggle('active');
        }

        // Xử lý lặp lai audio
        repeatBtn.onclick = function(e) {
            app.isRepeat = !app.isRepeat;
            app.setConfig('isRepeat', app.isRepeat);
            repeatBtn.classList.toggle('active');
        }

        // XỬ lý next bài hát khi audio ended
        audio.onended = function () {
            // Cần xử lý thêm k lặp lại những bài đã hát rồi khi random  
            if(app.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // Lắng nghe hành vi click vào play list 
        listSong.onclick = function (e) {
            const songNode = e.target.closest('.list-song__item:not(.active)');
           if (songNode || e.target.closest('.song-item__option'))
           {
                if(songNode) {
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    audio.play();
                    app.render();
                }
           }
        }

    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.src = this.currentSong.image;
        audio.src = this.currentSong.path;
    },
    loadConfig: function () {
        this.isRandomActive = this.config.isRandomActive;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    randomSong: function() {
        var newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollToActiveSong : function () {
        setTimeout(() => {
            $('.list-song__item.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }, 200);
    },
    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        // Đĩnh nghĩa các thuộc tính cho Object
        this.defineProperties();
        // Lắng nghe / xử lý các sự kiện (DOM Event)
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi lần đầu tiên chạy
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // randomBtn.classList.toggle('active', this.isRandomActive);
        // repeatBtn.classList.toggle('active', this.isRepeat);
    },
};
app.start();