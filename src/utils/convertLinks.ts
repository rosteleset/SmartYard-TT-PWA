import linkifyHtml from "linkify-html";

function wrapPhoneNumbers(text: string): string {
    const phoneRegex = /(?:(?:\+?\d{1,3})?[\s-.(]*)?(?:\d{3})[\s-.)]*(?:\d{3})[\s-]*(?:\d{2})[\s-]*(?:\d{2})/g;

    return text.replace(phoneRegex, (match) => {
        const telLink = match.replace(/[^\d+]/g, '');
        return `<a href="tel:${telLink}">${match}</a>`;
    });
}


function convertLinks(text: string) {
    const options = {
        defaultProtocol: "https",
        target: "_blank",
    };
    return wrapPhoneNumbers(linkifyHtml(text, options));
}

export default convertLinks;
