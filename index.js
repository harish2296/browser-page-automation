const puppeteer = require('puppeteer');
const express = require('express');
const cron = require('node-cron');
const axios = require('axios')

const app = express();
app.use(express.json());
const port = 7051;

app.post('/daily-update-naukri-profile', async (req, res) => {
    try {
        let loginModel = {
            url: 'https://www.naukri.com/nlogin/login',
            username: 'input[id="usernameField"]',
            password: 'input[id="passwordField"]',
            logoutUrl: 'https://www.naukri.com/nlogin/logout'
        };
        let editModel = {
            url: 'https://www.naukri.com/mnjuser/profile?id=&altresid',
            attachCV: 'input[id="attachCV"]'
        };
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(loginModel.url);
        await page.waitFor(loginModel.username);
        await page.waitFor(loginModel.password);

        await page.type(loginModel.username, req.body.username);
        await page.type(loginModel.password, req.body.password);
        await page.keyboard.press('Enter');
        await page.waitForNavigation();
        await page.evaluate(() => {
            if (document.querySelector('.feedbackBtn')) {
                document.querySelector('.feedbackBtn').click();
            } else {
                return;
            }
        });
        let timestamp = new Date();
        let fileName;
        fileName = './screenshots/' + timestamp.toDateString() + ' login ' + '.png';
        await page.screenshot({ path: fileName, fullPage: true });
        await page.goto(editModel.url);
        await page.evaluate(() => {
            let editElement = document.querySelectorAll('div.widgetHead')[1];
            editElement.querySelectorAll('span')[1].click();
        });
        fileName = './screenshots/' + timestamp.toDateString() + ' update ' + '.png';
        await page.screenshot({ path: fileName, fullPage: true });
        await page.evaluate(() => {
            document.querySelector('#saveKeySkills').click();
        });
        await page.goto(editModel.url);
        await page.waitFor(editModel.attachCV);
        fileName = './screenshots/' + timestamp.toDateString() + ' updated ' + '.png';
        await page.screenshot({ path: fileName, fullPage: true });
        await page.goto(loginModel.logoutUrl);
        await browser.close();
        res.send('success!!!')
    } catch (err) {

    }
});

cron.schedule('0 1 * * *', () => {
    axios.post('http://localhost:7051/daily-update-naukri-profile', {
        "username": "edit your email id",
        "password": "add your password"
    })
        .then((res) => {
            console.log(`statusCode: ${res.status}`)
            console.log(res.data)
        })
    console.log('running a task every day 6 am');
});

app.listen(port, () =>
    console.log(`Naukri update app listening on port ${port}`),
);
