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

* `URL` of the webpage
* The `title` given as what's displayed on a tab 
* The `body` of first paragraph or sentence of main content
  * We won't store the whole webpage in the interest of storage