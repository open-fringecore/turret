import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        hostname: req.hostname,
        message: "Hello from Test 1",
        time: new Date().toISOString(),
    });
});

app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000/');
});