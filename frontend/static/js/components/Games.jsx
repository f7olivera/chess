import React from 'react';

export default function Games() {

  React.useEffect(() => {
    const gamesPerLoad = 12;

    const listenForEndScroll = () => {
      const currentPage = Math.ceil(document.querySelectorAll('.game-preview').length / gamesPerLoad);
      const activeFilter = document.querySelector('.games-filter .active');
      const totalPages = Math.ceil(parseInt(activeFilter.querySelector('.ammount').textContent) / gamesPerLoad);
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight && currentPage < totalPages) {
        fetchMoreGames();
      }
    }

    const fetchMoreGames = async () => {
      window.onscroll = null;
      try {
        document.querySelector('.lds-ring').style.display = 'inline-block';
        const scrollingElement = (document.scrollingElement || document.body);
        scrollingElement.scrollTop = scrollingElement.scrollHeight;
        const currentPage = Math.ceil(document.querySelectorAll('.game-preview').length / gamesPerLoad);
        const moreGames = await (await fetch(window.location + `?page=${currentPage}`)).text();
        const parser = new DOMParser();
        const htmlDocument = parser.parseFromString(moreGames, "text/html");
        console.log(htmlDocument.documentElement)
        Array.from(htmlDocument.documentElement.querySelector(".game-list").children).map((game) => {
          document.querySelector('.game-list').appendChild(game);
        })
        document.querySelector('.lds-ring').style.display = 'none';
      } catch (e) {
        console.log(e)
      }
      window.onscroll = listenForEndScroll;
    }
    window.onscroll = listenForEndScroll;
  }, []);

  return <></>;
}
