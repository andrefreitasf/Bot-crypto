/** Phase 1: Tracking price only **/


const axios = require("axios"); //usefull to access the binance api

const SYMBOL = "BTCUSDT";

//Define o período de 14 velas para o cálculo do rsi.
const PERIOD = 14;

const API_URL = "https://testnet.binance.vision"; //https://api.binance.com


//calcula a média de ganhos e perdas no período definido na função
function averages(prices, period, startIndex){
    let gains = 0, losses = 0;

    for(let i=0; i< period && (i + startIndex) < prices.length; i++){
        const diff = prices[i + startIndex] - prices[i + startIndex - 1]; // Calcula a diferença de preço entre velas consecutivas
        if(diff >= 0){
            gains += diff;
        }else {
            losses += Math.abs(diff);
        }
    }

    let avgGains = gains / period; //média de ganhos
    let avgLosses = losses / period; //média de perdas
    return { avgGains, avgLosses }; //retorna um objeto com os valores médios
}

//calcula o rsi
function RSI(prices, period){
    let avgGains = 0, avgLosses = 0;

    for(let i = 1; i < prices.length; i++){
        let newAverages = averages(prices, period, i); //calcula a média de ganhos e perdas

        if(i === 1){ //se for a primeira iteração, inicializa os valores médios
            avgGains = newAverages.avgGains;
            avgLosses = newAverages.avgLosses;
            continue;
        }
        //atualiza as médias de ganhos e perdas utilizando a fórmula do rsi
        avgGains = (avgGains * (period - 1) + newAverages.avgGains) / period;
        avgLosses = (avgLosses * (period - 1) + newAverages.avgLosses) / period;
    }

    const rs = avgGains / avgLosses; //razão de ganhos e perdas
    return 100 - (100 / (1 + rs)); //fórmula do rsi para obter um valor entre 0 e 100

}

//flag p/ confirmar se comprei ou ñ a ordem.
let isOpened = false;

//consultar o preço atual do ativo de tempos em tempos
async function start() {
    //monitoramente para pegar dados
    // get retorna um objeto const com propriedade data
    //await serve para aguardar até a api retornar os dados.
    const { data } = await axios.get(API_URL + "/api/v3/klines?limit=100&interval=15m&symbol=" + SYMBOL);

    //última vela selecionada
    const candle = data[data.length - 1];

    //preço está na posição 4, origem é texto, passado p/ float.
    const lastPrice = parseFloat(candle[4]);

    console.clear();
    console.log("Price: " + lastPrice);

    const prices = data.map(k => parseFloat(k[4])); //mapeia os preços de fechamento das velas
    const rsi = RSI(prices, PERIOD); //calcula o rsi com base nos preços coletados
    console.log("RSI: " + rsi); //exibe o rsi


    if(rsi < 30 && isOpened === false){
        console.log("Comprar, sobrevendido.");
        isOpened = true;
    }
    else if(rsi > 70 && isOpened === true){
        console.log("Vender, sobrecomprado.");
        isOpened = false;
    }
    else 
        console.log("Aguardar.");
}

//a cada 3s, a função start será iniciada.
setInterval(start,3000)
