var modernBrowser = (
    'fetch' in window &&
    'Promise' in window &&
    'assign' in Object &&
    'keys' in Object
);

if (!modernBrowser) {
    var scriptElement = document.createElement('script');

    scriptElement.async = false;
    scriptElement.src = '/polyfills.js';
    document.head.appendChild(scriptElement);
}