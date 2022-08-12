import express from 'express';

import { PrismaClient } from '@prisma/client';

const path = require("path");
const app = express();

const prisma = new PrismaClient();

app.use(express.static(__dirname + '/public'));

app.get('/api/search', async (req, res) => {
    const searchTerm: string = req.query.term as string;
    // perform a search on the database.
    const results = await prisma.webpage.findMany({
        where: {
            title: {
                search: searchTerm
            }
        }
    });
    // await prisma.$queryRaw(`SELECT * FROM User WHERE SIMILARITY(lastName, '${searchString}') > 0.45;` as TemplateStringsArray)

    res.send(results);
});

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(4000, () => {
    console.log('Server is running on port 4000');
});