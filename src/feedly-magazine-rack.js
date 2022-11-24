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
            let doc = new DOMParser().parseFromString(entry.content.content, 'text/html');
            this.summary = splitToLength(doc.body.textContent, 350) || "";
        } else {
            this.summary = "";
        }
        if (entry.visual) {
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
        <div class="magazine-cover" style="${this.background};">
            <h1>${this.title}</h1>
            <div style="overflow:hidden;width=100%;height=100%;">${this.summary}</div>
            <span class="author">${this.origin}</span>
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
            await asyncForEach(feedJson, async (feedObj) => {
                await this.getLatestArticleFor(feedObj.id).then((feed) => {
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