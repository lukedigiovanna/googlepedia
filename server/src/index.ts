import express from 'express';

const app = express();

app.use(express.static(__dirname + '/public'));

app.get('/api/search', (req, res) => {
    const searchTerm: string = req.query.term as string;
    // perform a search on the database.
    res.send(searchTerm);
});

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});