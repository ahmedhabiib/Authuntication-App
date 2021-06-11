const express = require('express')
const app = express();
const User = require('./models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session')

const db = mongoose.connect('mongodb://localhost:27017/authoDemo', { useUnifiedTopology: true, useNewUrlParser: true, })
    .then(() => {
        console.log('MONGODB SUCCESSFULLY CONNECTED!');
    })
    .catch((err) => {
        console.log('ERROR WAS OCCURED!', err);
    })

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'nogoodsecret' }));

const requireLoggedIn = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next()
}
app.get('/', (req, res) => {
    res.send('This is home page!')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async(req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
        username: username,
        password: hash,
    });
    await user.save();
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login')
});

app.post('/login', async(req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const validUser = await bcrypt.compare(password, user.password);
    if (validUser) {
        req.session.user_id = user._id;
        res.redirect('/secret')
    } else {
        res.redirect('/login');
    };
});

app.post('/logout', (req, res) => {
    req.session.user_id = null
    res.redirect('/login')
})

app.get('/secret', requireLoggedIn, (req, res) => {
    res.render('secret')
});

app.get('/topsecret', requireLoggedIn, (req, res) => {
    res.send('Top Secrets')
})

app.listen(3000, () => {
    console.log('Server Get Started port 3000!');
})