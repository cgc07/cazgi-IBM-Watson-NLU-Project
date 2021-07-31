const express = require('express');
const dotoenv = require('dotenv');
dotoenv.config();

const app = new express();

app.use(express.static('client'))

const cors_app = require('cors');
app.use(cors_app());

function getNLUInstance(){
    let api_key = process.env.API_KEY;
    let api_url = process.env.API_URL;

    const NatutalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
    const { IamAuthenticator } = require('ibm-watson/auth');

    const naturalLanguageUnderstanding = new NatutalLanguageUnderstandingV1({
        version: '2021-03-25',
        authenticator: new IamAuthenticator({
            apikey: api_key,
        }),
        serviceUrl : api_url,
    });
    return naturalLanguageUnderstanding;
}

app.get("/",(req,res)=>{
    res.render('index.html');
  });

app.get("/url/emotion", (req,res) => {
    let NL = getNLUInstance();
    const analyzeParams = {
        'url': req.query.url,
        'features': {
            'emotion': {
                'targets': [
                    'happy'
                ]
            },
        }      
    };
    NL.analyze(analyzeParams)
    .then(analysisResults => {
        //console.log(JSON.stringify(analysisResults.result, null, 2));
        console.log("url/emotion");
        console.log(analysisResults.result.emotion.targets[0].emotion)
        return res.json(analysisResults.result.emotion.targets[0].emotion);
        //return res.send({"happy":"90","sad":"10"});
    })
    .catch(err => {
        console.log("url/emotion");
        console.log(err);
        return res.send({"happy":"90","sad":"10"});
    });
});

app.get("/url/sentiment", (req,res) => {
    let NL = getNLUInstance();
    const analyzeParams = {
        'url': req.query.url,
        'features': {
            'sentiment': {
                'targets': [
                    'happy',
                    'sad'
                ]
            },
            "categories": {},
            "entities": {
                "emotion": false,
                "sentiment": true,
                "limit": 1  
            },
            "keywords": {
              "emotion": false,
              "sentiment": true,
              "limit": 1
            }
        }      
    };
    NL.analyze(analyzeParams)
    .then(analysisResults => {
        //console.log(JSON.stringify(analysisResults.result, null, 2));
        console.log("url/sentiment");
        return res.json(analysisResults.result.sentiment.targets);
        //return res.send({"happy":"90","sad":"10"});
    })
    .catch(err => {
        console.log("url/sentiment");
        console.log(err);
        return res.send("url sentiment for "+req.query.url);
    });
});

app.get("/text/emotion", async (req,res) => {
    let NL = getNLUInstance();
    const analyzeParams = {
        'text': req.query.text,
        'features': {
            'emotion': {
                'targets': [
                    'happy'
                ]
            }
        },
        'language': 'en'     
    };
    await NL.analyze(analyzeParams)
    .then(analysisResults => {
        //console.log(JSON.stringify(analysisResults.result, null, 2));
        console.log("text/emotion");
        console.log(analysisResults.result.emotion.targets[0].emotion)
        return res.send(analysisResults.result.emotion.targets[0].emotion);
        //return res.send({"happy":"90","sad":"10"});
    })
    .catch(err => {
        console.log("text/emotion");
        console.log(err);
        return res.send({"happy":"-10","sad":"90"});
    });
});

app.get("/text/sentiment", (req,res) => {
    let NL = getNLUInstance();
    const analyzeParams = {
        'text': req.query.text,
        'features': {
            'sentiment': {
                'targets': [
                    'happy',
                    'sad'
                ]
            },
        },
        'language': 'en'    
    };
    NL.analyze(analyzeParams)
    .then(analysisResults => {
        //console.log(JSON.stringify(analysisResults.result, null, 2));
        //console.log(analysisResults.result.sentiment.targets);
        console.log("text/sentiment");
        return res.send(analysisResults.result.sentiment.targets);
        //return res.send({"happy":"90","sad":"10"});
    })
    .catch(err => {
        console.log("text/sentiment");
        console.log(err);
        return res.send("NO hay analisis para "+req.query.text);
    });
});

let server = app.listen(8080, () => {
    console.log('Listening', server.address().port)
})

