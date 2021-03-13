// ==UserScript==
// @name         LCSC_JLC_GM
// @version      0.1
// @match        https://lcsc.com/product-detail/*
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @connect      easyeda.com
// ==/UserScript==
GM_addStyle(`

.jlc-stock-good { color: green; }
.jlc-stock-good a { color: green; font-size: 14px;}
.jlc-stock-bad { color: orange; }
.jlc-stock-bad a { color: orange; font-size: 14px;}

.blinking {
animation: blinker 1s linear infinite;
}

@keyframes blinker {
50% {
opacity: 0;
}
}


`);




(function() {
    'use strict';
    const url = 'https://easyeda.com/api/component/getCanUseStockNum?numbers=';
    const jlc_ul = 'https://jlcpcb.com/parts/componentSearch?searchTxt=';


    var myplace = document.getElementsByClassName("cart-instock")[0];
    var myid = document.getElementById("product-id").innerText;

    var element = document.createElement("div");
    element.classList.add("jlc-stock");
    element.classList.add("blinking");
    element.innerHTML = 'JLC (<span id="jlc-id"></span>) : <span id="jlc-stock"></span>';
    element.setAttribute("style", "background: #f1f1f1;font-size: 17px;padding: 15px 15px;");
    element.id = 'jlc';

    myplace.parentNode.insertBefore(element, myplace.nextSibling);

    GM.xmlHttpRequest({
        method: 'GET',
        url: url + myid,
        headers: {
            'Content-type': 'application/json'
        },
        onload: function(xhr) {
            var data = JSON.parse(xhr.responseText);
            console.log(data);
            let res = data.result;
            console.log(res.component_code);
            console.log(res.stock_num);
            if (res.stock_num > 0) {
                document.getElementById("jlc").classList.add('jlc-stock-good');
            } else {
                document.getElementById("jlc").classList.add('jlc-stock-bad');
            }

            document.getElementById("jlc-id").innerHTML = '<a href="' + jlc_ul + res.component_code + '" target="popup">' + res.component_code + '</a>';
            document.getElementById("jlc-stock").innerText = res.stock_num;
            document.getElementById("jlc").classList.remove('blinking');
        },
        onerror: function(xhr) {
            //console.log("Error fetching JSON from xhr.");
            return false;
        }
    });



})();