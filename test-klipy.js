const fetch = require('node-fetch');

const API_KEY = "hxBFYhwAVB5nWoXdsmCaXBO12zsgQP744bfmGefqAwJCOI3Kc6R18CyRZxT8u5SG";
const BASE_URL = "https://api.klipy.com/api/v1/" + API_KEY;

async function testApi() {
  try {
    console.log("--- TRENDING ---");
    const trendingRes = await fetch(`${BASE_URL}/gifs/trending?count=1`);
    const trendingData = await trendingRes.json();
    console.log(JSON.stringify(trendingData.data, null, 2).substring(0, 500) + "...\n");

    console.log("--- SEARCH ---");
    const searchRes = await fetch(`${BASE_URL}/gifs/search?q=hello&count=1`);
    const searchData = await searchRes.json();
    console.log(JSON.stringify(searchData.data, null, 2).substring(0, 500) + "...\n");

    console.log("--- CATEGORIES ---");
    const catRes = await fetch(`${BASE_URL}/gifs/categories?count=2`);
    const catData = await catRes.json();
    console.log(JSON.stringify(catData.data, null, 2).substring(0, 500) + "...\n");
  } catch (err) {
    console.error(err);
  }
}

testApi();
