// https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

function splitToLength(thisstring, thislength) {
    let mike = thisstring.substring(0,thislength+1);
    while (/\w/.test(mike[thislength]) && thislength > 100) {
        mike = thisstring.substring(0,thislength);
        thislength--;
    }
    return mike + "&#8230;";
}

class MagazineCover {
    constructor() {
    }
    createCoverFromEntry(entry) {
        if (entry.summary) {
            this.summary = entry.summary.content;
        } else if (entry.content) {
            //let doc = new DOMParser().parseFromString(entry.content.content, 'text/html');
            //this.summary = splitToLength(doc.body.textContent, 350) || "";
            this.summary = entry.content.content;
        } else {
            this.summary = "";
        }
        if (entry.visual && entry.visual.url != "none") {
            this.background = `background: gray url(${entry.visual.url}) no-repeat no-repeat center center;background-size: contain`;
            this.summary = "";
        } else {
            this.background = `background: grey`;
        }
        this.title = entry.title;
        if (entry.origin) {
            this.origin = `<a href="${entry.origin.htmlUrl}">${entry.origin.title}</a>`;
        } else {
            this.origin = "";
        }
    }
    coverAsHTML() {
        return `
        <div class="magazine-cover">
            <h1 class="author">${this.origin}</h1>
            <div class="content" style="${this.background};">${this.summary}</div>
            <p class="title">${this.title}</p>
        </div>`;
    }
}

class MagazineRack {
    constructor(target) {
        this.target = document.querySelector(target); // @todo: catch bad target
        this.magazines = []
    }
    async addCover(entry) {
        let mag = new MagazineCover()
        mag.createCoverFromEntry(entry);
        this.magazines.push(mag);
    }
    async display() {
        this.target.innerHTML = "";
        this.magazines.forEach((cover) => {
            this.target.insertAdjacentHTML('beforeend', cover.coverAsHTML());
        });
    }
    totalMagazines() {
        return this.magazines.length;
    }
}

class FeedlyInterface {
    constructor() {
        this.base_url = "./feedly-interface.php";
    }
    get all_feeds() {
        return this.getAllFeedsForUser();
    }
    async getAllFeedsForUser() {
        let response = await fetch(
            this.base_url + "?command=subscriptions",
            {
                headers: {
                    Authentication: `Bearer ${this.token}`
                }
            });
        this.all_feeds_stored = await response.json();
        return this.all_feeds_stored;
    }
    async getLatestArticleFor(feedId) {
        let response = await fetch(
            this.base_url + "?command=contents&feedId=" + feedId
        )
        return await response.json();
    }
    async feedlyToMagazine() {
        let feedJson = await this.getAllFeedsForUser();
        // feedJson = [feedJson[0]];
        const start = async () => {
             asyncForEach(feedJson, async (feedObj) => {
                 this.getLatestArticleFor(feedObj.id).then((feed) => {
                    rack.addCover(feed);
                    rack.display();
                })
            })
        }
        return start();
    }
}

rack = new MagazineRack("#magazine-rack");
feedly = new FeedlyInterface();
(async () => {
    await feedly.feedlyToMagazine();
})();