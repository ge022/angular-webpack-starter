const tailwindcss = require('tailwindcss');
const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = ({file, options, env}) => {
    let plugins = [
        tailwindcss('./tailwind.js'),
        require('autoprefixer'),
    ];

    if (options['mode'] === 'production') {
        plugins.push(purgecss({
            content: ['./src/**/*.html', './src/**/*.ts'],
            extractors: [
                {
                    extractor: class {
                        static extract(content) {
                            return content.match(/[A-Za-z0-9-_://]+/g) || []
                        }
                    },
                    extensions: ['html', 'ts']
                }
            ],
        }))
    }

    return {
        plugins: plugins,
    }
};