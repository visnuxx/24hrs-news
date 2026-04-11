const express = require("express");
const axios = require("axios")
const xml2js = require("xml2js")
const cors = require("cors")

const  app = express()
app.use(cors())

const RSS_URL="http://feeds.bbci.co.uk/news/rss.xml"

app.get("/news",async(req,res)=>{
    try{
        const response = await axios.get(RSS_URL)
        const data = await xml2js.parseStringPromise(response.data)

        const item = data.rss.channel[0].item;

        const news = item.map(item=>({
            title:item.title[0],
            link:item.link[0],
            pubDate:item.pubDate[0]
        }))

        res.json(news)


    }
    catch(err){
            res.status(500).send("error fetching news")
    }
})

 app.listen(5000,()=>
        console.log("Server Started...!")
    )