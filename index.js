/** Phase 1: Tracking price only **/


const axios = require("axios"); //usefull to access the binance api

const SYMBOL = "BTCUSDT";
const BUY_PRICE = 94820;
const SELL_PRICE = 96651;

const API_URL = "https://testnet.binance.vision"; //https://api.binance.com

//flag p/ confirmar se comprei ou ñ a ordem.
let isOpened = false;

//consultar o preço atual do ativo de tempos em tempos
async function start() {
    //monitoramente para pegar dados
    // get retorna um objeto const com propriedade data
    //await serve para aguardar até a api retornar os dados.
    const { data } = await axios.get(API_URL + "/api/v3/klines?limit=21&interval=15m&symbol=" + SYMBOL);

    //última vela selecionada
    const candle = data[data.length - 1];

    //preço está na posição 4, origem é texto, passado p/ float.
    const price = parseFloat(candle[4]);

    console.clear();
    console.log("Price: " + price);

    if(price <= BUY_PRICE && isOpened === false){
        console.log("Comprar");
        isOpened = true;
    }
    else if(price >= SELL_PRICE && isOpened === true){
        console.log("Vender");
        isOpened = false;
    }
    else 
        console.log("Aguardar");
}

//cada 3s, a função start será iniciada.
setInterval(start,3000)
