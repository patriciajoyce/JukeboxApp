function reqParam() {
    throw new Error('This is a required param!');
}

(function() { 


    const validateSearch = (value) => {
        return new Promise((resolve, reject) => {
            if (value.trim() === "") {
                reject('Input a value');
            }

            resolve(value);
        });
    };

    const addTrackToHTML = (track) => {
        const {name, preview_url, id, album} = track;
        const imageUrl = album.images[1].url;

        // add the generate HTML contents to the search results div
        const div = document.createElement('div');
        div.classList.add('ui', 'card');
        div.innerHTML = getCardMarkup(name, preview_url, id, album, imageUrl);;
        results.appendChild(div).style.display = 'inline-block';
        results.appendChild(div).style.width = '25%';


        div.addEventListener('click',() => {
            PlaylistManager.addTrack(track);
            const currentIndex = PlaylistManager.tracks.length - 1;

            const playlistTrack = document.createElement('div');
            playlistTrack.classList.add('ui', 'card', 'trackid-' + id);
            playlistTrack.innerHTML = `
<div class="item playlist-track trackid-${id}">
    <a href="#" class="playlist-close js-playlist-close">
        <i class="icon remove"></i>
    </a>
    <div class="ui tiny image">
      <img src="${imageUrl}">
    </div>
    <div class="middle aligned content playlist-content">
      ${name}
    </div>
</div>
        <audio controls style="width: 100%;">
            <source src="${preview_url}">
        </audio>
            `
            playlist.appendChild(playlistTrack)

            // get the AUDIO tag
            const audio = playlistTrack.querySelector('audio');

            audio.addEventListener('play', () => {
                PlaylistManager.currentSong = currentIndex;
            });

            audio.addEventListener('ended', () => {
                console.log('done!')
                const nextTrackId = PlaylistManager.getNextSong();

                setTimeout(() => {
                    document.querySelector(`.trackid-${nextTrackId} audio`).play();
                }, 1000);
                
            })


            // get the CLOSE button
           const closeBtn = playlistTrack.querySelector('.js-playlist-close');
           closeBtn.addEventListener('click', () => {
                if (PlaylistManager.currentSong === currentIndex) {
                    const nextTrackId = PlaylistManager.getNextSong();

                    setTimeout(() => {
                        document.querySelector(`.trackid-${nextTrackId} audio`).play();
                    }, 500);
                }
                PlaylistManager.removeById(id);

                playlist.removeChild(playlistTrack);
           })
        })
        // console.log(html)
    }


    const button = document.querySelector('.js-search');
    const input = document.querySelector('.js-input');
    const results = document.querySelector('.js-searchresult');
    const playlist = document.querySelector('.js-playlist');

    const getCardMarkup = (name, preview_url, id, album, imageUrl) => {
        let html = `
            <div class="image" style="border: none;">
                <img src="${imageUrl}">
                <div class="description">
                    <audio controls class="${id}" style="width: 100%;">
                        <source src="${preview_url}">
                    </audio> 
                </div>
            </div>
            <div class="content" style="height: 85px; overflow: auto; width: 100%; text-align: right;">
                <div style="float: left;">
                <button class="ui icon button">
                    <i class="empty heart icon"></i>
                </button>
                </div>
                <a class="header">${name}</a>
                <div class="meta">${album.name}</div>

            </div>
        `;

        return html;
    }


    const runSearchQuery = () => {
        const {value} = input;

        validateSearch(value)
            .then((query) => {
                console.log('about to search for: ', query);

                input.value = '';
                input.setAttribute('disabled', 'disabled');
                button.setAttribute('disabled', 'disabled');


                return SpotifyAPI.search(query);
            })
            .then((data) => {
                // bring back the input fields
                input.removeAttribute('disabled');
                button.removeAttribute('disabled');
                // clear search results
                results.innerHTML = "";
                // append new results
                const tracks = data.tracks.items;
                for(const track of tracks) {
                    addTrackToHTML(track);
                }

            })
            .catch((e) => {
                alert(e);
            });
    }



    /***

        PROGRAM STARTS HERE

    ***/

    button.addEventListener('click', (e) => runSearchQuery());
    // ^^^^ shortcuts
    input.addEventListener('keydown', (e) => {
        const {keyCode, which} = e;
        // ^^^^ equivalent to: const keyCode = e.keyCode
        //                     const which = e.which
        // this is called object destructuring #es6

        if (keyCode === 13 || which === 13) {
           runSearchQuery();
        }
    });


})();


