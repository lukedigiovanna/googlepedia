import express from 'express';

import { PrismaClient } from '@prisma/client';

const path = require("path");
const app = express();

const prisma = new PrismaClient();

app.use(express.static(__dirname + '/public'));

app.get('/api/search', async (req, res) => {
    const searchTerm: string = req.query.term as string;
    // perform a search on the database.
    try {
        const results = await prisma.webpage.findMany({
            take: 50,
            where: {
                title: {
                    search: searchTerm.split(" ").join(" | ")
                },
                content: {
                    search: searchTerm.split(" ").join(" & ")
                }
            }
        });
        
        res.send(results);
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


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});