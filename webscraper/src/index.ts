
// This is where we will write the script which scrapes the web.

import axios from "axios";
import { parse } from 'node-html-parser';
import { PrismaClient } from '@prisma/client';
import _ from 'underscore';

const prisma = new PrismaClient();

interface ScrapeResult {
    url: string;
    title: string;
    content: string;
    links: Set<string>; // set of all unique URLs found on the page
    linkCount: number
}

const constructBody = (bodyTags: any[], body: string) => {
    if (body.length > 300 || !bodyTags || bodyTags.length == 0) {
        return body;
    }
    for (let i = 0; i < bodyTags.length; i++) {
        const tag = bodyTags[i];
        if (tag.rawTagName == "p") {
            body += tag.text;        
        }
        else {
            body += constructBody(tag.childNodes, "");
        }

        if (body.length > 300) {
            return body;
        }
    }
    return body;
}

const parseWebpage = async (url: string): Promise<ScrapeResult | null> => {
    try {
        const response = await axios.get(url);
        const root = parse(response.data);
        // extract title of the webpage.
        const title = root.querySelector('title')?.text as string;
        const content = constructBody(root.childNodes, "");
        // find the first body
        const allLinks = root.querySelectorAll('a').map(a => a.getAttribute('href')).filter(a => a != null);
        
        const links = new Set<string>();
        for (const link of allLinks) {
            if (link?.startsWith('http')) {
                links.add(link);
            } else {
                links.add(`${url}${link}`);
            }
        }
    
        const result: ScrapeResult = {
            url,
            title,
            content,
            links,
            linkCount: 0
        };
        return result;
    }
    catch (e) {
        return null;
    }
}

const parseWikipedia = async (title: string): Promise<ScrapeResult | null> => {
    try {
        const wikiResponse = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&page=${title}&prop=text&format=json`);
        const linkCountResponse = await axios.get(`https://linkcount.toolforge.org/api/?page=${title}&project=en.wikipedia.org&namespaces=0`);
        const linkCount = linkCountResponse.data.wikilinks.all;
        const html = wikiResponse.data.parse.text['*'];
        const root = parse(html);
        const allLinks = root.querySelectorAll('a')?.map(a => a.getAttribute('href'));
        const links = new Set<string>();
        const content = constructBody(root.childNodes, "").replaceAll(/\[[0-9]+\]/g,"");
        for (const link of allLinks) {
            // starts with wiki and has no colons.
            if (link?.startsWith('/wiki/') && !/(.*):(.*)/.test(link)) {
                links.add(link.replace(/^\/wiki\//, ''));
            }
        }
        return {
            url: `https://en.wikipedia.org/wiki/${title}`,
            title: wikiResponse.data.parse.title,
            content: content.replace(/^\s+/g, ''),
            links,
            linkCount
        }
    }
    catch (e) {
        return null;
    }
}

(async () => {
    // const test = await parseWikipedia('Search_engine');
    // console.log(test);
    // return;

    // Set up a queue from which will draw from to continue crawling the web.
    let queue = ["Search_engine"];
    // We'll keep track of visited URL's in this instance
    const visited = new Set<string>();
    // Continue searching so long as there is at least 1 URL in the queue.
    while (queue.length > 0) {
        // Draw a random URL from the queue to increase probability of finding more diverse articles.
        const url = queue.splice(Math.floor(Math.random() * queue.length), 1)[0];
        // Don't waste time with a URL we've seen
        if (visited.has(url)) {
            continue;
        }
        // Mark the URL as visited
        visited.add(url);
        const result = await parseWikipedia(url);
        if (result && !result.content.match(/Redirect to:/)) {
            console.log(`Parsed ${result.title} with ${result.linkCount} inbound links`);
            // Add two random links to the queue.
            const links = Array.from(result.links);
            const randomLinks = _.sample(links, 2);
            for (const link of randomLinks) {
                queue.push(link);
            }
            // Save the result to the database.
            try {
                await prisma.webpage.create({
                    data: {
                        url: result.url,
                        title: result.title,
                        content: result.content,
                        incoming_links: result.linkCount
                    }
                })
            }
            catch (e) {
                console.log(`Error saving ${result.url} to database`);
            }
        }
        // If the queue gets too long, we'll chop it down to promote diversity.
        if (queue.length > 500) {
            queue = _.sample(queue, 10);
            console.log("Cut the queue!");
        }
    }
})();