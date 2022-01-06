!function (e) {
    var t, n, o, d, c,
        i = '<svg><symbol id="icon-folder" viewBox="0 0 1024 1024"><path d="M928 444H820V330.4c0-17.7-14.3-32-32-32H473L355.7 186.2c-1.5-1.4-3.5-2.2-5.5-2.2H96c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h698c13 0 24.8-7.9 29.7-20l134-332c1.5-3.8 2.3-7.9 2.3-12 0-17.7-14.3-32-32-32z m-180 0H238c-13 0-24.8 7.9-29.7 20L136 643.2V256h188.5l119.6 114.4H748V444z" fill="#dbdbdb" ></path></symbol><symbol id="icon-doc" viewBox="0 0 1024 1024"><path d="M224 831.936V192.096L223.808 192H576v159.936c0 35.328 28.736 64.064 64.064 64.064h159.712c0.032 0.512 0.224 1.184 0.224 1.664L800.256 832 224 831.936zM757.664 352L640 351.936V224.128L757.664 352z m76.064-11.872l-163.872-178.08C651.712 142.336 619.264 128 592.672 128H223.808A64.032 64.032 0 0 0 160 192.096v639.84A64 64 0 0 0 223.744 896h576.512A64 64 0 0 0 864 831.872V417.664c0-25.856-12.736-58.464-30.272-77.536z" fill="#dbdbdb" ></path><path d="M640 512h-256a32 32 0 0 0 0 64h256a32 32 0 0 0 0-64M640 672h-256a32 32 0 0 0 0 64h256a32 32 0 0 0 0-64" fill="#dbdbdb" ></path></symbol><symbol id="icon-refresh" viewBox="0 0 1024 1024"><path d="M512 919.552c-224.768 0-407.552-182.784-407.552-407.552 0-8.704 0.512-17.408 1.024-26.112l71.68 4.608c-0.512 7.168-0.512 14.336-0.512 21.504 0 185.344 150.528 335.872 335.872 335.872 86.528 0 168.448-32.768 230.912-92.16l49.152 52.224C716.288 880.128 616.96 919.552 512 919.552zM919.552 512h-71.68c0-11.776-0.512-23.552-2.048-35.328-17.92-171.52-161.28-300.544-334.336-300.544-67.584 0-132.096 19.968-187.904 57.344L284.16 174.08c67.072-45.568 145.92-69.632 227.84-69.632 209.408 0 384 156.672 405.504 365.056 1.536 13.824 2.048 28.16 2.048 42.496z" fill="#dbdbdb" ></path><path d="M140.288 290.816L28.16 491.52c-3.072 5.12 1.024 11.776 6.656 11.776H258.56c6.144 0 9.728-6.144 6.656-11.776L153.6 290.816c-3.072-5.632-10.752-5.632-13.312 0zM870.4 675.84L758.272 475.136c-3.072-5.12 1.024-11.776 6.656-11.776h223.744c6.144 0 9.728 6.144 6.656 11.776L883.712 675.84c-2.56 5.12-10.24 5.12-13.312 0zM270.336 202.24a35.84 35.84 0 1 0 71.68 0 35.84 35.84 0 1 0-71.68 0zM728.576 784.896a35.84 35.84 0 1 0 71.68 0 35.84 35.84 0 1 0-71.68 0z" fill="#dbdbdb" ></path></symbol></svg>',
        l = (l = document.getElementsByTagName("script"))[l.length - 1].getAttribute("data-injectcss"),
        a = function (e, t) {
            t.parentNode.insertBefore(e, t)
        };
    if (l && !e.__iconfont__svg__cssinject__) {
        e.__iconfont__svg__cssinject__ = !0;
        try {
            document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>")
        } catch (e) {
            console && console.log(e)
        }
    }

    function s () {
        c || (c = !0, o())
    }

    function h () {
        try {
            d.documentElement.doScroll("left")
        } catch (e) {
            return void setTimeout(h, 50)
        }
        s()
    }

    t = function () {
        var e, t;
        (t = document.createElement("div")).innerHTML = i, i = null, (e = t.getElementsByTagName("svg")[0]) && (e.setAttribute("aria-hidden", "true"), e.style.position = "absolute", e.style.width = 0, e.style.height = 0, e.style.overflow = "hidden", t = e, (e = document.body).firstChild ? a(t, e.firstChild) : e.appendChild(t))
    }, document.addEventListener ? ~["complete", "loaded", "interactive"].indexOf(document.readyState) ? setTimeout(t, 0) : (n = function () {
        document.removeEventListener("DOMContentLoaded", n, !1), t()
    }, document.addEventListener("DOMContentLoaded", n, !1)) : document.attachEvent && (o = t, d = e.document, c = !1, h(), d.onreadystatechange = function () {
        "complete" == d.readyState && (d.onreadystatechange = null, s())
    })
}(window);
