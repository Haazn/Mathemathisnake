        let persistentBackgroundMusicOnThisPage;

        function initializePersistentMusic() {
            const musicSrcFromStorage = localStorage.getItem('musicSrc');
            if (!musicSrcFromStorage) {
                console.log(`PersistentMusic (${window.location.pathname}): No musicSrc found in localStorage.`);
                return;
            }

            persistentBackgroundMusicOnThisPage = new Audio(musicSrcFromStorage);

            const shouldBePlaying = localStorage.getItem('musicShouldBePlaying') === 'true';
            const lastTime = parseFloat(localStorage.getItem('musicTime')) || 0;
            const wasMuted = localStorage.getItem('musicMuted') === 'true';
            const shouldLoop = localStorage.getItem('musicLoop') !== 'false'; // Default true

            console.log(`PersistentMusic (${window.location.pathname}): Initializing with state:`, { musicSrcFromStorage, shouldBePlaying, lastTime, wasMuted, shouldLoop });

            persistentBackgroundMusicOnThisPage.currentTime = lastTime;
            persistentBackgroundMusicOnThisPage.muted = wasMuted;
            persistentBackgroundMusicOnThisPage.loop = shouldLoop;

            if (shouldBePlaying && !wasMuted) { 
                const playPromise = persistentBackgroundMusicOnThisPage.play();
                if(playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log(`PersistentMusic (${window.location.pathname}): Playback started/resumed.`);
                    }).catch(error => {
                        console.warn(`PersistentMusic (${window.location.pathname}): Autoplay was PREVENTED. Error:`, error);
                        // If autoplay is prevented here, the music will be paused.
                        // The user might need to interact with play.html options again to "unpause" globally.
                    });
                }
            } else {
                 console.log(`PersistentMusic (${window.location.pathname}): Not playing automatically (shouldBePlaying: ${shouldBePlaying}, wasMuted: ${wasMuted}).`);
            }
        }

        function saveMusicStateFromThisPage() {
            if (persistentBackgroundMusicOnThisPage) {
                localStorage.setItem('musicSrc', persistentBackgroundMusicOnThisPage.src);
                localStorage.setItem('musicShouldBePlaying', String(!persistentBackgroundMusicOnThisPage.paused && !persistentBackgroundMusicOnThisPage.ended));
                localStorage.setItem('musicTime', String(persistentBackgroundMusicOnThisPage.currentTime));
                localStorage.setItem('musicMuted', String(persistentBackgroundMusicOnThisPage.muted));
                localStorage.setItem('musicLoop', String(persistentBackgroundMusicOnThisPage.loop));
                console.log(`PersistentMusic (${window.location.pathname}): Saved state before unload:`, { 
                    shouldPlay: !persistentBackgroundMusicOnThisPage.paused && !persistentBackgroundMusicOnThisPage.ended, 
                    muted: persistentBackgroundMusicOnThisPage.muted,
                    time: persistentBackgroundMusicOnThisPage.currentTime,
                    loop: persistentBackgroundMusicOnThisPage.loop
                });
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            initializePersistentMusic();
        });

        window.addEventListener('beforeunload', saveMusicStateFromThisPage);

       
        const allLinksOnPage = document.querySelectorAll('a');
        allLinksOnPage.forEach(link => {
            link.addEventListener('click', function(event) {
                
                const href = this.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('javascript:')) {
                    console.log(`PersistentMusic (${window.location.pathname}): Saving state before navigating via <a> tag to ${href}`);
                    saveMusicStateFromThisPage();
                }
            });
        });
