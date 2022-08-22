import express from 'express';

import { PrismaClient } from '@prisma/client';

const path = require("path");
const app = express();

const prisma = new PrismaClient();

app.use(express.static(__dirname + '/public'));

app.get('/api/search', async (req, res) => {
    // extract search term from the request
    const searchTerm: string = req.query.term as string;
    // check for offset field
    const offset: number = req.query.offset ? parseInt(req.query.offset as string) : 0;
    // perform a search on the database.
    try {
        const startTime = Date.now();
        // generate a SQL query to search for the search term.
        const results = await prisma.webpage.findMany({
            // take: 50,
            skip: offset,
            // orderBy: [
            //     {
            //         incoming_links: 'desc'
            //     }
            // ],
            where: {
                title: {
                    search: searchTerm.split(" ").join(" | ")
                },
                content: {
                    search: searchTerm.split(" ").join(" & ")
                }
            }
        });

        const time = Date.now() - startTime;
        
        res.send({
            time, // given in milliseconds
            results
        });
    }
    catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
        console.log(e);
    }
});

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});