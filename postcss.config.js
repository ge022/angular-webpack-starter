const tailwindcss = require('tailwindcss');
const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
    plugins: [
        tailwindcss('./tailwind.js'),
        purgecss({
            content: ['./src/**/*.html', './src/**/*.ts'],
            extractors: [
                {
                    extractor: class {
                        static extract (content) {
                            return content.match(/[A-Za-z0-9-_://]+/g) || []
                        }
                    },
                    extensions: ['html', 'ts']
                }
            ],
        }),
        require('autoprefixer'),
    ]
};