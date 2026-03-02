
const fetchData = async (url) => {

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error("Fetch error:", error.message);
        throw error; // Rethrow to handle it in your component/route
    }
}

const searchMCIds = async (param) => {

    if (param == "NIFTY") {
        return "NIFTY"
    } else if (param == "BANKNIFTY") {
        return "BANKNIFTY"
    } else if (param == "INDVIX") {
        return "INDVIX"
    } else if (param == "USDINR") {
        return "USDINR"
    } else {
        const data = await fetchData(`https://www.moneycontrol.com/mccode/common/autosuggestion_solr.php?query=${param}&type=0&format=json`);
        return data[0].sc_id
    }
}

const spotDataUrl = async (scripCode) => {

    let spotUrl;

    if (scripCode == "NIFTY" || scripCode == "NIFTY 50") {
        spotUrl = "https://priceapi.moneycontrol.com/pricefeed/notapplicable/inidicesindia/in%3BNSX";
    } else if (scripCode == "BANKNIFTY" || scripCode == "BANK NIFTY") {
        spotUrl = ("https://priceapi.moneycontrol.com/pricefeed/notapplicable/inidicesindia/in%3Bnbx");
    } else if (scripCode == "INDVIX") {
        spotUrl = "https://priceapi.moneycontrol.com/pricefeed/notapplicable/inidicesindia/in%3BIDXN";
    } else if (scripCode == "NASDAQ") {
        spotUrl = "https://priceapi.moneycontrol.com/pricefeed/usMarket/index/CCMP:IND";
    } else if (scripCode == "USDINR") {
        spotUrl = "https://api.moneycontrol.com/mcapi/v1/us-markets/getCurrencies?source=webCurrency&currency=USDINR";
    } else {
        spotUrl = "https://priceapi.moneycontrol.com/pricefeed/nse/equitycash/" + scripCode;
    }

    console.log(spotUrl);

    let data = await fetchData(spotUrl);
    data = await structuredSpotData(data, scripCode);
    return data;

}


const structuredSpotData = async (data, scripCode) => {

    let dataObj = {};

    if (scripCode != "USDINR") {
        dataObj.name = data.data.NSEID || data.data.company;
        dataObj.cmp = data.data.pricecurrent;
        dataObj.open = data.data.OPN || data.data.OPEN;
        dataObj.high = data.data.HIGH || data.data.HP;
        dataObj.low = data.data.LOW || data.data.LP;
        dataObj.preClose = data.data.LOW || data.data.priceprevclose;
        dataObj.lotSize = data.data.MKT_LOT;
        dataObj.change = data.data.pricechange;
        dataObj.changePct = data.data.pricepercentchange;
        dataObj.adv = data.data.adv;
        dataObj.decl = data.data.decl;

    } else {
        dataObj.name = data.data[0].searchName;
        dataObj.cmp = data.data[0].ltp;
        dataObj.open = data.data[0].open;
        dataObj.high = data.data[0].high;
        dataObj.low = data.data[0].low;
        dataObj.preClose = data.data[0].prevclose;
        dataObj.change = data.data[0].chg;
        dataObj.changePct = data.data[0].chgper;
    }

    for (let key in dataObj) {
        if (key !== "name" && dataObj[key] !== undefined) {
            const cleanValue = String(dataObj[key]).replace(/,/g, '');
            dataObj[key] = parseFloat(cleanValue);
        }
    }

    return dataObj;

    // switch (parm) {
    //     case "LTP":
    //         return data.pricecurrent || data.current_price.replace(",", "")
    //     case "PRECLOSE":
    //         return data.priceprevclose || data.prev_close.replace(",", "")
    //     case "NAME":
    //         return data.SC_FULLNM || data.company
    //     case "52WH":
    //         return data['52H'] || data["52wkhi"]
    //     case "52WL":
    //         return data['52L'] || data["52wklow"]
    //     case "SECTOR":
    //         return data.main_sector || "INDEX"
    //     case "LTH":
    //         return data.LTH || "INDEX"
    //     case "LTL":
    //         return data.LTL || "INDEX"
    //     case "MKTCAP":
    //         return data['MKTCAP'].toFixed(2) || "INDEX"
    //     case "INDPE":
    //         return data.IND_PE || "INDEX"
    //     case "PE":
    //         data = (data['PECONS']) ? data['PECONS'].toFixed(2) : "0"
    //         return data
    //     case "PB":
    //         data = (data['PB']) ? data['PB'].toFixed(2) : "0"
    //         return data

    //     default:
    //         dataObj = {
    //             spotName: data.company || data.name,
    //             nseId: data.NSEID || data.company,
    //             open: data.OPN || data.OPEN || data.open.replace(",", ""),
    //             cmp: data.pricecurrent || data.current_price.replace(",", ""),
    //             dayHigh: data.HIGH || data.HP || data.high.replace(",", ""),
    //             dayLow: data.LOW || data.LP || data.low.replace(",", ""),
    //             prevClose: data.priceprevclose || data.prev_close.replace(",", ""),
    //             spotChng: data.net_change || (parseFloat(data.pricechange).toFixed(2)),
    //             spotChngPct: (data.percent_change || parseFloat(data.pricepercentchange).toFixed(2)),
    //         };

    //         switch (data.company) {
    //             case "NIFTY 50":
    //                 dataObj.lotSize = "50"
    //                 break;

    //             case "NIFTY BANK":
    //                 dataObj.lotSize = "15"
    //                 break;

    //             default:
    //                 dataObj.lotSize = (data.MKT_LOT) ? data.MKT_LOT.toString() : "0";
    //                 break;
    //         }

    //         (data.adv) ? dataObj.adv = data.adv.toString() : "0";
    //         (data.decl) ? dataObj.decl = data.decl.toString() : "0";

    //         console.log(dataObj);
    // }

}


export { fetchData, searchMCIds, spotDataUrl, structuredSpotData }