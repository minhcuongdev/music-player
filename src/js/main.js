const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER'

const cd = $('.cd');
const heading = $('header marquee');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');
const timeStart = $('.time__start');
const timeEnd = $('.time__end');

const cdWith = cd.offsetWidth;
var currentIndex = 0;
var isRandom = false;
var isRepeat = false;
var songTime = 0;
const config = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {};

const setConfig = (key, value) => {
    config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(config));
}

const getConfig = () => {
    return config;
}

const songs = [
    {
        name: 'Em Của Ngày Hôm Qua',
        singer: 'Sơn Tùng MTP',
        path: './src/assets/audio/Em cua ngay hom qua.mp3',
        image: './src/assets/img/Em cua ngay hom qua.png'
    },
    {
        name: 'Nắng Ấm Xa Dân',
        singer: 'Sơn Tùng MTP',
        path: './src/assets/audio/Nang am xa dan.mp3',
        image: './src/assets/img/Nang am xa dan.jpg'
    },
    {
        name: 'Buông Đôi Tay Nhau ra',
        singer: 'Sơn Tùng MTP',
        path: './src/assets/audio/Buong doi tay nhau ra.mp3',
        image: './src/assets/img/Buong doi tay nhau ra.jpg'
    },
    {
        name: 'Nơi Này Có Anh',
        singer: 'Sơn Tùng MTP',
        path: './src/assets/audio/Noi nay co anh.mp3',
        image: './src/assets/img/Noi nay co anh.jpg'
    },
    {
        name: 'Âm Thầm Bên Em',
        singer: 'Sơn Tùng MTP',
        path: './src/assets/audio/Am tham ben em.mp3',
        image: './src/assets/img/Am tham ben em.jpg'
    },
    {
        name: 'Lạc Trôi',
        singer: 'Sơn Tùng MTP',
        path: './src/assets/audio/Lac troi.mp3',
        image: './src/assets/img/Lac troi.jpg'
    },
    {
        name: 'Chúng Ta Không Thuộc Về Nhau',
        singer: 'Son Tung MTP',
        path: './src/assets/audio/Chung ta khong thuoc ve nhau.mp3',
        image: './src/assets/img/Chung ta khong thuoc ve nhau.jpg'
    },
    {
        name: 'Cơn Mưa Ngang Qua',
        singer: 'Sơn Tùng MTP',
        path: './src/assets/audio/Con mua ngang qua.mp3',
        image: './src/assets/img/Con mua ngang qua.jpg'
    },
    {
        name: 'Hãy Trao Cho Anh',
        singer: 'Sơn Tùng MTP',
        path: './src/assets/audio/Hay trao cho anh.mp3',
        image: './src/assets/img/Hay trao cho anh.jpg'
    }
]

const defineProperties = () => {
    Object.defineProperty(this, 'currentSong', {
        get: () => { return songs[currentIndex] }
    })
}

