
// This is where we will write the script which scrapes the web.

import axios from "axios";
import { parse } from 'node-html-parser';
import { PrismaClient } from '@prisma/client';
import _ from 'underscore';

const prisma = new PrismaClient();

interface ScrapeResult {
    url: string;
    title: string;
    links: Set<string>; // set of all unique URLs found on the page
}

const parseWebpage = async (url: string): Promise<ScrapeResult | null> => {
    try {
        const response = await axios.get(url);
        const root = parse(response.data);
        const title = root.querySelector('title')?.text as string;
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
            links
        };
        return result;
    }
    catch (e) {
        console.log(e);
        return null;
    }
}

(async () => {
    const results = await prisma.webpage.findMany({
        where: {
            title: {
                search: 'weather'
            }
        }
    });

    console.log(results);

    return;

    // const queue = ["https://www.weather.gov/"];
    // const visited = new Set<string>();

    // while (queue.length > 0) {
    //     // take a random url from the queue
    //     const url = queue.splice(Math.floor(Math.random() * queue.length), 1)[0];
    //     // don't visit already visited URLs
    //     if (url == null || visited.has(url)) {
    //         continue;
    //     }
    //     console.log(`Scraping ${url}`);
    //     visited.add(url);
    //     const result = await parseWebpage(url);
    //     if (result == null) continue;
    //     if (result.title && result.title.length > 0) {
    //         try {
    //             await prisma.webpage.create({
    //                 data: {
    //                     url: result.url,
    //                     title: result.title,
    //                 }
    //             });
    //         }
    //         catch (e) {
    //             console.log(e);
    //         }
    //     }
    //     // const links = Array.from(result.links);
    //     // if (links.length > 0 && queue.length < 500) {
    //     //     queue.push(links[Math.floor(Math.random() * links.length)]);
    //     // }
    //     const links = Array.from(_.sample(Array.from(result.links), 2));
    //     for (const link of links) {
    //         if (queue.length < 500) {
    //             queue.push(link);
    //         }
    //         else {
    //             break;
    //         }
    //     }
    // }
})();