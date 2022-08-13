# Making a Custom Search Engine

Search engines are ubiquitous in daily life. We use them constantly throughout the day to quickly and reliably find the information we need or access the sites we don't have bookmarked. Sometimes it feels like magic that you can just type in "cat" and millions of pictures of adorable kittens pop up on your screen. But really, search engines are not all that complicated and there certainly isn't any magic going on.

To demystify the beauty of search engines, I'm going to walk you through how I created my own, albeit simple and limited, search engine.

## The Core Components

A search engine such as Google essentially works by collecting billions of pages on the internet and storing them in something called an index. Then, when a user makes a search using some string of terms, that query is matched against the pages in the database and subsequently ranked by relevance (Google uses a very popular algorithm called PageRank for this step). So, to make a search engine there are three main tasks we need to accomplish.

1. Find and index millions of webpages
2. Receive a query and return pages from the index
3. Develop a user interface to cleanly make a search and see the results.

Simple, right?

## Technology

Let me first start off by listing the technology I'm going to use to make this.

* `TypeScript` for the whole of my search engine
* `PostgreSQL` database to store and index all of the web pages in my engine.
* `node-html-parser` to extract information from web pages
* `Prisma` to interface between TypeScript and my database
* `Express` to make the API that will serve the frontend and handle search requests
* `ReactJS` the frontend will be developed in React

## The Web Crawler

We first need to find a whole lot of webpages, and how we do that is by making a bot which will sprawl itself across the web. Google uses Googlebot to constantly scan the internet for new pages to add to their index. This is why your new domain may take a few days to show itself on Google's search results. The generic term for these bots that _crawl_ the internet is web crawler. We will implement a fairly straight forward web crawler as follows:

1. Start on a webpage such as `https://google.com`
2. Find all of the links on that webpage
3. Go to all of those links and proceed again from step 1

Additionally, each time we explore a webpage we will want to extract some important information that will be useful when we try to search later. Information like:

* The `URL` of the webpage
* The `title` given as what's displayed on a tab 
* And the `body` of first paragraph or sentence of main content
  * We won't store the whole webpage in the interest of storage

Google may look at other information such as images, CSS, meta tags, or JavaScript, but we will not consider any of that in this simplified engine.

But, without further ado, let's get to the code for this section.

#### Postgres Database

We'll start by initializing a table to store all of the webpages that we find.

**Create table of webpages:**

```sql
CREATE TABLE "webpage" (
  "id" SERIAL PRIMARY KEY, 
  "url" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  UNIQUE ("url")
);
```


We then need to create an index such that queries on this table will be performant. This is at the sacrifice of more compute to store our webpages, but with potentially millions of rows, it is worth it.

**Create index on webpages:**

```sql
CREATE INDEX page_index ON webpage USING GIN (title, content);
```

We will index based on the title and content and use the GIN (Generalized Inverted Index) method of indexing. This will make lookups on the table based on title and content far more performant.

#### Crawling Script

![Visualization of internet](https://www.researchgate.net/profile/Quan-Nguyen-123/publication/325794369/figure/fig2/AS:639787606220801@1529548660141/Example-of-large-and-complex-networks-Visualization-of-the-Internet-graph-by-the-Opte.png)
<figcaption align = "center">Visualization of the internet as a graph</figcaption>
<br>

We'll now move on to actually finding and indexing webpages. As described above, this will work by starting on some webpage and finding others through the links of that webpage. Here, we can imagine the internet as a directed graph where each webpage is a node and each link is an edge from the source to its target. With this in mind, we can explore the internet as if it is a graph. Two common algorithms exist to do this:

* Breadth First Search (BFS)
* and Depth First Search (DFS)

In a BFS we would index all of the links on the webpage we are on before moving to another. The issue I have with this approach to my webcrawler is that we would end up with many webpages in our index that are very similar. For example, if we start on `https://google.com`, we will explore only Google related links for quite some time such as YouTube, the Google Play Store, etc. Of course if we were indexing the whole internet, this would not matter, but I am only taking a tiny subset of the internet and want more diverse results. Therefore, I am going to employ a "stochastic" DFS to find more diverse articles more quickly.

This will essentially be DFS but instead of pursuing the first edge we find, we will pursue the next 2 random edges. In case a certain webpage has no links on it, we don't want the algorithm to stop, so we store a backlog of previous links we have found in this event.

The implementation for this is straightforward:

```TypeScript
// Set up a queue from which will draw from to continue crawling the web.
let queue = ["https://www.google.com"];
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
    const result = await parseWebpage(url);
    if (result) {
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
                    content: result.content
                }
            })
        }
        catch (e) {
            console.error(`Error saving ${result.url} to database`);
        }
    }
    // If the queue gets too long, we'll chop it down to promote diversity.
    if (queue.length > 500) {
        queue = _.sample(queue, 10);
        console.log("Cut the queue!");
    }
}
```