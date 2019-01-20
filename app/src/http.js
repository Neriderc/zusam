import util from "./util.js";
import alert from "./alert.js";
import cache from "./cache.js";

const http = {
    sendFile: (formData, loadFn, progressFn = null, errorFn = null) => {
        return cache.get("apiKey").then(apiKey => {
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/files/upload", true);
            xhr.setRequestHeader("X-AUTH-TOKEN", apiKey)
            xhr.addEventListener("load", e => loadFn(JSON.parse(e.target.response)));
            if (progressFn) {
                xhr.upload.onprogress = e => progressFn({loaded: e.loaded, total: e.total});
            }
            if (errorFn) {
                xhr.addEventListener("error", e => errorFn(e));
            }
            xhr.send(formData);
        });
    },
    get: (url, nocache = false) => {
        return cache.get("apiKey").then(apiKey => {
            if (!url) {
                return;
            }
            let h = {};
            if (apiKey) {
                h["X-AUTH-TOKEN"] = apiKey;
            }
            if (nocache) {
                h["X-NOCACHE"] = "nocache";
            }
            return fetch(url, {
                method: "GET",
                headers: new Headers(h),
            }).then(
                res => res.ok && res.json()
            ).catch(
                err => console.warn("ERROR for " + url, err)
            )
        });
    },
    post: (url, data, contentType = "application/json") => http.request(url, data, "POST", contentType),
    put: (url, data, contentType = "application/json") => http.request(url, data, "PUT", contentType),
    delete: (url, data, contentType = "application/json") => http.request(url, null, "DELETE", contentType),
    request: (url, data, method, contentType = "application/json") => {
        return cache.get("apiKey").then(apiKey => {
            if (!url) {
                return;
            }
            let h = {};
            if (apiKey) {
                h["X-AUTH-TOKEN"] = apiKey;
            }
            if (contentType) {
                h["Content-type"] = contentType;
            }
            let fetchOptions = {
                method: method,
                headers: new Headers(h),
            }
            if (data) {
                fetchOptions.body = (typeof(data) == "object" && data.constructor.name == "Object") ? JSON.stringify(data) : data;
            }
            return fetch(url, fetchOptions).then(
                res => method == "DELETE" ? res : res.json()
            ).catch(
                err => console.warn("ERROR for " + url, err)
            )
        }).catch(error => alert.add(error));
    },
};
export default http;
