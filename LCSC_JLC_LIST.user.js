// ==UserScript==
// @name         LCSC_JLC_LIST
// @version      0.1
// @match        https://lcsc.com/products/*
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      easyeda.com
// ==/UserScript==
GM_addStyle(`

.jlc-stock-good { color: green; }
.jlc-stock-good a { color: green; font-size: 12px;}
.jlc-stock-bad { color: orange; }
.jlc-stock-bad a { color: orange; font-size: 12px;}

.loader {
border: 3px solid #f3f3f3; /* Light grey */
border-top: 3px solid #3498db; /* Blue */
border-radius: 50%;
width: 10px;
height: 10px;
animation: spin 1s linear infinite;
}

@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}


`);



(function() {
    'use strict';

    var $ = unsafeWindow.jQuery;
    if (unsafeWindow.CurrentPage == undefined) {
        unsafeWindow.CurrentPage = "1";
        GetJLCStock();
    }

    var myBTN = document.createElement ('div');
    myBTN.innerHTML = '<button id="jlcbtn" style="padding: 10px 27px; color: white; margin: 30px; background-color: #16d; border: none; font-size: 15px;cursor: pointer;font-weight : bold ;border-radius: 4px;">Refresh JLC</button>';
    let tmp=document.getElementsByClassName("category-result-area")[1];
    tmp.parentNode.insertBefore(myBTN, tmp.nextSibling);
    document.getElementById ("jlcbtn").addEventListener ("click", GetJLCStock, false);

    $(".pagination").bind("DOMSubtreeModified", function() {
        var span = document.getElementsByClassName("layui-laypage-curr")[0].getElementsByTagName("em")[1];

        //console.log("CurrentPage: " + unsafeWindow.CurrentPage);
        //console.log("NEW: " +span.innerText);
        if (unsafeWindow.CurrentPage !== span.innerText) {
            unsafeWindow.CurrentPage = span.innerText
            console.log("PAGE CHANGED!!");
            setTimeout(function() {
                GetJLCStock();
            }, 2000);

        }
    });
})();


function GetJLCStock() {
    const url = 'https://easyeda.com/api/component/getCanUseStockNum?numbers=';
    const jlc_ul = 'https://jlcpcb.com/parts/componentSearch?searchTxt=';

    var myrows = document.getElementById("table_content").rows;
    console.log(myrows.length);

    var wait_element = document.createElement("div");
    wait_element.classList.add("loader");

    for (var i = 0; i < myrows.length; i++) {

        var stock = myrows[i].getElementsByClassName("avali-stock-tip")[0];
        var partnum = myrows[i].getElementsByClassName("part-num-title")[0].innerText;
        //console.log(i + ' - ' + partnum);
        let tmp = myrows[i].getElementsByClassName("jlc-stock");
        if (tmp.length > 0) {
            //
        } else {

            var clone = wait_element.cloneNode(true);
            stock.appendChild(clone);
            stock.id = 'jlc-stock#' + i

            GM.xmlHttpRequest({
                method: 'GET',
                url: url + partnum,
                headers: {
                    'Content-type': 'application/json'
                },
                onload: function(xhr) {
                    var data = JSON.parse(xhr.responseText);
                    //console.log(data);
                    let res = data.result;
                    //console.log(res.component_code);
                    //console.log(res.stock_num);
                    var element = document.createElement("div");
                    element.classList.add("jlc-stock");
                    if (res.stock_num > 0) {
                        element.classList.add('jlc-stock-good');
                    } else {
                        element.classList.add('jlc-stock-bad');
                    }

                    element.innerHTML = 'JLC (<a href="' + jlc_ul + res.component_code + '" target="popup">' + res.component_code + '</a>) : <span id="jlc-stock">' + res.stock_num + '</span>';
                    for (var i = 0; i < myrows.length; i++) {
                        var tmp_stock = myrows[i].getElementsByClassName("avali-stock-tip")[0];
                        var tmp_partnum = myrows[i].getElementsByClassName("part-num-title")[0].innerText;
                        if (tmp_partnum == res.component_code) {
                            //tmp_stock.appendChild(element);
                            tmp_stock.parentNode.insertBefore(element, tmp_stock.nextSibling);
                            tmp_stock.getElementsByClassName("loader")[0].remove();
                        }
                    }
                },
                onerror: function(xhr) {
                    //console.log("Error fetching JSON from xhr.");
                    return false;
                }
            });

        }
    }
};