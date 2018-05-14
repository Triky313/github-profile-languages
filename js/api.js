"use strict";

(function (doc) {
    window.addEventListener("load", function () {

        var loading = doc.querySelector(".loading"),
            errorDiv = doc.querySelector(".error"),
            errorMessage = errorDiv.querySelector(".message");
        var token = Url.queryString("token");
        var input = (Url.queryString("user") || location.search).replace(/^\?@?/g, "");

        if (!input) {
            return;
        }

        token = Url.queryString("token") || undefined;
        if (token) {
            input = Url.queryString("input");
            if (!input) {
                errorDiv.classList.add("visible");
                return errorMessage.textContent = "If you are using a token, please provide the 'input' querystring parameter.";
            }
        }

        loading.classList.add("visible");

        var getStats = function getStats(input, callback) {

            var fromLocalStorage = localStorage[input];
            try {
                fromLocalStorage = JSON.parse(fromLocalStorage);
            } catch (e) {
                fromLocalStorage = null;
            }

            if (Array.isArray(fromLocalStorage)) {
                return callback(null, fromLocalStorage);
            }

            var polyglot = new GitHubPolyglot(input, token);
            var func = polyglot.userStats;

            if (localStorage[input]) {
                return callback(null, localStorage[input]);
            }

            if (polyglot.repo) {
                func = polyglot.repoStats;
            }

            func.call(polyglot, function (err, stats) {
                if (err) {
                    return callback(err);
                }

                try {
                    localStorage[input] = JSON.stringify(stats);
                } catch (e) {
                    localStorage.clear();
                }

                callback(null, stats);
            });
        };

        getStats(input, function (err, stats) {
            loading.classList.remove("visible");
            if (err) {
                errorDiv.classList.add("visible");
                return errorMessage.textContent = err || "This user doesn't have any repositories.";
            }
            stats.sort(function (a, b) {
                return a.value < b.value ? 1 : -1;
            }).forEach(function (c) {
                c.title = c.label;
                delete c.label;
            });
            drawPieChart.call(doc.querySelector("#pieChart"), stats, {
                legend: true
            });
        });
    });
})(document);