const handleEvent = () => {

    //xu ly phong to thu nho
    document.onscroll = () => {
        let scrollTop = window.scrollY || document.documentElement.scrollTop;
        let newCdWidth = cdWith - scrollTop;

        cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
        cd.style.opacity = newCdWidth / cdWith;
    }

    // xử lý cd rotation
    const cdThumbAnimate = cdThumb.animate([
        { transform: 'rotate(360deg)' }
    ], {
        duration: 10000,
        iterations: Infinity
    })
    cdThumbAnimate.pause();

    let isPlay = false;
    // xu ly khi click play
    playBtn.onclick = () => {
        setConfig('currentIndex',currentIndex);
        if (isPlay) {
            audio.pause();
        } else {
            audio.play();
        }
    }

    //khi song dc play
    audio.onplay = () => {
        isPlay = true;
        player.classList.add('playing');
        cdThumbAnimate.play();
    }

    //khi song dc pause
    audio.onpause = () => {
        isPlay = false;
        player.classList.remove('playing');
        cdThumbAnimate.pause();
    }

    // khi nhấn nút next
    nextBtn.onclick = () => {
        if (isRandom) {
            playRandomSong();
        } else {
            nextSong();
        }
        audio.play();
        render();
        scrollToActiveSong();
    }

    //xu ly khi bam prev
    prevBtn.onclick = () => {
        if (isRandom) {
            playRandomSong();
        } else {
            prevSong();
        }
        audio.play();
        render();
        scrollToActiveSong();
    }

    // xu ly khi bam random
    randomBtn.onclick = () => {
        isRandom = !isRandom;
        setConfig('isRandom', isRandom);
        randomBtn.classList.toggle('active', isRandom);
    }

    //xu ly khi bam repeat
    repeatBtn.onclick = () => {
        isRepeat = !isRepeat;
        setConfig('isRepeat', isRepeat);
        repeatBtn.classList.toggle('active', isRepeat);
    }

    //khi tiến độ bài hát thay đổi
    audio.ontimeupdate = () => {
        if (audio.duration) {
            let progressPercent = audio.currentTime / audio.duration * 100;
            progress.value = progressPercent;

            let second = Math.floor(audio.currentTime) % 60;
            let minute = Math.floor(audio.currentTime / 60) ;

            //console.log(minute+':'+second)
            timeStart.innerHTML = `${minute >= 10 ? minute : '0' + minute}:${second > 9 ? second : '0' + second}`
        }
    }

    // xử lý tua bài hát
    progress.oninput = (e) => {
        let seekTime = e.target.value / 100 * audio.duration;
        audio.currentTime = seekTime;
    }

    // xử lý sự kiện khi audio ended
    audio.onended = () => {
        if (isRepeat) {
            audio.play();
        } else {
            nextBtn.click();
        }
    }

    // xu ly thoi time start and time end
    audio.onloadeddata = () => {
        songTime = audio.duration.toFixed();
        let second = songTime % 60;
        let minute = Math.floor(songTime / 60);
        timeEnd.innerHTML = `${minute >= 10 ? minute : '0' + minute}:${second > 9 ? second : '0' + second}`
    }

    playlist.onclick = (e) => {
        const songNode = e.target.closest('.song:not(.active)');

        if (songNode || e.target.closest('.option')) {
            if (songNode && !e.target.closest('.option')) {
                let songIndex = Number(songNode.dataset.index);
                currentIndex = songIndex;
                setConfig('currentIndex', currentIndex);
                loadCurrentSong();
                audio.play();
                render();
                scrollToActiveSong();
            }

            if (e.target.closest('.option')) {

            }
        }
    }


}


const loadCurrentSong = () => {
    heading.textContent = currentSong.name;
    cdThumb.style.backgroundImage = `url('${currentSong.image}')`;
    audio.src = currentSong.path;
}

const loadConfig = () => {
    if(getConfig().isRandom !== undefined){
        isRandom = getConfig().isRandom;
        randomBtn.classList.toggle('active', isRandom);
    }
    
    if(getConfig().isRepeat !== undefined){
        isRepeat = getConfig().isRepeat;
        repeatBtn.classList.toggle('active', isRepeat);
    }
    
    if(getConfig().currentIndex !== undefined){
        currentIndex = getConfig().currentIndex;
    }
    
}

const nextSong = () => {
    currentIndex++;
    if (currentIndex > songs.length - 1) {
        currentIndex = 0;
    }
    setConfig('currentIndex', currentIndex);
    loadCurrentSong();
}

const prevSong = () => {
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = songs.length - 1;
    }
    setConfig('currentIndex', currentIndex);
    loadCurrentSong();
}

const playRandomSong = () => {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * songs.length);
    } while (currentIndex === newIndex);

    currentIndex = newIndex;
    setConfig('currentIndex', currentIndex);
    loadCurrentSong();
}

const scrollToActiveSong = () => {
    if (currentIndex !== 0 || currentIndex !== 1 || currentIndex !== 2) {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 300);
    } else {
        window.scroll(0);
    }
}

const render = () => {
    let htmls = songs.map((song, index) => {
        return `
            <div class="song ${index === currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')"></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
        `
    })
    playlist.innerHTML = htmls.join('');
}

const start = () => {
    loadConfig();

    defineProperties();
    handleEvent();

    loadCurrentSong();

    render();
}

start();


