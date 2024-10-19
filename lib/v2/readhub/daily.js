// noinspection JSCheckFunctionSignatures

const got = require('@/utils/got');
const cheerio = require('cheerio');

const { rootUrl, processItems } = require('./util');

module.exports = async (ctx) => {
    const currentUrl = new URL('daily', rootUrl).href;
    const { data: currentResponse } = await got(currentUrl);
    const $ = cheerio.load(currentResponse);

    let items = $('div.style_list__hKCUB > div')
        .map((_, item) => {
            const currentUrl = new URL($(item).find('.style_title__XsDBN .style_link__V0ex1').attr('href'), rootUrl).href;
            return {
                title: $(item).find('.style_title__XsDBN .style_link__V0ex1').text(),
                link: currentUrl,
                guid: currentUrl,
            };
        })
        .get();
    items = await processItems(items, ctx.cache.tryGet);

    const author = $('meta[name="application-name"]').prop('content');
    const subtitle = $('meta[property="og:title"]').prop('content');
    const image = 'https://readhub-oss.nocode.com/static/readhub.png';
    const icon = new URL($('link[rel="apple-touch-icon"]').prop('href'), rootUrl);

    ctx.state.data = {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle,
        author,
        allowEmpty: true,
    };
};
